import { Injectable } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { HelloWorldContext } from '../../HelloWorldContext';

@Injectable()
export class SampleDownstreamIntegration {
  execute(featureContext: HelloWorldContext): Observable<HelloWorldContext> {
    // Simulate a downstream call
    return of(featureContext);
  }
}
