import { Logger, Module } from '@nestjs/common';
import { SubjectController } from './subject.controller';
import { SubjectService } from './subject.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { I18nUtils } from 'src/helper/utils/i18n-utils';
import { hashPassword } from 'src/helper/shared/hash_password.shared';
import { PaginationService } from 'src/helper/shared/pagination.shared';
import { GetCourse } from 'src/helper/shared/get_course.shared';
import { Subject } from 'src/database/entities/subject.entity';
import { Course } from 'src/database/entities/course.entity';
import { UserCourse } from 'src/database/entities/user_course.entity';
import { CourseSubject } from 'src/database/entities/course_subject.entity';
import { SupervisorCourse } from 'src/database/entities/supervisor_course.entity';
import { User } from 'src/database/entities/user.entity';
import { UserSubject } from 'src/database/entities/user_subject.entity';
import { Task } from 'src/database/entities/task.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Course,User,Subject,Task,UserCourse,SupervisorCourse,CourseSubject,UserSubject])],
  controllers: [SubjectController],
  providers: [SubjectService, I18nUtils, hashPassword, PaginationService, GetCourse,Logger]
})
export class SubjectModule { }
