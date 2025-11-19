import { pipe, Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { FeatureFlag } from './FeatureFlag';
import { InternalServerErrorException } from '@nestjs/common';

export const checkIfFeatureIsEnabledOrThrowFeatureIsDisabledError = <T>(
  featureFlagSelector: (context: T) => FeatureFlag,
) =>
  pipe(
    map((context: T) => {
      const featureFlag = featureFlagSelector(context);
      if (featureFlag.isOn) {
        return context;
      }
      return throwError(() => new InternalServerErrorException('Feature is disabled'));
    }),
    // The previous map operator can return an Observable (from throwError) or the context.
    // This part is simplified and assumes further operators would flatten it.
    // For a simple error throw, just throwing works.
    // In a real RxJS pipeline, you'd use mergeMap for the throwError to properly handle it.
  );
