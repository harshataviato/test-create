import { Injectable } from '@nestjs/common';
import { map, Observable, of, mergeMap } from 'rxjs';
import { HelloWorldContext } from '../HelloWorldContext';
import { HelloWorldFeatureFlag } from '../HelloWorldFeatureFlag';
import { addSampleComponent } from './components/AddSampleComponent';
import { checkIfFeatureIsEnabledOrThrowFeatureIsDisabledError, loadFeatureFlag } from '../../../foundation/feature-flag/CheckFeatureFlag';
import { SampleDownstreamIntegration } from './downstreams/SampleDownstreamIntegration';

@Injectable()
export class HelloWorldForNRMAUseCase {
  constructor(
    private readonly featureFlag: HelloWorldFeatureFlag,
    private readonly sampleDownstreamIntegration: SampleDownstreamIntegration,
  ) {}

  execute(featureContext: HelloWorldContext): Observable<HelloWorldContext> {
    return of(featureContext).pipe(
      mergeMap(loadFeatureFlag((context: HelloWorldContext) => this.featureFlag.execute(context))),
      checkIfFeatureIsEnabledOrThrowFeatureIsDisabledError((context: HelloWorldContext) => context.featureFlag!),
      mergeMap((context) => this.sampleDownstreamIntegration.execute(context)), // Simulate downstream call
      map(this.initializeResponse()),
      map(addSampleComponent()),
    );
  }

  private initializeResponse() {
    return (context: HelloWorldContext): HelloWorldContext => ({
      ...context,
      response: {
        message: 'Hello world!',
      },
    });
  }
}
