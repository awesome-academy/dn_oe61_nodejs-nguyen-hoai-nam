import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { I18nService } from 'nestjs-i18n';
import { AsyncLocalStorage } from 'async_hooks';

export const asyncLocalStorage = new AsyncLocalStorage<Map<string, any>>();

@Injectable()
export class LanguageMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    const lang = req.query.lang || req.headers['accept-language'] || req.cookies?.lang || 'vi';

    asyncLocalStorage.run(new Map([['lang', lang]]), () => {
      next();
    });
  }
}
