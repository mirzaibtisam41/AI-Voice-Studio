import { randomInt, randomUUID } from 'node:crypto';
import mongoose from 'mongoose';
import { buildApp } from '#src/bootstrap/index.js';
import { REFRESH_COOKIE_NAME } from '#src/config/index.js';
import { AI_CAPABILITY } from '#src/constants/index.js';
import {
  checkUserIsAdminHook,
  checkUserIsLoggedInHook,
} from '#src/hooks/index.js';
import {
  AiModelModel,
  AiProviderModel,
  UserModel,
  VoiceModel,
} from '#src/database/models.js';
import { createMemoryStorage } from './memory-storage.js';
import { createFakeAi } from './fake-ai.js';
import { createFakeAudio } from './fake-audio.js';
import { createFakeMailer } from './fake-mailer.js';

export const TEST_PASSWORD = 'secret123';

export const TEST_MONGODB_URI =
  process.env.TEST_MONGODB_URI ??
  'mongodb://127.0.0.1:27018/ai_voice_studio_test?replicaSet=rs0&directConnection=true';

const TEST_ENV = {
  NODE_ENV: 'test',
  LOG_LEVEL: 'silent',
  PORT: '8001',
  MONGODB_URI: TEST_MONGODB_URI,
  JWT_ACCESS_SECRET: 'test-secret-that-is-long-enough-for-jwt-signing',
  STORAGE_R2_ACCOUNT_ID: 'test',
  STORAGE_R2_ACCESS_KEY_ID: 'test',
  STORAGE_R2_SECRET_ACCESS_KEY: 'test',
  STORAGE_R2_BUCKET: 'test',
  OPENAI_API_KEY: 'test',
  BREVO_API_KEY: '',
};

function randomIpAddress() {
  return `10.${randomInt(256)}.${randomInt(256)}.${randomInt(1, 255)}`;
}

function readRefreshCookie(response) {
  const setCookie = [response.headers['set-cookie'] ?? []].flat().join(';');

  return setCookie.match(new RegExp(`${REFRESH_COOKIE_NAME}=([^;]*)`))?.[1];
}

