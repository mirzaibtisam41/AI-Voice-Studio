import { AI_CAPABILITY } from '#src/constants/index.js';
import { BadRequestError, calculateCreditsUtil } from '#src/utils/index.js';
import { resolvePricedModelService } from '#src/modules/ai-models/shared/services/index.js';
import { findCreditWalletByUserIdRepository } from '#src/modules/credit-wallets/shared/repositories/index.js';
import { TRANSCRIPT_LINE_ROLE } from '#src/modules/generations/generation.constants.js';
import {
  completeGenerationService,
  startGenerationService,
} from '#src/modules/generations/shared/services/index.js';
import { getPlatformSettingsService } from '#src/modules/platform-settings/shared/services/index.js';
import {
  failAgentChatAndThrowService,
  findMyAgentService,
} from '#src/modules/agents/shared/services/index.js';
import {
  ASSISTANT_CHANNEL,
  buildAssistantInstructionsUtil,
} from '#src/modules/agents/shared/utils/index.js';

function checkMessages({ messages, maxMessages }) {
  if (messages.length > maxMessages) {
    throw new BadRequestError(
      `A test chat can hold up to ${maxMessages} messages. Start a new chat to keep testing.`,
    );
  }

  if (messages.at(-1).role !== TRANSCRIPT_LINE_ROLE.USER) {
    throw new BadRequestError('The last message must be yours');
  }
}

async function requestReply({
  server,
  log,
  generation,
  agent,
  model,
  messages,
}) {
  try {
    const { reply } = await server.ai.generateChatReply({
      model,
      instructions: buildAssistantInstructionsUtil({
        name: agent.name,
        instructions: agent.instructions,
        responseStyle: agent.responseStyle,
        knowledge: agent.knowledge,
        channel: ASSISTANT_CHANNEL.CHAT,
      }),
      messages,
    });

    return reply;
  } catch (error) {
    return failAgentChatAndThrowService({ log, generation, error });
  }
}

export async function chatWithAgentService({
  server,
  log,
  userId,
  agentId,
  data,
}) {
  const agent = await findMyAgentService({ userId, agentId });
  const settings = await getPlatformSettingsService();
  const messages = data.messages.map((message) => ({
    role: message.role,
    content: message.content.trim(),
  }));

  checkMessages({ messages, maxMessages: settings.agentChatMaxMessages });

  const pricedModel = await resolvePricedModelService({
    capability: AI_CAPABILITY.AGENT_CHAT,
  });
  const credits = calculateCreditsUtil({
    unit: pricedModel.unit,
    creditsPerUnit: pricedModel.creditsPerUnit,
    quantity: 1,
  });

  const generation = await startGenerationService({
    userId,
    pricedModel,
    units: 1,
    creditsHeld: credits,
    input: { agentId: agent._id, message: messages.at(-1).content },
    reason: `Test chat with ${agent.name}`,
  });

  const reply = await requestReply({
    server,
    log,
    generation,
    agent,
    model: pricedModel.model.providerModelId,
    messages,
  });

  const completed = await completeGenerationService({
    generationId: generation._id,
    units: 1,
    output: { reply },
  });
  const wallet = await findCreditWalletByUserIdRepository({ userId });

  return {
    reply,
    creditsCharged: completed.creditsCharged,
    balance: wallet.balance,
  };
}
