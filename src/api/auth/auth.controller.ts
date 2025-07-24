import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { AuthDto } from 'src/validation/auth_validation/auth.validation';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/validation/class_validation/user.validation';
import { I18nService } from 'nestjs-i18n';
import { Language } from 'src/helper/decorators/language.decorator';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly i18nService: I18nService
    ) { }

    @Post('login')
    async login(@Body() userInput: AuthDto, @Language() lang: string) {
        const result = await this.authService.login(userInput,lang);
        return result;
    }

    @Post('register')
    async register(@Body() userInput: CreateUserDto, @Language() lang: string) {
        const result = await this.authService.register(userInput,lang);
        return result;
    }
}
