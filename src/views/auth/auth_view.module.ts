import { Module } from '@nestjs/common';
import { AuthViewController, DashboardViewController } from './auth_view.controller';

@Module({
  controllers: [AuthViewController, DashboardViewController],
  providers: []
})
export class AuthModule {}
