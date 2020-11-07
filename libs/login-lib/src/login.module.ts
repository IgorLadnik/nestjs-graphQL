import { Module } from '@nestjs/common';
import { LoginController } from './login.controller';
import { AuthModule } from 'auth-lib';

@Module({
  imports: [AuthModule],
  providers: [LoginController],
  exports: [LoginController]
})
export class LoginModule {}
