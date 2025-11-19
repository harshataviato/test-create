import { Request } from 'express';
import { Observable } from 'rxjs';
import { LaunchDarklyContext } from '../feature-flag/GetBooleanFeatureFlagUseCase';
import { HttpException, HttpStatus } from '@nestjs/common';

export type RequestContext<TFeatureContext> = {
  req: Request;
  correlationId: string;
  traceId: string;
  brand?: Brand;
  launchDarklyContext: LaunchDarklyContext;
  featureContext?: TFeatureContext;
};

export type BrandEnum = 'AMI' | 'NRMA' | 'STATE';

export class Brand {
  private constructor(public readonly value: BrandEnum) {}

  public ami(callback: () => Observable<any>): BrandCallback<any> {
    return new BrandCallback(this.value === 'AMI' ? callback() : undefined);
  }

  public nrma(callback: () => Observable<any>): BrandCallback<any> {
    return new BrandCallback(this.value === 'NRMA' ? callback() : undefined);
  }

  public state(callback: () => Observable<any>): BrandCallback<any> {
    return new BrandCallback(this.value === 'STATE' ? callback() : undefined);
  }

  public toString(): string {
    return this.value;
  }
}

export class BrandCallback<T> {
  constructor(private readonly responseObservable?: Observable<T>) {}

  public toResponseOrBrandNotSupportedError(): Observable<T> {
    if (!this.responseObservable) {
      throw new HttpException('Brand not supported for this endpoint', HttpStatus.NOT_FOUND);
    }
    return this.responseObservable;
  }
}

export class RequestContextMiddleware {
  use(req: Request, res: Response, next: () => void) {
    req['requestContext'] = {
      req,
      correlationId: req.headers['x-correlation-id'] || 'no-correlation-id',
      traceId: req.headers['x-trace-id'] || 'no-trace-id',
      brand: req.headers['x-iag-brand'] ? new Brand(req.headers['x-iag-brand'] as BrandEnum) : undefined,
      launchDarklyContext: {
        key: 'default-user',
        kind: 'user',
      },
    };
    next();
  }
}
