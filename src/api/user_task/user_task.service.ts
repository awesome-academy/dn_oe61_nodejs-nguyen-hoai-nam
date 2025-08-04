import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserSubjectStatus } from 'src/database/dto/user_subject.dto';
import { UserTaskStatus } from 'src/database/dto/user_task.dto';
import { Course } from 'src/database/entities/course.entity';
import { CourseSubject } from 'src/database/entities/course_subject.entity';
import { Task } from 'src/database/entities/task.entity';
import { User } from 'src/database/entities/user.entity';
import { UserCourse } from 'src/database/entities/user_course.entity';
import { UserSubject } from 'src/database/entities/user_subject.entity';
import { UserTask } from 'src/database/entities/user_task.entity';
import { maxProgress } from 'src/helper/constants/cron_expression.constant';
import { TrainingCalendarDto } from 'src/helper/interface/user_task.interface';
import { address, formatDate, formatDateForMySQL } from 'src/helper/shared/format_date.shared';
import { GetCourse } from 'src/helper/shared/get_course.shared';
import { I18nUtils } from 'src/helper/utils/i18n-utils';
import { CompleteTaskDto } from 'src/validation/class_validation/user_task.validation';
import { DataSource, EntityManager, Repository } from 'typeorm';

@Injectable()
export class UserTaskService {
    constructor(
        @InjectRepository(Course) private readonly courseRepo: Repository<Course>,
        @InjectRepository(UserCourse) private readonly userCourseRepo: Repository<UserCourse>,
        @InjectRepository(CourseSubject) private readonly courseSubjectRepo: Repository<CourseSubject>,
        @InjectRepository(User) private readonly userRepo: Repository<User>,
        @InjectRepository(UserSubject) private readonly userSubjectRepo: Repository<UserSubject>,
        @InjectRepository(UserTask) private readonly userTaskRepo: Repository<UserTask>,
        @InjectRepository(Task) private readonly taskRepo: Repository<Task>,
        private readonly i18nUtils: I18nUtils,
        private readonly dataSource: DataSource,
        private readonly getCourse: GetCourse,
        private readonly logger: Logger,
    ) { }

    async getTrainingCalendar(traineeId: number, lang: string, fromDate?: string, toDate?: string): Promise<TrainingCalendarDto[]> {
        const user = await this.userRepo.findOneBy({ userId: traineeId });
        if (!user) {
            throw new NotFoundException(this.i18nUtils.translate('validation.auth.user_notfound', {}, lang));
        }

        const results = await this.queryInformationUserTask(traineeId, lang, fromDate, toDate);

        return results.map(row => ({
            courseName: row.course_name,
            subjectName: row.subject_name,
            taskName: row.task_name,
            status: row.status,
            assignedAt: row.assigned_at ? formatDate(new Date(row.assigned_at), address) : null,
            dueAt: row.due_at ? formatDate(new Date(row.due_at), address) : null,
        }));
    }

    private async queryInformationUserTask(traineeId: number, lang: string, fromDate?: string, toDate?: string) {
        const fromDateFormatted = fromDate ? formatDateForMySQL(fromDate) : undefined;
        const toDateFormatted = toDate ? formatDateForMySQL(toDate) : undefined;

        const query = this.userTaskRepo
            .createQueryBuilder('userTask')
            .leftJoin('userTask.userSubject', 'userSubject')
            .leftJoin('userSubject.user', 'user')
            .leftJoin('userSubject.courseSubject', 'courseSubject')
            .leftJoin('courseSubject.course', 'course')
            .leftJoin('courseSubject.subject', 'subject')
            .leftJoin('userTask.task', 'task')
            .where('user.user_id = :userId', { userId: traineeId })
            .andWhere('userTask.assignedAt IS NOT NULL');

        if (fromDateFormatted) {
            query.andWhere('userTask.assignedAt >= :fromDate', { fromDate: fromDateFormatted });
        }

        if (toDateFormatted) {
            query.andWhere('userTask.assignedAt <= :toDate', { toDate: toDateFormatted });
        }

        query.select([
            'course.name AS course_name',
            'subject.name AS subject_name',
            'task.name AS task_name',
            'userTask.status AS status',
            'userTask.assignedAt AS assigned_at',
            'userTask.dueAt AS due_at',
        ]);

        query.orderBy('userTask.assignedAt', 'ASC');

        const results = await query.getRawMany();
        return results;
    }

    async completeTask(userId: number, taskId: number, dto: CompleteTaskDto, lang: string): Promise<void> {
        await this.dataSource.transaction(async (manager) => {
            const userTask = await this.markTaskAsDone(userId, taskId, dto, lang, manager);
            await this.updateUserSubjectProgressAndStatus(userTask.userSubject.userSubjectId, manager,lang);
        });
    }

    private async markTaskAsDone(userId: number, taskId: number, dto: CompleteTaskDto, lang: string, manager: EntityManager): Promise<UserTask> {
        const { userSubjectId } = dto;

        const userSubject = await manager.getRepository(UserSubject).findOne({
            where: {
                userSubjectId,
                user: { userId },
            },
            relations: ['user'],
        });

        if (!userSubject) {
            throw new NotFoundException(this.i18nUtils.translate('validation.user_subject.user_subject_not_found', {}, lang));
        }

        const task = await manager.getRepository(Task).findOneBy({ taskId });
        if (!task) {
            throw new NotFoundException(this.i18nUtils.translate('validation.task.task_not_found', {}, lang));
        }

        const newUserTask = manager.getRepository(UserTask).create({
            userSubject,
            task,
            status: UserTaskStatus.DONE,
            doneAt: new Date(),
        });

        return await manager.getRepository(UserTask).save(newUserTask);
    }

    private async updateUserSubjectProgressAndStatus(userSubjectId: number, manager: EntityManager,lang:string): Promise<void> {
        const userTaskRepo = manager.getRepository(UserTask);

        const [totalTasks, doneTasks] = await Promise.all([
            userTaskRepo.count({ where: { userSubject: { userSubjectId } } }),
            userTaskRepo.count({
                where: {
                    userSubject: { userSubjectId },
                    status: UserTaskStatus.DONE,
                },
            }),
        ]);

        if (totalTasks === 0) {
            throw new BadRequestException(this.i18nUtils.translate('validation.user_task.user_task_not_found_date',{},lang))
        }

        const rawProgress = (doneTasks / totalTasks) * maxProgress;
        const cappedProgress = Math.max(0, Math.min(maxProgress, Math.round(rawProgress)));

        const updatePayload: Partial<UserSubject> = {
            subjectProgress: cappedProgress,
        };

        if (doneTasks === totalTasks) {
            updatePayload.status = UserSubjectStatus.COMPLETED;
            updatePayload.finishedAt = new Date();
        }

        await manager.getRepository(UserSubject).update({ userSubjectId }, updatePayload);
    }
}
