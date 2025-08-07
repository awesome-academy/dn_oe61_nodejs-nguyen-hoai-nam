import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
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
import { maxProgress } from 'src/helper/constants/cron_expression.constant';
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
        const { startDate, endDate, courseId } = filter;

        const query = this.dataSource
            .getRepository(UserTask)
            .createQueryBuilder('userTask')
            .innerJoinAndSelect('userTask.userSubject', 'userSubject')
            .innerJoin('userSubject.courseSubject', 'courseSubject')
            .innerJoin('courseSubject.course', 'course')
            .where('userSubject.startedAt BETWEEN :start AND :end', {
                start: startDate,
                end: endDate,
            });

        if (courseId) {
            query.andWhere('course.courseId = :courseId', { courseId });
        }

        if (user.role === Role.SUPERVISOR) {
            query
                .innerJoin('course.supervisorCourses', 'supervisorCourse')
                .andWhere('supervisorCourse.supervisor_id = :supervisorId', {
                    supervisorId: user.userId,
                });
        }

        const tasks = await query
            .select([
                'userTask.userTaskId',
                'userTask.status',
                'userSubject.userSubjectId',
                'userSubject.subjectProgress',
            ])
            .getMany();

        if (tasks.length === 0) {
            throw new NotFoundException(this.i18nUtils.translate('validation.report.not_found',{},lang));
        }

        return this.buildReportData(tasks);
    }

    private buildReportData(tasks: UserTask[]): ReportResponseDto {
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(t => t.status === UserTaskStatus.DONE).length;
        const uncompletedTasks = totalTasks - completedTasks;
        const averageTaskCompletionRate =
            totalTasks > 0 ? Math.round((completedTasks / totalTasks) * maxProgress) : 0;

        const subjectMap = new Map<number, number>();
        for (const task of tasks) {
            const subjectId = task.userSubject.userSubjectId;
            if (!subjectMap.has(subjectId)) {
                subjectMap.set(subjectId, task.userSubject.subjectProgress ?? 0);
            }
        }

        const totalSubjects = subjectMap.size;
        const completedSubjects = Array.from(subjectMap.values()).filter(prog => prog === maxProgress).length;
        const uncompletedSubjects = totalSubjects - completedSubjects;

        const totalSubjectProgress = Array.from(subjectMap.values()).reduce((sum, prog) => sum + prog, 0);
        const averageSubjectProgress =
            totalSubjects > 0 ? Math.round(totalSubjectProgress / totalSubjects) : 0;

        return {
            totalSubjects,
            completedSubjects,
            uncompletedSubjects,
            averageSubjectProgress,

            totalTasks,
            completedTasks,
            uncompletedTasks,
            averageTaskCompletionRate,
        };
    }

    async getActivityLogs(courseId: number, lang: string, user: User, userId?: number): Promise<ActivityLogDto[]> {
        await this.validateAccess(courseId, user, lang);

        const [courseLogs, subjectLogs, taskLogs] = await Promise.all([
            this.getCourseLogs(courseId, userId),
            this.getSubjectLogs(courseId, userId),
            this.getTaskLogs(courseId, userId),
        ]);

        const allLogs = [...(courseLogs || []), ...(subjectLogs || []), ...(taskLogs || []),];

        if (allLogs.length === 0) return [];

        return allLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }

    private async validateAccess(courseId: number, user: User, lang: string): Promise<void> {
        if (user.role === Role.ADMIN) return;

        const isSupervisor = await this.supervisorCourseRepo.exists({
            where: { course: { courseId }, supervisor: { userId: user.userId } }
        });

        if (!isSupervisor) {
            throw new ForbiddenException(this.i18nUtils.translate('validation.auth.access_denied', {}, lang));
        }
    }

    private async getCourseLogs(courseId: number, userId?: number): Promise<ActivityLogDto[]> {
        const userCourseLogs = await this.userCourseRepo
            .createQueryBuilder('uc')
            .select([
                'uc.course_id AS courseId',
                'uc.user_id AS userId',
                `'COURSE_REGISTER' AS eventType`,
                'uc.registration_date AS timestamp',
                `NULL AS meta`
            ])
            .where('uc.course_id = :courseId', { courseId })
            .andWhere(userId ? 'uc.user_id = :userId' : '1=1', { userId })
            .getRawMany<ActivityLogDto>();

        const finishedLogs = await this.userCourseRepo
            .createQueryBuilder('uc')
            .select([
                'uc.course_id AS courseId',
                'uc.user_id AS userId',
                `'COURSE_FINISH' AS eventType`,
                'uc.finished_at AS timestamp',
                `NULL AS meta`
            ])
            .where('uc.course_id = :courseId', { courseId })
            .andWhere('uc.finished_at IS NOT NULL')
            .andWhere(userId ? 'uc.user_id = :userId' : '1=1', { userId })
            .getRawMany<ActivityLogDto>();

        return [...userCourseLogs, ...finishedLogs];
    }

    private async getSubjectLogs(courseId: number, userId?: number): Promise<ActivityLogDto[]> {
        const query = this.userSubjectRepo
            .createQueryBuilder('us')
            .innerJoin('us.courseSubject', 'cs')
            .select([
                'cs.course_id AS courseId',
                'us.user_id AS userId',
                `'SUBJECT_START' AS eventType`,
                'us.started_at AS timestamp',
                'cs.subject_id AS "meta.subjectId"'
            ])
            .where('cs.course_id = :courseId', { courseId })
            .andWhere('us.started_at IS NOT NULL');

        if (userId) query.andWhere('us.user_id = :userId', { userId });

        const startedLogs = await query.getRawMany<ActivityLogDto>();

        const finishedLogs = await this.userSubjectRepo
            .createQueryBuilder('us')
            .innerJoin('us.courseSubject', 'cs')
            .select([
                'cs.course_id AS courseId',
                'us.user_id AS userId',
                `'SUBJECT_FINISH' AS eventType`,
                'us.finished_at AS timestamp',
                'cs.subject_id AS "meta.subjectId"'
            ])
            .where('cs.course_id = :courseId', { courseId })
            .andWhere('us.finished_at IS NOT NULL')
            .andWhere(userId ? 'us.user_id = :userId' : '1=1', { userId })
            .getRawMany<ActivityLogDto>();

        return [...startedLogs, ...finishedLogs];
    }

    private async getTaskLogs(courseId: number, userId?: number): Promise<ActivityLogDto[]> {
        const query = this.userTaskRepo
            .createQueryBuilder('ut')
            .innerJoin('ut.userSubject', 'us')
            .innerJoin('us.courseSubject', 'cs')
            .select([
                'cs.course_id AS courseId',
                'us.user_id AS userId',
                `'TASK_DONE' AS eventType`,
                'ut.done_at AS timestamp',
                'ut.task_id AS "meta.taskId"'
            ])
            .where('cs.course_id = :courseId', { courseId })
            .andWhere('ut.done_at IS NOT NULL');

        if (userId) query.andWhere('us.user_id = :userId', { userId });

        return await query.getRawMany<ActivityLogDto>();
    }
}
