import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from 'config-lib';
import { SqlConfig } from './sql-config';
import { SqlTransaction } from "./sql-transaction";

@Module({
  imports: [ConfigModule, TypeOrmModule.forRoot(SqlConfig.getTypeOrmConfig())],
  providers: [SqlConfig, SqlTransaction],
  exports: [SqlConfig, SqlTransaction]
})
export class SqlBaseModule {}
