import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const UserDecorator = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
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

