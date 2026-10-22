import { checkUserIsLoggedInHook } from '#src/hooks/index.js';
import { createTranscriptionController } from '#src/modules/transcriptions/features/create-transcription/create-transcription.controller.js';
import { createTranscriptionSchema } from '#src/modules/transcriptions/features/create-transcription/create-transcription.schema.js';
import { deleteMyTranscriptionController } from '#src/modules/transcriptions/features/delete-my-transcription/delete-my-transcription.controller.js';
import { deleteMyTranscriptionSchema } from '#src/modules/transcriptions/features/delete-my-transcription/delete-my-transcription.schema.js';
import { exportMyTranscriptionController } from '#src/modules/transcriptions/features/export-my-transcription/export-my-transcription.controller.js';
import { exportMyTranscriptionSchema } from '#src/modules/transcriptions/features/export-my-transcription/export-my-transcription.schema.js';
import { getMyTranscriptionController } from '#src/modules/transcriptions/features/get-my-transcription/get-my-transcription.controller.js';
import { getMyTranscriptionSchema } from '#src/modules/transcriptions/features/get-my-transcription/get-my-transcription.schema.js';
import { getTranscriptionOptionsController } from '#src/modules/transcriptions/features/get-transcription-options/get-transcription-options.controller.js';
import { listMyTranscriptionsController } from '#src/modules/transcriptions/features/list-my-transcriptions/list-my-transcriptions.controller.js';
import { listMyTranscriptionsSchema } from '#src/modules/transcriptions/features/list-my-transcriptions/list-my-transcriptions.schema.js';
import { updateMyTranscriptionController } from '#src/modules/transcriptions/features/update-my-transcription/update-my-transcription.controller.js';
import { updateMyTranscriptionSchema } from '#src/modules/transcriptions/features/update-my-transcription/update-my-transcription.schema.js';

export async function transcriptionsRoutes(fastify) {
  fastify.addHook('onRequest', checkUserIsLoggedInHook);

  fastify.get('/options', getTranscriptionOptionsController);

  fastify.post(
    '/',
    {
      schema: createTranscriptionSchema,
      config: { rateLimit: { max: 10, timeWindow: 60000 } },
    },
    createTranscriptionController,
  );

  fastify.get(
    '/',
    { schema: listMyTranscriptionsSchema },
    listMyTranscriptionsController,
  );

  fastify.get(
    '/:id',
    { schema: getMyTranscriptionSchema },
    getMyTranscriptionController,
  );

  fastify.patch(
    '/:id',
    { schema: updateMyTranscriptionSchema },
    updateMyTranscriptionController,
  );

  fastify.get(
    '/:id/export',
    { schema: exportMyTranscriptionSchema },
    exportMyTranscriptionController,
  );

  fastify.delete(
    '/:id',
    { schema: deleteMyTranscriptionSchema },
    deleteMyTranscriptionController,
  );
}
