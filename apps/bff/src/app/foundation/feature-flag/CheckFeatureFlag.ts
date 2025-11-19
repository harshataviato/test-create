import { Observable, throwError, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { FeatureFlag } from './FeatureFlag';
import { InternalServerErrorException } from '@nestjs/common';

export function checkIfFeatureIsEnabledOrThrowFeatureIsDisabledError<TContext extends { featureFlag?: FeatureFlag }>(
  featureFlagSelector: (context: TContext) => FeatureFlag,
) {
  return (source: Observable<TContext>): Observable<TContext> =>
    source.pipe(
      mergeMap((context: TContext) => {
        const featureFlag = featureFlagSelector(context);
        if (featureFlag.isEnabled) {
          return of(context);
        }
        return throwError(() => new InternalServerErrorException('Feature is disabled'));
      }),
    );
}

export function loadFeatureFlag<TContext>(
  featureFlagExecutor: (context: TContext) => Observable<TContext>,
) {
  return (source: Observable<TContext>): Observable<TContext> =>
    source.pipe(
      mergeMap((context: TContext) => featureFlagExecutor(context)),
    );
}