export async function buildTestApp({ env = {}, audioDurationSeconds } = {}) {
  Object.assign(process.env, TEST_ENV, env);

  const storage = createMemoryStorage();
  const ai = createFakeAi();
  const audio = createFakeAudio({ durationSeconds: audioDurationSeconds });
  const mailer = createFakeMailer();
  const app = buildApp({ storage, ai, audio, mailer });

  app.register(
    async (adminRoutes) => {
      adminRoutes.addHook('onRequest', checkUserIsLoggedInHook);
      adminRoutes.addHook('onRequest', checkUserIsAdminHook);
      adminRoutes.get('/ping', async () => ({ ok: true }));
    },
    { prefix: '/api/test-admin' },
  );

  await app.ready();
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.syncIndexes();

  async function sendRequest({
    method,
    url,
    payload,
    accessToken,
    refreshToken,
    headers = {},
  }) {
    const response = await app.inject({
      method,
      url,
      payload,
      remoteAddress: randomIpAddress(),
      headers: {
        ...(accessToken ? { authorization: `Bearer ${accessToken}` } : {}),
        ...(refreshToken
          ? { cookie: `${REFRESH_COOKIE_NAME}=${refreshToken}` }
          : {}),
        ...headers,
      },
    });

    let body;

    try {
      body = response.json();
    } catch {
      body = response.body;
    }

    return {
      statusCode: response.statusCode,
      body,
      headers: response.headers,
      refreshCookie: readRefreshCookie(response),
    };
  }

  function makeEmail() {
    return `test-${randomUUID()}@example.com`;
  }

  async function registerUser({
    email = makeEmail(),
    name = 'Test User',
  } = {}) {
    await sendRequest({
      method: 'POST',
      url: '/api/auth/register',
      payload: { name, email, password: TEST_PASSWORD },
    });

    return email;
  }

  async function loginUser({ email }) {
    const response = await sendRequest({
      method: 'POST',
      url: '/api/auth/login',
      payload: { email, password: TEST_PASSWORD },
    });

    return {
      accessToken: response.body.data?.accessToken,
      refreshToken: response.refreshCookie,
      user: response.body.data?.user,
    };
  }

  async function registerAndLogin() {
    const email = await registerUser();

    return { email, ...(await loginUser({ email })) };
  }

  async function registerAndLoginAsAdmin() {
    const email = await registerUser();
    await UserModel.updateOne({ email }, { role: 'admin' });

    return { email, ...(await loginUser({ email })) };
  }

  async function seedCatalog() {
    const provider = await AiProviderModel.create({
      name: 'OpenAI',
      code: 'openai',
    });

    const realtimeModel = await AiModelModel.create({
      providerId: provider._id,
      name: 'GPT Realtime Mini',
      slug: 'gpt-realtime-mini',
      providerModelId: 'gpt-realtime-2.1-mini',
      status: 'active',
      capabilities: [
        {
          code: AI_CAPABILITY.TEXT_TO_SPEECH,
          enabled: true,
          creditsPerUnit: 1,
          isDefault: true,
        },
        {
          code: AI_CAPABILITY.REALTIME,
          enabled: true,
          creditsPerUnit: 3,
          isDefault: true,
        },
        {
          code: AI_CAPABILITY.VOICE_AGENT,
          enabled: true,
          creditsPerUnit: 3,
          isDefault: true,
        },
      ],
    });

    const transcribeModel = await AiModelModel.create({
      providerId: provider._id,
      name: 'GPT Transcribe',
      slug: 'gpt-transcribe',
      providerModelId: 'gpt-transcribe',
      status: 'active',
      capabilities: [
        {
          code: AI_CAPABILITY.SPEECH_TO_TEXT,
          enabled: true,
          creditsPerUnit: 1,
          isDefault: true,
        },
      ],
    });

    const chatModel = await AiModelModel.create({
      providerId: provider._id,
      name: 'GPT-5 Nano',
      slug: 'gpt-5-nano',
      providerModelId: 'gpt-5-nano',
      status: 'active',
      capabilities: [
        {
          code: AI_CAPABILITY.AGENT_CHAT,
          enabled: true,
          creditsPerUnit: 1,
          isDefault: true,
        },
      ],
    });

    const voices = await VoiceModel.create([
      {
        providerId: provider._id,
        code: 'marin',
        name: 'Marin',
        gender: 'female',
        tags: ['Warm'],
        sortOrder: 1,
      },
      {
        providerId: provider._id,
        code: 'cedar',
        name: 'Cedar',
        gender: 'male',
        tags: ['Deep'],
        sortOrder: 2,
      },
      {
        providerId: provider._id,
        code: 'alloy',
        name: 'Alloy',
        enabled: false,
        sortOrder: 3,
      },
    ]);

    return { provider, realtimeModel, transcribeModel, chatModel, voices };
  }

  async function uploadAudio({
    accessToken,
    fileName = 'clip.mp3',
    contentType = 'audio/mpeg',
    content = Buffer.from('ID3fake-audio-bytes'),
    fields = {},
  }) {
    const boundary = 'helper-boundary';
    const fieldParts = Object.entries(fields).map(([name, value]) =>
      Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`,
      ),
    );
    const response = await app.inject({
      method: 'POST',
      url: '/api/audio-files',
      payload: Buffer.concat([
        ...fieldParts,
        Buffer.from(
          `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${fileName}"\r\nContent-Type: ${contentType}\r\n\r\n`,
        ),
        content,
        Buffer.from(`\r\n--${boundary}--\r\n`),
      ]),
      headers: {
        authorization: `Bearer ${accessToken}`,
        'content-type': `multipart/form-data; boundary=${boundary}`,
      },
      remoteAddress: randomIpAddress(),
    });

    return { statusCode: response.statusCode, body: response.json() };
  }

  async function getBalance({ accessToken }) {
    const response = await sendRequest({
      method: 'GET',
      url: '/api/wallet',
      accessToken,
    });

    return response.body.data?.balance;
  }

  async function close() {
    await app.close();
  }

  return {
    app,
    storage,
    ai,
    audio,
    mailer,
    sendRequest,
    makeEmail,
    registerUser,
    loginUser,
    registerAndLogin,
    registerAndLoginAsAdmin,
    seedCatalog,
    uploadAudio,
    getBalance,
    close,
  };
}
