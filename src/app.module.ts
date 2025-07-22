import { Module } from '@nestjs/common';
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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
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
          entities: [User, Course, Subject, Task, CourseSubject, SupervisorCourse, UserCourse, UserSubject, UserTask],
          namingStrategy: new SnakeNamingStrategy(),
          synchronize: false,
          logging: true,
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
