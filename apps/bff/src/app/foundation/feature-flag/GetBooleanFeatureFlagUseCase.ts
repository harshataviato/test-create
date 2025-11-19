import { Injectable } from '@nestjs/common';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { FeatureFlagsService } from '@iag-ct/simple-feature-flags';

@Injectable()
export class GetBooleanFeatureFlagUseCase {
  constructor(private readonly featureFlagsService: FeatureFlagsService) {}

  execute(
    flagKey: string,
    defaultValue: boolean,
    launchDarklyContext: any,
  ): Observable<boolean> {
    return from(this.featureFlagsService.isFeatureEnabled(flagKey, defaultValue, launchDarklyContext)).pipe(
      map((isEnabled) => isEnabled),
    );
  }
}
