import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Language = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    
    const lang = 
      request.query?.lang || 
      request.headers['accept-language'] || 
      request.cookies?.lang;
    
    return lang || 'vi';
  },
); 
