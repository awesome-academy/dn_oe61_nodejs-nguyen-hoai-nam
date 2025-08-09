import { MailerService } from '@nestjs-modules/mailer';
import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { CourseStatus } from 'src/database/dto/course.dto';
import { CourseSubjectStatus } from 'src/database/dto/course_subject.dto';
import { Role } from 'src/database/dto/user.dto';
import { UserCourseStatus } from 'src/database/dto/user_course.dto';
import { UserSubjectStatus } from 'src/database/dto/user_subject.dto';
import { Course } from 'src/database/entities/course.entity';
import { CourseSubject } from 'src/database/entities/course_subject.entity';
import { SupervisorCourse } from 'src/database/entities/supervisor_course.entity';
import { User } from 'src/database/entities/user.entity';
import { UserCourse } from 'src/database/entities/user_course.entity';
import { UserSubject } from 'src/database/entities/user_subject.entity';
import { course_process_constant, firstCourseProgress, firstUserSubjectProgress, maxProgress, todayDate } from 'src/helper/constants/cron_expression.constant';
import { tableName } from 'src/helper/constants/emtities.constant';
import { templatePug } from 'src/helper/constants/template.constant';
import { ApiResponse } from 'src/helper/interface/api.interface';
import { AssignTraineeToCourseResponseDto, CourseDetailDto, CourseListItem } from 'src/helper/interface/course.iterface';
import { GetCourse } from 'src/helper/shared/get_course.shared';
import { I18nUtils } from 'src/helper/utils/i18n-utils';
import { CreateCourseDto, UpdateCourseDto } from 'src/validation/class_validation/course.validation';
import { DatabaseValidation } from 'src/validation/existence/existence.validator';
import { DataSource, EntityManager, In, Repository } from 'typeorm';

@Injectable()
export class CourseService {
    constructor(
        @InjectRepository(Course) private readonly courseRepo: Repository<Course>,
        @InjectRepository(UserCourse) private readonly userCourseRepo: Repository<UserCourse>,
        @InjectRepository(CourseSubject) private readonly courseSubjectRepo: Repository<CourseSubject>,
        @InjectRepository(SupervisorCourse) private readonly supervisorCourseRepo: Repository<SupervisorCourse>,
        @InjectRepository(User) private readonly userRepo: Repository<User>,
        @InjectRepository(UserSubject) private readonly userSubjectRepo: Repository<UserSubject>,
        private readonly databaseValidation: DatabaseValidation,
        private readonly i18nUtils: I18nUtils,
        private readonly dataSource: DataSource,
        private readonly getCourse: GetCourse,
        private readonly mailerService: MailerService,
        private readonly logger: Logger,

    ) { }

    private async getCoursesByRole(userId: number, role: string, page: number, pageSize: number): Promise<[Course[], number]> {
        if (role === Role.ADMIN) {
            return this.getCourse.getCoursesByAdmin(page, pageSize);
        } else if (role === Role.SUPERVISOR) {
            return this.getCourse.getCoursesBySupervisor(userId, page, pageSize);
        } else if (role === Role.TRAINEE) {
            return this.getCourse.getCoursesByTrainee(userId, page, pageSize);
        } else {
            return [[], 0];
        }
    }

    async getAll(userId: number, role: string, page: number, pageSize: number, lang: string) {
        const [courses, totalItems] = await this.getCoursesByRole(userId, role, page, pageSize);

        if (totalItems === 0) {
            return {
                items: [],
                meta: {
                    totalItems: 0,
                    totalPages: 0,
                    currentPage: page,
                },
            };
        }

        const items: CourseListItem[] = courses.map(course => ({
            id: course.courseId,
            name: course.name,
            description: course.description,
            status: course.status,
            start: course.start,
            end: course.end,
        }));

        const totalPages = Math.ceil(totalItems / pageSize);

        return {
            items,
            meta: {
                totalItems,
                totalPages,
                currentPage: page,
            },
        };
    }

    async getMyCourses(userId: number, role: string): Promise<Course[]> {
        let courses: Course[] = [];
        if (role === Role.SUPERVISOR) {
            [courses] = await this.getCourse.getCoursesBySupervisor(userId, null, null);
        } else if (role === Role.TRAINEE) {
            [courses] = await this.getCourse.getCoursesByTrainee(userId, null, null);
        }
        return courses;
    }

