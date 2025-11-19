import { Controller, Get, Param } from '@nestjs/common';
import { Observable } from 'rxjs';
import { GetRequestContext } from '../../foundation/request-context/RequestContextDecorator';
import { RequestContext } from '../../foundation/request-context/RequestContext';
import { HelloWorldContext, HelloWorldRequest, HelloWorldResponse } from './HelloWorldContext';
import { HelloWorldForNRMAUseCase } from './nrma/HelloWorldForNRMAUseCase';

@Controller('hello')
export class HelloWorldController {
  constructor(
    private readonly nrmaUseCase: HelloWorldForNRMAUseCase,
  ) {}

  @Get('/')
  getHelloWorld(
    @GetRequestContext() requestContext: RequestContext<HelloWorldContext>,
    @Param() params: HelloWorldRequest['params'],
  ): Observable<HelloWorldResponse> {
    const featureContext = this.buildFeatureContext(requestContext, params);
    return featureContext.requestContext.brand!
      .nrma(() => this.nrmaUseCase.execute(featureContext))
      .toResponseOrBrandNotSupportedError();
  }

  private buildFeatureContext(
    requestContext: RequestContext<HelloWorldContext>,
    params: HelloWorldRequest['params'],
  ): HelloWorldContext {
    return {
      requestContext,
      request: { params },
    };
  }
}
