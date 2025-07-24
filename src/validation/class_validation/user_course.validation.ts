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

export class CreateUserCourseDto {
    @IsInt({ message: 'course_id phải là số nguyên' })
    @IsNotEmpty({ message: 'course_id không được để trống' })
    courseId: number;

    @IsInt({ message: 'user_id phải là số nguyên' })
    @IsNotEmpty({ message: 'user_id không được để trống' })
    userId: number;

    @IsDateString({}, { message: 'registration_date phải là định dạng ngày hợp lệ' })
    @IsNotEmpty({ message: 'registration_date không được để trống' })
    registrationDate: string;

    @IsInt({ message: 'course_progress phải là số nguyên' })
    @Min(0, { message: 'course_progress phải lớn hơn hoặc bằng 0' })
    @Max(100, { message: 'course_progress phải nhỏ hơn hoặc bằng 100' })
    courseProgress: number;

    @IsEnum(UserCourseStatus, { message: 'status không hợp lệ' })
    @IsNotEmpty({ message: 'status không được để trống' })
    status: UserCourseStatus;
}

export class UpdateUserCourseDto {
    @IsOptional()
    @IsDateString({}, { message: 'registration_date phải là định dạng ngày hợp lệ' })
    registrationDate?: string;
  
    @IsOptional()
    @IsInt({ message: 'course_progress phải là số nguyên' })
    @Min(0, { message: 'course_progress phải lớn hơn hoặc bằng 0' })
    @Max(100, { message: 'course_progress phải nhỏ hơn hoặc bằng 100' })
    courseProgress?: number;
  
    @IsOptional()
    @IsEnum(UserCourseStatus, { message: 'status không hợp lệ' })
    status?: UserCourseStatus;
  }