    async getById(courseId: number, user: User, lang: string): Promise<CourseDetailDto> {
        const course = await this.courseRepo.findOne({
            where: { courseId },
            relations: ['creator', 'courseSubjects', 'courseSubjects.subject'],
        });

        if (!course) {
            throw new NotFoundException(this.i18nUtils.translate('validation.course.not_found', {}, lang))
        }

        if (user.role === Role.TRAINEE) {
            const isRegistered = await this.userCourseRepo.findOneBy({
                user: { userId: user.userId },
                course: { courseId: course.courseId },
            });

            if (!isRegistered) {
                throw new ForbiddenException(this.i18nUtils.translate('validation.course.not_found', {}, lang));
            }
        }

        const courseDetail: CourseDetailDto = {
            id: course.courseId,
            courseId: course.courseId,
            name: course.name,
            description: course.description,
            status: course.status,
            start: course.start,
            end: course.end,
            creator: course.creator ? { userId: course.creator.userId, userName: course.creator.userName } : null,
            subjects: course.courseSubjects.map(cs => cs.subject),
        }
        return courseDetail;
    }

    async create(courseInput: CreateCourseDto, userId: number, lang: string): Promise<Course> {

        const savedCourse = await this.savedCourse(courseInput, userId, lang)
        await this.saveCourseSubjects(savedCourse.courseId, courseInput.subjectIds, lang);

        return savedCourse;
    }

    private async savedCourse(courseInput: CreateCourseDto, userId: number, lang: string): Promise<Course> {
        const { name, description, status, start, end, subjectIds } = courseInput;

        if (!subjectIds || subjectIds.length === 0) {
            throw new BadRequestException(this.i18nUtils.translate('validation.course.arrayNotEmpty', {}, lang));
        }

        const data = this.courseRepo.create({
            name: name,
            description: description,
            status: status,
            start: start,
            end: end,
            creator: { userId },
        } as Course);

        const savedCourse = await this.courseRepo.save(data);

        if (!savedCourse) {
            throw new BadRequestException(this.i18nUtils.translate('validation.crud.create_faild', {}, lang))
        }

        return savedCourse;
    }

    private async saveCourseSubjects(courseId: number, subjectIds: number[], lang: string): Promise<void> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const courseSubjectRepo = queryRunner.manager.getRepository(CourseSubject);
            const courseSubjects = subjectIds.map(subjectId =>
                courseSubjectRepo.create({
                    course: { courseId },
                    subject: { subjectId },
                    status: CourseSubjectStatus.NOT_STARTED
                })
            );

