import { Injectable } from '@nestjs/common';
import { FeatureFlagsService } from '@iag-ct/simple-feature-flags';
import { from, Observable } from 'rxjs';

@Injectable()
export class GetBooleanFeatureFlagUseCase {
  constructor(private readonly featureFlagsService: FeatureFlagsService) {}

  execute(
    flagKey: string,
    defaultValue: boolean,
    launchDarklyContext?: Record<string, unknown>,
  ): Observable<boolean> {
    return from(this.featureFlagsService.isFeatureEnabled(flagKey, defaultValue, launchDarklyContext));
  }
}
