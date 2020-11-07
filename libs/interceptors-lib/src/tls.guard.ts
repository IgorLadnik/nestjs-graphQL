import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from "config-lib";
import { TlsValidator } from "./tls-validator";

@Injectable()
export class TlsGuard implements CanActivate {
  private readonly tlsValidator: TlsValidator;

  constructor() {
    if (new ConfigService().getBool('IS_TLS_ON'))
      this.tlsValidator = new TlsValidator();
  }

  canActivate = (context: ExecutionContext): boolean =>
    this.tlsValidator ? this.tlsValidator.validate(context) : true;
}
