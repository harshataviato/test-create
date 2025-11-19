import { Injectable } from '@nestjs/common';
import { Observable, of } from 'rxjs';

// Mock LaunchDarkly context for demonstration
export type LaunchDarklyContext = {
  key: string;
  kind: 'user';
};

// This is a mock implementation for demonstration purposes.
// In a real application, this would integrate with a feature flag service like LaunchDarkly.
export class FeatureFlagsService {
  isFeatureEnabled(flagKey: string, defaultValue: boolean, context: LaunchDarklyContext): Promise<boolean> {
    console.warn(`[MOCK] FeatureFlagsService: isFeatureEnabled called for ${flagKey}. Returning ${defaultValue}.`);
    return Promise.resolve(defaultValue);
  }
  beforeApplicationShutdown(): Promise<void> {
    return Promise.resolve();
  }
}

@Injectable()
export class GetBooleanFeatureFlagUseCase {
  constructor(private readonly featureFlagsService: FeatureFlagsService) {}

  execute(flagKey: string, defaultValue: boolean, launchDarklyContext: LaunchDarklyContext): Observable<boolean> {
    return of(true); // For simplicity, always return true for hello world, or use `of(this.featureFlagsService.isFeatureEnabled(flagKey, defaultValue, launchDarklyContext))`
  }
}
