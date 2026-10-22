import fp from 'fastify-plugin';
import {
  buildOpenAiClientIntegration,
  createRealtimeClientSecretIntegration,
  generateChatReplyIntegration,
  synthesizeSpeechIntegration,
  transcribeAudioIntegration,
} from '#src/integrations/index.js';

function buildAi({ appConfig }) {
  const client = buildOpenAiClientIntegration({ appConfig });

  return {
    synthesizeSpeech: (request) =>
      synthesizeSpeechIntegration({ client, appConfig, ...request }),
    transcribeAudio: (request) =>
      transcribeAudioIntegration({ client, ...request }),
    createRealtimeClientSecret: (request) =>
      createRealtimeClientSecretIntegration({ client, ...request }),
    generateChatReply: (request) =>
      generateChatReplyIntegration({ client, ...request }),
  };
}

async function registerAi(fastify, { ai }) {
  fastify.decorate('ai', ai ?? buildAi({ appConfig: fastify.config }));
}

export const aiPlugin = fp(registerAi);
