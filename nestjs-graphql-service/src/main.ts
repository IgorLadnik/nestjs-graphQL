import { NestFactory } from '@nestjs/core';
import { ModuleLoader, ModulesHolder } from 'module-loader-lib';
import { isGqlFromWeb, isAuthOn, isTlsOn } from './common/utils';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { logger } from 'logger-lib';
import * as fs from 'fs';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as https from 'https';
import { ConfigService } from 'config-lib';
const express = require('express');

function printToConsole(port: number, securePort: number) {
  const red     = '\x1b[31m';
  const green   = '\x1b[32m';
  const blue    = '\x1b[34m';
  const magenta = '\x1b[35m';
  const reset   = '\x1b[0m';

  console.log();

  if (port && port > 0)
    console.log(`http  on port ${green}${port}${reset}`);

  if (securePort && securePort > 0)
    console.log(`https on port ${red}${securePort}${reset}`);
}

(async function bootstrap() {
  logger.log('===========================================================');
  logger.log('Main Service started');
  logger.log('Main settings:');
  logger.log(`isAuthOn = ${isAuthOn}`);
  logger.log(`isTlsOn = ${isTlsOn}`);
  logger.log(`GQLModule from Web = ${isGqlFromWeb}`);
  logger.log('-----------------------------------------------------------');

  const configService = new ConfigService();

  const moduleLoader = new ModuleLoader('dist/modules');

  if (isGqlFromWeb)
    ModulesHolder.setGqlModule(await moduleLoader.loadModuleFromWeb('gql.module'));

  const server = express();

  const app = await NestFactory.create(
    moduleLoader.loadModule('app/app.module').AppModule,
      new ExpressAdapter(server),
    { logger, cors: true });

  await app.startAllMicroservicesAsync();

  // OpenAPI (Swagger)
  const options = new DocumentBuilder()
    .setTitle('Persons example')
    .setDescription('Persons API description')
    .setVersion('1.0')
    .addTag('Persons')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);

  const port = configService.getInt('PORT');
  if (port && port > 0)
    await app.listen(port);

  const securePort = configService.getInt('SECURE_PORT');
  if (securePort && securePort > 0) {
    const httpsOptions = {
      key: fs.readFileSync('./cert/private-key.pem'),
      cert: fs.readFileSync('./cert/public-cert.pem'),
    };
    await https.createServer(httpsOptions, server).listen(securePort);
  }

  setTimeout(() => printToConsole(port, securePort), 100);
})();
