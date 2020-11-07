import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { IValidator } from "./validator-interface";

@Injectable()
export class ExecutionContextValidationInterceptor implements NestInterceptor {
  constructor(private readonly validator: IValidator) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (this.validator.validate(context))
      return next.handle();

    this.validator.onError();
    return new Observable();
  }
}
