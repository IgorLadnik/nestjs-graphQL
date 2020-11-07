import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { SqlConfig } from "sql-base-lib";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "config-lib";

@Module({
  imports: [ConfigModule, TypeOrmModule.forRoot(SqlConfig.getTypeOrmConfig())],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

