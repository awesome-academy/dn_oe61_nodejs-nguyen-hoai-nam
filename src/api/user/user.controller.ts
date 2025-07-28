import { Controller, Get, Param, Post, Put, Req } from '@nestjs/common';
import { Request } from 'express';
import { UserService } from './user.service';
import { Language } from 'src/helper/decorators/language.decorator';
import { UserDecorator } from 'src/helper/decorators/user.decorator';
import { User } from 'src/database/entities/user.entity';
import { Role } from 'src/database/dto/user.dto';
import { AuthRoles } from 'src/helper/decorators/auth_roles.decorator';

@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService
    ) { }

    @Get('me')
    async getProfileUser(@UserDecorator('userId') userId: number, @Language() lang: string) {
        const result = await this.userService.getProfileUser(userId, lang);
        return result;
    }

    @Put('edit')
    async editProfile(@UserDecorator() user: User, @UserDecorator('userId') userId: number, @Language() lang: string) {
        const result = await this.userService.editProfileUser(user, userId, lang);
        return result;
    }

    @Get(':userId')
    @AuthRoles(Role.ADMIN, Role.SUPERVISOR)
    async viewProfile(@Param('userId') userId: number, @UserDecorator('role') userRole: string, @Language() lang: string) {
        const result = await this.userService.viewProfile(userId, userRole, lang);
        return result;
    }
}
