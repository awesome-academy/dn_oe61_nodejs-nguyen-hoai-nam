import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength, MaxLength, } from 'class-validator';
import { Role, UserStatus } from '../../database/dto/user.dto';
import { i18nValidationMessage } from '../../helper/decorators/i18n-validation.decorator';
import { IsStrongPassword } from 'src/helper/decorators/i18n-validators';

export class CreateUserDto {
    @IsEmail({}, i18nValidationMessage('validation.email.isEmail'))
    @IsNotEmpty(i18nValidationMessage('validation.email.isNotEmpty'))
    email: string;

    @IsString(i18nValidationMessage('validation.userName.isString'))
    @IsNotEmpty(i18nValidationMessage('validation.userName.isNotEmpty'))
    @MaxLength(100, i18nValidationMessage('validation.userName.maxLength'))
    userName: string;

    @IsString(i18nValidationMessage('validation.password.isString'))
    @IsNotEmpty(i18nValidationMessage('validation.password.isNotEmpty'))
    @MinLength(6, i18nValidationMessage('validation.password.minLength'))
    @IsStrongPassword()
    password: string;

    @IsEnum(Role, i18nValidationMessage('validation.role.isEnum'))
    @IsOptional()
    role?: Role;

    @IsEnum(UserStatus, i18nValidationMessage('validation.status.isEnum'))
    @IsOptional()
    status?: UserStatus;
}

export class UpdateUserDto {
    @IsEmail({}, i18nValidationMessage('validation.email.isEmail'))
    @IsOptional()
    email?: string;

    @IsString(i18nValidationMessage('validation.userName.isString'))
    @IsOptional()
    @MaxLength(100, i18nValidationMessage('validation.userName.maxLength'))
    userName?: string;

    @IsString(i18nValidationMessage('validation.password.isString'))
    @IsOptional()
    @MinLength(6, i18nValidationMessage('validation.password.minLength'))
    @IsStrongPassword()
    password?: string;

    @IsEnum(Role, i18nValidationMessage('validation.role.isEnum'))
    @IsOptional()
    role?: Role;

    @IsEnum(UserStatus, i18nValidationMessage('validation.status.isEnum'))
    @IsOptional()
    status?: UserStatus;
}
