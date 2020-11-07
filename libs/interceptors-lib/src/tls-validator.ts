import { ExecutionContext } from '@nestjs/common';
import { BaseExecutionContextValidator } from "./base-execution-context-validator";

export class TlsValidator extends BaseExecutionContextValidator {
  validate(context: ExecutionContext): boolean {
    if (!super.validate(context))
      return false;

    const isOK = this.get('req')?.client.ssl;
    if (!isOK)
      this.onError();

    return isOK;
  }
}

