import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatMessage } from '../database/entities/chat_message.entity';
import { UserCourse } from '../database/entities/user_course.entity';
import { Course } from '../database/entities/course.entity';
import { User } from 'src/database/entities/user.entity';
import { I18nUtils } from 'src/helper/utils/i18n-utils';
import { SupervisorCourse } from 'src/database/entities/supervisor_course.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatMessage, UserCourse, Course,SupervisorCourse, User]),
  ],
  controllers: [ChatController],
  providers: [ChatGateway, ChatService,I18nUtils],
})
export class ChatModule {}
