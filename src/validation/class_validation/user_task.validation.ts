import {
    IsEnum,
    IsNotEmpty,
    IsInt,
} from 'class-validator';
import { UserTaskStatus } from '../../database/dto/user_task.dto';
import { i18nValidationMessage } from 'src/helper/decorators/i18n-validation.decorator';

export class UserTaskDto {
    @IsInt(i18nValidationMessage('validation.user_task.userSubjectId.isInt'))
    @IsNotEmpty(i18nValidationMessage('validation.user_task.userSubjectId.isNotEmpty'))
    userSubjectId?: number;

    @IsInt(i18nValidationMessage('validation.user_task.taskId.isInt'))
    @IsNotEmpty(i18nValidationMessage('validation.user_task.taskId.isNotEmpty'))
    taskId?: number;

    @IsEnum(UserTaskStatus, i18nValidationMessage('validation.user_task.status.isEnum'))
    @IsNotEmpty(i18nValidationMessage('validation.user_task.status.isNotEmpty'))
    status: UserTaskStatus;
}
