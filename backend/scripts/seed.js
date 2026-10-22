import { pathToFileURL } from 'node:url';
import mongoose from 'mongoose';
import '#src/bootstrap/load-env.bootstrap.js';
import { buildAppConfig } from '#src/config/index.js';
import { AI_CAPABILITY } from '#src/constants/index.js';
import {
  AiModelModel,
  AiProviderModel,
  VoiceModel,
} from '#src/database/models.js';
import { AI_MODEL_STATUS } from '#src/modules/ai-models/ai-model.constants.js';
import {
  AI_PROVIDER_CODE,
  AI_PROVIDER_STATUS,
} from '#src/modules/ai-providers/ai-provider.constants.js';
import { VOICE_GENDER } from '#src/modules/voices/voice.constants.js';
import { getPlatformSettingsService } from '#src/modules/platform-settings/shared/services/index.js';

const SEED_PROVIDER = {
  code: AI_PROVIDER_CODE.OPENAI,
  name: 'OpenAI',
  description: 'Speech, transcription, realtime and chat models',
  status: AI_PROVIDER_STATUS.ACTIVE,
};

const SEED_MODELS = [
  {
    slug: 'gpt-realtime-mini',
    name: 'GPT Realtime Mini',
    providerModelId: 'gpt-realtime-2.1-mini',
    description: 'Speech generation, live conversations and voice agents',
    status: AI_MODEL_STATUS.ACTIVE,
    capabilities: [
      {
        code: AI_CAPABILITY.TEXT_TO_SPEECH,
        creditsPerUnit: 1,
        isDefault: true,
      },
      { code: AI_CAPABILITY.REALTIME, creditsPerUnit: 3, isDefault: true },
      { code: AI_CAPABILITY.VOICE_AGENT, creditsPerUnit: 3, isDefault: true },
    ],
  },
  {
    slug: 'gpt-transcribe',
    name: 'GPT Transcribe',
    providerModelId: 'gpt-transcribe',
    description: 'Audio transcription with automatic language detection',
    status: AI_MODEL_STATUS.ACTIVE,
    capabilities: [
      {
        code: AI_CAPABILITY.SPEECH_TO_TEXT,
        creditsPerUnit: 1,
        isDefault: true,
      },
    ],
  },
  {
    slug: 'gpt-5-nano',
    name: 'GPT-5 Nano',
    providerModelId: 'gpt-5-nano',
    description: 'Agent test chat',
    status: AI_MODEL_STATUS.ACTIVE,
    capabilities: [
      { code: AI_CAPABILITY.AGENT_CHAT, creditsPerUnit: 1, isDefault: true },
    ],
  },
  {
    slug: 'gpt-4o-mini-tts',
    name: 'GPT-4o Mini TTS',
    providerModelId: 'gpt-4o-mini-tts',
    description: 'Shuts down on Jan 6, 2027',
    status: AI_MODEL_STATUS.DEPRECATED,
    capabilities: [
      {
        code: AI_CAPABILITY.TEXT_TO_SPEECH,
        creditsPerUnit: 1,
        isDefault: false,
      },
    ],
  },
  {
    slug: 'gpt-realtime',
    name: 'GPT Realtime',
    providerModelId: 'gpt-realtime-2.1',
    description: 'Higher quality realtime voice',
    status: AI_MODEL_STATUS.DISABLED,
    capabilities: [
      { code: AI_CAPABILITY.REALTIME, creditsPerUnit: 10, isDefault: false },
      { code: AI_CAPABILITY.VOICE_AGENT, creditsPerUnit: 10, isDefault: false },
    ],
  },
];

const SEED_VOICES = [
  ['marin', 'American', VOICE_GENDER.FEMALE, ['Warm', 'Narration']],
  ['cedar', 'American', VOICE_GENDER.MALE, ['Deep', 'Documentary']],
  ['coral', 'British', VOICE_GENDER.FEMALE, ['Crisp', 'Corporate']],
  ['ash', 'American', VOICE_GENDER.MALE, ['Energetic', 'Ads']],
  ['shimmer', 'American', VOICE_GENDER.FEMALE, ['Friendly', 'Explainer']],
  ['sage', 'American', VOICE_GENDER.FEMALE, ['Calm', 'Meditation']],
  ['ballad', 'British', VOICE_GENDER.MALE, ['Clear', 'E-learning']],
  ['verse', 'American', VOICE_GENDER.MALE, ['Podcast', 'Conversational']],
  ['alloy', 'American', VOICE_GENDER.NEUTRAL, ['Balanced', 'Assistant']],
  ['echo', 'American', VOICE_GENDER.MALE, ['Steady', 'Support']],
];

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

