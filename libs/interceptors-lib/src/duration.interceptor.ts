import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { logger } from 'logger-lib';

@Injectable()
export class DurationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const funcName = context.getHandler().name;
    logger.log(`*** Before ${funcName} ...`);
    const before = Date.now();
    return next
      .handle()
      .pipe(
        tap(() =>
          logger.log(`*** After ${funcName} ${Date.now() - before} ms`),
        ),
      );
  }
}
