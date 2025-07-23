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
  
  export class CreateCourseDto {
    @IsString({ message: 'Tên khóa học phải là chuỗi' })
    @IsNotEmpty({ message: 'Tên khóa học không được để trống' })
    @MaxLength(255, { message: 'Tên khóa học không được vượt quá 255 ký tự' })
    name: string;
  
    @IsString({ message: 'Mô tả phải là chuỗi' })
    @IsNotEmpty({ message: 'Mô tả không được để trống' })
    description: string;
  
    @IsEnum(CourseStatus, { message: 'Trạng thái khóa học không hợp lệ' })
    status: CourseStatus;
  
    @IsDateString({}, { message: 'Ngày bắt đầu phải đúng định dạng ISO' })
    start: string;
  
    @IsDateString({}, { message: 'Ngày kết thúc phải đúng định dạng ISO' })
    end: string;
  
    @IsInt({ message: 'creator_id phải là số nguyên' })
    @IsNotEmpty({ message: 'creator_id không được để trống' })
    creator_id: number;
  }
  
  export class UpdateCourseDto {
    @IsOptional()
    @IsString({ message: 'Tên khóa học phải là chuỗi' })
    @MaxLength(255, { message: 'Tên khóa học không được vượt quá 255 ký tự' })
    name?: string;
  
    @IsOptional()
    @IsString({ message: 'Mô tả phải là chuỗi' })
    description?: string;
  
    @IsOptional()
    @IsEnum(CourseStatus, { message: 'Trạng thái khóa học không hợp lệ' })
    status?: CourseStatus;
  
    @IsOptional()
    @IsDateString({}, { message: 'Ngày bắt đầu phải đúng định dạng ISO' })
    start?: string;
  
    @IsOptional()
    @IsDateString({}, { message: 'Ngày kết thúc phải đúng định dạng ISO' })
    end?: string;
  }
  