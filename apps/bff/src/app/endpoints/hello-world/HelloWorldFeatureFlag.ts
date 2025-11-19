import { Injectable } from '@nestjs/common';
import { GetBooleanFeatureFlagUseCase } from '../../foundation/feature-flag/GetBooleanFeatureFlagUseCase';
import { map, Observable } from 'rxjs';
import { off, on } from '../../foundation/feature-flag/FeatureFlag';
import { HelloWorldContext } from './HelloWorldContext';

@Injectable()
export class HelloWorldFeatureFlag {
  constructor(private readonly getBooleanFeatureFlagUseCase: GetBooleanFeatureFlagUseCase) {}

  execute(context: HelloWorldContext): Observable<HelloWorldContext> {
    return this.getBooleanFeatureFlagUseCase
      .execute(
        'hello-world-feature-enabled',
        false,
        context.requestContext.launchDarklyContext,
      )
      .pipe(
        map((isEnabled: boolean): HelloWorldContext => ({
          ...context,
          featureFlag: isEnabled ? on() : off(),
        })),
      );
  }
}
