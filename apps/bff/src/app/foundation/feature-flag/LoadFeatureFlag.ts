import { pipe, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

export const loadFeatureFlag = <T>(
  featureFlagLoader: (context: T) => Observable<T>,
) =>
  pipe(
    mergeMap((context: T) => featureFlagLoader(context)),
  );
