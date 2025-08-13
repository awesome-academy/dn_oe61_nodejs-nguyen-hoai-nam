import { Body, Controller, Get, Post, Redirect, Req, Res, UseGuards } from '@nestjs/common';
import { AuthDto } from 'src/validation/auth_validation/auth.validation';
import { AuthService } from './auth.service';
import { UseInterceptors } from '@nestjs/common';
import { SetCookieInterceptor } from 'src/helper/Interceptors/set_cookie.interceptor';
import { CreateUserDto } from 'src/validation/class_validation/user.validation';
import { Language } from 'src/helper/decorators/language.decorator';
import { Public } from 'src/helper/decorators/metadata.decorator';
import { User } from 'src/database/entities/user.entity';
import { ResponseDecorator, UserDecorator } from 'src/helper/decorators/user.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiResponseLogin } from 'src/helper/swagger/auth/login_response.decorator';
import { ApiResponseRegister } from 'src/helper/swagger/auth/response_regiser.decorator';
import { LoginResponse, RegisterResponse, UserProfileResponse } from 'src/helper/interface/auth.interface';
import { ApiResponse } from 'src/helper/interface/api.interface';
import { I18nUtils } from 'src/helper/utils/i18n-utils';
import { ApiResponseMe } from 'src/helper/swagger/auth/me_response.decorator';
import { AuthGuard } from '@nestjs/passport';
import { NestResponse } from 'src/helper/interface/response.interface';

@ApiTags('auths')
@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly i18nUtils: I18nUtils,
    ) { }

    @ApiResponseLogin()
    @Public()
    @UseInterceptors(SetCookieInterceptor)
    @Post('login')
    async login(@Body() userInput: AuthDto, @Language() lang: string): Promise<ApiResponse | LoginResponse> {
        const result = await this.authService.login(userInput, lang);
        return {
            success: true,
            message: this.i18nUtils.translate('validation.auth.login_success', {}, lang),
            data: result
        };
    }

    @ApiResponseRegister()
    @Public()
    @Post('register')
    async register(@Body() userInput: CreateUserDto, @Language() lang: string): Promise<ApiResponse | RegisterResponse> {
        const result = await this.authService.register(userInput, lang);
        return {
            success: true,
            message: this.i18nUtils.translate('validation.auth.register_success', {}, lang),
            data: result
        }
    }

    @ApiBearerAuth('access-token')
    @ApiResponseMe()
    @Get('me')
    async getProfile(@UserDecorator() user: User, @Language() lang: string): Promise<ApiResponse | UserProfileResponse> {
        const result = await this.authService.getProfile(user, lang);
        return {
            success: true,
            message: this.i18nUtils.translate('validation.response_api.success', {}, lang),
            data: result
        }
    }

    @Public()
    @Get('google')
    @UseGuards(AuthGuard('google'))
    async googleAuth() { }

    @Public()
    @UseGuards(AuthGuard('google'))
    @Get('google/callback')
    async googleAuthRedirect(@UserDecorator() user: User, @Language() lang: string, @ResponseDecorator() res: NestResponse) {
        const redirectUrl = await this.authService.googleAuthRedirect(user, lang, res);
        return res.redirect(302, redirectUrl);
    }
}
