import { Injectable } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { HelloWorldContext } from '../../HelloWorldContext';

@Injectable()
export class SampleDownstreamIntegration {
  execute(featureContext: HelloWorldContext): Observable<HelloWorldContext> {
    // This is a placeholder for actual downstream service calls (e.g., BAPI, Harmony, CSG)
    // For "Hello World", it simply passes the context through.
    console.log(`[NRMA] SampleDownstreamIntegration executed for: ${featureContext.requestContext.correlationId}`);
    return of(featureContext);
  }
}
