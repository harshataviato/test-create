import { Injectable } from '@nestjs/common';
import { map, Observable, of, mergeMap } from 'rxjs';
import { HelloWorldContext } from '../HelloWorldContext';
import { HelloWorldFeatureFlag } from '../HelloWorldFeatureFlag';
import { addHelloWorldComponent } from './components/builders/AddHelloWorldComponent';
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
      mergeMap(context => this.featureFlag.execute(context)),
      checkIfFeatureIsEnabledOrThrowFeatureIsDisabledError((context: HelloWorldContext) => context.featureFlag!),
      mergeMap(context => this.sampleDownstreamIntegration.execute(context)), // Example downstream call
      map(this.initializeResponse()),
      map(addHelloWorldComponent()),
    );
  }

  private initializeResponse() {
    return (context: HelloWorldContext): HelloWorldContext => ({
      ...context,
      response: {},
    });
  }
}
