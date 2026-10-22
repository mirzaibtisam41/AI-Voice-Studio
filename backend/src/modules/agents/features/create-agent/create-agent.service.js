import { createAgentRepository } from '#src/modules/agents/shared/repositories/index.js';
import {
  ensureAgentSlotAvailableService,
  ensureEnabledVoiceService,
} from '#src/modules/agents/shared/services/index.js';
import {
  buildDefaultGreetingUtil,
  normalizeAgentFieldsUtil,
} from '#src/modules/agents/shared/utils/index.js';

export async function createAgentService({ userId, data }) {
  const fields = normalizeAgentFieldsUtil({ data });

  await ensureEnabledVoiceService({ voiceCode: fields.voiceCode });
  await ensureAgentSlotAvailableService({ userId });

  return createAgentRepository({
    data: {
      ...fields,
      userId,
      greeting:
        fields.greeting ?? buildDefaultGreetingUtil({ name: fields.name }),
    },
  });
}