async function seedProvider() {
  const existing = await AiProviderModel.findOne({ code: SEED_PROVIDER.code });

  if (existing) return { provider: existing, created: false };

  return {
    provider: await AiProviderModel.create(SEED_PROVIDER),
    created: true,
  };
}

async function hasDefaultModel({ capability }) {
  const count = await AiModelModel.countDocuments({
    capabilities: { $elemMatch: { code: capability, isDefault: true } },
  });

  return count > 0;
}

async function buildCapabilities({ capabilities }) {
  const built = [];

  for (const capability of capabilities) {
    built.push({
      code: capability.code,
      enabled: true,
      creditsPerUnit: capability.creditsPerUnit,
      isDefault:
        capability.isDefault &&
        !(await hasDefaultModel({ capability: capability.code })),
    });
  }

  return built;
}

async function seedModel({ provider, seed }) {
  const existing = await AiModelModel.findOne({ slug: seed.slug });

  if (!existing) {
    await AiModelModel.create({
      providerId: provider._id,
      slug: seed.slug,
      name: seed.name,
      providerModelId: seed.providerModelId,
      description: seed.description,
      status: seed.status,
      capabilities: await buildCapabilities({
        capabilities: seed.capabilities,
      }),
    });

    return 'created';
  }

  const existingCodes = new Set(existing.capabilities.map((item) => item.code));
  const missing = seed.capabilities.filter(
    (capability) => !existingCodes.has(capability.code),
  );

  if (missing.length === 0) return 'kept';

  const added = await buildCapabilities({ capabilities: missing });

  await AiModelModel.updateOne(
    { _id: existing._id },
    {
      $push: {
        capabilities: {
          $each: added.map((capability) => ({
            ...capability,
            isDefault:
              capability.isDefault &&
              existing.status === AI_MODEL_STATUS.ACTIVE,
          })),
        },
      },
    },
  );

  return 'updated';
}

async function seedVoice({ provider, seed, sortOrder }) {
  const [code, accent, gender, tags] = seed;
  const result = await VoiceModel.updateOne(
    { providerId: provider._id, code },
    {
      $setOnInsert: {
        providerId: provider._id,
        code,
        name: capitalize(code),
        accent,
        gender,
        tags,
        enabled: true,
        sortOrder,
      },
    },
    { upsert: true },
  );

  return result.upsertedCount > 0;
}

export async function seedDatabase() {
  await getPlatformSettingsService();

  const { provider, created: providerCreated } = await seedProvider();
  const models = { created: 0, updated: 0, kept: 0 };

  for (const seed of SEED_MODELS) {
    models[await seedModel({ provider, seed })] += 1;
  }

  let voicesCreated = 0;

  for (const [index, seed] of SEED_VOICES.entries()) {
    if (await seedVoice({ provider, seed, sortOrder: index + 1 })) {
      voicesCreated += 1;
    }
  }

  return {
    provider: providerCreated ? 'created' : 'kept',
    models,
    voices: {
      created: voicesCreated,
      kept: SEED_VOICES.length - voicesCreated,
    },
  };
}

async function runSeed() {
  const appConfig = buildAppConfig();

  await mongoose.connect(appConfig.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
  });

  try {
    await mongoose.connection.syncIndexes();

    const summary = await seedDatabase();

    console.log('Seed finished');
    console.log(`  Platform settings: ready`);
    console.log(`  Provider OpenAI: ${summary.provider}`);
    console.log(
      `  Models: ${summary.models.created} created, ${summary.models.updated} updated, ${summary.models.kept} unchanged`,
    );
    console.log(
      `  Voices: ${summary.voices.created} created, ${summary.voices.kept} unchanged`,
    );
  } finally {
    await mongoose.disconnect();
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  runSeed().catch((error) => {
    console.error('Seed failed:', error.message);
    process.exitCode = 1;
  });
}
