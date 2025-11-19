import { Module, Global } from '@nestjs/common';
import { GetBooleanFeatureFlagUseCase } from './feature-flag/GetBooleanFeatureFlagUseCase';
import { FeatureFlagsService } from '@iag-ct/simple-feature-flags';
import { BrandService } from './request-context/BrandService';

@Global()
@Module({
  providers: [
    GetBooleanFeatureFlagUseCase,
    FeatureFlagsService,
    BrandService,
  ],
  exports: [
    GetBooleanFeatureFlagUseCase,
    FeatureFlagsService,
    BrandService,
  ],
})
export class FoundationModule {}
