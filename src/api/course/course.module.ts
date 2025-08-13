import { Logger, Module } from '@nestjs/common';
import { CourseController } from './course.controller';
import { CourseService } from './course.service';
import { I18nUtils } from 'src/helper/utils/i18n-utils';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from 'src/database/entities/course.entity';
import { hashPassword } from 'src/helper/shared/hash_password.shared';
import { UserCourse } from 'src/database/entities/user_course.entity';
import { CourseSubject } from 'src/database/entities/course_subject.entity';
import { SupervisorCourse } from 'src/database/entities/supervisor_course.entity';
import { PaginationService } from 'src/helper/shared/pagination.shared';
import { User } from 'src/database/entities/user.entity';
import { GetCourse } from 'src/helper/shared/get_course.shared';
import { UserSubject } from 'src/database/entities/user_subject.entity';
import { MailQueueModule } from 'src/helper/Queue/mail/mail_queue.module';

@Module({
  imports: [TypeOrmModule.forFeature([Course,UserCourse,CourseSubject,SupervisorCourse,User,UserSubject]),MailQueueModule],
  controllers: [CourseController],
  providers: [CourseService,I18nUtils,hashPassword,PaginationService,GetCourse,Logger]
})
export class SourseModule {}
