import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { NestResponse } from '../interface/response.interface';

export const UserDecorator = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);

export const RequestDecorator = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    return ctx.switchToHttp().getRequest();
  },
);

export const ResponseDecorator = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): NestResponse => {
    return ctx.switchToHttp().getResponse() as unknown as NestResponse;
  },
);


export const QueryParam = createParamDecorator(
  (data: string | string[] | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const query = request.query;

    if (!data) {
      return query;
    }

    if (typeof data === 'string') {
      return query[data];
    }

    if (Array.isArray(data)) {
      const result: Record<string, any> = {};
      for (const key of data) {
        if (key in query) {
          result[key] = query[key];
        }
      }
      return result;
    }

    return undefined;
  },
);

export const PathParam = createParamDecorator(
  (data: string | string[] | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const params = request.params;

    if (!data) {
      return params;
    }

    if (typeof data === 'string') {
      return params[data];
    }

    if (Array.isArray(data)) {
      const result: Record<string, any> = {};
      for (const key of data) {
        if (key in params) {
          result[key] = params[key];
        }
      }
      return result;
    }

    console.warn(`@PathParam nhận kiểu không hợp lệ: ${typeof data}. Chỉ hỗ trợ string | string[] | undefined.`);
    return {};
  },
);

