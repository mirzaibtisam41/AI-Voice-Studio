import { PROVIDER_ERROR_CATEGORY } from '#src/constants/index.js';
import { ProviderError } from '#src/utils/index.js';

export function createFakeAi() {
  const calls = {
    synthesizeSpeech: [],
    transcribeAudio: [],
    createRealtimeClientSecret: [],
    generateChatReply: [],
  };
  let nextFailure = null;

  function maybeFail() {
    if (!nextFailure) return;

    const category = nextFailure;
    nextFailure = null;

    throw new ProviderError({ category });
  }

  return {
    calls,

    failNext(category = PROVIDER_ERROR_CATEGORY.PROVIDER_UNAVAILABLE) {
      nextFailure = category;
    },

    async synthesizeSpeech(request) {
      calls.synthesizeSpeech.push(request);
      maybeFail();

      const seconds = Math.max(1, Math.round(request.text.length / 15));

      return { pcm: Buffer.alloc(seconds * 24000 * 2), sampleRate: 24000 };
    },

    async transcribeAudio(request) {
      calls.transcribeAudio.push(request);
      maybeFail();

      return { text: 'Hello from the fake transcriber.', languages: ['en'] };
    },

    async createRealtimeClientSecret(request) {
      calls.createRealtimeClientSecret.push(request);
      maybeFail();

      return {
        value: 'ek_test_secret',
        expiresAt: new Date(Date.now() + 60 * 1000),
      };
    },

    async generateChatReply(request) {
      calls.generateChatReply.push(request);
      maybeFail();

      return { reply: 'This is a fake agent reply.' };
    },
  };
}
