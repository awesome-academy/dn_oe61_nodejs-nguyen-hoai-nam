import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength, MaxLength, } from 'class-validator';
import { Role, UserStatus } from '../../database/dto/user.dto';

export class CreateUserDto {
    @IsEmail({}, { message: 'Email không hợp lệ' })
    @IsNotEmpty({ message: 'Email không được để trống' })
    email: string;

    @IsString({ message: 'User name phải là chuỗi' })
    @IsNotEmpty({ message: 'User name không được để trống' })
    @MaxLength(100, { message: 'User name không được vượt quá 100 ký tự' })
    userName: string;

    @IsString({ message: 'Password phải là chuỗi' })
    @IsNotEmpty({ message: 'Password không được để trống' })
    @MinLength(6, { message: 'Password phải có ít nhất 6 ký tự' })
    password: string;
}

export class UpdateUserDto {
    @IsEmail({}, { message: 'Email không hợp lệ' })
    @IsOptional()
    email?: string;

    @IsString({ message: 'User name phải là chuỗi' })
    @IsOptional()
    @MaxLength(100, { message: 'User name không được vượt quá 100 ký tự' })
    userName?: string;

    @IsString({ message: 'Password phải là chuỗi' })
    @IsOptional()
    @MinLength(6, { message: 'Password phải có ít nhất 6 ký tự' })
    password?: string;

    @IsEnum(Role, { message: 'Role không hợp lệ' })
    @IsOptional()
    role?: Role;

    @IsEnum(UserStatus, { message: 'Status không hợp lệ' })
    @IsOptional()
    status?: UserStatus;
}
