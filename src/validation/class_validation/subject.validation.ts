import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsInt,
    Min,
    MaxLength,
} from 'class-validator';

export class CreateSubjectDto {
    @IsString({ message: 'Tên môn học phải là chuỗi' })
    @IsNotEmpty({ message: 'Tên môn học không được để trống' })
    @MaxLength(255, { message: 'Tên môn học không được vượt quá 255 ký tự' })
    name: string;

    @IsString({ message: 'Mô tả phải là chuỗi' })
    @IsNotEmpty({ message: 'Mô tả không được để trống' })
    description: string;

    @IsInt({ message: 'Thời lượng học phải là số nguyên' })
    @Min(0, { message: 'Thời lượng học phải lớn hơn hoặc bằng 0' })
    study_duration: number;

    @IsInt({ message: 'creator_id phải là số nguyên' })
    @IsNotEmpty({ message: 'creator_id không được để trống' })
    creator_id: number;
}

export class UpdateSubjectDto {
    @IsOptional()
    @IsString({ message: 'Tên môn học phải là chuỗi' })
    @MaxLength(255, { message: 'Tên môn học không được vượt quá 255 ký tự' })
    name?: string;

    @IsOptional()
    @IsString({ message: 'Mô tả phải là chuỗi' })
    description?: string;

    @IsOptional()
    @IsInt({ message: 'Thời lượng học phải là số nguyên' })
    @Min(0, { message: 'Thời lượng học phải lớn hơn hoặc bằng 0' })
    study_duration?: number;
}
