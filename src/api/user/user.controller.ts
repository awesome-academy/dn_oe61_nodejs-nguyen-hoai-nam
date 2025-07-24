import { Body, Controller, Get, Post, Put, Req } from '@nestjs/common';
import { Request } from 'express';
import { UserService } from './user.service';
import { UpdateUserDto } from 'src/validation/class_validation/user.validation';
import { Language } from 'src/helper/decorators/language.decorator';
import { UserDecorator } from 'src/helper/decorators/user.decorator';
import { User } from 'src/database/entities/user.entity';

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
    async editProfile(@UserDecorator() user: User, @Req() req: Request, @Language() lang: string) {
        const result = await this.userService.editProfileUser(user, req, lang);
        return result;
    }
}
