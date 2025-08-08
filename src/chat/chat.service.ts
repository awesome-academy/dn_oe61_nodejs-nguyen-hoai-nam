// src/chat/chat.service.ts
import { ForbiddenException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatMessage } from '../database/entities/chat_message.entity';
import { UserCourse } from '../database/entities/user_course.entity';
import { Course } from '../database/entities/course.entity';
import { User } from '../database/entities/user.entity';
import { I18nUtils } from 'src/helper/utils/i18n-utils';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatMessage) private chatMessageRepository: Repository<ChatMessage>,
    @InjectRepository(UserCourse) private userCourseRepository: Repository<UserCourse>,
    @InjectRepository(Course) private courseRepository: Repository<Course>,
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

      return await this.chatMessageRepository.save(message);
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
      const course = await this.courseRepository.findOne({
        where: { courseId },
        relations: ['creator'],
      });

      if (course?.creator?.userId === userId) {
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
