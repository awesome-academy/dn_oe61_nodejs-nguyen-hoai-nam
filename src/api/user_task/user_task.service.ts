import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserSubjectStatus } from 'src/database/dto/user_subject.dto';
import { UserTaskStatus } from 'src/database/dto/user_task.dto';
import { Course } from 'src/database/entities/course.entity';
import { CourseSubject } from 'src/database/entities/course_subject.entity';
import { User } from 'src/database/entities/user.entity';
import { UserCourse } from 'src/database/entities/user_course.entity';
import { Task } from 'src/database/entities/task.entity';
import { UserSubject } from 'src/database/entities/user_subject.entity';
import { UserTask } from 'src/database/entities/user_task.entity';
import { maxProgress, millisecondsPerDay } from 'src/helper/constants/cron_expression.constant';
import { TrainingCalendarDto, ViewTaskDto } from 'src/helper/interface/user_task.interface';
import { formatDateForMySQL } from 'src/helper/shared/format_date.shared';
import { GetCourse } from 'src/helper/shared/get_course.shared';
import { I18nUtils } from 'src/helper/utils/i18n-utils';
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
        await this.ensureTraineeExists(traineeId, lang);

        const startDate = fromDate ? new Date(formatDateForMySQL(fromDate)) : undefined;
        const endDate = toDate ? new Date(formatDateForMySQL(toDate)) : undefined;

        const calendarEventList = await this.buildCalendarEventsFromDb(traineeId, startDate, endDate);

        if (calendarEventList.length === 0) {
            throw new BadRequestException(this.i18nUtils.translate('validation.user_subject.not_found', {}, lang),);
        }

        return calendarEventList.map(event => ({
            courseName: event.courseName,
            subjectName: event.subjectName,
            taskName: event.taskName,
            startAt: event.start.toISOString(),
            endAt: event.end.toISOString(),
            type: event.type,
        }));
    }

    private async ensureTraineeExists(traineeId: number, lang: string) {
        const trainee = await this.userRepo.findOne({ where: { userId: traineeId } });
        if (!trainee) {
            throw new NotFoundException(this.i18nUtils.translate('validation.user.not_found', {}, lang));
        }
    }

    private async buildCalendarEventsFromDb(traineeId: number, fromDate?: Date, toDate?: Date) {
        const taskCountsSubQuery = this.taskRepo.createQueryBuilder('task')
            .select('task.subject', 'subjectId')
            .addSelect('COUNT(task.taskId)', 'taskCount')
            .groupBy('task.subject');

        const rankedTasksSubQuery = this.taskRepo.createQueryBuilder('task')
            .where(`NOT EXISTS (
                SELECT 1
                FROM user_task ut
                JOIN user_subject us ON ut.user_subject_id = us.user_subject_id
                WHERE ut.task_id = task.task_id AND us.user_id = :traineeId
            )`)
            .select('task.taskId', 'taskId')
            .addSelect('task.name', 'taskName')
            .addSelect('task.subject', 'subjectId')
            .addSelect('ROW_NUMBER() OVER(PARTITION BY task.subject ORDER BY task.taskId ASC) - 1', 'taskIndex');

        const query = this.userSubjectRepo.createQueryBuilder('us')
            .innerJoin('us.courseSubject', 'cs')
            .innerJoin('cs.subject', 's')
            .innerJoin('cs.course', 'c')
            .innerJoin(`(${rankedTasksSubQuery.getQuery()})`, 'rt', 's.subjectId = rt.subjectId')
            .innerJoin(`(${taskCountsSubQuery.getQuery()})`, 'stc', 's.subjectId = stc.subjectId')
            .where('us.user_id = :traineeId', { traineeId })
            .andWhere('us.startedAt IS NOT NULL')
            .andWhere('us.finishedAt IS NULL')
            .andWhere('stc.taskCount > 0')
            .select([
                'c.name AS courseName',
                's.name AS subjectName',
                'rt.taskName AS taskName',
                'us.startedAt AS startedAt',
                's.studyDuration AS studyDuration',
                'stc.taskCount AS taskCount',
                'rt.taskIndex AS taskIndex',
            ]);

        const rawEvents = await query.getRawMany();

        const allEvents = rawEvents.map(event => {
            const millisecondsPerHour = 60 * 60 * 1000;
            const totalDurationInMs = event.studyDuration * millisecondsPerHour;
            const slotDurationInMs = totalDurationInMs / event.taskCount;
            const assignedDate = new Date(event.startedAt.getTime() + slotDurationInMs * event.taskIndex);
            const dueDate = new Date(assignedDate.getTime() + slotDurationInMs);

            return {
                courseName: event.courseName,
                subjectName: event.subjectName,
                taskName: event.taskName,
                start: assignedDate,
                end: dueDate,
                type: 'task' as const,
            };
        });

        const filteredEvents = allEvents.filter(event => {
            if (fromDate && event.end < fromDate) return false;
            if (toDate && event.start > toDate) return false;
            return true;
        });

        return filteredEvents.sort((a, b) => a.start.getTime() - b.start.getTime());
    }

    async completeTask(userId: number, taskId: number, lang: string): Promise<void> {
        await this.dataSource.transaction(async (manager) => {
            const userTask = await this.markTaskAsDone(userId, taskId, lang, manager);
            await this.updateUserSubjectProgressAndStatus(userTask.userSubject.userSubjectId, manager, lang);
        });
    }

    private async markTaskAsDone(userId: number, taskId: number, lang: string, manager: EntityManager): Promise<UserTask> {
        try {

            const task = await this.findTaskOrFail(taskId, lang, manager);
            const subjectId = task.subject.subjectId;
            const userSubject = await this.findUserSubjectBySubject(subjectId, userId, lang, manager);

            await this.ensureUserTaskNotExists(userSubject.userSubjectId, taskId, lang, manager);

            const newUserTask = manager.getRepository(UserTask).create({
                userSubject,
                task,
                status: UserTaskStatus.DONE,
                doneAt: new Date(),
            });

            return await manager.getRepository(UserTask).save(newUserTask);
        } catch (error) {
            this.logger.error(`markTaskAsDone failed: ${error?.message || error}`, error?.stack);
            throw new InternalServerErrorException(this.i18nUtils.translate('validation.server.internal_server_error', {}, lang));
        }
    }

    private async findUserSubjectBySubject(subjectId: number, userId: number, lang: string, manager: EntityManager): Promise<UserSubject> {
        const userSubject = await manager.getRepository(UserSubject)
            .createQueryBuilder('us')
            .leftJoin('us.courseSubject', 'cs')
            .leftJoin('cs.subject', 's')
            .where('s.subjectId = :subjectId', { subjectId })
            .andWhere('us.user_id = :userId', { userId })
            .getOne();

        if (!userSubject) {
            throw new NotFoundException(this.i18nUtils.translate('validation.user_subject.not_found', {}, lang));
        }
        return userSubject;
    }

    private async findTaskOrFail(taskId: number, lang: string, manager: EntityManager): Promise<Task> {
        const task = await manager.getRepository(Task).findOne({ where: { taskId: taskId }, relations: ['subject'] });
        if (!task) {
            throw new NotFoundException(this.i18nUtils.translate('validation.task.task_not_found', {}, lang));
        }

        return task;
    }

    private async ensureUserTaskNotExists(userSubjectId: number, taskId: number, lang: string, manager: EntityManager): Promise<void> {
        const userTask = await manager.getRepository(UserTask).findOne({
            where: {
                task: { taskId },
                userSubject: { userSubjectId }
            }
        });

        if (userTask) {
            throw new NotFoundException(this.i18nUtils.translate('validation.user_task.complete_task_faild', {}, lang));
        }
    }

    private async calculateSubjectProgress(userSubjectId: number,manager: EntityManager,lang: string,): Promise<{ progress: number; isCompleted: boolean }> {
        const userSubject = await manager.getRepository(UserSubject).findOne({
            where: { userSubjectId },
            relations: ['courseSubject', 'courseSubject.subject'],
        });

        if (!userSubject) {
            throw new NotFoundException(this.i18nUtils.translate('validation.user_subject.not_found', {}, lang));
        }

        const subjectId = userSubject.courseSubject.subject.subjectId;

        const userTaskRepo = manager.getRepository(UserTask);
        const taskRepo = manager.getRepository(Task);

        const [totalTasks, doneTasks] = await Promise.all([
            taskRepo.count({ where: { subject: { subjectId } } }),
            userTaskRepo.count({
                where: {
                    userSubject: { userSubjectId },
                    status: UserTaskStatus.DONE,
                },
            }),
        ]);

        if (totalTasks === 0) {
            throw new BadRequestException(this.i18nUtils.translate('validation.user_task.user_task_not_found_date', {}, lang))
        }

        const rawProgress = (doneTasks / totalTasks) * maxProgress;
        const cappedProgress = Math.max(0, Math.min(maxProgress, Math.round(rawProgress)));

        return { progress: cappedProgress, isCompleted: doneTasks === totalTasks };
    }

    private async updateUserSubjectProgressAndStatus(userSubjectId: number, manager: EntityManager, lang: string): Promise<void> {

        const { progress, isCompleted } = await this.calculateSubjectProgress(userSubjectId, manager, lang);

        const updatePayload: Partial<UserSubject> = {
            subjectProgress: progress,
        };

        if (isCompleted) {
            updatePayload.status = UserSubjectStatus.COMPLETED;
            updatePayload.finishedAt = new Date();
        }

        await manager.getRepository(UserSubject).update({ userSubjectId }, updatePayload);
    }

    async getViewTask(userId: number, taskId: number, lang: string): Promise<ViewTaskDto> {
        const result = await this.dataSource
            .createQueryBuilder('task', 't')
            .select(['t.taskId as taskId', 't.name as Name', 't.file_url as fileUrl'])
            .innerJoin('user_task', 'ut', 'ut.task_id = t.task_id')
            .innerJoin('user_subject', 'us', 'us.user_subject_id = ut.user_subject_id')
            .where('t.task_id = :taskId', { taskId })
            .andWhere('us.user_id = :userId', { userId })
            .getRawOne();

        if (!result) {
            throw new BadRequestException(this.i18nUtils.translate('validation.task.task_not_found', {}, lang));
        }
        return result;
    }

}
