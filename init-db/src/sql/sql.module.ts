import { Module } from '@nestjs/common';
import { SqlService } from './sql.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from 'config-lib';
import { SqlConfig } from 'sql-base-lib';

@Module({
  imports: [ConfigModule, TypeOrmModule.forRoot(SqlConfig.getTypeOrmConfig())],
  providers: [SqlService],
  exports: [SqlService],
})
export class SqlModule {}
