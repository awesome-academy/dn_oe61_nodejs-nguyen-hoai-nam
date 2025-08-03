import { Module } from '@nestjs/common';
import { CourseSubjectController } from './course_subject.controller';
import { CourseSubjectService } from './course_subject.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseSubject } from 'src/database/entities/course_subject.entity';
import { I18nUtils } from 'src/helper/utils/i18n-utils';
import { Course } from 'src/database/entities/course.entity';
import { Subject } from 'src/database/entities/subject.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CourseSubject,Course,Subject])],
  controllers: [CourseSubjectController],
  providers: [CourseSubjectService,I18nUtils]
})
export class CourseSubjectModule {}
