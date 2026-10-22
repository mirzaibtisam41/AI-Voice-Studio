import fp from 'fastify-plugin';
import {
  encodePcmAudioIntegration,
  readAudioMetadataIntegration,
} from '#src/integrations/index.js';

function buildAudio() {
  return {
    encodePcm: (request) => encodePcmAudioIntegration(request),
    readMetadata: (request) => readAudioMetadataIntegration(request),
  };
}

async function registerAudio(fastify, { audio }) {
  fastify.decorate('audio', audio ?? buildAudio());
}

export const audioPlugin = fp(registerAudio);
