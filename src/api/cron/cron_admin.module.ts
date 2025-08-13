import { Module } from '@nestjs/common';
import { CronAdminController } from './cron_admin.controller';
import { CronAdminService } from './cron_admin.service';
import { ScheduleModule } from '@nestjs/schedule';
import { I18nUtils } from 'src/helper/utils/i18n-utils';

@Module({
  imports: [ScheduleModule],
  controllers: [CronAdminController],
  providers: [CronAdminService,I18nUtils],
})
export class CronAdminModule {}
