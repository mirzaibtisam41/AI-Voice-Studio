import {
  AGENT_CHAT_STYLE_GUIDANCE,
  AGENT_RESPONSE_STYLE,
  AGENT_RESPONSE_STYLE_GUIDANCE,
} from '#src/modules/agents/agent.constants.js';

export const ASSISTANT_CHANNEL = {
  VOICE: 'voice',
  CHAT: 'chat',
};

export function buildAssistantInstructionsUtil({
  name = null,
  instructions = null,
  responseStyle = AGENT_RESPONSE_STYLE.BALANCED,
  knowledge = null,
  greeting = null,
  channel = ASSISTANT_CHANNEL.VOICE,
}) {
  const parts = [];

  if (name) {
    parts.push(`Your name is ${name}.`);
  }

  if (instructions?.trim()) {
    parts.push(instructions.trim());
  }

  parts.push(
    AGENT_RESPONSE_STYLE_GUIDANCE[responseStyle] ??
      AGENT_RESPONSE_STYLE_GUIDANCE[AGENT_RESPONSE_STYLE.BALANCED],
  );

  if (knowledge?.trim()) {
    parts.push(
      `Use these facts when they are relevant, and do not invent facts that are not here:\n${knowledge.trim()}`,
    );
  }

  if (channel === ASSISTANT_CHANNEL.VOICE) {
    parts.push(
      'You are speaking out loud, so use natural spoken language without lists, links or formatting.',
    );

    if (greeting?.trim()) {
      parts.push(`Start the conversation by saying: "${greeting.trim()}"`);
    }
  } else {
    parts.push(
      `This is a text chat. Reply in plain text without Markdown. ${
        AGENT_CHAT_STYLE_GUIDANCE[responseStyle] ??
        AGENT_CHAT_STYLE_GUIDANCE[AGENT_RESPONSE_STYLE.BALANCED]
      }`,
    );
  }

  return parts.join('\n\n');
}
