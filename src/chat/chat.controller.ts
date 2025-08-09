// src/chat/chat.controller.ts
import { Controller, Get, Param, Render, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { Public } from 'src/helper/decorators/metadata.decorator';
import { UserDecorator } from 'src/helper/decorators/user.decorator';
import { AuthRoles } from 'src/helper/decorators/auth_roles.decorator';
import { Role } from 'src/database/dto/user.dto';
import { Language } from 'src/helper/decorators/language.decorator';

@Controller('chat')
export class ChatController {
    constructor(private readonly chatService: ChatService) { }

    @Get('course/:courseId')
    @AuthRoles(Role.SUPERVISOR, Role.TRAINEE)
    async getMessagesByCourse(@Param('courseId') courseId: number, @UserDecorator('userId') userId: number,@Language() lang:string) {
        return await this.chatService.getMessagesForCourse(courseId, userId,lang);
    }

    @Get('history/:courseId')
    @AuthRoles(Role.SUPERVISOR, Role.TRAINEE)
    async getChatHistory(@Param('courseId') courseId: number, @UserDecorator('userId') userId: number,@Language() lang:string) {
        return await this.chatService.getChatHistory(courseId, userId,lang);
    }
}
