import { Module } from '@nestjs/common';
import { GetBooleanFeatureFlagUseCase } from './feature-flag/GetBooleanFeatureFlagUseCase';
import { FeatureFlagsService } from '@iag-ct/simple-feature-flags';

// A minimal stub for FeatureFlagsService to make the project compilable
// without the actual @iag-ct/simple-feature-flags library.
// In a real project, the actual library would be provided.
class StubFeatureFlagsService {
  isFeatureEnabled(flagKey: string, defaultValue: boolean, context: any): Promise<boolean> {
    return Promise.resolve(defaultValue);
  }
  beforeApplicationShutdown(): Promise<void> { return Promise.resolve(); }
}

@Module({
  providers: [
    GetBooleanFeatureFlagUseCase,
    {
      provide: FeatureFlagsService,
      useClass: StubFeatureFlagsService,
    },
  ],
  exports: [
    GetBooleanFeatureFlagUseCase,
    FeatureFlagsService
  ],
})
export class FoundationModule {}
