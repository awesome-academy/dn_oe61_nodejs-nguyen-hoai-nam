import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ValidationModule } from 'src/validation/validation.module';

@Module({
    imports: [AuthModule, ValidationModule],
})
export class ApiModule {}
