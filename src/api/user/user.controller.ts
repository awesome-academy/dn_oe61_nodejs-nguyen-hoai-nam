import { Body, Controller, Get, Param, Post, Put, Req } from '@nestjs/common';
import { Request } from 'express';
import { UserService } from './user.service';
import { Language } from 'src/helper/decorators/language.decorator';
import { UserDecorator } from 'src/helper/decorators/user.decorator';
import { User } from 'src/database/entities/user.entity';
import { Role } from 'src/database/dto/user.dto';
import { AuthRoles } from 'src/helper/decorators/auth_roles.decorator';
import { ApiBearerAuth, ApiExcludeEndpoint } from '@nestjs/swagger';
import { I18nUtils } from 'src/helper/utils/i18n-utils';
import { ApiResponse } from 'src/helper/interface/api.interface';
import { MyProfile } from 'src/helper/interface/user.interface';
import { ApiResponseMyProfile } from 'src/helper/swagger/user/my_profile_response.decorator';
import { UpdateUserDto } from 'src/validation/class_validation/user.validation';
import { ApiResponseEditProfile } from 'src/helper/swagger/user/edit_profile_reponse.decorator';

@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService,
        private readonly i18nUtils: I18nUtils
    ) { }

    @ApiResponseMyProfile()
    @ApiBearerAuth('access-token')
    @Get('me')
    async getProfileUser(@UserDecorator('userId') userId: number, @Language() lang: string): Promise<ApiResponse | MyProfile> {
        const result = await this.userService.getProfileUser(userId, lang);
        return {
            success: true,
            message: this.i18nUtils.translate('validation.auth.user_success', {}, lang),
            data: result
        }
    }

    @ApiResponseEditProfile()
    @ApiBearerAuth('access-token')
    @Put('edit')
    async editProfile(@Body() user: UpdateUserDto, @UserDecorator('userId') userId: number, @Language() lang: string): Promise<ApiResponse|UpdateUserDto> {
        const result = await this.userService.editProfileUser(user, userId, lang);
        return {
            success: true,
            message: this.i18nUtils.translate('validation.crud.update_success'),
            data: result
        }
    }

    @ApiExcludeEndpoint()
    @Get(':userId')
    @AuthRoles(Role.ADMIN, Role.SUPERVISOR)
    async viewProfile(@Param('userId') userId: number, @UserDecorator('role') userRole: string, @Language() lang: string) {
        const result = await this.userService.viewProfile(userId, userRole, lang);
        return result;
    }
}
