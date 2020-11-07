import { NestFactory } from '@nestjs/core';
import { SqlModule } from './sql/sql.module';

async function bootstrap() {
  const app = await NestFactory.create(SqlModule);
}
bootstrap();