            await queryRunner.manager.save(courseSubjects);
            await queryRunner.commitTransaction();
        } catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error(`saveCourseSubjects failed: ${error?.message || error}`, error?.stack, 'CourseService',
            );
            throw new InternalServerErrorException(this.i18nUtils.translate('validation.server.internal_server_error', {}, lang));
        } finally {
            await queryRunner.release()
        }
    }

    async delete(courseId: number, lang: string): Promise<void> {
        const course = await this.courseRepo.findOne({
            where: { courseId },
            relations: ['creator', 'courseSubjects', 'courseSubjects.subject'],
        });

        if (!course) {
            throw new NotFoundException(this.i18nUtils.translate('validation.crud.delete_not_allowed', {}, lang));
        }

        await this.checkAllCourseRelations(courseId, lang);
        await this.deleteCourseWithRelations(courseId, lang);
    }

    private async checkAllCourseRelations(courseId: number, lang: string) {
        await this.databaseValidation.checkCourseRelationExists(this.userCourseRepo, tableName.userCourse, tableName.course, courseId, lang);
        await this.databaseValidation.checkCourseRelationExists(this.userCourseRepo, tableName.courseSubject, tableName.course, courseId, lang);
        await this.databaseValidation.checkCourseRelationExists(this.userCourseRepo, tableName.supervisorCourse, tableName.course, courseId, lang);
    }

    private async deleteCourseWithRelations(courseId: number, lang: string) {
        return await this.dataSource.transaction(async (manager) => {
            const deleteResult = await manager.delete(this.courseRepo.target, { courseId });

            if (deleteResult.affected === 0) {
                throw new BadRequestException(this.i18nUtils.translate('validation.crud.delete_faild', {}, lang));
            }
        });
    }

    async update(courseInput: UpdateCourseDto, courseId: number, lang: string): Promise<UpdateCourseDto> {
        const hasValidField = Object.values(courseInput).some(value => value !== undefined);

        if (!hasValidField) {
            throw new BadRequestException(this.i18nUtils.translate('validation.crud.missing_required_fields', {}, lang));
        }

        if (!courseId) {
            throw new NotFoundException(this.i18nUtils.translate('validation.course.not_found', {}, lang));
        }

        const savedCourse = await this.findAndUpdateCourse(courseId, courseInput, lang);

        const data: UpdateCourseDto = {
            name: savedCourse.name,
            description: savedCourse.description,
            status: savedCourse.status,
            start: savedCourse.start,
            end: savedCourse.end,
        }
        return data;
    }

    private async findCourseOrFail(courseId: number, lang: string): Promise<Course> {
        const course = await this.courseRepo.findOneOrFail({
            where: { courseId },
            select: ['courseId', 'name', 'description', 'status', 'start', 'end'],
        });

        if (!course) {
            throw new BadRequestException(this.i18nUtils.translate('validation.crud.no_changes', {}, lang));
        }
        return course;
    }

    private async findAndUpdateCourse(courseId: number, courseInput: UpdateCourseDto, lang: string): Promise<Course> {
        const course = await this.findCourseOrFail(courseId, lang);

        const { name, description, status, start, end } = courseInput;

        if (name !== undefined) course.name = name;
        if (description !== undefined) course.description = description;
        if (start !== undefined) course.start = start

        if (end !== undefined) course.end = end;
        if (status !== undefined) course.status = status;

        Object.assign(course, courseInput);
        const savedCourse: Course | null = await this.courseRepo.save(course);

        if (!savedCourse) {
            throw new NotFoundException(this.i18nUtils.translate('validation.crud.update_faild', {}, lang));
        }

        return savedCourse;
    }

    async assignSupervisorToCourse(courseId: number, supervisorId: number, lang: string): Promise<SupervisorCourse> {

        const user = await this.checkUserRole(supervisorId, Role.SUPERVISOR);
        if (!user) {
            throw new BadRequestException(this.i18nUtils.translate('validation.course.user_not_supervisor', {}, lang));
        }

        const existing = await this.checkAssigned(courseId, supervisorId, lang);
        if (existing) {
            throw new BadRequestException(this.i18nUtils.translate('validation.course.user_duplicate', {}, lang));
        }

        try {
            const assignment = this.supervisorCourseRepo.create({
                supervisor: { userId: supervisorId },
                course: { courseId: courseId }
            });

            const result = await this.supervisorCourseRepo.save(assignment);
            return result;
        } catch {
            throw new InternalServerErrorException(this.i18nUtils.translate('validation.server.internal_server_error', {}, lang));
        }
    }

    private async checkUserRole(supervisorId: number, userRole: Role): Promise<User | null> {
        const user: User | null = await this.userRepo.findOneBy({ userId: supervisorId, role: userRole });
        return user;
    }

    private async checkAssigned(courseId: number, supervisorId: number, lang: string): Promise<SupervisorCourse | null> {
        const existing = await this.supervisorCourseRepo.findOneBy({
            course: { courseId },
            supervisor: { userId: supervisorId }
        });

        return existing;
    }

    async removeSupervisorFromCourse(courseId: number, supervisorId: number, lang: string): Promise<void> {
        const existing = await this.checkAssigned(courseId, supervisorId, lang);
        if (!existing) {
            throw new BadRequestException(this.i18nUtils.translate('validation.course.user_notfound', {}, lang));
        }

        try {
            await this.supervisorCourseRepo.remove(existing);
        } catch {
            throw new InternalServerErrorException(this.i18nUtils.translate('validation.server.internal_server_error', {}, lang));
        }
    }

    async assignTraineeToCourse(courseId: number, traineeId: number, lang: string): Promise<AssignTraineeToCourseResponseDto> {
        const user: User | null = await this.checkUserRole(traineeId, Role.TRAINEE);

        if (!user) {
            throw new BadRequestException(this.i18nUtils.translate('validation.course.user_not_trainee', {}, lang));
        }

        await this.validateTraineeHasNoActiveCourse(traineeId, tableName.userCourse, tableName.course, lang);

        const { savedUserCourse, course } = await this.createAndNotifyUserCourse(courseId, traineeId, user, lang);

        const data: AssignTraineeToCourseResponseDto = {
            userCourseId: savedUserCourse.userCourseId,
            userName: user.userName,
            courseName: course.name,
            registrationDate: savedUserCourse.registrationDate,
            courseProgress: savedUserCourse.courseProgress,
            status: savedUserCourse.status
        }

        return data;
    }

    private async createAndNotifyUserCourse(courseId: number, traineeId: number, user: User, lang: string) {
        try {
            const data: UserCourse = this.userCourseRepo.create({
                registrationDate: todayDate,
                courseProgress: firstCourseProgress,
                status: UserCourseStatus.RESIGN,
                course: { courseId },
                user: { userId: traineeId }
            });

            const savedUserCourse = await this.userCourseRepo.save(data);
            const course = await this.getCourseById(savedUserCourse, lang);

            const subject = this.i18nUtils.translate('validation.course.user_course_success', {}, lang);
            const template = templatePug.assignUserToCourse;
            const email = user.email;
            const context = {
                userName: user.userName,
                courseName: course.name,
                startDate: format(course.start, 'dd/MM/yyyy', { locale: vi }),
                endDate: format(course.end, 'dd/MM/yyyy', { locale: vi }),
            }
            await this.sendEmail(email, subject, template, context, lang);

            return { savedUserCourse, course };
        } catch {
            throw new InternalServerErrorException(this.i18nUtils.translate('validation.server.internal_server_error', {}, lang));
        }
    }

    private async validateTraineeHasNoActiveCourse(userId: number, alias: string, relationField: string, lang: string): Promise<void> {
        const count = await this.userCourseRepo.createQueryBuilder(alias)
            .innerJoin(`${alias}.${relationField}`, relationField)
            .where(`${alias}.user_id = :userId`, { userId })
            .andWhere(`${relationField}.status = :status`, { status: CourseStatus.ACTIVE })
            .andWhere(`CURRENT_DATE BETWEEN ${relationField}.start AND ${relationField}.end`)
            .getCount();

        if (count > 0) {
            throw new BadRequestException(this.i18nUtils.translate('validation.course.trainee_has_active_course', {}, lang));
        }
    }

    private async getCourseById(savedUserCourse: UserCourse, lang: string): Promise<Course> {
        const course: Course | null = await this.courseRepo.findOneBy({ courseId: savedUserCourse.course.courseId });
        if (!course) {
            throw new BadRequestException(this.i18nUtils.translate('validation.course.user_not_trainee', {}, lang));
        }
        return course;
    }

    private async sendEmail(email: string, subject: string, template: string, context: object, lang: string): Promise<void> {
        try {
            await this.mailerService.sendMail({
                to: email,
                subject: subject,
                template: template,
                context: context
            });
        } catch {
            throw new InternalServerErrorException(this.i18nUtils.translate('validation.server.internal_server_error', {}, lang));
        }
    }

    async removeTraineeFromCourse(courseId: number, traineeId: number, lang: string): Promise<void> {
        const existing = await this.userCourseRepo.findOne({
            where: {
                course: { courseId: courseId },
                user: { userId: traineeId }
            },
            relations: ['user', 'course']
        });

        if (!existing) {
            throw new BadRequestException(this.i18nUtils.translate('validation.course.trainee_not_found', {}, lang));
        }

        try {
            await this.userCourseRepo.remove(existing);

            const email = existing.user.email;
            const subject = this.i18nUtils.translate('validation.course.user_course_remove', {}, lang);;
            const template = templatePug.removeUserCourse;
            const context = {
                userName: existing.user.userName,
                courseName: existing.course.name,
            };

            await this.sendEmail(email, subject, template, context, lang);

        } catch {
            throw new InternalServerErrorException(this.i18nUtils.translate('validation.server.internal_server_error', {}, lang));
        }
    }

    async startCourse(courseId: number, lang: string): Promise<ApiResponse> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            await this.changeStatusCourseSubject(courseId, lang, queryRunner.manager);
            await this.assignSubjectsToUsersInCourse(courseId, lang, queryRunner.manager);

            await queryRunner.commitTransaction();

            return {
                success: true,
                message: this.i18nUtils.translate('validation.course.start_course_success'),
            };

        } catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error('startCourse failed', error?.stack || error);
            throw new InternalServerErrorException(this.i18nUtils.translate('validation.server.internal_server_error', {}, lang));

        } finally {
            await queryRunner.release();
        }
    }

    private async findCourseSubject(courseId: number, lang: string, status?: CourseSubjectStatus): Promise<CourseSubject[]> {
        const findCourse = await this.courseSubjectRepo.find({
            where: {
                course: { courseId: courseId, status: CourseStatus.ACTIVE },
                status: status,
            },
            relations: ['course']
        });

        if (findCourse.length === 0) {
            throw new BadRequestException(this.i18nUtils.translate('validation.course.not_found', {}, lang));
        }
        return findCourse;
    }

    private async changeStatusCourseSubject(courseId: number, lang: string, manager: EntityManager): Promise<void> {
        const courses = await this.findCourseSubject(courseId, lang, CourseSubjectStatus.NOT_STARTED);

        for (const course of courses) {
            course.status = CourseSubjectStatus.START;
        }

        await manager.save(courses);
    }

    private async findResignedUserCourses(courseId: number, lang: string): Promise<UserCourse[]> {
        const userCourse = await this.userCourseRepo.find({
            where: {
                course: { courseId: courseId },
                status: UserCourseStatus.RESIGN,
            },
            relations: ['user']
        });

        if (userCourse.length === 0) {
            throw new BadRequestException(this.i18nUtils.translate('validation.course.trainee_not_found', {}, lang));
        }

        return userCourse;
    }

    private async assignSubjectsToUsersInCourse(courseId: number, lang: string, manager: EntityManager): Promise<void> {
        const subjects = await this.findCourseSubject(courseId, lang);
        const users = await this.findResignedUserCourses(courseId, lang);

        const newDataUserCourse = subjects.flatMap((subject) => {
            return users.map((user) => {
                const userId = user.user.userId;
                const courseSubjectId = subject.courseSubjectId;

                return this.userSubjectRepo.create({
                    subjectProgress: firstUserSubjectProgress,
                    status: UserSubjectStatus.NOT_STARTED,
                    user: { userId: userId },
                    courseSubject: { courseSubjectId: courseSubjectId }
                });
            });
        });

        await manager.save(newDataUserCourse);

    }

    async finishCourse(courseId: number, lang: string): Promise<ApiResponse> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const courses = await this.findCourseSubject(courseId, lang, CourseSubjectStatus.START);
            await this.finishCourseSubjects(courses, queryRunner.manager);
            const userSubjects = await this.finishUserSubjects(courses);
            await this.finishUserCourses(courseId, lang, userSubjects);

            await queryRunner.commitTransaction();

            return {
                success: true,
                message: this.i18nUtils.translate('validation.course.start_course_success'),
            };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error('startCourse failed', error?.stack || error);
            throw new InternalServerErrorException(this.i18nUtils.translate('validation.server.internal_server_error', {}, lang));

        } finally {
            await queryRunner.release();
        }
    }

    private async finishCourseSubjects(courses: CourseSubject[], manager: EntityManager): Promise<void> {
        courses.forEach(c => c.status = CourseSubjectStatus.FINISH);
        await manager.save(courses);
    }

    private async finishUserSubjects(courses: CourseSubject[]): Promise<UserSubject[]> {
        const courseSubjectIds = (courses)
            .map(c => c.courseSubjectId);

        const userSubjects = await this.userSubjectRepo.find({
            where: { courseSubject: { courseSubjectId: In(courseSubjectIds) }, },
            relations: ['user']
        });

        return this.userSubjectRepo.save(
            userSubjects.map(us => ({
                ...us,
                status: UserSubjectStatus.COMPLETED,
                finishedAt: new Date(),
            }))
        );
    }

    private async finishUserCourses(courseId: number, lang: string, userSubjects: UserSubject[]): Promise<void> {
        const userCourses = await this.userCourseRepo.find({
            where: {
                course: { courseId: courseId }
            },
            relations: ['user']
        });

        if (userCourses.length === 0) {
            throw new BadRequestException(this.i18nUtils.translate('validation.course.not_found', {}, lang))
        }

        const avgProgress = this.calculateUserCourseProgress(userSubjects);
        const updatedUserCourses = userCourses.map(userCourse => {
            const progress = avgProgress[userCourse.user.userId];
            const status = progress > course_process_constant ? UserCourseStatus.PASS : UserCourseStatus.FAIL;
            return {
                ...userCourse,
                courseProgress: progress,
                status,
                finishedAt: new Date(),
            };
        });

        await this.userCourseRepo.save(updatedUserCourses);
    }

    private calculateUserCourseProgress(userSubjects: UserSubject[]): Record<number, number> {
        const progressByUser: Record<number, number[]> = {};

        for (const userSubject of userSubjects) {
            const userId = userSubject.user.userId;
            if (!progressByUser[userId]) {
                progressByUser[userId] = [];
            }

            const cappedProgress = Math.max(0, Math.min(userSubject.subjectProgress, maxProgress));
            progressByUser[userId].push(cappedProgress);
        }

        return Object.fromEntries(
            Object.entries(progressByUser).map(([userIdStr, progresses]) => {
                const average = progresses.reduce((sum, score) => sum + score, 0) / progresses.length;
                return [Number(userIdStr), Math.max(0, Math.min(maxProgress, Math.round(average)))];
            })
        );
    }

}
