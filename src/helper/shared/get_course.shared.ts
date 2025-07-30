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

    async getCoursesByAdmin(page: number, pageSize: number): Promise<Course[]> {
        const { data } = await this.paginationService.queryWithPagination(
            this.courseRepo,
            { page, pageSize },
            { order: { createdAt: 'ASC' } }
        );
        return data;
    }

    async getCoursesBySupervisor(userId: number, page: number, pageSize: number): Promise<Course[]> {
        const { data } = await this.paginationService.queryWithPagination(
            this.SupervisorCourseRepo,
            { page, pageSize },
            {
                where: { supervisor: { userId } },
                relations: ['course'],
                order: { supervisorCourseId: 'ASC' },
            }
        );
        return data.map(sc => sc.course);
    }

    async getCoursesByTrainee(userId: number, page: number, pageSize: number): Promise<Course[]> {
        const { data } = await this.paginationService.queryWithPagination(
            this.UserCourseRepo,
            { page, pageSize },
            {
                where: { user: { userId } },
                relations: ['course'],
                order: { userCourseId: 'ASC' },
            }
        );
        return data.map(uc => uc.course);
    }
}
