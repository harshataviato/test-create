import { Global, Module } from '@nestjs/common';
import { RequestContextMiddleware } from './request-context/RequestContextMiddleware';
import { FeatureFlagsService, GetBooleanFeatureFlagUseCase } from './feature-flag/GetBooleanFeatureFlagUseCase';
import { CustomLoggingInterceptor } from './common/CustomLoggingInterceptor';
import { SecurityModule } from './SecurityModule';

@Global()
@Module({
  imports: [SecurityModule],
  providers: [
    RequestContextMiddleware,
    GetBooleanFeatureFlagUseCase,
    FeatureFlagsService,
    CustomLoggingInterceptor
  ],
  exports: [
    GetBooleanFeatureFlagUseCase,
    FeatureFlagsService,
    CustomLoggingInterceptor,
    SecurityModule
  ],
})
export class FoundationModule {}
