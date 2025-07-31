import { Type } from 'class-transformer';
import {
    IsNotEmpty,
    IsString,
    IsInt,
    IsOptional,
} from 'class-validator';
import { i18nValidationMessage } from 'src/helper/decorators/i18n-validation.decorator';

export class CreateTaskDto {
    @IsString(i18nValidationMessage('validation.task.name.isString'))
    @IsNotEmpty(i18nValidationMessage('validation.task.name.isNotEmpty'))
    name: string;

    @IsString(i18nValidationMessage('validation.task.fileUrl.isString'))
    @IsNotEmpty(i18nValidationMessage('validation.task.fileUrl.isNotEmpty'))
    fileUrl: string;

    @IsInt(i18nValidationMessage('validation.task.subjectId.isInt'))
    @IsNotEmpty(i18nValidationMessage('validation.task.subjectId.isNotEmpty'))
    subjectId: number;
}

export class UpdateTaskDto {
    @IsString(i18nValidationMessage('validation.task.name.isString'))
    @IsOptional()
    name?: string;

    @IsOptional()
    @IsString(i18nValidationMessage('validation.task.fileUrl.isString'))
    fileUrl?: string;

    @IsInt(i18nValidationMessage('validation.task.subjectId.isInt'))
    @IsOptional()
    subjectId: number;
}

export class TaskIdDto {
    @IsNotEmpty(i18nValidationMessage('validation.task.taskId'))
    @Type(() => Number)
    taskId: number
}
