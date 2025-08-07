import { ForbiddenException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatMessage } from '../database/entities/chat_message.entity';
import { UserCourse } from '../database/entities/user_course.entity';
import { User } from '../database/entities/user.entity';
import { I18nUtils } from 'src/helper/utils/i18n-utils';
import { SupervisorCourse } from 'src/database/entities/supervisor_course.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatMessage) private chatMessageRepository: Repository<ChatMessage>,
    @InjectRepository(UserCourse) private userCourseRepository: Repository<UserCourse>,
    @InjectRepository(SupervisorCourse) private supervisorCourseRepository: Repository<SupervisorCourse>,
    @InjectRepository(User) private userRepository: Repository<User>,
    private readonly i18nUtils: I18nUtils,
  ) { }

  async saveMessage(data: { courseId: number; senderId: number; content: string }, lang: string) {
    try {
      const hasAccess = await this.validateUserAccess(data.courseId, data.senderId,lang);
      if (!hasAccess) {
        throw new ForbiddenException(this.i18nUtils.translate('chat.no_access', {}, lang));
      }

      const message = this.chatMessageRepository.create({
        content: data.content,
        course: { courseId: data.courseId },
        sender: { userId: data.senderId },
      });

      const saved = await this.chatMessageRepository.save(message);

      const sender = await this.userRepository.findOne({ where: { userId: data.senderId } });
      if (sender) {
        saved.sender = sender;
      }
      return saved;
    } catch {
      throw new InternalServerErrorException(this.i18nUtils.translate('validation.server.internal_server_error', {}, lang));
    }
  }

  async getMessagesForCourse(courseId: number, userId: number, lang: string) {
    try {
      const hasAccess = await this.validateUserAccess(courseId, userId,lang);
      if (!hasAccess) {
        throw new ForbiddenException(this.i18nUtils.translate('chat.no_access', {}, lang));
      }

      const chatMessage = await this.chatMessageRepository.find({
        where: { course: { courseId } },
        relations: ['sender'],
        order: { createdAt: 'ASC' },
      });

      if (chatMessage.length === 0) {
        return [];
      }

      return chatMessage;
    } catch {
      throw new InternalServerErrorException(this.i18nUtils.translate('validation.server.internal_server_error', {}, lang));
    }
  }

  async getChatHistory(courseId: number, userId: number, lang: string) {
    try {
      const hasAccess = await this.validateUserAccess(courseId, userId,lang);
      if (!hasAccess) {
        throw new ForbiddenException(this.i18nUtils.translate('chat.no_access', {}, lang));
      }

      const messages = await this.chatMessageRepository.find({
        where: { course: { courseId } },
        relations: ['sender'],
        order: { createdAt: 'ASC' },
        take: 50,
      });

      if (messages.length === 0) {
        return [];
      }

      return {
        success: true,
        message: this.i18nUtils.translate('chat.load_success', {}, lang),
        data: messages.map(message => ({
          messageId: message?.messageId,
          content: message?.content,
          sender: {
            userId: message?.sender?.userId,
            userName: message?.sender?.userName,
            role: message?.sender?.role,
          },
          createdAt: message?.createdAt,
          updatedAt: message?.updatedAt,
        })),
      };
    } catch {
      throw new InternalServerErrorException(this.i18nUtils.translate('validation.server.internal_server_error', {}, lang));
    }
  }

  async validateUserAccess(courseId: number, userId: number,lang:string): Promise<boolean> {
    try {
      const course = await this.supervisorCourseRepository.findOne({
        where: { course: {courseId: courseId}, supervisor: {userId: userId} },
      });
      
      if (course) {
        return true;
      }

      const userCourse = await this.userCourseRepository.findOne({
        where: {
          course: { courseId },
          user: { userId },
        },
      });

      return !!userCourse;
    } catch {
      throw new InternalServerErrorException(this.i18nUtils.translate('validation.server.internal_server_error', {}, lang));
    }
  }
}
