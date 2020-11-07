import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LogDurationInterceptor implements NestInterceptor {
  constructor(private readonly logger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const funcName = context.getHandler().name;
    this.logger.log(`### Before ${funcName} ...`);
    const before = Date.now();
    return next.handle().pipe(
        tap(() => this.logger.log(`### After ${funcName} ${Date.now() - before} ms`)));
  }
}
