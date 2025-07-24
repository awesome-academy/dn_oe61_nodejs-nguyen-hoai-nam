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
import { DefaultLength } from 'src/helper/constants/emtities.constant';

export class CreateCourseDto {
  @IsString({ message: 'Tên khóa học phải là chuỗi' })
  @IsNotEmpty({ message: 'Tên khóa học không được để trống' })
  @MaxLength(DefaultLength, { message: `Tên khóa học không được vượt quá ${DefaultLength} ký tự` })
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
  creatorId: number;
}

export class UpdateCourseDto {
  @IsOptional()
  @IsString({ message: 'Tên khóa học phải là chuỗi' })
  @MaxLength(DefaultLength, { message: `Tên khóa học không được vượt quá ${DefaultLength} ký tự` })
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
