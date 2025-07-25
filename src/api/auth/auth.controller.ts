import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { AuthDto } from 'src/validation/auth_validation/auth.validation';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/validation/class_validation/user.validation';
import { Language } from 'src/helper/decorators/language.decorator';
import { Public } from 'src/helper/decorators/metadata.decorator';
import { User } from 'src/database/entities/user.entity';
import { UserDecorator } from 'src/helper/decorators/user.decorator';

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

    @Get('me')
    async getProfile(@UserDecorator() user: User, @Language() lang: string) {
        const result = await this.authService.getProfile(user,lang);
        return result;
    }
}
