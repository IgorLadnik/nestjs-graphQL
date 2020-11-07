import { ExecutionContext } from '@nestjs/common';
import { IValidator } from './validator-interface';
import { logger } from 'logger-lib';

export class BaseExecutionContextValidator implements IValidator {
  protected context: ExecutionContext;

  validate(context: ExecutionContext): boolean {
    this.context = context;
    return true;
  }

  onError(): void {
    const queryName = this.get('fieldName');
    const insertion = queryName && queryName.length > 0 ? `for \'${queryName}\' ` : '';
    const errMessage = `Request ${insertion}was rejected by execution context validator`;
    logger.error(errMessage);
    this.get('req').res.status(403).send(JSON.stringify({ error: errMessage }, null, 2));
  }

  protected get(pattern: string) {
    for (let arg of this.context.getArgs()) {
      if (arg === undefined)
        continue;

      const result = arg?.[pattern];
      if (result)
        return result;
    }

    return undefined;
  }
}
