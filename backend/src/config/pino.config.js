import { ENVIRONMENT } from '#src/constants/index.js';

const REDACTED_PATHS = [
  '*.authorization',
  '*.cookie',
  '*.headers.authorization',
  '*.headers.cookie',
  '*.headers["set-cookie"]',
  '*.password',
  '*.newPassword',
  '*.currentPassword',
  '*.token',
  '*.accessToken',
  '*.refreshToken',
  '*.apiKey',
];

export function buildPinoConfig({ appConfig }) {
  const config = {
    level: appConfig.LOG_LEVEL,
    redact: { paths: REDACTED_PATHS, censor: '[REDACTED]' },
  };

  if (appConfig.NODE_ENV !== ENVIRONMENT.PRODUCTION) {
    config.transport = {
      target: 'pino-pretty',
      options: {
        translateTime: 'SYS:standard',
        colorize: true,
        ignore: 'pid,hostname',
      },
    };
  }

  return config;
}
