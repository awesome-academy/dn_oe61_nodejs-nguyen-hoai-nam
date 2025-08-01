import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import databaseConfig from './config/database.config';
import { User } from './database/entities/user.entity';
import { Course } from './database/entities/course.entity';
import { Subject } from './database/entities/subject.entity';
import { Task } from './database/entities/task.entity';
import { CourseSubject } from './database/entities/course_subject.entity';
import { SupervisorCourse } from './database/entities/supervisor_course.entity';
import { UserCourse } from './database/entities/user_course.entity';
import { UserSubject } from './database/entities/user_subject.entity';
import { UserTask } from './database/entities/user_task.entity';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { ApiModule } from './api/api.module';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AllExceptionFilter } from './helper/exceptions_filter/http_exception.helper';
import { TransformResponse } from './helper/Interceptors/transfrom.interceptor';
import {
  I18nModule,
  I18nJsonLoader,
  QueryResolver,
  HeaderResolver,
  CookieResolver
} from 'nestjs-i18n';
import { LanguageMiddleware } from './middleware/language.middleware';
import { I18nUtils } from './helper/utils/i18n-utils';
import * as path from 'path';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';
import * as dotenv from 'dotenv';
import { AuthGuard } from './middleware/guard.middleware';
import { MailerModule } from '@nestjs-modules/mailer';
import { JwtModule } from '@nestjs/jwt';
import { BlacklistedToken } from './database/entities/blacklisted_token.entity';
import { ScheduleModule } from '@nestjs/schedule';
dotenv.config();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'vi',
      loader: I18nJsonLoader,
      loaderOptions: {
        path: path.join(__dirname, 'i18n'),
        watch: true,
      },
      resolvers: [
        new QueryResolver(['lang']),
        new HeaderResolver(['accept-language']),
        new CookieResolver(['lang'])
      ],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService): TypeOrmModuleOptions => {
        const dbConfig = config.get<TypeOrmModuleOptions>('database');
        if (!dbConfig) {
          throw new Error('Database config not found');
        }

        return {
          ...dbConfig,
          entities: [User, Course, Subject, Task, CourseSubject, SupervisorCourse, UserCourse, UserSubject, UserTask, BlacklistedToken],
          namingStrategy: new SnakeNamingStrategy(),
          synchronize: false,
          logging: false,
        };
      },
      inject: [ConfigService],
    }),
    ApiModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('MAIL_HOST'),
          port: configService.get<number>('MAIL_PORT'),
          secure: false,
          auth: {
            user: configService.get<string>('MAIL_USER'),
            pass: configService.get<string>('MAIL_PASSWORD')
          },
        },
        defaults: {
          from: `"No Reply" <${configService.get<string>('MAIL_FROM')}>`,
        },
        template: {
          dir: path.join(__dirname, 'templates/email'),
          adapter: new PugAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '7d' },
    }),
    ScheduleModule.forRoot()
  ],
  controllers: [AppController],
  providers: [
    AppService,
    I18nUtils,
    {
      provide: APP_FILTER,
      useClass: AllExceptionFilter
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformResponse,
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard
    },
  ],
  exports: [I18nUtils],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LanguageMiddleware).forRoutes('*');
  }
}
