import { NotFoundException } from '@nestjs/common';

export class BrandNotSupportedError extends NotFoundException {
  constructor(brand: string) {
    super(`Brand '${brand}' is not supported for this endpoint.`);
  }
}
