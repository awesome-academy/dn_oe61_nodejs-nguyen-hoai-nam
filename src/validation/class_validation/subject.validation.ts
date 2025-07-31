import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsInt,
    Min,
    MaxLength,
    IsArray,
    ArrayUnique,
    ArrayNotEmpty,
} from 'class-validator';
import { DefaultLength } from 'src/helper/constants/emtities.constant';
import { i18nValidationMessage } from 'src/helper/decorators/i18n-validation.decorator';
import { CreateTaskDto } from './task.validation';
import { Type } from 'class-transformer';

export class CreateSubjectDto {
    @IsString(i18nValidationMessage('validation.subject.name.isString'))
    @IsNotEmpty(i18nValidationMessage('validation.subject.name.isNotEmpty'))
    @MaxLength(DefaultLength, i18nValidationMessage('validation.subject.name.maxLength'))
    name: string;

    @IsString(i18nValidationMessage('validation.subject.description.isString'))
    @IsNotEmpty(i18nValidationMessage('validation.subject.description.isNotEmpty'))
    description: string;

    @IsInt(i18nValidationMessage('validation.subject.studyDuration.isInt'))
    @Min(0, i18nValidationMessage('validation.subject.studyDuration.min'))
    studyDuration: number;

    @IsArray(i18nValidationMessage('validation.subject.taskIds.isArray'))
    @ArrayUnique(i18nValidationMessage('validation.subject.taskIds.arrayUnique'))
    @ArrayNotEmpty(i18nValidationMessage('validation.subject.taskIds.arrayNotEmpty'))
    tasks: CreateTaskDto[];
}

export class UpdateSubjectDto {
    @IsOptional()
    @IsString(i18nValidationMessage('validation.subject.name.isString'))
    @MaxLength(DefaultLength, i18nValidationMessage('validation.subject.name.maxLength'))
    name?: string;

    @IsOptional()
    @IsString(i18nValidationMessage('validation.subject.description.isString'))
    description?: string;

    @IsOptional()
    @IsInt(i18nValidationMessage('validation.subject.studyDuration.isInt'))
    @Min(0, i18nValidationMessage('validation.subject.studyDuration.min'))
    studyDuration?: number;
}

export class subjectIdDto {
    @IsNotEmpty(i18nValidationMessage('validation.userId.isNotEmpty'))
    @Type(() => Number)
    subjectId: number
}
