import { Logger, Module } from '@nestjs/common';
import { UserCourseController } from './user_course.controller';
import { UserCourseService } from './user_course.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from 'src/database/entities/course.entity';
import { UserCourse } from 'src/database/entities/user_course.entity';
import { CourseSubject } from 'src/database/entities/course_subject.entity';
import { SupervisorCourse } from 'src/database/entities/supervisor_course.entity';
import { User } from 'src/database/entities/user.entity';
import { UserSubject } from 'src/database/entities/user_subject.entity';
import { I18nUtils } from 'src/helper/utils/i18n-utils';
import { PaginationService } from 'src/helper/shared/pagination.shared';
import { GetCourse } from 'src/helper/shared/get_course.shared';

@Module({
  imports: [TypeOrmModule.forFeature([Course,UserCourse,CourseSubject,SupervisorCourse,User,UserSubject])],
  controllers: [UserCourseController],
  providers: [UserCourseService,I18nUtils,PaginationService,GetCourse,Logger]
})
export class UserCourseModule {}
