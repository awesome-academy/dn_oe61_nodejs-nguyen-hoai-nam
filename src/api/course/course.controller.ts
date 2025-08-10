import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { Role } from 'src/database/dto/user.dto';
import { AuthRoles } from 'src/helper/decorators/auth_roles.decorator';
import { CourseService } from './course.service';
import { courseIdDto, CreateCourseDto, UpdateCourseDto } from 'src/validation/class_validation/course.validation';
import { Language } from 'src/helper/decorators/language.decorator';
import { QueryParam, UserDecorator } from 'src/helper/decorators/user.decorator';
import { User } from 'src/database/entities/user.entity';
import { AssignSupervisorDto } from 'src/validation/class_validation/supervisor_course.validation';
import { userIdDto } from 'src/validation/class_validation/user.validation';
import { ApiBearerAuth, ApiExcludeEndpoint } from '@nestjs/swagger';
import { AssignTraineeToCourseResponseDto, CourseDetailDto, CourseListItem } from 'src/helper/interface/course.iterface';
import { ApiResponse } from 'src/helper/interface/api.interface';
import { ApiResponseGetAllCourse } from 'src/helper/swagger/course/get_all_response.decorator';
import { ApiResponseGetByIdCourse } from 'src/helper/swagger/course/get_by_id_response.decorator';
import { I18nUtils } from 'src/helper/utils/i18n-utils';
import { SupervisorCourse } from 'src/database/entities/supervisor_course.entity';
import { MyProfile } from 'src/helper/interface/user.interface';

@Controller('course')
export class CourseController {
    constructor(
        private readonly courseService: CourseService,
        private readonly i18nUtils: I18nUtils,
    ) { }

    @ApiResponseGetAllCourse()
    @ApiBearerAuth('access-token')
    @Get()
    async getAll(@QueryParam(['page', 'pageSize']) pagination: { page: number; pageSize: number }, @UserDecorator() user: User, @Language() lang: string): Promise<ApiResponse> {
        const { page, pageSize } = pagination;
        const { userId, role } = user;
        const result = await this.courseService.getAll(userId, role, page, pageSize, lang);
        return {
            success: true,
            message: this.i18nUtils.translate('validation.response_api.success', {}, lang),
            data: result
        }
    }

    @AuthRoles(Role.SUPERVISOR, Role.TRAINEE)
    @Get('my_courses')
    async getMyCourses(@UserDecorator() user: User) {
        const { userId, role } = user;
        const result = await this.courseService.getMyCourses(userId, role);
        return result;
    }

    @ApiResponseGetByIdCourse()
    @ApiBearerAuth('access-token')
    @AuthRoles(Role.ADMIN, Role.SUPERVISOR, Role.TRAINEE)
    @Get(':courseId')
    async getById(@Param() courseId: courseIdDto, @UserDecorator() user: User, @Language() lang: string): Promise<ApiResponse | CourseDetailDto> {
        const result = await this.courseService.getById(courseId.courseId, user, lang);
        return result;
    }

    @ApiExcludeEndpoint()
    @AuthRoles(Role.ADMIN, Role.SUPERVISOR)
    @Post('')
    async create(@Body() courseInput: CreateCourseDto, @UserDecorator('userId') userId: number, @Language() lang: string) {
        const result = await this.courseService.create(courseInput, userId, lang);
        return result;
    }

    @ApiExcludeEndpoint()
    @AuthRoles(Role.ADMIN, Role.SUPERVISOR)
    @Delete(':courseId')
    async delete(@Param() courseId: courseIdDto, @Language() lang: string) {
        const result = await this.courseService.delete(courseId.courseId, lang);
        return result;
    }

    @ApiExcludeEndpoint()
    @AuthRoles(Role.ADMIN, Role.SUPERVISOR)
    @Put(':courseId')
    async update(@Body() courseInput: UpdateCourseDto, @Param() courseId: courseIdDto, @Language() lang: string) {
        const result = await this.courseService.update(courseInput, courseId.courseId, lang);
        return result;
    }

