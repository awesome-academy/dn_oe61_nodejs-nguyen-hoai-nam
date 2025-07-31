import { Logger, Module } from '@nestjs/common';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserSubject } from 'src/database/entities/user_subject.entity';
import { CourseSubject } from 'src/database/entities/course_subject.entity';
import { Task } from 'src/database/entities/task.entity';
import { User } from 'src/database/entities/user.entity';
import { I18nUtils } from 'src/helper/utils/i18n-utils';
import { PaginationService } from 'src/helper/shared/pagination.shared';
import { Subject } from 'src/database/entities/subject.entity';
import { UserTask } from 'src/database/entities/user_task.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User,Subject,Task,CourseSubject,UserSubject,UserTask])],
  controllers: [TaskController],
  providers: [TaskService, I18nUtils, PaginationService,Logger]
})
export class TaskModule {}
