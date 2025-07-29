import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsDateString,
  MaxLength,
  IsInt,
} from 'class-validator';
import { CourseStatus } from '../../database/dto/course.dto';
import { DefaultLength } from 'src/helper/constants/emtities.constant';
import { i18nValidationMessage } from 'src/helper/decorators/i18n-validation.decorator';
import { Type } from 'class-transformer';

export class CreateCourseDto {
  @IsString(i18nValidationMessage('validation.course.name.isString'))
  @IsNotEmpty(i18nValidationMessage('validation.course.name.isNotEmpty'))
  @MaxLength(DefaultLength, i18nValidationMessage('validation.course.name.maxLength'))
  name: string;

  @IsString(i18nValidationMessage('validation.course.description.isString'))
  @IsNotEmpty(i18nValidationMessage('validation.course.description.isNotEmpty'))
  description: string;

  @IsEnum(CourseStatus, i18nValidationMessage('validation.course.status.isEnum'))
  status: CourseStatus;

  @IsDateString({}, i18nValidationMessage('validation.course.start.isDateString'))
  start: string;

  @IsDateString({}, i18nValidationMessage('validation.course.end.isDateString'))
  end: string;
}

export class UpdateCourseDto {
  @IsOptional()
  @IsString(i18nValidationMessage('validation.course.name.isString'))
  @MaxLength(DefaultLength, i18nValidationMessage('validation.course.name.maxLength'))
  name?: string;

  @IsOptional()
  @IsString(i18nValidationMessage('validation.course.description.isString'))
  description?: string;

  @IsOptional()
  @IsEnum(CourseStatus, i18nValidationMessage('validation.course.status.isEnum'))
  status?: CourseStatus;

  @IsOptional()
  @IsDateString({}, i18nValidationMessage('validation.course.start.isDateString'))
  start?: string;

  @IsOptional()
  @IsDateString({}, i18nValidationMessage('validation.course.end.isDateString'))
  end?: string;
}

export class courseIdDto {
  @IsNotEmpty(i18nValidationMessage('validation.userId.isNotEmpty'))
  @Type(() => Number)
  courseId: number
}
