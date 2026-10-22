import { toFile } from 'openai';
import { PROVIDER_ERROR_CATEGORY } from '#src/constants/index.js';
import { ProviderError } from '#src/utils/index.js';
import { requestOpenAiIntegration } from '#src/integrations/openai/request-openai.integration.js';

const MODELS_WITH_HINTS = ['gpt-transcribe'];

function supportsHints({ model }) {
  return MODELS_WITH_HINTS.some(
    (prefix) => model === prefix || model.startsWith(`${prefix}-`),
  );
}

function buildRequest({ model, file, languages, keywords, prompt }) {
  const request = { model, file };
  const promptParts = prompt ? [prompt] : [];
  const withHints = supportsHints({ model });

  if (languages?.length) {
    if (withHints) {
      request.languages = languages;
    } else if (languages.length === 1) {
      request.language = languages[0];
    }
  }

  if (keywords?.length) {
    if (withHints) {
      request.keywords = keywords;
    } else {
      promptParts.push(`Words you may hear: ${keywords.join(', ')}.`);
    }
  }

  if (promptParts.length > 0) {
    request.prompt = promptParts.join(' ');
  }

  return request;
}

export async function transcribeAudioIntegration({
  client,
  model,
  audio,
  fileName,
  contentType,
  languages,
  keywords,
  prompt,
}) {
  const file = await toFile(audio, fileName, { type: contentType });

  const response = await requestOpenAiIntegration({
    send: () =>
      client.audio.transcriptions.create(
        buildRequest({ model, file, languages, keywords, prompt }),
      ),
  });

  if (typeof response?.text !== 'string') {
    throw new ProviderError({ category: PROVIDER_ERROR_CATEGORY.UNKNOWN });
  }

  return {
    text: response.text.trim(),
    languages: (response.languages ?? [])
      .map((language) => language?.code)
      .filter(Boolean),
  };
}
