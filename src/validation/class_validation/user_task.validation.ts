import {
    IsEnum,
    IsNotEmpty,
    IsInt,
    IsDate,
} from 'class-validator';
import { UserTaskStatus } from '../../database/dto/user_task.dto';
import { i18nValidationMessage } from 'src/helper/decorators/i18n-validation.decorator';
import { Type } from 'class-transformer';

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

    @Type(() => Date)
    @IsDate(i18nValidationMessage('validation.user_task.assignedAt.isDate'))
    assignedAt?: Date;

    @Type(() => Date)
    @IsDate(i18nValidationMessage('validation.user_task.dueAt.isDate'))
    dueAt?: Date;

    @Type(() => Date)
    @IsDate(i18nValidationMessage('validation.user_task.doneAt.isDate'))
    doneAt?: Date;
}

export class CompleteTaskDto {
    userSubjectId: number;
}

