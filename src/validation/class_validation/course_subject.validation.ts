import {
  IsInt,
  IsNotEmpty,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { CourseSubjectStatus } from '../../database/dto/course_subject.dto';
import { i18nValidationMessage } from 'src/helper/decorators/i18n-validation.decorator';

export class SubjectDto {
  @IsInt(i18nValidationMessage('validation.course_subject.courseId.isInt'))
  @IsNotEmpty(i18nValidationMessage('validation.course_subject.courseId.isNotEmpty'))
  courseId: number;

  @IsInt(i18nValidationMessage('validation.course_subject.subjectId.isInt'))
  @IsNotEmpty(i18nValidationMessage('validation.course_subject.subjectId.isNotEmpty'))
  subjectId: number;

  @IsEnum(CourseSubjectStatus, i18nValidationMessage('validation.course_subject.status.isEnum'))
  @IsNotEmpty(i18nValidationMessage('validation.course_subject.status.isNotEmpty'))
  status: CourseSubjectStatus;
}

export class UpdateCourseSubjectDto {
  @IsOptional()
  @IsEnum(CourseSubjectStatus, i18nValidationMessage('validation.course_subject.status.isEnum'))
  status?: CourseSubjectStatus;
}
