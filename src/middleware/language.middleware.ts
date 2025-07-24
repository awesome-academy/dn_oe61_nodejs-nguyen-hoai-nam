import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class LanguageMiddleware implements NestMiddleware {
  constructor(private readonly i18n: I18nService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const lang = 
      req.query.lang as string || 
      req.headers['accept-language'] || 
      req.cookies?.lang ||
      'vi';
    
    req['lang'] = lang;
    
    next();
  }
} 
