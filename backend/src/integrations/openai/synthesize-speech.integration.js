import { ProviderError } from '#src/utils/index.js';
import { mapOpenAiErrorIntegration } from '#src/integrations/openai/map-openai-error.integration.js';
import {
  SPEECH_SAMPLE_RATE,
  synthesizeRealtimeSpeechIntegration,
} from '#src/integrations/openai/synthesize-realtime-speech.integration.js';

const REALTIME_MODEL_PREFIX = 'gpt-realtime';

export function isRealtimeSpeechModelIntegration({ model }) {
  return model.startsWith(REALTIME_MODEL_PREFIX);
}

async function synthesizeAudioSpeech({
  client,
  model,
  voice,
  text,
  instructions,
}) {
  const style = instructions?.trim();

  try {
    const response = await client.audio.speech.create({
      model,
      voice,
      input: text,
      ...(style ? { instructions: style } : {}),
      response_format: 'pcm',
    });

    return {
      pcm: Buffer.from(await response.arrayBuffer()),
      sampleRate: SPEECH_SAMPLE_RATE,
    };
  } catch (error) {
    throw new ProviderError({
      category: mapOpenAiErrorIntegration({ error }),
      cause: error,
    });
  }
}

export function synthesizeSpeechIntegration({
  client,
  model,
  voice,
  text,
  instructions,
  openConnection,
}) {
  if (isRealtimeSpeechModelIntegration({ model })) {
    return synthesizeRealtimeSpeechIntegration({
      client,
      model,
      voice,
      text,
      instructions,
      openConnection,
    });
  }

  return synthesizeAudioSpeech({ client, model, voice, text, instructions });
}
