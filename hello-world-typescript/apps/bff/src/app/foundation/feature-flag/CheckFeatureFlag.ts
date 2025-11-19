import { FeatureFlag } from './FeatureFlag';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Observable, pipe } from 'rxjs';
import { tap } from 'rxjs/operators';

export const checkIfFeatureIsEnabledOrThrowFeatureIsDisabledError =
  <TContext extends { featureFlag?: FeatureFlag }>(getFeatureFlag: (context: TContext) => FeatureFlag) =>
  (source: Observable<TContext>): Observable<TContext> =>
    source.pipe(
      tap((context: TContext) => {
        const featureFlag = getFeatureFlag(context);
        if (!featureFlag.isEnabled) {
          throw new HttpException('Feature is disabled', HttpStatus.INTERNAL_SERVER_ERROR);
        }
      }),
    );

export const loadFeatureFlag =
  <TContext extends { featureFlag?: FeatureFlag }>(getFeatureFlagObservable: (context: TContext) => Observable<TContext>) =>
  (source: Observable<TContext>): Observable<TContext> =>
    pipe(
      (observable: Observable<TContext>) => observable.pipe(
        tap((context: TContext) => {
          return getFeatureFlagObservable(context);
        })
      )
    )(source);

