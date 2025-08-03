import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ValidationModule } from 'src/validation/validation.module';
import { UserModule } from './user/user.module';
import { SourseModule } from './course/course.module';
import { SubjectModule } from './subject/subject.module';
import { TaskModule } from './task/task.module';
import { CourseSubjectModule } from './course_subject/course_subject.module';
import { UserCourseModule } from './user_course/user_course.module';
import { UserTaskModule } from './user_task/user_task.module';
import { UserSubjectModule } from './user_subject/user_subject.module';
import { ReportingModule } from './reporting/reporting.module';

@Module({
    imports: [AuthModule, ValidationModule, UserModule, SourseModule, SubjectModule, TaskModule, CourseSubjectModule, UserCourseModule, UserTaskModule, UserSubjectModule, ReportingModule],
})
export class ApiModule {}
