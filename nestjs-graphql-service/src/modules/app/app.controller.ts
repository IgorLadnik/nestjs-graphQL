import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
  Param, UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from 'auth-lib';
import { ApiBearerAuth } from '@nestjs/swagger';
import {
  BaseExecutionContextValidator,
  DurationInterceptor,
  ExecutionContextValidationInterceptor,
  TlsGuard,
} from 'interceptors-lib';

//@ApiBearerAuth()
@Controller()
export class AppController {
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TlsGuard)
  @UseInterceptors(DurationInterceptor,
    new ExecutionContextValidationInterceptor(new BaseExecutionContextValidator()))
  @Get('/numEcho/:n')
  numEcho(@Req() req, @Param('n') n: number) {
    return n;
  }
}

