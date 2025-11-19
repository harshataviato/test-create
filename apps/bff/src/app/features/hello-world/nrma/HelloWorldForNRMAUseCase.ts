import { Injectable } from '@nestjs/common';
import { map, Observable, of, mergeMap } from 'rxjs';
import { HelloWorldContext } from '../HelloWorldContext';
import { HelloWorldFeatureFlag } from '../HelloWorldFeatureFlag';
import { checkIfFeatureIsEnabledOrThrowFeatureIsDisabledError } from '../../../foundation/feature-flag/CheckFeatureFlag';
import { loadFeatureFlag } from '../../../foundation/feature-flag/LoadFeatureFlag';

@Injectable()
export class HelloWorldForNRMAUseCase {
  constructor(
    private readonly featureFlag: HelloWorldFeatureFlag,
  ) {}

  execute(featureContext: HelloWorldContext): Observable<HelloWorldContext> {
    return of(featureContext).pipe(
      mergeMap(loadFeatureFlag((context: HelloWorldContext) => this.featureFlag.execute(context))),
      checkIfFeatureIsEnabledOrThrowFeatureIsDisabledError((context: HelloWorldContext) => context.featureFlag!),
      map(this.generateHelloWorldResponse()),
    );
  }

  private generateHelloWorldResponse() {
    return (context: HelloWorldContext): HelloWorldContext => ({
      ...context,
      response: {
        message: 'Hello world!',
      },
    });
  }
}
