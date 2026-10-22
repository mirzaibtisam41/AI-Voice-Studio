import { BadRequestError } from '#src/utils/index.js';
import { AGENT_INSTRUCTIONS_MIN_LENGTH } from '#src/modules/agents/agent.constants.js';

const OPTIONAL_TEXT_FIELDS = ['description', 'greeting', 'knowledge'];

export function normalizeAgentFieldsUtil({ data }) {
  const fields = { ...data };

  if (fields.name !== undefined) fields.name = fields.name.trim();

  if (fields.voiceCode !== undefined) {
    fields.voiceCode = fields.voiceCode.toLowerCase();
  }

  if (fields.instructions !== undefined) {
    fields.instructions = fields.instructions.trim();

    if (fields.instructions.length < AGENT_INSTRUCTIONS_MIN_LENGTH) {
      throw new BadRequestError(
        `Write at least ${AGENT_INSTRUCTIONS_MIN_LENGTH} characters of instructions so the agent knows how to behave`,
      );
    }
  }

  for (const key of OPTIONAL_TEXT_FIELDS) {
    if (fields[key] !== undefined) fields[key] = fields[key].trim() || null;
  }

  return fields;
}
