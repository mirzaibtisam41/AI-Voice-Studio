import { PROVIDER_ERROR_CATEGORY } from '#src/constants/index.js';
import { ProviderError } from '#src/utils/index.js';
import { requestOpenAiIntegration } from '#src/integrations/openai/request-openai.integration.js';

const CLIENT_SECRET_SECONDS = 600;
const INPUT_TRANSCRIPTION_MODEL = 'gpt-transcribe';

export async function createRealtimeClientSecretIntegration({
  client,
  model,
  voice,
  instructions,
}) {
  const response = await requestOpenAiIntegration({
    send: () =>
      client.realtime.clientSecrets.create({
        expires_after: {
          anchor: 'created_at',
          seconds: CLIENT_SECRET_SECONDS,
        },
        session: {
          type: 'realtime',
          model,
          instructions,
          audio: {
            input: { transcription: { model: INPUT_TRANSCRIPTION_MODEL } },
            output: { voice },
          },
        },
      }),
  });

  if (!response?.value) {
    throw new ProviderError({ category: PROVIDER_ERROR_CATEGORY.UNKNOWN });
  }

  return {
    value: response.value,
    expiresAt: response.expires_at
      ? new Date(response.expires_at * 1000)
      : new Date(Date.now() + CLIENT_SECRET_SECONDS * 1000),
  };
}
