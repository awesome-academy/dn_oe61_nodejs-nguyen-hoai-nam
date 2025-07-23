import {
    IsInt,
    IsNotEmpty,
    IsEnum,
    Min,
    Max,
    IsOptional,
} from 'class-validator';
import { UserSubjectStatus } from '../../database/dto/user_subject.dto';

export class CreateUserSubjectDto {
    @IsInt({ message: 'user_id phải là số nguyên' })
    @IsNotEmpty({ message: 'user_id không được để trống' })
    user_id: number;

    @IsInt({ message: 'course_subject_id phải là số nguyên' })
    @IsNotEmpty({ message: 'course_subject_id không được để trống' })
    course_subject_id: number;

    @IsInt({ message: 'subject_progress phải là số nguyên' })
    @Min(0, { message: 'subject_progress phải lớn hơn hoặc bằng 0' })
    @Max(100, { message: 'subject_progress phải nhỏ hơn hoặc bằng 100' })
    subject_progress: number;

    @IsEnum(UserSubjectStatus, { message: 'status không hợp lệ' })
    @IsNotEmpty({ message: 'status không được để trống' })
    status: UserSubjectStatus;
}

export class UpdateUserSubjectDto {
    @IsOptional()
    @IsInt({ message: 'subject_progress phải là số nguyên' })
    @Min(0, { message: 'subject_progress phải lớn hơn hoặc bằng 0' })
    @Max(100, { message: 'subject_progress phải nhỏ hơn hoặc bằng 100' })
    subject_progress?: number;
  
    @IsOptional()
    @IsEnum(UserSubjectStatus, { message: 'status không hợp lệ' })
    status?: UserSubjectStatus;
  }
