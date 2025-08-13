import { Controller, Get, Param, Post } from '@nestjs/common';
import { UserSubjectService } from './user_subject.service';
import { I18nUtils } from 'src/helper/utils/i18n-utils';
import { UserDecorator } from 'src/helper/decorators/user.decorator';
import { User } from 'src/database/entities/user.entity';
import { Language } from 'src/helper/decorators/language.decorator';
import { UserSubjectIdDto } from 'src/validation/class_validation/user_subject.validation';
import { AuthRoles } from 'src/helper/decorators/auth_roles.decorator';
import { Role } from 'src/database/dto/user.dto';
import { ApiResponse } from 'src/helper/interface/api.interface';
import { ActivityHistoryDto, SubjectWithTasksDto, TraineeCourseProgressDto, TraineeInCourseDto } from 'src/helper/interface/user_subject.interface';
import { ApiBearerAuth, ApiExcludeEndpoint } from '@nestjs/swagger';
import { ApiResponseViewSubject } from 'src/helper/swagger/user_subject/view_subject.decorator';
import { ApiResponseFinishSubject } from 'src/helper/swagger/user_subject/finish_subject.decorator';
import { ApiResponseGetActivityHistory } from 'src/helper/swagger/user_subject/get_activity_history';

@Controller('user_subject')
export class UserSubjectController {
    constructor(
        private readonly userSubjectService: UserSubjectService,
        private readonly i18nUtils: I18nUtils
    ) { }

    @ApiExcludeEndpoint()
    @AuthRoles(Role.SUPERVISOR, Role.ADMIN)
    @Get(':userSubjectId/progress')
    async getTraineeSubjectProgress(@Param() userSubjectId: UserSubjectIdDto, @Language() lang: string): Promise<any> {
        return this.userSubjectService.getTraineeSubjectProgress(userSubjectId.userSubjectId, lang);
    }

    @ApiExcludeEndpoint()
    @AuthRoles(Role.SUPERVISOR)
    @Post(':userSubjectId/start')
    async startSubject(@Param() userSubjectId: UserSubjectIdDto, @UserDecorator() user: User, @Language() lang: string): Promise<ApiResponse> {
        await this.userSubjectService.startSubject(userSubjectId.userSubjectId, user.userId, lang);
        return {
            code: 200,
            success: true,
            message: this.i18nUtils.translate('validation.user_subject.start_success')
        };
    }

    @ApiResponseFinishSubject()
    @ApiBearerAuth('access-token')
    @AuthRoles(Role.TRAINEE)
    @Post(':userSubjectId/finish')
    async finishSubject(@Param() userSubjectId: UserSubjectIdDto, @UserDecorator() user: User, @Language() lang: string): Promise<ApiResponse> {
        await this.userSubjectService.finishSubject(userSubjectId.userSubjectId, user.userId, lang);
        return {
            code: 200,
            success: true,
            message: this.i18nUtils.translate('validation.user_subject.finish_success')
        };
    }

    @ApiResponseViewSubject()
    @ApiBearerAuth('access-token')
    @AuthRoles(Role.TRAINEE)
    @Get(':userSubjectId')
    async getUserSubjectDetail(@Param() userSubjectId: UserSubjectIdDto, @UserDecorator() user: User, @Language() lang: string): Promise<ApiResponse | SubjectWithTasksDto> {
        const result = await this.userSubjectService.getUserSubjectDetail(userSubjectId.userSubjectId, user.userId, lang);
        return result;
    }

    @ApiResponseGetActivityHistory()
    @ApiBearerAuth('access-token')
    @AuthRoles(Role.TRAINEE)
    @Get('trainee/my_activity_history')
    async getMyActivityHistory(@UserDecorator() user: User, @Language() lang: string): Promise<ApiResponse | ActivityHistoryDto[]> {
        const result = await this.userSubjectService.getMyActivityHistory(user.userId, lang);
        return result;
    }

    @ApiExcludeEndpoint()
    @AuthRoles(Role.SUPERVISOR, Role.ADMIN)
    @Get(':courseId/trainee/:traineeId/progress')
    async getTraineeProgress(@Param('courseId') courseId: number, @Param('traineeId') traineeId: number, @UserDecorator() user: User, @Language() lang: string): Promise<ApiResponse | TraineeCourseProgressDto> {
        return this.userSubjectService.getTraineeCourseProgress(courseId, traineeId, user, lang);
    }

    @ApiExcludeEndpoint()
    @AuthRoles(Role.SUPERVISOR, Role.ADMIN)
    @Get(':courseId/trainees')
    async listTraineesInCourse(@Param('courseId') courseId: number, @UserDecorator() user: User, @Language() lang: string): Promise<ApiResponse | TraineeInCourseDto[]> {
        return await this.userSubjectService.getTraineesInCourse(courseId, user, lang);
    }
}

