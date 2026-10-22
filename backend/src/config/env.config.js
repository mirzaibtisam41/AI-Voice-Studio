import envSchema from 'env-schema';
import { ENVIRONMENT, ENVIRONMENTS } from '#src/constants/index.js';

const envSchemaConfig = {
  type: 'object',
  required: [
    'NODE_ENV',
    'PORT',
    'MONGODB_URI',
    'JWT_ACCESS_SECRET',
    'STORAGE_R2_ACCOUNT_ID',
    'STORAGE_R2_ACCESS_KEY_ID',
    'STORAGE_R2_SECRET_ACCESS_KEY',
    'STORAGE_R2_BUCKET',
    'OPENAI_API_KEY',
  ],
  properties: {
    NODE_ENV: {
      type: 'string',
      enum: ENVIRONMENTS,
      default: ENVIRONMENT.DEVELOPMENT,
    },
    LOG_LEVEL: {
      type: 'string',
      enum: ['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'],
      default: 'info',
    },
    PORT: { type: 'number', minimum: 1, maximum: 65535, default: 8000 },
    CORS_ORIGIN: { type: 'string', default: 'http://localhost:3000' },
    MONGODB_URI: { type: 'string', minLength: 1 },
    JWT_ACCESS_SECRET: { type: 'string', minLength: 32 },
    STORAGE_R2_ACCOUNT_ID: { type: 'string', minLength: 1 },
    STORAGE_R2_ACCESS_KEY_ID: { type: 'string', minLength: 1 },
    STORAGE_R2_SECRET_ACCESS_KEY: { type: 'string', minLength: 1 },
    STORAGE_R2_BUCKET: { type: 'string', minLength: 1 },
    OPENAI_API_KEY: { type: 'string', minLength: 1 },
    BREVO_API_KEY: { type: 'string', default: '' },
    MAIL_FROM_EMAIL: { type: 'string', default: '' },
    APP_URL: { type: 'string', default: 'http://localhost:3000' },
    COOKIE_SAME_SITE: {
      type: 'string',
      enum: ['lax', 'strict', 'none'],
      default: 'lax',
    },
  },
};

export function buildAppConfig() {
  return envSchema({ schema: envSchemaConfig });
}
