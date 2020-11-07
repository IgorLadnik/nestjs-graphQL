import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from 'config-lib';
import { ExecutionContext } from "@nestjs/common/interfaces/features/execution-context.interface";
import { Observable } from "rxjs";

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    isAuthOn: boolean;

    constructor() {
      super();
      this.isAuthOn = new ConfigService().getBool('IS_AUTH_ON');
    }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
      return this.isAuthOn ? super.canActivate(context) : true;
    }
}
