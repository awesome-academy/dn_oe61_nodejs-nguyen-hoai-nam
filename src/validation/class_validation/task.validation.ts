import {
    IsNotEmpty,
    IsString,
    IsInt,
    IsOptional,
} from 'class-validator';

export class CreateTaskDto {
    @IsString({ message: 'file_url phải là chuỗi' })
    @IsNotEmpty({ message: 'file_url không được để trống' })
    fileUrl: string;

    @IsInt({ message: 'subject_id phải là số nguyên' })
    @IsNotEmpty({ message: 'subject_id không được để trống' })
    subjectId: number;
}

export class UpdateTaskDto {
    @IsOptional()
    @IsString({ message: 'file_url phải là chuỗi' })
    fileUrl?: string;
}
