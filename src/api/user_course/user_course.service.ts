import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CourseStatus } from 'src/database/dto/course.dto';
import { Role } from 'src/database/dto/user.dto';
import { UserCourseStatus } from 'src/database/dto/user_course.dto';
import { Course } from 'src/database/entities/course.entity';
import { CourseSubject } from 'src/database/entities/course_subject.entity';
import { SupervisorCourse } from 'src/database/entities/supervisor_course.entity';
import { User } from 'src/database/entities/user.entity';
import { UserCourse } from 'src/database/entities/user_course.entity';
import { UserSubject } from 'src/database/entities/user_subject.entity';
import { firstCourseProgress, firstUserSubjectProgress, todayDate } from 'src/helper/constants/cron_expression.constant';
import { tableName } from 'src/helper/constants/emtities.constant';
import { templatePug } from 'src/helper/constants/template.constant';
import { AssignTraineeToCourseResponseDto } from 'src/helper/interface/course.iterface';
import { GetCourse } from 'src/helper/shared/get_course.shared';
import { I18nUtils } from 'src/helper/utils/i18n-utils';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { format } from 'date-fns';
import { MailerService } from '@nestjs-modules/mailer';
import { vi } from 'date-fns/locale';
import { CourseSubjectStatus } from 'src/database/dto/course_subject.dto';
import { UserSubjectStatus } from 'src/database/dto/user_subject.dto';
import { ActiveCourseView } from 'src/helper/interface/user_course.interface';

@Injectable()
export class UserCourseService {
    constructor(
        @InjectRepository(Course) private readonly courseRepo: Repository<Course>,
        @InjectRepository(UserCourse) private readonly userCourseRepo: Repository<UserCourse>,
        @InjectRepository(CourseSubject) private readonly courseSubjectRepo: Repository<CourseSubject>,
        @InjectRepository(SupervisorCourse) private readonly supervisorCourseRepo: Repository<SupervisorCourse>,
        @InjectRepository(User) private readonly userRepo: Repository<User>,
        @InjectRepository(UserSubject) private readonly userSubjectRepo: Repository<UserSubject>,
        private readonly i18nUtils: I18nUtils,
        private readonly dataSource: DataSource,
        private readonly getCourse: GetCourse,
        private readonly mailerService: MailerService,
        private readonly logger: Logger,
    ) { }

    private async getCourseSubjectById(manager: EntityManager, courseId: number, lang: string): Promise<CourseSubject[]> {
        const courseSubjectRepo = manager.getRepository(CourseSubject)
        const courseSubject: CourseSubject[] = await courseSubjectRepo.find({
            where: { course: { courseId: courseId } },
            relations: ['course', 'subject']
        });

        if (courseSubject.length !== 0) {
            throw new NotFoundException(this.i18nUtils.translate('validation.course.trainee_has_active_course', {}, lang));
        }
        return courseSubject;
    }

    async registerToCourse(courseId: number, trainee: User, lang: string): Promise<AssignTraineeToCourseResponseDto> {
        if (trainee.role !== Role.TRAINEE) {
            throw new BadRequestException(this.i18nUtils.translate('validation.course.user_not_trainee', {}, lang));
        }

        await this.validateTraineeHasNoActiveCourse(trainee.userId, tableName.userCourse, tableName.course, lang);

        const data = await this.registerTraineeWithTransaction(courseId, trainee, lang);
        return data;
    }

    private async registerTraineeWithTransaction(courseId: number, trainee: User, lang: string): Promise<AssignTraineeToCourseResponseDto> {
        return await this.dataSource.transaction(async (manager) => {
            const courseSubjects = await this.getCourseSubjectById(manager, courseId, lang);

            const { savedUserCourse, course } = await this.createAndNotifyUserCourse(manager, courseId, trainee.userId, trainee, lang);

            if (courseSubjects[0] && courseSubjects[0].status === CourseSubjectStatus.START) {
                await this.savedUserSubject(courseSubjects, trainee, manager)
            }

            const data: AssignTraineeToCourseResponseDto = {
                userCourseId: savedUserCourse.userCourseId,
                userName: trainee.userName,
                courseName: course.name,
                registrationDate: savedUserCourse.registrationDate,
                courseProgress: savedUserCourse.courseProgress,
                status: savedUserCourse.status
            }

            return data;
        });
    }

    private async createAndNotifyUserCourse(manager: EntityManager, courseId: number, traineeId: number, user: User, lang: string) {
        const userCourseRepo = manager.getRepository(UserCourse);
        try {
            const userCourse = await this.userCourseRepo.findOne({
                where: {
                    course: { courseId: courseId },
                    user: { userId: traineeId }
                }
            });

            if (userCourse) {
                throw new BadRequestException(this.i18nUtils.translate('validation.user_course.user_already_registered_course', {}, lang))
            }

            const data: UserCourse = userCourseRepo.create({
                registrationDate: todayDate,
                courseProgress: firstCourseProgress,
                status: UserCourseStatus.RESIGN,
                course: { courseId },
                user: { userId: traineeId }
            });
            const savedUserCourse = await userCourseRepo.save(data);

            const course = await this.notifyUserCourse(manager, savedUserCourse, user, lang);

            return { savedUserCourse, course };
        } catch (error) {
            this.logger.error(`createAndNotifyUserCourse failed: ${error?.message || error}`, error?.stack);
            throw new InternalServerErrorException(this.i18nUtils.translate('validation.server.internal_server_error', {}, lang));
        }
    }

