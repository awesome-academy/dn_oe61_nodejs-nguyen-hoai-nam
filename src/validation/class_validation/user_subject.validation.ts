import {
    IsInt,
    IsNotEmpty,
    IsEnum,
    Min,
    Max,
    IsOptional,
} from 'class-validator';
import { UserSubjectStatus } from '../../database/dto/user_subject.dto';
import { i18nValidationMessage } from 'src/helper/decorators/i18n-validation.decorator';
import { Type } from 'class-transformer';

export class CreateUserSubjectDto {
    @IsInt(i18nValidationMessage('validation.user_subject.userId.isInt'))
    @IsNotEmpty(i18nValidationMessage('validation.user_subject.userId.isNotEmpty'))
    userId: number;

    @IsInt(i18nValidationMessage('validation.user_subject.courseSubjectId.isInt'))
    @IsNotEmpty(i18nValidationMessage('validation.user_subject.courseSubjectId.isNotEmpty'))
    courseSubjectId: number;

    @IsInt(i18nValidationMessage('validation.user_subject.subjectProgress.isInt'))
    @Min(0, i18nValidationMessage('validation.user_subject.subjectProgress.min'))
    @Max(100, i18nValidationMessage('validation.user_subject.subjectProgress.max'))
    subjectProgress: number;

    @IsEnum(UserSubjectStatus, i18nValidationMessage('validation.user_subject.status.isEnum'))
    @IsNotEmpty(i18nValidationMessage('validation.user_subject.status.isNotEmpty'))
    status: UserSubjectStatus;
}

export class UpdateUserSubjectDto {
    @IsOptional()
    @IsInt(i18nValidationMessage('validation.user_subject.subjectProgress.isInt'))
    @Min(0, i18nValidationMessage('validation.user_subject.subjectProgress.min'))
    @Max(100, i18nValidationMessage('validation.user_subject.subjectProgress.max'))
    subjectProgress?: number;

    @IsOptional()
    @IsEnum(UserSubjectStatus, i18nValidationMessage('validation.user_subject.status.isEnum'))
    status?: UserSubjectStatus;
}

export class UserSubjectIdDto {
    @IsNotEmpty(i18nValidationMessage('validation.user_subject.isNotEmpty'))
    @Type(() => Number)
    userSubjectId: number
}
