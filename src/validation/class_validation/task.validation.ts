import {
    IsNotEmpty,
    IsString,
    IsInt,
    IsOptional,
} from 'class-validator';

export class CreateTaskDto {
    @IsString({ message: 'file_url phải là chuỗi' })
    @IsNotEmpty({ message: 'file_url không được để trống' })
    file_url: string;

    @IsInt({ message: 'subject_id phải là số nguyên' })
    @IsNotEmpty({ message: 'subject_id không được để trống' })
    subject_id: number;
}

export class UpdateTaskDto {
    @IsOptional()
    @IsString({ message: 'file_url phải là chuỗi' })
    file_url?: string;
}
