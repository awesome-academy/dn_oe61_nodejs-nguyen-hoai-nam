import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth_view.module';

@Module({
  imports: [AuthModule]
})
export class ViewsModule {}
