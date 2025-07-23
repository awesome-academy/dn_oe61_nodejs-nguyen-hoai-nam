import {
    IsInt,
    IsNotEmpty,
    IsEnum,
    IsOptional,
  } from 'class-validator';
  import { CourseSubjectStatus } from '../../database/dto/course_subject.dto';
  
  export class SubjectDto {
    @IsInt({ message: 'course_id phải là số nguyên' })
    @IsNotEmpty({ message: 'course_id không được để trống' })
    course_id: number;
  
    @IsInt({ message: 'subject_id phải là số nguyên' })
    @IsNotEmpty({ message: 'subject_id không được để trống' })
    subject_id: number;
  
    @IsEnum(CourseSubjectStatus, { message: 'status không hợp lệ' })
    @IsNotEmpty({ message: 'status không được để trống' })
    status: CourseSubjectStatus;
  }
  
  export class UpdateCourseSubjectDto {
    @IsOptional()
    @IsEnum(CourseSubjectStatus, { message: 'status không hợp lệ' })
    status?: CourseSubjectStatus;
  }
  