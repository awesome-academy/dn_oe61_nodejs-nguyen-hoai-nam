import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Course } from 'src/database/entities/course.entity';
import { CourseSubject } from 'src/database/entities/course_subject.entity';
import { SupervisorCourse } from 'src/database/entities/supervisor_course.entity';
import { User } from 'src/database/entities/user.entity';
import { UserCourse } from 'src/database/entities/user_course.entity';
import { hashPassword } from 'src/helper/shared/hash_password.shared';
import { PaginationService } from 'src/helper/shared/pagination.shared';
import { I18nUtils } from 'src/helper/utils/i18n-utils';
import { DatabaseValidation } from 'src/validation/existence/existence.validator';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class GetCourse {
    constructor(
        @InjectRepository(Course) private readonly courseRepo: Repository<Course>,
        @InjectRepository(UserCourse) private readonly UserCourseRepo: Repository<UserCourse>,
        @InjectRepository(SupervisorCourse) private readonly SupervisorCourseRepo: Repository<SupervisorCourse>,
        private readonly paginationService: PaginationService,
    ) { }

    async getCoursesByAdmin(page: number | null, pageSize: number | null): Promise<[Course[], number]> {
        const options = {
            order: { createdAt: 'ASC' as const },
            ...(page && pageSize && { take: pageSize, skip: (page - 1) * pageSize })
        };
        const [data, total] = await this.courseRepo.findAndCount(options);
        return [data, total];
    }

    async getCoursesBySupervisor(userId: number, page: number | null, pageSize: number | null): Promise<[Course[], number]> {
        const options = {
            where: { supervisor: { userId } },
            relations: ['course'],
            order: { supervisorCourseId: 'ASC' as const },
            ...(page && pageSize && { take: pageSize, skip: (page - 1) * pageSize })
        };

        const [supervisorCourses, total] = await this.SupervisorCourseRepo.findAndCount(options);
        const courses = supervisorCourses.map(sc => sc.course);
        return [courses, total];
    }

    async getCoursesByTrainee(userId: number, page: number | null, pageSize: number | null): Promise<[Course[], number]> {
        const options = {
            where: { user: { userId } },
            relations: ['course'],
            order: { userCourseId: 'ASC' as const },
            ...(page && pageSize && { take: pageSize, skip: (page - 1) * pageSize })
        };

        const [userCourses, total] = await this.UserCourseRepo.findAndCount(options);
        const courses = userCourses.map(uc => uc.course);
        return [courses, total];
    }
}
