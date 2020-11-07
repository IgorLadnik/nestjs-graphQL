import { Module, Logger } from '@nestjs/common';
import { ConfigModule } from 'config-lib';
import { AuthModule } from 'auth-lib';
import { LoginModule, LoginController } from 'login-lib';
import { ModulesHolder } from 'module-loader-lib';
import { isGqlFromWeb } from '../../common/utils';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule,
    AuthModule,
    LoginModule,
    isGqlFromWeb
      ? ModulesHolder.getGqlModule()
      : require('../gql.module').GqlModule,
  ],
  controllers: [AppController, LoginController],
  providers: [Logger],
})
export class AppModule {}
