import { NotFoundException } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { FeatureFlag } from '../feature-flag/FeatureFlag';

export type Brand = 'NRMA' | 'AMI' | 'STATE';

export class RequestContext<TContext extends { featureFlag?: FeatureFlag; response?: unknown }> {
  constructor(
    public readonly traceId: string,
    public readonly brandId: Brand,
    public readonly launchDarklyContext: any = {},
    public readonly brand?: BrandSelector<TContext>,
  ) {
    this.brand = new BrandSelector<TContext>(this.brandId, () => {
      throw new NotFoundException('Brand not supported');
    });
  }
}

export class BrandSelector<TContext> {
  constructor(private brandId: string, private errorHandler: () => never, private result?: Observable<TContext>) {}

  nrma(executor: () => Observable<TContext>): BrandSelector<TContext> {
    if (this.brandId === 'NRMA' && !this.result) {
      return new BrandSelector(this.brandId, this.errorHandler, executor());
    }
    return this;
  }

  ami(executor: () => Observable<TContext>): BrandSelector<TContext> {
    if (this.brandId === 'AMI' && !this.result) {
      return new BrandSelector(this.brandId, this.errorHandler, executor());
    }
    return this;
  }

  state(executor: () => Observable<TContext>): BrandSelector<TContext> {
    if (this.brandId === 'STATE' && !this.result) {
      return new BrandSelector(this.brandId, this.errorHandler, executor());
    }
    return this;
  }

  toResponseOrBrandNotSupportedError(): Observable<TContext> {
    if (this.result) {
      return this.result;
    }
    return throwError(() => this.errorHandler());
  }
}
