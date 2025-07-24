import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { AuthDto } from 'src/validation/auth_validation/auth.validation';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/validation/class_validation/user.validation';
import { I18nService } from 'nestjs-i18n';
import { Language } from 'src/helper/decorators/language.decorator';
import { Public } from 'src/helper/decorators/metadata.decorator';
import { AuthRoles } from 'src/helper/decorators/auth_roles.decorator';
import { Role } from 'src/database/dto/user.dto';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
    ) { }

    @Public()
    @Post('login')
    async login(@Body() userInput: AuthDto, @Language() lang: string) {
        const result = await this.authService.login(userInput,lang);
        return result;
    }

    @Public()
    @Post('register')
    async register(@Body() userInput: CreateUserDto, @Language() lang: string) {
        const result = await this.authService.register(userInput,lang);
        return result;
    }
}
