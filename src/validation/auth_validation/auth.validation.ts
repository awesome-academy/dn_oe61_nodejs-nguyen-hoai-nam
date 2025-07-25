import { IsString, IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { i18nValidationMessage } from '../../helper/decorators/i18n-validation.decorator';
import { IsStrongPassword } from 'src/helper/decorators/i18n-validators';

export class AuthDto {
    @IsString(i18nValidationMessage('validation.email.isString'))
    @IsEmail({}, i18nValidationMessage('validation.email.isEmail'))
    @IsNotEmpty(i18nValidationMessage('validation.email.isNotEmpty'))
    email: string;

    @IsString(i18nValidationMessage('validation.password.isString'))
    @IsNotEmpty(i18nValidationMessage('validation.password.isNotEmpty'))
    @MinLength(6, i18nValidationMessage('validation.password.minLength'))
    password: string;
}

export class ChangePasswordDto {
    @IsString(i18nValidationMessage('validation.password.isString'))
    @IsNotEmpty(i18nValidationMessage('validation.password.isNotEmpty'))
    @MinLength(6, i18nValidationMessage('validation.password.minLength'))
    @IsStrongPassword()
    password: string;

    @IsString(i18nValidationMessage('validation.token.isString'))
    token: string;
}
