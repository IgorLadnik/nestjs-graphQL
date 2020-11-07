import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from 'config-lib';
import path from 'path';
import * as fs from 'fs';

export class SqlConfig {
  static getTypeOrmConfig(): TypeOrmModuleOptions {
    let modulesDir: string;
    let projectDir: string;

    let shouldReturnDir = false;
    if (fs.existsSync('.env')) {
      projectDir = process.cwd();
      modulesDir = path.join(projectDir, 'dist/modules');
    }
    else {
      modulesDir = process.cwd();
      projectDir = path.join(modulesDir, '../../');

      process.chdir(projectDir);
      shouldReturnDir = true;
    }

    const configService = new ConfigService();

    const retObj: TypeOrmModuleOptions = {
      type: 'mssql',
      host: configService.get('SQL_SERVER_HOST'),
      database: configService.get('SQL_SERVER_DATABASE'),
      entities: configService.getStringArray('SQL_SERVER_ENTITIES'),
      synchronize: true,
      autoLoadEntities: true,
      options: {
        enableArithAbort: true
      },
      username: configService.get('SQL_SERVER_USER'),
      password: configService.get('SQL_SERVER_PASSWORD')
    }

    if (shouldReturnDir)
      process.chdir(modulesDir);

    return retObj;
  }
}
