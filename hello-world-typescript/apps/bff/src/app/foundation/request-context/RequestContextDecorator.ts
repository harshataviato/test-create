import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestContext } from './RequestContext';

export const GetRequestContext = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): RequestContext<any> => {
    const request = ctx.switchToHttp().getRequest();
    return request.requestContext;
  },
);
