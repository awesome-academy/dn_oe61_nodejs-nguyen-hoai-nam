import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ValidationModule } from 'src/validation/validation.module';
import { UserModule } from './user/user.module';
import { SourseModule } from './course/course.module';
import { SubjectModule } from './subject/subject.module';
import { TaskModule } from './task/task.module';
import { CourseSubjectModule } from './course_subject/course_subject.module';

@Module({
    imports: [AuthModule, ValidationModule, UserModule, SourseModule, SubjectModule, TaskModule, CourseSubjectModule],
})
export class ApiModule {}
