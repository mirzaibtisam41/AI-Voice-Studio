import { PROVIDER_ERROR_CATEGORY } from '#src/constants/index.js';
import { ProviderError } from '#src/utils/index.js';
import { requestOpenAiIntegration } from '#src/integrations/openai/request-openai.integration.js';

const REPLY_MAX_OUTPUT_TOKENS = 400;
const REASONING_REPLY_MAX_OUTPUT_TOKENS = 1200;

function buildReasoning({ model }) {
  if (/^gpt-5(-|$)/.test(model)) return { effort: 'minimal' };

  if (/^(o\d|gpt-5\.)/.test(model)) return { effort: 'low' };

  return null;
}

export async function generateChatReplyIntegration({
  client,
  model,
  instructions,
  messages,
}) {
  const reasoning = buildReasoning({ model });
  const request = {
    model,
    instructions,
    input: messages.map((message) => ({
      role: message.role,
      content: message.content,
    })),
    max_output_tokens:
      reasoning?.effort === 'low'
        ? REASONING_REPLY_MAX_OUTPUT_TOKENS
        : REPLY_MAX_OUTPUT_TOKENS,
    store: false,
  };

  if (reasoning) request.reasoning = reasoning;

  const response = await requestOpenAiIntegration({
    send: () => client.responses.create(request),
  });

  const reply = response?.output_text?.trim();

  if (!reply) {
    throw new ProviderError({ category: PROVIDER_ERROR_CATEGORY.UNKNOWN });
  }

  return { reply };
}
