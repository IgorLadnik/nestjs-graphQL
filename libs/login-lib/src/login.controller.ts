// import { Request, Response } from 'express';
import {
  // Inject,
  Controller,
  Get,
  Post,
  Req,
  Res,
  // UseInterceptors,
  UseGuards,
  // Param,
} from '@nestjs/common';
import { ConfigService } from 'config-lib';
// import { logger } from 'logger-lib';
import { AuthService, LocalAuthGuard, JwtAuthGuard } from 'auth-lib';
// import { jsonStr } from 'common-utils-lib';
// import { ApiImplicitParam } from '@nestjs/swagger/dist/decorators/api-implicit-param.decorator';
import { ApiBearerAuth, ApiExcludeEndpoint } from '@nestjs/swagger';
// const {
//   LogDurationInterceptor,
//   DurationInterceptor,
// } = require('interceptors-lib');

//@ApiBearerAuth()
@Controller()
export class LoginController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @ApiExcludeEndpoint()
  @Post('auth/login')
  async login(@Req() req) {
    return this.authService.login(req.user);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req) {
    return req.user;
  }
}