    @ApiExcludeEndpoint()
    @AuthRoles(Role.ADMIN)
    @Post(':courseId/supervisor')
    async assignSupervisorToCourse(@Param() courseId: courseIdDto, @Body() supervisorId: AssignSupervisorDto, @Language() lang: string): Promise<ApiResponse | SupervisorCourse> {
        const result = await this.courseService.assignSupervisorToCourse(courseId.courseId, supervisorId.supervisorId, lang);
        return {
            code: 200,
            success: true,
            message: this.i18nUtils.translate('validation.course.assign_success', {}, lang),
            data: result
        };
    }

    @ApiExcludeEndpoint()
    @AuthRoles(Role.ADMIN)
    @Delete(':courseId/supervisor/:supervisorId')
    async removeSupervisorFromCourse(@Param() param: { courseId: number; supervisorId: number }, @Language() lang: string): Promise<ApiResponse> {
        const { courseId, supervisorId } = param;
        await this.courseService.removeSupervisorFromCourse(courseId, supervisorId, lang);
        return {
            code: 200,
            success: true,
            message: this.i18nUtils.translate('validation.course.remove_success', {}, lang),
        };
    }

    @ApiExcludeEndpoint()
    @AuthRoles(Role.ADMIN, Role.SUPERVISOR)
    @Post(':courseId/trainee')
    async assignTraineeToCourse(@Param() courseId: courseIdDto, @Body() traineeId: userIdDto, @Language() lang: string): Promise<ApiResponse | AssignTraineeToCourseResponseDto> {
        const result = await this.courseService.assignTraineeToCourse(courseId.courseId, traineeId.userId, lang);
        return {
            code: 200,
            success: true,
            message: this.i18nUtils.translate('validation.course.assign_trainee_success', {}, lang),
            data: result
        };
    }

    @ApiExcludeEndpoint()
    @AuthRoles(Role.ADMIN, Role.SUPERVISOR)
    @Delete(':courseId/trainee/:traineeId')
    async removeTraineeFromCourse(@Param() param: { courseId: number; traineeId: number }, @Language() lang: string): Promise<ApiResponse> {
        const { courseId, traineeId } = param;
        await this.courseService.removeTraineeFromCourse(courseId, traineeId, lang)
        return {
            code: 200,
            success: true,
            message: this.i18nUtils.translate('validation.course.remove_trainee_success', {}, lang),
        };
    }

    @ApiExcludeEndpoint()
    @AuthRoles(Role.ADMIN, Role.SUPERVISOR)
    @Post(':courseId/start')
    async startCourse(@Param() courseId: courseIdDto, @Language() lang: string): Promise<ApiResponse> {
        await this.courseService.startCourse(courseId.courseId, lang);
        return {
            code: 200,
            success: true,
            message: this.i18nUtils.translate('validation.course.start_course_success', {}, lang),
        };
    }

    @ApiExcludeEndpoint()
    @AuthRoles(Role.ADMIN, Role.SUPERVISOR)
    @Post(':courseId/finish')
    async finishCourse(@Param() courseId: courseIdDto, @Language() lang: string): Promise<ApiResponse> {
        await this.courseService.finishCourse(courseId.courseId, lang);
        return {
            code: 200,
            success: true,
            message: this.i18nUtils.translate('validation.course.finish_course_success', {}, lang),
        };
    }

    @ApiExcludeEndpoint()
    @AuthRoles(Role.ADMIN, Role.SUPERVISOR)
    @Get(':courseId/supervisor')
    async getSupervisorsOfCourse(@Param() courseId: courseIdDto, @Language() lang: string): Promise<ApiResponse | MyProfile[]> {
        const data = await this.courseService.getSupervisorsOfCourse(courseId.courseId, lang);
        return {
            code: 200,
            success: true,
            message: this.i18nUtils.translate('validation.response_api.success', {}, lang),
            data: data
        }
    }
}
