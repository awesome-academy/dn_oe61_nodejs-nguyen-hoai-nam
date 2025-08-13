import { Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { Language } from 'src/helper/decorators/language.decorator';
import { ApiResponse } from 'src/helper/interface/api.interface';
import { CronAdminService } from './cron_admin.service';
import { ApiExcludeController, ApiTags } from '@nestjs/swagger';
import { I18nUtils } from 'src/helper/utils/i18n-utils';

@ApiExcludeController()
@Controller('cron_jobs')
export class CronAdminController {
  constructor(
    private readonly cronAdminService: CronAdminService,
    private readonly i18n: I18nUtils,
  ) {}

  @Get()
  getAll(@Language() lang: string): ApiResponse {
    return {
      code: 200,
      success: true,
      message: this.i18n.translate('validation.cron.listSuccess', {}, lang),
      data: this.cronAdminService.listJobs(),
    };
  }

  @Post(':name/run')
  runNow(@Param('name') name: string, @Language() lang: string): ApiResponse {
    this.cronAdminService.runNow(name, lang);
    return {
      code: 200,
      success: true,
      message: this.i18n.translate('validation.cron.triggered', {}, lang),
    };
  }
}
