import {
    IsInt,
    IsNotEmpty,
    IsDateString,
    IsEnum,
    Min,
    Max,
    IsOptional,
} from 'class-validator';
import { UserCourseStatus } from '../../database/dto/user_course.dto';
import { i18nValidationMessage } from 'src/helper/decorators/i18n-validation.decorator';

export class CreateUserCourseDto {
    @IsInt(i18nValidationMessage('validation.user_course.courseId.isInt'))
    @IsNotEmpty(i18nValidationMessage('validation.user_course.courseId.isNotEmpty'))
    courseId: number;

    @IsInt(i18nValidationMessage('validation.user_course.userId.isInt'))
    @IsNotEmpty(i18nValidationMessage('validation.user_course.userId.isNotEmpty'))
    userId: number;

    @IsDateString({}, i18nValidationMessage('validation.user_course.registrationDate.isDateString'))
    @IsNotEmpty(i18nValidationMessage('validation.user_course.registrationDate.isNotEmpty'))
    registrationDate: string;

    @IsInt(i18nValidationMessage('validation.user_course.courseProgress.isInt'))
    @Min(0, i18nValidationMessage('validation.user_course.courseProgress.min'))
    @Max(100, i18nValidationMessage('validation.user_course.courseProgress.max'))
    courseProgress: number;

    @IsEnum(UserCourseStatus, i18nValidationMessage('validation.user_course.status.isEnum'))
    @IsNotEmpty(i18nValidationMessage('validation.user_course.status.isNotEmpty'))
    status: UserCourseStatus;
}

export class UpdateUserCourseDto {
    @IsOptional()
    @IsDateString({}, i18nValidationMessage('validation.user_course.registrationDate.isDateString'))
    registrationDate?: string;

    @IsOptional()
    @IsInt(i18nValidationMessage('validation.user_course.courseProgress.isInt'))
    @Min(0, i18nValidationMessage('validation.user_course.courseProgress.min'))
    @Max(100, i18nValidationMessage('validation.user_course.courseProgress.max'))
    courseProgress?: number;

    @IsOptional()
    @IsEnum(UserCourseStatus, i18nValidationMessage('validation.user_course.status.isEnum'))
    status?: UserCourseStatus;
}

export class AssignSupervisorDto {
    @IsInt(i18nValidationMessage('validation.supervisor_course.supervisorId.isInt'))
    @IsNotEmpty(i18nValidationMessage('validation.supervisor_course.supervisorId.isNotEmpty'))
    supervisorId: number;
}
