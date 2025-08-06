import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { addDays, endOfDay, startOfDay } from "date-fns";
import { UserSubjectStatus } from "src/database/dto/user_subject.dto";
import { Course } from "src/database/entities/course.entity";
import { User } from "src/database/entities/user.entity";
import { UserCourse } from "src/database/entities/user_course.entity";
import { UserSubject } from "src/database/entities/user_subject.entity";
import { CronExpression, endDateOfCourse, subjectCourseReminder } from "src/helper/constants/cron_expression.constant";
import { templatePug } from "src/helper/constants/template.constant";
import { MailQueueService } from "src/helper/Queue/mail/mail_queue.service";
import { Repository } from "typeorm";

@Injectable()
export class CourseReminderService {
    constructor(
        @InjectRepository(Course) private courseRepo: Repository<Course>,
        @InjectRepository(UserCourse) private userCourseRepo: Repository<UserCourse>,
        @InjectRepository(UserSubject) private userSubjectRepo: Repository<UserSubject>,
        private readonly mailQueueService: MailQueueService,
        private readonly logger: Logger,

    ) { }

    @Cron(CronExpression.DAILY)
    async handleReminder() {
        await this.sendEndingSoonCourseReminders();
    }

    async sendEndingSoonCourseReminders(): Promise<void> {
        const endingCourses = await this.getCoursesEndingSoon();
        const sendTasks: Promise<void>[] = [];

        for (const course of endingCourses) {
            const supervisors = this.extractSupervisors(course);
            if (supervisors.length === 0) {
                this.logger.warn(`Course [${course.courseId}] has no supervisors.`);
                continue;
            }

            const [totalUsers, totalSubjectsDone] = await Promise.all([
                this.countUsersInCourse(course.courseId),
                this.countCompletedSubjects(course.courseId)
            ]);

            if (totalUsers === 0 || totalSubjectsDone === 0) {
                this.logger.warn(`Course [${course.courseId}]`);
                continue;
            }

            for (const supervisor of supervisors) {
                sendTasks.push(this.sendCourseReminderEmail(supervisor, course, totalUsers, totalSubjectsDone));
            }
        }

        await Promise.all(sendTasks);
    }

    private async getCoursesEndingSoon(): Promise<Course[]> {
        const targetDate = addDays(new Date(), endDateOfCourse);

        return await this.courseRepo
            .createQueryBuilder('course')
            .leftJoinAndSelect('course.supervisorCourses', 'sc')
            .leftJoinAndSelect('sc.supervisor', 'supervisor')
            .where('course.end IS NOT NULL')
            .andWhere('course.end BETWEEN :start AND :end', {
                start: startOfDay(targetDate),
                end: endOfDay(targetDate),
            })
            .getMany();
    }

    private extractSupervisors(course: Course): User[] {
        return course.supervisorCourses.map((sc) => sc.supervisor);
    }

    private async countUsersInCourse(courseId: number): Promise<number> {
        return await this.userCourseRepo.count({
            where: { course: { courseId } },
        });
    }

    private async countCompletedSubjects(courseId: number): Promise<number> {
        return await this.userSubjectRepo
            .createQueryBuilder('us')
            .innerJoin('us.courseSubject', 'cs')
            .innerJoin('cs.course', 'course')
            .where('course.courseId = :courseId', { courseId })
            .andWhere('us.status = :status', { status: UserSubjectStatus.COMPLETED })
            .getCount();
    }

    private async sendCourseReminderEmail(supervisor: User, course: Course, totalUsers: number, totalSubjectsDone: number): Promise<void> {
        try {
            const email = supervisor.email;
            const subject = subjectCourseReminder;
            const template = templatePug.courseEndingReport;
            const context = {
                supervisorName: supervisor.userName,
                courseName: course.name,
                totalUsers,
                totalSubjectsDone,
                endDate: course.end,
            };

            await this.sendEmailQueue(email, subject, template, context);
        } catch (error) {
            this.logger.error('sendCourseReminderEmail', error, 'message: ', error.message);
        }
    }

    private async sendEmailQueue(email: string, subject: string, template: string, context: any) {
        try {
            await this.mailQueueService.enqueueMailJob({
                to: email,
                subject: subject,
                template: template,
                context: context,
            });

        } catch (error) {
            this.logger.error(`Failed to send reminder email: ${error.message}`, error.stack, 'CourseReminderService');
        }
    }
}
