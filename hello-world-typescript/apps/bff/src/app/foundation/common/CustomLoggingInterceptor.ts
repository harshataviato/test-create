import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { RequestContext } from '../request-context/RequestContext';

@Injectable()
export class CustomLoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const requestContext = context.switchToHttp().getRequest().requestContext as RequestContext<any>;
    const { correlationId, traceId, brand } = requestContext;
    const { method, url } = context.switchToHttp().getRequest();

    console.log(`[${correlationId}] [${traceId}] [${brand?.toString() || 'N/A'}] ${method} ${url} - Request started`);

    const now = Date.now();
    return next.handle().pipe(
      tap(() => {
        console.log(`[${correlationId}] [${traceId}] [${brand?.toString() || 'N/A'}] ${method} ${url} - Request ended in ${Date.now() - now}ms`);
      }),
    );
  }
}
