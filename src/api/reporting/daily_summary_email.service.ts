import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { endOfDay, startOfDay } from "date-fns";
import { format } from 'date-fns';
import { Role, UserStatus } from "src/database/dto/user.dto";
import { SupervisorCourse } from "src/database/entities/supervisor_course.entity";
import { User } from "src/database/entities/user.entity";
import { UserTask } from "src/database/entities/user_task.entity";
import { CronExpression, formatDateConstant, subjectDailySummary } from "src/helper/constants/cron_expression.constant";
import { templatePug } from "src/helper/constants/template.constant";
import { MailQueueService } from "src/helper/Queue/mail/mail_queue.service";
import { Repository } from "typeorm";

@Injectable()
export class DailySummaryEmailService {
    constructor(
        @InjectRepository(User) private userRepo: Repository<User>,
        @InjectRepository(UserTask) private userTaskRepo: Repository<UserTask>,
        @InjectRepository(SupervisorCourse) private supervisorCourseRepo: Repository<SupervisorCourse>,
        private readonly mailQueueService: MailQueueService,
        private readonly logger: Logger,
    ) { }

    @Cron(CronExpression.DAILY_AT_23_59)
    async sendDailySummaryEmails() {
        const supervisors = await this.getAllSupervisors();

        await Promise.all(supervisors.map(async (supervisor) => {
            try {
                const courseIds = await this.getSupervisorCourseIds(supervisor.userId);
                if (courseIds.length === 0) return;

                const activitySummary = await this.getDailyActivitySummary(courseIds);
                await this.sendSummaryEmail(supervisor, activitySummary);
            } catch (error) {
                this.logger.error(`Lỗi khi gửi email cho supervisor ${supervisor.userId}: ${error.message}`);
            }
        }));
    }

    private async getAllSupervisors(): Promise<User[]> {
        return this.userRepo.find({ where: { role: Role.SUPERVISOR, status: UserStatus.ACTIVE } });
    }

    private async getSupervisorCourseIds(supervisorId: number): Promise<number[]> {
        const records = await this.supervisorCourseRepo.find({
            where: { supervisor: { userId: supervisorId } },
            relations: ['course'],
        });
        return records.map(r => r.course.courseId);
    }

    private async getDailyActivitySummary(courseIds: number[]): Promise<any> {
        const now = new Date();
        const startOfToday = startOfDay(now);
        const endOfToday = endOfDay(now);

        const qb = this.userTaskRepo.createQueryBuilder('userTask')
            .leftJoin('userTask.userSubject', 'userSubject')
            .leftJoin('userSubject.user', 'user')
            .leftJoin('userSubject.courseSubject', 'courseSubject')
            .leftJoin('courseSubject.course', 'course')
            .where('course.courseId IN (:...courseIds)', { courseIds })
            .andWhere('userTask.doneAt BETWEEN :start AND :end', { start: startOfToday, end: endOfToday });

        const activities = await qb.select([
            'user.userId',
            'user.userName as userName',
            'COUNT(userTask.userTaskId) AS taskCount',
            'SUM(CASE WHEN userTask.status = \'DONE\' THEN 1 ELSE 0 END) AS doneCount',
        ]).groupBy('user.userId').getRawMany();

        return activities;
    }

    private async sendSummaryEmail(supervisor: User, activitySummary: any) {
        if (!supervisor.email) {
            console.warn(`Supervisor [${supervisor.userId}] không có email.`);
            return;
        }

        const to = supervisor.email;
        const subject = subjectDailySummary;
        const template = templatePug.dailySummaryReport;
        const formatDate = formatDateConstant;

        const context = {
            userName: supervisor.userName,
            activitySummary,
            reportDate: format(new Date(), formatDate),
        };

        await this.mailQueueService.enqueueMailJob({ to, subject, template, context });
    }
}
