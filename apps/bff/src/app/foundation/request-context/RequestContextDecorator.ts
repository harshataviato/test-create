import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestContext } from './RequestContext';

export const GetRequestContext = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): RequestContext<any> => {
    const request = ctx.switchToHttp().getRequest();
    // In a real application, you would extract these from headers or context
    const traceId = request.headers['x-iag-trace-id'] || 'default-trace-id';
    const brandId = request.headers['x-iag-brand'] || 'NRMA'; // Default to NRMA
    return new RequestContext(traceId, brandId);
  },
);
