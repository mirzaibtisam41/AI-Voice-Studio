import { AI_CAPABILITY } from '#src/constants/index.js';
import {
  BadRequestError,
  InsufficientCreditsError,
  calculateCreditsUtil,
} from '#src/utils/index.js';
import { resolvePricedModelService } from '#src/modules/ai-models/shared/services/index.js';
import { AGENT_RESPONSE_STYLE } from '#src/modules/agents/agent.constants.js';
import {
  ensureEnabledVoiceService,
  findMyAgentService,
} from '#src/modules/agents/shared/services/index.js';
import {
  ASSISTANT_CHANNEL,
  buildAssistantInstructionsUtil,
} from '#src/modules/agents/shared/utils/index.js';
import { findCreditWalletByUserIdRepository } from '#src/modules/credit-wallets/shared/repositories/index.js';
import { startGenerationService } from '#src/modules/generations/shared/services/index.js';
import { getPlatformSettingsService } from '#src/modules/platform-settings/shared/services/index.js';
import {
  REALTIME_DEFAULT_INSTRUCTIONS,
  REALTIME_SESSION_GRACE_MINUTES,
} from '#src/modules/realtime/realtime.constants.js';
import { failRealtimeSessionAndThrowService } from '#src/modules/realtime/shared/services/index.js';

const MINUTE_MS = 60 * 1000;

async function resolveConversation({ userId, data }) {
  if (data.agentId) {
    const agent = await findMyAgentService({ userId, agentId: data.agentId });

    return {
      agent,
      capability: AI_CAPABILITY.VOICE_AGENT,
      voiceCode: agent.voiceCode,
      responseStyle: agent.responseStyle,
      customInstructions: null,
      instructions: buildAssistantInstructionsUtil({
        name: agent.name,
        instructions: agent.instructions,
        responseStyle: agent.responseStyle,
        knowledge: agent.knowledge,
        greeting: agent.greeting,
        channel: ASSISTANT_CHANNEL.VOICE,
      }),
    };
  }

  if (!data.voiceCode) {
    throw new BadRequestError('Choose a voice for the conversation');
  }

  const responseStyle = data.responseStyle ?? AGENT_RESPONSE_STYLE.BALANCED;
  const customInstructions = data.instructions?.trim() || null;

  return {
    agent: null,
    capability: AI_CAPABILITY.REALTIME,
    voiceCode: data.voiceCode.toLowerCase(),
    responseStyle,
    customInstructions,
    instructions: buildAssistantInstructionsUtil({
      instructions: customInstructions ?? REALTIME_DEFAULT_INSTRUCTIONS,
      responseStyle,
      channel: ASSISTANT_CHANNEL.VOICE,
    }),
  };
}

async function calculateAllowedMinutes({ userId, pricedModel }) {
  const [settings, wallet] = await Promise.all([
    getPlatformSettingsService(),
    findCreditWalletByUserIdRepository({ userId }),
  ]);
  const balance = wallet?.balance ?? 0;
  const allowedMinutes = Math.min(
    settings.realtimeMaxMinutes,
    Math.floor(balance / pricedModel.creditsPerUnit),
  );

  if (allowedMinutes < 1) {
    throw new InsufficientCreditsError(
      `A conversation needs at least ${pricedModel.creditsPerUnit} credits for one minute but you have ${balance}`,
    );
  }

  return allowedMinutes;
}

export async function createRealtimeSessionService({
  server,
  log,
  userId,
  data,
}) {
  const conversation = await resolveConversation({ userId, data });

  await ensureEnabledVoiceService({ voiceCode: conversation.voiceCode });

  const pricedModel = await resolvePricedModelService({
    capability: conversation.capability,
    modelId: data.modelId,
  });
  const allowedMinutes = await calculateAllowedMinutes({ userId, pricedModel });
  const allowedSeconds = allowedMinutes * 60;
  const startedAt = new Date();

  const generation = await startGenerationService({
    userId,
    pricedModel,
    units: allowedSeconds,
    creditsHeld: calculateCreditsUtil({
      unit: pricedModel.unit,
      creditsPerUnit: pricedModel.creditsPerUnit,
      quantity: allowedSeconds,
    }),
    input: {
      voiceCode: conversation.voiceCode,
      style: conversation.responseStyle,
      instructions: conversation.customInstructions,
      agentId: conversation.agent?._id ?? null,
    },
    realtime: {
      startedAt,
      allowedMinutes,
      expiresAt: new Date(
        startedAt.getTime() +
          (allowedMinutes + REALTIME_SESSION_GRACE_MINUTES) * MINUTE_MS,
      ),
    },
    reason: conversation.agent
      ? `Voice session with ${conversation.agent.name}`
      : 'Real-time conversation',
  });

  let clientSecret;

  try {
    clientSecret = await server.ai.createRealtimeClientSecret({
      model: pricedModel.model.providerModelId,
      voice: conversation.voiceCode,
      instructions: conversation.instructions,
    });
  } catch (error) {
    await failRealtimeSessionAndThrowService({ log, generation, error });
  }

  const wallet = await findCreditWalletByUserIdRepository({ userId });

  return {
    sessionId: generation._id.toString(),
    clientSecret: clientSecret.value,
    expiresAt: clientSecret.expiresAt,
    model: pricedModel.model.providerModelId,
    voice: conversation.voiceCode,
    allowedMinutes,
    creditsPerMinute: pricedModel.creditsPerUnit,
    balance: wallet.balance,
  };
}
