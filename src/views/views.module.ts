import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth_view.module';
import { ChatAdminController } from './admin/chat/chat_admin.controller';
import { AdminViewController } from './admin/admin_view.controller';
import { I18nUtils } from 'src/helper/utils/i18n-utils';

@Module({
  imports: [AuthModule],
  controllers: [ChatAdminController, AdminViewController],
  providers: [I18nUtils]
})
export class ViewsModule {}
