import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { Role } from 'src/database/dto/user.dto';
import { AuthRoles } from 'src/helper/decorators/auth_roles.decorator';
import { CourseService } from './course.service';
import { courseIdDto, CreateCourseDto, UpdateCourseDto } from 'src/validation/class_validation/course.validation';
import { Language } from 'src/helper/decorators/language.decorator';
import { QueryParam, UserDecorator } from 'src/helper/decorators/user.decorator';
import { User } from 'src/database/entities/user.entity';
import { AssignSupervisorDto } from 'src/validation/class_validation/supervisor_course.validation';

@Controller('course')
export class CourseController {
    constructor(
        private readonly courseService: CourseService,
    ) { }

    @Get()
    async getAll(@QueryParam(['page', 'pageSize']) pagination: { page: number; pageSize: number }, @UserDecorator() user: User, @Language() lang: string) {
        const { page, pageSize } = pagination;
        const { userId, role } = user;
        const result = await this.courseService.getAll(userId, role, page, pageSize, lang);
        return result
    }

    @AuthRoles(Role.ADMIN, Role.SUPERVISOR, Role.TRAINEE)
    @Get(':courseId')
    async getById(@Param() courseId: courseIdDto, @UserDecorator() user: User, @Language() lang: string) {
        const result = await this.courseService.getById(courseId.courseId, user, lang);
        return result;
    }

    @AuthRoles(Role.ADMIN, Role.SUPERVISOR)
    @Post('')
    async create(@Body() courseInput: CreateCourseDto, @UserDecorator('userId') userId: number, @Language() lang: string) {
        const result = await this.courseService.create(courseInput, userId, lang);
        return result;
    }

    @AuthRoles(Role.ADMIN, Role.SUPERVISOR)
    @Delete(':courseId')
    async delete(@Param() courseId: courseIdDto, @Language() lang: string) {
        const result = await this.courseService.delete(courseId.courseId, lang);
        return result;
    }

    @AuthRoles(Role.ADMIN, Role.SUPERVISOR)
    @Put(':courseId')
    async update(@Body() courseInput: UpdateCourseDto, @Param() courseId: courseIdDto, @Language() lang: string) {
        const result = await this.courseService.update(courseInput, courseId.courseId, lang);
        return result;
    }

    @AuthRoles(Role.ADMIN)
    @Post(':courseId/supervisor')
    async assignSupervisorToCourse(@Param() courseId: courseIdDto, @Body() supervisorId: AssignSupervisorDto, @Language() lang: string) {
        const result = await this.courseService.assignSupervisorToCourse(courseId.courseId, supervisorId.supervisorId, lang);
        return result;
    }

    @AuthRoles(Role.ADMIN)
    @Delete(':courseId/supervisor/:supervisorId')
    async removeSupervisorFromCourse(@Param() param: { courseId: number; supervisorId: number }, @Language() lang: string) {
        const { courseId, supervisorId } = param;
        const result = await this.courseService.removeSupervisorFromCourse(courseId, supervisorId, lang);
        return result;
    }
}
