import {
    IsInt,
    IsNotEmpty,
    IsOptional,
} from 'class-validator';
import { i18nValidationMessage } from 'src/helper/decorators/i18n-validation.decorator';

export class CreateSupervisorCourseDto {
    @IsInt(i18nValidationMessage('validation.supervisor_course.courseId.isInt'))
    @IsNotEmpty(i18nValidationMessage('validation.supervisor_course.courseId.isNotEmpty'))
    courseId: number;

    @IsInt(i18nValidationMessage('validation.supervisor_course.supervisorId.isInt'))
    @IsNotEmpty(i18nValidationMessage('validation.supervisor_course.supervisorId.isNotEmpty'))
    supervisorId: number;
}

export class UpdateSupervisorCourseDto {
    @IsOptional()
    @IsInt(i18nValidationMessage('validation.supervisor_course.courseId.isInt'))
    courseId?: number;

    @IsOptional()
    @IsInt(i18nValidationMessage('validation.supervisor_course.supervisorId.isInt'))
    supervisorId?: number;
}
