import {
    IsInt,
    IsNotEmpty,
    IsOptional,
} from 'class-validator';

export class CreateSupervisorCourseDto {
    @IsInt({ message: 'course_id phải là số nguyên' })
    @IsNotEmpty({ message: 'course_id không được để trống' })
    courseId: number;

    @IsInt({ message: 'supervisor_id phải là số nguyên' })
    @IsNotEmpty({ message: 'supervisor_id không được để trống' })
    supervisorId: number;
}

export class UpdateSupervisorCourseDto {
    @IsOptional()
    @IsInt({ message: 'course_id phải là số nguyên' })
    courseId?: number;

    @IsOptional()
    @IsInt({ message: 'supervisor_id phải là số nguyên' })
    supervisorId?: number;
}
