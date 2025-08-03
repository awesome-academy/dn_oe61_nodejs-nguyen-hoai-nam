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
import { TrainingCalendarDto } from 'src/helper/interface/user_task.interface';

@Controller('user_task')
export class UserTaskController {
    constructor(
        private readonly userTaskService: UserTaskService,
        private readonly i18nUtils: I18nUtils
    ) { }

    @AuthRoles(Role.TRAINEE)
    @Get('calendar')
    async getTrainingCalendar(@UserDecorator() user: User, @Language() lang: string, @Query('fromDate') fromDate?: string, @Query('toDate') toDate?: string): Promise<ApiResponse | TrainingCalendarDto[]> {
        const result = await this.userTaskService.getTrainingCalendar(user.userId, lang, fromDate, toDate);
        return result;
    }

    @AuthRoles(Role.TRAINEE)
    @Post('tasks/:taskId/complete')
    async completeTask(@Param('taskId', ParseIntPipe) taskId: number, @Language() lang: string, @Body() dto: CompleteTaskDto, @UserDecorator() user: User): Promise<ApiResponse> {
        await this.userTaskService.completeTask(user.userId, taskId, dto, lang);
        return {
            success: true,
            message: this.i18nUtils.translate('validation.user_task.complete_task_success', {}, lang)
        };
    }

}
