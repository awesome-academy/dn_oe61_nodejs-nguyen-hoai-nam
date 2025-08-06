import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from 'src/database/dto/user.dto';
import { UserTaskStatus } from 'src/database/dto/user_task.dto';
import { Course } from 'src/database/entities/course.entity';
import { CourseSubject } from 'src/database/entities/course_subject.entity';
import { SupervisorCourse } from 'src/database/entities/supervisor_course.entity';
import { Task } from 'src/database/entities/task.entity';
import { User } from 'src/database/entities/user.entity';
import { UserCourse } from 'src/database/entities/user_course.entity';
import { UserSubject } from 'src/database/entities/user_subject.entity';
import { UserTask } from 'src/database/entities/user_task.entity';
import { ActivityLogDto, ReportResponseDto } from 'src/helper/interface/reporting.interface';
import { GetCourse } from 'src/helper/shared/get_course.shared';
import { I18nUtils } from 'src/helper/utils/i18n-utils';
import { ReportFilterDto } from 'src/validation/class_validation/report_filter.validation';
import { Between, DataSource, In, Not, Repository } from 'typeorm';

@Injectable()
export class ReportingService {
    constructor(
        @InjectRepository(Course) private readonly courseRepo: Repository<Course>,
        @InjectRepository(UserCourse) private readonly userCourseRepo: Repository<UserCourse>,
        @InjectRepository(CourseSubject) private readonly courseSubjectRepo: Repository<CourseSubject>,
        @InjectRepository(User) private readonly userRepo: Repository<User>,
        @InjectRepository(UserSubject) private readonly userSubjectRepo: Repository<UserSubject>,
        @InjectRepository(UserTask) private readonly userTaskRepo: Repository<UserTask>,
        @InjectRepository(Task) private readonly taskRepo: Repository<Task>,
        @InjectRepository(SupervisorCourse) private readonly supervisorCourseRepo: Repository<SupervisorCourse>,
        private readonly i18nUtils: I18nUtils,
        private readonly dataSource: DataSource,
        private readonly getCourse: GetCourse,
    ) { }

    async getReportData(filter: ReportFilterDto, user: User, lang: string): Promise<ReportResponseDto> {
        const { startDate, endDate, courseId, type } = filter;

        const query = this.dataSource
            .getRepository(UserTask)
            .createQueryBuilder('userTask')
            .innerJoinAndSelect('userTask.userSubject', 'userSubject')
            .innerJoin('userSubject.courseSubject', 'courseSubject')
            .innerJoin('courseSubject.course', 'course')
            .where('userTask.assignedAt BETWEEN :start AND :end', { start: startDate, end: endDate });

        if (courseId) {
            query.andWhere('course.courseId = :courseId', { courseId });
        }

        if (user.role === Role.SUPERVISOR) {
            query.innerJoin('course.supervisorCourses', 'sc')
                .andWhere('sc.supervisor_id = :supervisorId', { supervisorId: user.userId });
        }

        const tasks = await query.select([
            'userTask.userTaskId',
            'userTask.status',
            'userSubject.userSubjectId',
            'userSubject.subjectProgress',
        ]).getMany();

        if (!tasks.length) {
            throw new NotFoundException({ message: this.i18nUtils.translate('validation.report.not_found', { lang }), });
        }

        return this.buildReportData(tasks);
    }

    private async buildReportData(tasks: UserTask[]): Promise<ReportResponseDto> {
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(t => t.status === UserTaskStatus.DONE).length;

        const subjectProgressMap = new Map<number, number>();

        for (const task of tasks) {
            const subjectid = task.userSubject.userSubjectId;
            if (!subjectProgressMap.has(subjectid)) {
                subjectProgressMap.set(subjectid, task.userSubject.subjectProgress ?? 0);
            }
        }

        const totalProgress = Array.from(subjectProgressMap.values()).reduce((sum, p) => sum + p, 0);
        const averageProgress = subjectProgressMap.size > 0
            ? Math.round(totalProgress / subjectProgressMap.size)
            : 0;

        return {
            totalTasks,
            completedTasks,
            averageProgress,
        };
    }

    async getActivityLogs(courseId: number, lang: string, user: User, userId?: number): Promise<ActivityLogDto[]> {
        const query = this.userTaskRepo
            .createQueryBuilder('userTask')
            .leftJoin('userTask.userSubject', 'us')
            .leftJoin('us.userCourse', 'uc')
            .leftJoin('uc.course', 'course')
            .leftJoin('us.subject', 'subject')
            .leftJoin('userTask.task', 'task')
            .leftJoin('us.user', 'student')

            .where('course.courseId = :courseId', { courseId });

        if (user.role === Role.SUPERVISOR) {
            query.innerJoin('course.supervisorCourses', 'sc')
                .andWhere('sc.supervisor_id = :supervisorId', { supervisorId: user.userId });
        }

        if (userId) {
            query.andWhere('student.userId = :userId', { userId });
        }

        const results = await query.select([
            'userTask.status',
            'userTask.assignedAt',
            'userTask.submittedAt',
            'task.name',
            'student.fullName',
            'subject.name',
        ]).orderBy('userTask.assignedAt', 'DESC').getMany();

        return results.map(user_task => {
            if (!user_task) {
                throw new BadRequestException(this.i18nUtils.translate('validation.user_task.user_task_not_found', {}, lang))
            }

            const taskName = user_task?.task?.name ?? null;
            const status = user_task?.status as UserTaskStatus;
            const assignedAt = user_task?.assignedAt;
            const userName = user_task?.userSubject?.user?.userName ?? null;
            const subjectName = user_task?.userSubject?.courseSubject?.subject?.name ?? null;

            return { taskName, status, assignedAt, userName, subjectName };
        });
    }

}
