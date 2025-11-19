import { createParamDecorator, ExecutionContext, Inject } from '@nestjs/common';
import { Request } from 'express';
import { RequestContext } from './RequestContext';
import { BrandService } from './BrandService';

export const GetRequestContext = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request: Request = ctx.switchToHttp().getRequest();
    const brandHeader = request.headers['x-iag-brand'] as string | undefined;

    const brandService = new BrandService();
    if (brandHeader) {
      brandService.withBrand(brandHeader);
    }

    const requestContext: RequestContext<any> = {
      traceId: request.headers['x-trace-id'] as string || 'default-trace-id',
      brand: brandService,
      launchDarklyContext: {
        user: { key: request.headers['x-user-key'] as string || 'anonymous' },
        custom: { brand: brandHeader }
      },
    };
    return requestContext;
  },
);