    private async notifyUserCourse(manager: EntityManager, savedUserCourse: UserCourse, user: User, lang: string): Promise<Course> {
        try {
            const course = await this.getCourseById(manager, savedUserCourse, lang);

            const subject = this.i18nUtils.translate('validation.course.user_course_success', {}, lang);
            const template = templatePug.traineeRegisterSuccess;
            const email = user.email;
            const context = {
                userName: user.userName,
                courseName: course.name,
                startDate: format(course.start, 'dd/MM/yyyy', { locale: vi }),
                endDate: format(course.end, 'dd/MM/yyyy', { locale: vi }),
            }
            await this.sendEmail(email, subject, template, context, lang);

            return course;
        } catch (error) {
            this.logger.error(`notifyUserCourse failed: ${error?.message || error}`, error?.stack);
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

    private async getCourseById(manager: EntityManager, savedUserCourse: UserCourse, lang: string): Promise<Course> {
        const courseRepo = manager.getRepository(Course);
        const course: Course | null = await courseRepo.findOneBy({ courseId: savedUserCourse.course.courseId });
        if (!course) {
            throw new BadRequestException(this.i18nUtils.translate('validation.course.user_not_trainee', {}, lang));
        }
        return course;
    }

    private async savedUserSubject(courseSubjects: CourseSubject[], trainee: User, manager: EntityManager) {
        const userSubjectRepo = manager.getRepository(UserSubject);

        const userSubjects = courseSubjects.map(courseSubject =>
            userSubjectRepo.create({
                subjectProgress: firstUserSubjectProgress,
                user: { userId: trainee.userId },
                courseSubject: { courseSubjectId: courseSubject.subject.subjectId },
                status: UserSubjectStatus.NOT_STARTED,
            })
        );
        await userSubjectRepo.save(userSubjects);
    }

    private async sendEmail(email: string, subject: string, template: string, context: object, lang: string): Promise<void> {
        try {
            await this.mailerService.sendMail({
                to: email,
                subject: subject,
                template: template,
                context: context
            });
        } catch (error) {
            this.logger.error(`Gửi email thất bại: ${error?.message}`, error?.stack);
            throw new InternalServerErrorException(this.i18nUtils.translate('validation.server.internal_server_error', {}, lang));
        }
    }

    async viewActiveCourse(userId: number, lang: string): Promise<ActiveCourseView> {
        const user = this.userRepo.findOneBy({ userId: userId });

        if (!user) {
            throw new NotFoundException(this.i18nUtils.translate('validation.auth.user_notfound', {}, lang))
        }

        const course = await this.getCourseActive(userId);
        if (!course) {
            throw new NotFoundException(this.i18nUtils.translate('validation.user_course.course_not_active', {}, lang))
        }

        return course;
    }

    private async getCourseActive(userId: number): Promise<ActiveCourseView | undefined> {
        const course = await this.dataSource
            .getRepository('course')
            .createQueryBuilder('c')
            .innerJoin('user_course', 'uc', 'uc.course_id = c.course_id')
            .where('uc.user_id = :userId', { userId })
            .andWhere('c.status = :status', { status: CourseStatus.ACTIVE })
            .select([
                'c.course_id AS course_id',
                'c.name AS name',
                'c.description AS description',
                'c.start AS start',
                'c.end AS end',
                'c.status AS status',
            ])
            .limit(1)
            .getRawOne<ActiveCourseView>();

        return course;
    }

    async searchCourses(name: string, lang: string) {
        const courses = await this.courseRepo
            .createQueryBuilder('course')
            .where('course.name LIKE :name', { name: `%${name}%` })
            .getMany();

        if (courses.length === 0) {
            throw new BadRequestException(this.i18nUtils.translate('validation.course.not_found', {}, lang));
        }

        return courses;
    }
    
    async getAllUserCourse(courseId: number, lang: string) {
        const userCourses = await this.userCourseRepo.find({
            where: { course: { courseId } },
            relations: ['user'],
        });

        if (userCourses.length === 0) {
            throw new BadRequestException(this.i18nUtils.translate('validation.course.trainee_not_found', {}, lang))
        }

        return userCourses.map(userCourse => ({
            userId: userCourse.user.userId,
            userName: userCourse.user.userName,
            registrationDate: userCourse.registrationDate,
            courseProgress: userCourse.courseProgress,
            status: userCourse.status,
        }));
    }
}
