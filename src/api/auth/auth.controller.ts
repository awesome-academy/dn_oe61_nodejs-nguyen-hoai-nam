import { Body, Controller, Post } from '@nestjs/common';
import { AuthDto } from 'src/validation/auth_validation/auth.validation';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/validation/class_validation/user.validation';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService){}

    @Post('login')
    async login (@Body() userInput: AuthDto) {
        const result = await this.authService.login(userInput);
        return result;
    }

    @Post('register')
    async register (@Body() userInput: CreateUserDto) {
        const result = await this.authService.register(userInput);
        return result;
    }
}
