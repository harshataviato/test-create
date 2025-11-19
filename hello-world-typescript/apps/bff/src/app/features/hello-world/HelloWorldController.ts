import { Controller, Get, Param, Headers, Res } from '@nestjs/common';
import { Observable } from 'rxjs';
import { GetRequestContext } from '../../foundation/request-context/RequestContextDecorator';
import { RequestContext } from '../../foundation/request-context/RequestContext';
import { HelloWorldContext, HelloWorldRequest, HelloWorldResponse } from './HelloWorldContext';
import { HelloWorldForNRMAUseCase } from './nrma/HelloWorldForNRMAUseCase';
import { Response } from 'express';
import * as path from 'path';

@Controller('hello')
export class HelloWorldController {
  constructor(
    private readonly nrmaUseCase: HelloWorldForNRMAUseCase,
  ) {}

  @Get('/')
  getFeature(
    @GetRequestContext() requestContext: RequestContext<HelloWorldContext>,
    @Param() params: HelloWorldRequest['params'],
    @Headers('Accept') acceptHeader: string,
    @Res() res: Response,
  ): Observable<HelloWorldResponse> | void {
    const featureContext = this.buildFeatureContext(requestContext, params);

    const responseObservable = featureContext.requestContext.brand!
      .nrma(() => this.nrmaUseCase.execute(featureContext))
      .toResponseOrBrandNotSupportedError();

    if (acceptHeader && acceptHeader.includes('text/html')) {
      responseObservable.subscribe(
        (data) => {
          res.sendFile(path.join(__dirname, '../../views/hello-world.html'), (err) => {
            if (err) {
              res.status(500).send('Error loading HTML view');
            }
          });
        },
        (error) => {
          res.status(error.status || 500).send(error.message);
        }
      );
      return;
    } else {
      return responseObservable;
    }
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
