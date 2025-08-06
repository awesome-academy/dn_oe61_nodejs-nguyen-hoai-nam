import { Logger, Module } from '@nestjs/common';
import { UserSubjectController } from './user_subject.controller';
import { UserSubjectService } from './user_subject.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from 'src/database/entities/course.entity';
import { UserCourse } from 'src/database/entities/user_course.entity';
import { CourseSubject } from 'src/database/entities/course_subject.entity';
import { SupervisorCourse } from 'src/database/entities/supervisor_course.entity';
import { User } from 'src/database/entities/user.entity';
import { UserSubject } from 'src/database/entities/user_subject.entity';
import { UserTask } from 'src/database/entities/user_task.entity';
import { I18nUtils } from 'src/helper/utils/i18n-utils';
import { PaginationService } from 'src/helper/shared/pagination.shared';
import { GetCourse } from 'src/helper/shared/get_course.shared';
import { Task } from 'src/database/entities/task.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Course, CourseSubject, SupervisorCourse, Task, User, UserCourse, UserSubject, UserTask])],
  controllers: [UserSubjectController],
  providers: [UserSubjectService, I18nUtils, PaginationService, GetCourse, Logger]
})
export class UserSubjectModule { }
