import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SqlService } from './sql.service';
import { ConfigModule } from 'config-lib';
import { SqlConfig } from 'sql-base-lib';

@Module({
  imports: [ConfigModule, TypeOrmModule.forRoot(SqlConfig.getTypeOrmConfig())],
  providers: [SqlService],
  exports: [SqlService],
})
export class SqlModule {}
