import { ExecutionContext } from '@nestjs/common';

export interface IValidator {
  validate(context: ExecutionContext): boolean;
  onError(): void;
}
