import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { I18nService } from 'nestjs-i18n';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly i18n: I18nService
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('test-i18n')
  async testI18n() {
    const enMessage = await this.i18n.translate('validation.email.isEmail', { lang: 'en' });
    const viMessage = await this.i18n.translate('validation.email.isEmail', { lang: 'vi' });
    
    return {
      en: enMessage,
      vi: viMessage
    };
  }
}
