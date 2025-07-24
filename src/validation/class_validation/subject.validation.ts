import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsInt,
    Min,
    MaxLength,
} from 'class-validator';
import { DefaultLength } from 'src/helper/constants/emtities.constant';
import { i18nValidationMessage } from 'src/helper/decorators/i18n-validation.decorator';

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

    @IsInt(i18nValidationMessage('validation.subject.creatorId.isInt'))
    @IsNotEmpty(i18nValidationMessage('validation.subject.creatorId.isNotEmpty'))
    creatorId: number;
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
