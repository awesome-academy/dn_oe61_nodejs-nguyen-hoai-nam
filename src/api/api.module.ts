import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ValidationModule } from 'src/validation/validation.module';
import { UserModule } from './user/user.module';
import { SourseModule } from './course/course.module';

@Module({
    imports: [AuthModule, ValidationModule, UserModule, SourseModule],
})
export class ApiModule {}
