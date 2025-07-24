import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ValidationModule } from 'src/validation/validation.module';
import { UserModule } from './user/user.module';

@Module({
    imports: [AuthModule, ValidationModule, UserModule],
})
export class ApiModule {}
