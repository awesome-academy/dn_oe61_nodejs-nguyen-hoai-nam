import { Body, Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { Role } from 'src/database/dto/user.dto';
import { AuthRoles } from 'src/helper/decorators/auth_roles.decorator';
import { Language } from 'src/helper/decorators/language.decorator';
import { UserTaskService } from './user_task.service';
import { UserDecorator } from 'src/helper/decorators/user.decorator';
import { User } from 'src/database/entities/user.entity';
import { CompleteTaskDto } from 'src/validation/class_validation/user_task.validation';
import { I18nUtils } from 'src/helper/utils/i18n-utils';
import { ApiResponse } from 'src/helper/interface/api.interface';
import { TrainingCalendarDto, ViewTaskDto } from 'src/helper/interface/user_task.interface';
import { Task } from 'src/database/entities/task.entity';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ApiResponseGetTraingCelendar } from 'src/helper/swagger/user_task/get_training_calendar.decorator';
import { ApiResponseCompleteTask } from 'src/helper/swagger/user_task/complete_task.decorator';
import { ApiResponseViewTask } from 'src/helper/swagger/user_task/view_task.decorator';

@Controller('user_task')
export class UserTaskController {
    constructor(
        private readonly userTaskService: UserTaskService,
        private readonly i18nUtils: I18nUtils
    ) { }

    @ApiResponseGetTraingCelendar()
    @ApiBearerAuth('access-token')
    @AuthRoles(Role.TRAINEE)
    @Get('calendar')
    async getTrainingCalendar(@UserDecorator() user: User, @Language() lang: string, @Query('fromDate') fromDate?: string, @Query('toDate') toDate?: string): Promise<ApiResponse | TrainingCalendarDto[]> {
        const result = await this.userTaskService.getTrainingCalendar(user.userId, lang, fromDate, toDate);
        return result;
    }

    @ApiResponseCompleteTask()
    @ApiBearerAuth('access-token')
    @AuthRoles(Role.TRAINEE)
    @Post('tasks/:taskId/complete')
    async completeTask(@Param('taskId', ParseIntPipe) taskId: number, @Language() lang: string, @UserDecorator() user: User): Promise<ApiResponse> {
        await this.userTaskService.completeTask(user.userId, taskId, lang);
        return {
            code: 200,
            success: true,
            message: this.i18nUtils.translate('validation.user_task.complete_task_success', {}, lang),
        };
    }

    @ApiResponseViewTask()
    @ApiBearerAuth('access-token')
    @AuthRoles(Role.TRAINEE)
    @Get(':taskId')
    async getViewTask(@Param('taskId', ParseIntPipe) taskId: number, @UserDecorator() user: User, @Language() lang: string): Promise<ApiResponse|ViewTaskDto> {
        const result = await this.userTaskService.getViewTask(user.userId, taskId, lang);
        return result;
    }

}
