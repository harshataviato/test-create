import { Injectable } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { BrandNotSupportedError } from './BrandNotSupportedError';

type BrandExecutionMap<T> = {
  nrma?: () => Observable<T>;
  ami?: () => Observable<T>;
  state?: () => Observable<T>;
};

@Injectable()
export class BrandService<T> {
  private currentBrand: string | undefined;
  private executionMap: BrandExecutionMap<T> = {};

  withBrand(brand: string) {
    this.currentBrand = brand.toUpperCase();
    return this;
  }

  nrma(executor: () => Observable<T>) {
    this.executionMap.nrma = executor;
    return this;
  }

  ami(executor: () => Observable<T>) {
    this.executionMap.ami = executor;
    return this;
  }

  state(executor: () => Observable<T>) {
    this.executionMap.state = executor;
    return this;
  }

  toResponseOrBrandNotSupportedError(): Observable<T> {
    switch (this.currentBrand) {
      case 'NRMA':
        if (this.executionMap.nrma) {
          return this.executionMap.nrma();
        }
        break;
      case 'AMI':
        if (this.executionMap.ami) {
          return this.executionMap.ami();
        }
        break;
      case 'STATE':
        if (this.executionMap.state) {
          return this.executionMap.state();
        }
        break;
    }
    return throwError(() => new BrandNotSupportedError(this.currentBrand || 'Unknown'));
  }
}
