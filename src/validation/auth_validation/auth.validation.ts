import { IsString, IsEmail, IsNotEmpty, MinLength} from 'class-validator';
import { i18nValidationMessage } from '../../helper/decorators/i18n-validation.decorator';

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
