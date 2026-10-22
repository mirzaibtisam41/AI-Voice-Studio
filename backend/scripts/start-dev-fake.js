import '#src/bootstrap/load-env.bootstrap.js';
import { buildApp } from '#src/bootstrap/build-app.bootstrap.js';
import { VoiceModel } from '#src/database/models.js';
import { startJobs } from '#src/bootstrap/start-jobs.bootstrap.js';
import { seedDatabase } from './seed.js';
import { createDevFakeAi, createDevMemoryStorage } from './dev-fakes.js';

const DEV_DEFAULTS = {
  NODE_ENV: 'development',
  PORT: '8000',
  MONGODB_URI:
    'mongodb://127.0.0.1:27018/ai_voice_studio_dev?replicaSet=rs0&directConnection=true',
  JWT_ACCESS_SECRET: 'development-only-secret-that-is-long-enough',
  STORAGE_R2_ACCOUNT_ID: 'dev',
  STORAGE_R2_ACCESS_KEY_ID: 'dev',
  STORAGE_R2_SECRET_ACCESS_KEY: 'dev',
  STORAGE_R2_BUCKET: 'dev',
  OPENAI_API_KEY: 'dev',
};

for (const [name, value] of Object.entries(DEV_DEFAULTS)) {
  process.env[name] ||= value;
}

const port = Number(process.env.PORT);
const storage = createDevMemoryStorage({ baseUrl: `http://localhost:${port}` });
const fastify = buildApp({ storage, ai: createDevFakeAi() });

fastify.get(
  '/dev-storage/*',
  { config: { helmet: { skipRoute: true } } },
  async (request, reply) => {
    const file = storage.files.get(request.params['*']);

    if (!file) return reply.code(404).send();

    if (request.query.download) {
      reply.header(
        'content-disposition',
        `attachment; filename="${String(request.query.download).replaceAll('"', '')}"`,
      );
    }

    reply.header('cross-origin-resource-policy', 'cross-origin');

    return reply.type(file.contentType).send(file.body);
  },
);

await fastify.ready();
await seedDatabase();
await VoiceModel.updateMany({}, { previewStorageKey: null });
await fastify.listen({ port, host: '0.0.0.0' });
startJobs({ fastify });

fastify.log.warn(
  'Running with fake OpenAI and in-memory storage. Files disappear on restart.',
);
