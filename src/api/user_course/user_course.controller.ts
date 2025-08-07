import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Role } from 'src/database/dto/user.dto';
import { AuthRoles } from 'src/helper/decorators/auth_roles.decorator';
import { Language } from 'src/helper/decorators/language.decorator';
import { courseIdDto } from 'src/validation/class_validation/course.validation';
import { UserCourseService } from './user_course.service';
import { UserDecorator } from 'src/helper/decorators/user.decorator';
import { User } from 'src/database/entities/user.entity';
import { ApiResponse } from 'src/helper/interface/api.interface';
import { AssignTraineeToCourseResponseDto } from 'src/helper/interface/course.iterface';
import { traineeIdDto, userIdDto } from 'src/validation/class_validation/user.validation';
import { ApiBearerAuth, ApiExcludeEndpoint } from '@nestjs/swagger';
import { ApiResponseRegisterToCourse } from 'src/helper/swagger/user_course/user_course_response.decorator';
import { ApiResponseGetActiveCourse } from 'src/helper/swagger/user_course/course_active_response.decorator';
import { SearchCourseDto } from 'src/validation/class_validation/user_course.validation';
import { ApiResponseSearchCourses } from 'src/helper/swagger/user_course/search_course_response.decorator';

@Controller('user_course')
export class UserCourseController {
    constructor(private readonly userCourseSErvice: UserCourseService) { }

    @ApiResponseRegisterToCourse()
    @ApiBearerAuth('access-token')
    @AuthRoles(Role.TRAINEE)
    @Post(':courseId/trainee')
    async registerToCourse(@Param() courseId: courseIdDto, @UserDecorator() traineeId: User, @Language() lang: string): Promise<ApiResponse | AssignTraineeToCourseResponseDto> {
        const result = await this.userCourseSErvice.registerToCourse(courseId.courseId, traineeId, lang);
        return result;
    }

    @ApiResponseGetActiveCourse()
    @ApiBearerAuth('access-token')
    @AuthRoles(Role.TRAINEE)
    @Get('trainee/courses/active')
    async viewActiveCourse(@UserDecorator() traineeId: User, @Language() lang: string) {
        const result = await this.userCourseSErvice.viewActiveCourse(traineeId.userId, lang);
        return result;
    }

    @ApiExcludeEndpoint()
    @AuthRoles(Role.SUPERVISOR, Role.ADMIN)
    @Get(':courseId/users')
    async getAllUserCourse(@Param() courseId: courseIdDto, @Language() lang: string) {
        const result = await this.userCourseSErvice.getAllUserCourse(courseId.courseId, lang);
        return result;
    }

    @ApiResponseSearchCourses()
    @ApiBearerAuth('access-token')
    @AuthRoles(Role.TRAINEE)
    @Post('search/course')
    async searchCourses (@Body() input: SearchCourseDto, @Language() lang: string) {
        const result = await this.userCourseSErvice.searchCourses(input.name,lang);
        return result;
    }
}
