import { NestFactory } from '@nestjs/core';
import { SqlModule } from './sql.module';

async function bootstrap() {
  const app = await NestFactory.create(SqlModule);
}
bootstrap();
