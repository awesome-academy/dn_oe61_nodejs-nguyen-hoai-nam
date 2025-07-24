import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { langConstant } from '../constants/lang.constant';

@Injectable()
export class I18nUtils {
  constructor(private readonly i18nService: I18nService) {}

  translate(key: string, args: any = {}, lang?: string): string {
    return this.i18nService.translate(key, {
      lang: lang || langConstant.VN,
      args,
    });
  }
} 
