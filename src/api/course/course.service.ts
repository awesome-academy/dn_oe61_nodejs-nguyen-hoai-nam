import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CourseSubjectStatus } from 'src/database/dto/course_subject.dto';
import { Role } from 'src/database/dto/user.dto';
import { Course } from 'src/database/entities/course.entity';
import { CourseSubject } from 'src/database/entities/course_subject.entity';
import { SupervisorCourse } from 'src/database/entities/supervisor_course.entity';
import { User } from 'src/database/entities/user.entity';
import { UserCourse } from 'src/database/entities/user_course.entity';
import { tableName } from 'src/helper/constants/emtities.constant';
import { ApiResponse } from 'src/helper/interface/api.interface';
import { GetCourse } from 'src/helper/shared/get_course.shared';
import { hashPassword } from 'src/helper/shared/hash_password.shared';
import { PaginationService } from 'src/helper/shared/pagination.shared';
import { I18nUtils } from 'src/helper/utils/i18n-utils';
import { CreateCourseDto, UpdateCourseDto } from 'src/validation/class_validation/course.validation';
import { DatabaseValidation } from 'src/validation/existence/existence.validator';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class CourseService {
    constructor(
        @InjectRepository(Course) private readonly courseRepo: Repository<Course>,
        @InjectRepository(UserCourse) private readonly UserCourseRepo: Repository<UserCourse>,
        @InjectRepository(CourseSubject) private readonly courseSubjectRepo: Repository<CourseSubject>,
        @InjectRepository(SupervisorCourse) private readonly SupervisorCourseRepo: Repository<SupervisorCourse>,
        @InjectRepository(User) private readonly userRepo: Repository<User>,
        private readonly hashPassword: hashPassword,
        private readonly databaseValidation: DatabaseValidation,
        private readonly i18nUtils: I18nUtils,
        private readonly paginationService: PaginationService,
        private readonly dataSource: DataSource,
        private readonly getCourse: GetCourse
    ) { }

    private async getCoursesByRole(userId: number, role: string, page: number, pageSize: number): Promise<Course[]> {
        if (role === Role.ADMIN) {
            return await this.getCourse.getCoursesByAdmin(page, pageSize);
        } else if (role === Role.SUPERVISOR) {
            return await this.getCourse.getCoursesBySupervisor(userId, page, pageSize);
        } else if (role === Role.TRAINEE) {
            return await this.getCourse.getCoursesByTrainee(userId, page, pageSize);
        } else {
            return [];
        }
    }

    async getAll(userId: number, role: string, page: number, pageSize: number, lang: string) {
        let courses: Course[] = [];

        courses = await this.getCoursesByRole(userId, role, page, pageSize);
        if (courses.length === 0) {
            throw new NotFoundException(this.i18nUtils.translate('validation.course.not_found', {}, lang));
        }

        const datas = courses.map(course => ({
            id: course.courseId,
            name: course.name,
            description: course.description,
            status: course.status,
            start: course.start,
            end: course.end,
        }));

        return {
            success: true,
            message: this.i18nUtils.translate('validation.response_api.success', {}, lang),
            data: datas
        };
    }

    async getById(courseId: number, user: User, lang: string) {
        const course = await this.courseRepo.findOneBy({ courseId: courseId });

        if (!course) {
            throw new NotFoundException(this.i18nUtils.translate('validation.course.not_found', {}, lang))
        }

        if (user.role === Role.TRAINEE) {
            const isRegistered = await this.UserCourseRepo.findOneBy({
                user: { userId: user.userId },
                course: { courseId: course.courseId },
            });

            if (!isRegistered) {
                throw new ForbiddenException(this.i18nUtils.translate('validation.course.not_found', {}, lang));
            }
        }

        return {
            success: true,
            message: this.i18nUtils.translate('validation.crud.get_detail_success', {}, lang),
            data: {
                name: course.name,
                description: course.description,
                status: course.status,
                start: course.start,
                end: course.end,
            },
        }
    }

    async create(courseInput: CreateCourseDto, userId: number, lang: string): Promise<ApiResponse> {

        const savedCourse = await this.savedCourse(courseInput, userId, lang)
        await this.saveCourseSubjects(savedCourse.courseId, courseInput.subjectIds, lang);

        return {
            success: true,
            message: this.i18nUtils.translate('validation.crud.create_success', {}, lang),
            data: savedCourse
        }
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

    private async saveCourseSubjects(courseId: number, subjectIds: number[], lang: string) {
        try {
            for (const subjectId of subjectIds) {
                const courseSubject = this.courseSubjectRepo.create({
                    course: { courseId },
                    subject: { subjectId },
                    status: CourseSubjectStatus.NOT_STARTED,
                });
                await this.courseSubjectRepo.save(courseSubject);
            }
        } catch {
            throw new InternalServerErrorException(this.i18nUtils.translate('validation.server.internal_server_error', {}, lang));
        }
    }

    async delete(courseId: number, lang: string) {
        const course = await this.courseRepo.findOne({ where: { courseId } });

        if (!course) {
            throw new NotFoundException(this.i18nUtils.translate('validation.crud.delete_not_allowed', {}, lang));
        }

        await this.checkAllCourseRelations(courseId, lang);

        return await this.deleteCourseWithRelations(courseId, lang);
    }

    private async checkAllCourseRelations(courseId: number, lang: string) {
        await this.databaseValidation.checkCourseRelationExists(this.UserCourseRepo, tableName.userCourse, tableName.course, courseId, lang);
        await this.databaseValidation.checkCourseRelationExists(this.UserCourseRepo, tableName.courseSubject, tableName.course, courseId, lang);
        await this.databaseValidation.checkCourseRelationExists(this.UserCourseRepo, tableName.supervisorCourse, tableName.course, courseId, lang);
    }

    private async deleteCourseWithRelations(courseId: number, lang: string) {
        return await this.dataSource.transaction(async (manager) => {
            await manager.delete(UserCourse, { course: { courseId } });
            await manager.delete(CourseSubject, { course: { courseId } });
            await manager.delete(SupervisorCourse, { course: { courseId } });

            const deleteResult = await manager.delete(this.courseRepo.target, { courseId });

            if (deleteResult.affected === 0) {
                throw new BadRequestException(this.i18nUtils.translate('validation.crud.delete_faild', {}, lang));
            }

            return {
                success: true,
                message: this.i18nUtils.translate('validation.crud.delete_success'),
            };
        });
    }

    async update(courseInput: UpdateCourseDto, courseId: number, lang: string): Promise<ApiResponse> {
        const hasValidField = Object.values(courseInput).some(value => value !== undefined);

        if (!hasValidField) {
            throw new BadRequestException(this.i18nUtils.translate('validation.crud.missing_required_fields', {}, lang));
        }

        if (!courseId) {
            throw new NotFoundException(this.i18nUtils.translate('validation.course.not_found', {}, lang));
        }

        const savedCourse = await this.findAndUpdateCourse(courseId, courseInput, lang);

        return {
            success: true,
            message: this.i18nUtils.translate('validation.crud.update_success', {}, lang),
            data: {
                name: savedCourse.name,
                description: savedCourse.description,
                status: savedCourse.status,
                start: savedCourse.start,
                end: savedCourse.end,
            }
        };
    }

    private async findCourseOrFail(courseId: number, lang: string): Promise<Course> {
        const course = await this.courseRepo.findOneBy({ courseId: courseId });
        if (!course) {
            throw new BadRequestException(this.i18nUtils.translate('validation.crud.no_changes', {}, lang));
        }
        return course;
    }

    private async findAndUpdateCourse(courseId: number, courseInput: UpdateCourseDto, lang: string) {
        const course = await this.findCourseOrFail(courseId, lang);

        const { name, description, status, start, end } = courseInput;

        if (name !== undefined) course.name = name;
        if (description !== undefined) course.description = description;
        if (start !== undefined) course.start = start

        if (end !== undefined) course.end = end;
        if (status !== undefined) course.status = status;

        const savedCourse: Course | null = await this.courseRepo.save(course);

        if (!savedCourse) {
            throw new NotFoundException(this.i18nUtils.translate('validation.crud.update_faild', {}, lang));
        }

        return savedCourse;
    }

    async assignSupervisorToCourse(courseId: number, supervisorId: number, lang: string): Promise<ApiResponse> {

        const user = await this.checkUserRole(supervisorId, lang);
        if (!user) {
            throw new BadRequestException(this.i18nUtils.translate('validation.course.user_not_supervisor', {}, lang));
        }

        const existing = await this.checkAssigned(courseId, supervisorId, lang);
        if (existing) {
            throw new BadRequestException(this.i18nUtils.translate('validation.course.user_duplicate', {}, lang));
        }

        try {
            const assignment = this.SupervisorCourseRepo.create({
                supervisor: { userId: supervisorId },
                course: { courseId: courseId }
            });

            const result = await this.SupervisorCourseRepo.save(assignment);
            return {
                success: true,
                message: this.i18nUtils.translate('validation.crud.create_success', {}, lang),
                data: result
            }
        } catch {
            throw new InternalServerErrorException(this.i18nUtils.translate('validation.server.internal_server_error', {}, lang));
        }
    }

    private async checkUserRole(supervisorId: number, lang: string) {
        const user: User | null = await this.userRepo.findOneBy({ userId: supervisorId, role: Role.SUPERVISOR });
        return user;
    }

    private async checkAssigned(courseId: number, supervisorId: number, lang: string) {
        const existing = await this.SupervisorCourseRepo.findOneBy({
            course: { courseId },
            supervisor: { userId: supervisorId }
        });

        return existing;
    }

    async removeSupervisorFromCourse(courseId: number, supervisorId: number, lang: string) {
        const existing = await this.checkAssigned(courseId, supervisorId, lang);
        if (!existing) {
            throw new BadRequestException(this.i18nUtils.translate('validation.course.user_notfound', {}, lang));
        }

        try {
            await this.SupervisorCourseRepo.remove(existing);
            return {
                success: true,
                message: this.i18nUtils.translate('validation.crud.delete_success', {}, lang),
            };
        } catch {
            throw new InternalServerErrorException(this.i18nUtils.translate('validation.server.internal_server_error', {}, lang));
        }
    }
} 
