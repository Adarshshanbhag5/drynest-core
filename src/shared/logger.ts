import { createLogger, transports, format } from 'winston';
import { WinstonModule } from 'nest-winston';

// Custom colorizing
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6,
};

export const winstonConfig = {
  levels,
  level: 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.json(),
  ),
  transports: [
    new transports.Console({
      handleExceptions: true,
      format: format.json(),
    }),
  ],
  exitOnError: false,
};

export function getLogger() {
  const loggerInstance = createLogger(winstonConfig);
  const logger = WinstonModule.createLogger({
    instance: loggerInstance,
  });
  return logger;
}
