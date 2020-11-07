import * as winston from 'winston';
import { WinstonModule } from 'nest-winston';
import { ConfigService } from 'config-lib';

const maxsize = 20480;
const maxFiles = 100;

const formatConsole = winston.format.combine(
  winston.format.timestamp(),
  winston.format.colorize(),
  winston.format.printf(
    info => `${info.timestamp} [${info.level}] ${info.message}`,
  ),
);

const formatFile = winston.format.combine(
  winston.format.timestamp(),
  winston.format.printf(info => `${info.timestamp} [${info.level}] ${info.message}`),
);

const configService = new ConfigService();

export const logger = WinstonModule.createLogger({
  transports: [
    new winston.transports.Console({
      format: formatConsole,
    }),
    new winston.transports.File({
      filename: configService.get('LOG_FILE_INFO'),
      level: 'info',
      format: formatFile,
      maxsize,
      maxFiles,
    }),
    new winston.transports.File({
      filename: configService.get('LOG_FILE_ERROR'),
      level: 'error',
      format: formatFile,
      maxsize,
      maxFiles,
    }),
  ],
});
