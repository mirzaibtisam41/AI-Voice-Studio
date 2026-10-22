import { objectIdParamsSchema } from '#src/shared/schemas/index.js';

export const getVoicePreviewSchema = {
  params: objectIdParamsSchema('voiceId'),
};
