import {
    IsInt,
    IsNotEmpty,
    IsOptional,
} from 'class-validator';

export class CreateSupervisorCourseDto {
    @IsInt({ message: 'course_id phải là số nguyên' })
    @IsNotEmpty({ message: 'course_id không được để trống' })
    course_id: number;

    @IsInt({ message: 'supervisor_id phải là số nguyên' })
    @IsNotEmpty({ message: 'supervisor_id không được để trống' })
    supervisor_id: number;
}

export class UpdateSupervisorCourseDto {
    @IsOptional()
    @IsInt({ message: 'course_id phải là số nguyên' })
    course_id?: number;

    @IsOptional()
    @IsInt({ message: 'supervisor_id phải là số nguyên' })
    supervisor_id?: number;
}
