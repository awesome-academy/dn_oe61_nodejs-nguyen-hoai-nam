import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CourseSubjectStatus } from 'src/database/dto/course_subject.dto';
import { Role } from 'src/database/dto/user.dto';
import { UserSubjectStatus } from 'src/database/dto/user_subject.dto';
import { UserTaskStatus } from 'src/database/dto/user_task.dto';
import { Course } from 'src/database/entities/course.entity';
import { CourseSubject } from 'src/database/entities/course_subject.entity';
import { SupervisorCourse } from 'src/database/entities/supervisor_course.entity';
import { Task } from 'src/database/entities/task.entity';
import { User } from 'src/database/entities/user.entity';
import { UserCourse } from 'src/database/entities/user_course.entity';
import { UserSubject } from 'src/database/entities/user_subject.entity';
import { UserTask } from 'src/database/entities/user_task.entity';
import { ActivityHistoryDto, SubjectWithTasksDto, TraineeCourseProgressDto, TraineeInCourseDto, MySubjectDto } from 'src/helper/interface/user_subject.interface';
import { GetCourse } from 'src/helper/shared/get_course.shared';
import { I18nUtils } from 'src/helper/utils/i18n-utils';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class UserSubjectService {
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
        private readonly logger: Logger,
    ) { }

    async getTraineeSubjectProgress(userSubjectId: number, lang: string): Promise<UserSubject> {
        const userSubject = await this.userSubjectRepo.findOne({
            where: { userSubjectId },
            relations: [
                'user',
                'courseSubject.subject',
                'userTasks',
                'userTasks.task',
            ],
        });

        if (!userSubject) {
            throw new NotFoundException(this.i18nUtils.translate('validation.user_subject.not_found', {}, lang));
        }

        return userSubject;
    }

    async startSubject(userSubjectId: number, supervisorId: number, lang: string): Promise<void> {
        try {
            const userSubject = await this.validateUserSubjectForSupervisor(userSubjectId, supervisorId, lang);

            if (!userSubject) {
                throw new NotFoundException(this.i18nUtils.translate('validation.user_subject.not_found', {}, lang));
            }

            const courseId = userSubject?.courseSubject?.course?.courseId;
            const subjectId = userSubject?.courseSubject?.subject?.subjectId;
            await this.validateCourseSubjectStarted(courseId, subjectId, lang);

            await this.userSubjectRepo.update(userSubjectId, {
                status: UserSubjectStatus.IN_PROGRESS,
                startedAt: new Date(),
            });

        } catch (error) {
            this.logger.error(`startSubject: ${error}`);
            this.i18nUtils.translate('validation.server.internal_server_error', {}, lang)
        }
    }

    private async validateUserSubjectForSupervisor(userSubjectId: number, supervisorId: number, lang: string): Promise<UserSubject> {
        const userSubject = await this.userSubjectRepo.findOne({
            where: { userSubjectId },
            relations: ['courseSubject', 'courseSubject.course', 'courseSubject.subject', 'courseSubject.subject.creator'],
        });

        if (!userSubject) {
            throw new NotFoundException(this.i18nUtils.translate('validation.user_subject.not_found', {}, lang));
        }

        const subjectCreatorId = userSubject.courseSubject.subject.creator.userId;

        if (subjectCreatorId !== supervisorId) {
            throw new ForbiddenException(this.i18nUtils.translate('validation.user_subject.not_belong_to_creator', {}, lang));
        }

        if (userSubject.status !== UserSubjectStatus.NOT_STARTED) {
            throw new BadRequestException(this.i18nUtils.translate('validation.user_subject.already_started', {}, lang));
        }

        return userSubject;
    }


    private async validateCourseSubjectStarted(courseId: number, subjectId: number, lang: string): Promise<CourseSubject> {
        const courseSubject = await this.courseSubjectRepo.findOne({
            where: {
                course: { courseId: courseId },
                subject: { subjectId: subjectId },
            },
        });

        if (!courseSubject) {
            throw new NotFoundException(this.i18nUtils.translate('validation.course_subject.not_found', {}, lang));
        }

        if (courseSubject.status !== CourseSubjectStatus.START) {
            throw new BadRequestException(this.i18nUtils.translate('validation.course_subject.not_started', {}, lang));
        }

        return courseSubject;
    }

    async finishSubject(userSubjectId: number, traineeId: number, lang: string): Promise<void> {
        try {
            await this.validateUserSubjectToFinish(userSubjectId, traineeId, lang);

            await this.ensureAllTasksDone(userSubjectId, lang);

            await this.dataSource.transaction(async (manager) => {
                await manager.update(UserSubject, { userSubjectId }, {
                    status: UserSubjectStatus.COMPLETED,
                    finishedAt: new Date(),
                    subjectProgress: 100,
                });
            });
        } catch (error) {
            this.logger.error(`finishSubject: ${error}`);
            throw new InternalServerErrorException(this.i18nUtils.translate('validation.server.internal_server_error', {}, lang))
        }
    }


    private async validateUserSubjectToFinish(userSubjectId: number, traineeId: number, lang: string): Promise<UserSubject> {
        const userSubject = await this.userSubjectRepo.findOne({
            where: { userSubjectId },
            relations: ['user'],
        });

        if (!userSubject) {
            throw new NotFoundException(this.i18nUtils.translate('validation.user_subject.not_found', {}, lang));
        }

        if (userSubject.user.userId !== traineeId) {
            throw new ForbiddenException(this.i18nUtils.translate('validation.user_subject.not_belong_to_user', {}, lang));
        }

        if (userSubject.status !== UserSubjectStatus.IN_PROGRESS) {
            throw new BadRequestException(this.i18nUtils.translate('validation.user_subject.not_in_progress', {}, lang));
        }

        return userSubject;
    }

    private async ensureAllTasksDone(userSubjectId: number, lang: string): Promise<void> {
        const userSubject = await this.userSubjectRepo.findOne({
            where: { userSubjectId },
            relations: ['courseSubject', 'courseSubject.subject', 'courseSubject.subject.tasks'],
        });

        if (!userSubject) {
            throw new NotFoundException(this.i18nUtils.translate('validation.user_subject.not_found', {}, lang));
        }

        const totalTasks = userSubject?.courseSubject?.subject?.tasks?.length;

        const completedTasks = await this.userTaskRepo.count({
            where: {
                userSubject: { userSubjectId },
                status: UserTaskStatus.DONE,
            },
        });

        if (completedTasks < totalTasks) {
            throw new BadRequestException(this.i18nUtils.translate('validation.user_subject.not_all_done', {}, lang));
        }
    }

    async getUserSubjectDetail(userSubjectId: number, traineeId: number, lang: string): Promise<SubjectWithTasksDto> {
            const userSubject = await this.userSubjectRepo.findOne({
                where: { userSubjectId },
                relations: ['user', 'courseSubject', 'courseSubject.subject', 'courseSubject.subject.tasks',],
            });

            if (!userSubject) {
                throw new NotFoundException(this.i18nUtils.translate('validation.user_subject.not_found', {}, lang));
            }

            if (userSubject.user.userId !== traineeId) {
                throw new ForbiddenException(this.i18nUtils.translate('validation.user_subject.not_belong_to_user', {}, lang));
            }

            const subject = userSubject.courseSubject.subject;
            return {
                subjectId: subject.subjectId,
                name: subject.name,
                description: subject.description,
                studyDuration: subject.studyDuration,
                status: userSubject.status,
                subjectProgress: userSubject.subjectProgress,
                tasks: subject.tasks.map((task) => ({
                    taskId: task.taskId,
                    name: task.name,
                    fileUrl: task.fileUrl,
                })),
            };
    }

    async getMyActivityHistory(traineeId: number, lang: string): Promise<ActivityHistoryDto[]> {
        try {
            const userSubjects = await this.userSubjectRepo.find({
                where: { user: { userId: traineeId } },
                relations: [
                    'courseSubject',
                    'courseSubject.course',
                    'courseSubject.subject',
                ],
            });

            if (userSubjects.length === 0) {
                throw new NotFoundException(this.i18nUtils.translate('validation.user_subject.not_found', {}, lang));
            }

            const userTasks = await this.userTaskRepo.find({
                where: { userSubject: { user: { userId: traineeId } } },
                relations: ['task', 'userSubject', 'userSubject.courseSubject', 'userSubject.courseSubject.subject'],
                order: { userTaskId: 'ASC' },
            });

            const activityHistory = this.tasksGroupedBySubject(userTasks, userSubjects);

            return activityHistory;
        } catch (error) {
            this.logger.error(`getMyActivityHistory: ${error}`);
            throw new InternalServerErrorException(this.i18nUtils.translate('validation.server.internal_server_error', {}, lang))
        }
    }

    private tasksGroupedBySubject(userTasks: UserTask[], userSubjects: UserSubject[]): ActivityHistoryDto[] {
        const tasksGroupedBySubject = userTasks.reduce((acc, task) => {
            const usId = task.userSubject.userSubjectId;
            if (!acc[usId]) acc[usId] = [];
            acc[usId].push({
                taskId: task?.task?.taskId,
                taskName: task?.task?.name,
                status: task?.status,
            });
            return acc;
        }, {} as Record<number, { taskId: number; taskName: string; status: UserTaskStatus }[]>);

        const activityHistory = userSubjects.map((us) => ({
            userSubjectId: us?.userSubjectId,
            courseName: us?.courseSubject?.course?.name,
            subjectName: us?.courseSubject?.subject?.name,
            subjectStatus: us?.status,
            startedAt: us?.startedAt,
            finishedAt: us?.finishedAt,
            tasks: tasksGroupedBySubject[us?.userSubjectId] || [],
        }));

        return activityHistory;
    }

    async getTraineeCourseProgress(courseId: number, traineeId: number, viewer: User, lang: string): Promise<TraineeCourseProgressDto> {
        try {
            await this.checkViewerPermission(courseId, viewer, lang);

            const userSubjects = await this.findUserSubjectAndgetrelations(traineeId, courseId,lang);
            const userTasks = await this.findUsertaskAndgetrelations(traineeId, courseId,lang);

            return this.buildProgressDto(userSubjects, userTasks);
        } catch (error) {
            this.logger.error(`startSubject: ${error}`);
            throw new InternalServerErrorException(this.i18nUtils.translate('validation.server.internal_server_error', {}, lang))
        }
    }

    private async findUserSubjectAndgetrelations(traineeId: number, courseId: number, lang: string) {
        const userSubjects = await this.userSubjectRepo.find({
            where: {
                courseSubject: { course: { courseId } },
                user: { userId: traineeId },
            },
            relations: ['courseSubject', 'courseSubject.subject', 'courseSubject.course'],
        });

        if (userSubjects.length === 0) {
            throw new NotFoundException(this.i18nUtils.translate('validation.user_subject.not_found', {}, lang));
        }

        return userSubjects;
    }

    private async findUsertaskAndgetrelations(traineeId: number, courseId: number, lang: string) {
        const userTasks = await this.userTaskRepo.find({
            where: {
                userSubject: { user: { userId: traineeId }, courseSubject: { course: { courseId } } },
            },
            relations: ['task', 'userSubject', 'userSubject.courseSubject'],
        });

        return userTasks;
    }

    private async checkViewerPermission(courseId: number, viewer: User, lang: string): Promise<void> {
        if (viewer.role === Role.ADMIN) return;

        const isSupervisorOfCourse = await this.supervisorCourseRepo.exists({
            where: { course: { courseId }, supervisor: { userId: viewer.userId } },
        });

        if (!isSupervisorOfCourse) {
            throw new ForbiddenException(this.i18nUtils.translate('validation.auth.access_denied', {}, lang));
        }
    }

    private buildProgressDto(userSubjects: UserSubject[], userTasks: UserTask[]): TraineeCourseProgressDto {
        const subjectsProgress = userSubjects.map((us) => {
            const tasks = userTasks.filter((ut) => ut.userSubject.userSubjectId === us.userSubjectId);
            const totalTasks = tasks.length;
            const completedTasks = tasks.filter((t) => t.status === UserTaskStatus.DONE).length;
            const progress = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

            return {
                userSubjectId: us.userSubjectId,
                subjectName: us.courseSubject.subject.name,
                status: us.status,
                startedAt: us.startedAt,
                finishedAt: us.finishedAt,
                totalTasks,
                completedTasks,
                progress,
            };
        });

        const totalTasks = userTasks.length;
        const completedTasks = userTasks.filter((t) => t.status === UserTaskStatus.DONE).length;
        const courseProgress = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

        return {
            courseName: userSubjects[0]?.courseSubject?.course?.name || null,
            totalTasks,
            completedTasks,
            courseProgress,
            subjects: subjectsProgress,
        };
    }

    async listMySubjects(traineeId: number, lang: string): Promise<MySubjectDto[]> {
        const userSubjects = await this.userSubjectRepo.find({
            where: { user: { userId: traineeId } },
            relations: ['courseSubject', 'courseSubject.course', 'courseSubject.subject'],
            order: { userSubjectId: 'ASC' }
        });

        if (userSubjects.length === 0) {
            throw new NotFoundException(this.i18nUtils.translate('validation.user_subject.not_found', {}, lang));
        }

        return userSubjects.map((us) => ({
            userSubjectId: us.userSubjectId,
            subjectId: us.courseSubject.subject.subjectId,
            subjectName: us.courseSubject.subject.name,
            courseName: us.courseSubject.course.name,
            status: us.status,
            subjectProgress: us.subjectProgress,
        }));
    }

    async getTraineesInCourse(courseId: number, user: User, lang: string): Promise<TraineeInCourseDto[]> {
        const userCourses = await this.userCourseRepo.find({
            where: { course: { courseId } },
            relations: ['user'],
        });

        if (userCourses.length === 0) {
            throw new BadRequestException(this.i18nUtils.translate('validation.course.trainee_not_found', {}, lang))
        }

        return userCourses.map(uc => ({
            userId: uc.user.userId,
            name: uc.user.userName,
            email: uc.user.email,
        }));
    }

}
