import { checkUserIsLoggedInHook } from '#src/hooks/index.js';
import { objectIdParamsSchema } from '#src/shared/schemas/index.js';
import { bulkDeleteMyAudioFilesController } from '#src/modules/audio-files/features/bulk-delete-my-audio-files/bulk-delete-my-audio-files.controller.js';
import { bulkDeleteMyAudioFilesSchema } from '#src/modules/audio-files/features/bulk-delete-my-audio-files/bulk-delete-my-audio-files.schema.js';
import { bulkFavoriteMyAudioFilesController } from '#src/modules/audio-files/features/bulk-favorite-my-audio-files/bulk-favorite-my-audio-files.controller.js';
import { bulkFavoriteMyAudioFilesSchema } from '#src/modules/audio-files/features/bulk-favorite-my-audio-files/bulk-favorite-my-audio-files.schema.js';
import { deleteMyAudioFileController } from '#src/modules/audio-files/features/delete-my-audio-file/delete-my-audio-file.controller.js';
import { getMyAudioFileController } from '#src/modules/audio-files/features/get-my-audio-file/get-my-audio-file.controller.js';
import { getMyAudioFileDownloadController } from '#src/modules/audio-files/features/get-my-audio-file-download/get-my-audio-file-download.controller.js';
import { listMyAudioFilesController } from '#src/modules/audio-files/features/list-my-audio-files/list-my-audio-files.controller.js';
import { listMyAudioFilesSchema } from '#src/modules/audio-files/features/list-my-audio-files/list-my-audio-files.schema.js';
import { updateMyAudioFileController } from '#src/modules/audio-files/features/update-my-audio-file/update-my-audio-file.controller.js';
import { updateMyAudioFileSchema } from '#src/modules/audio-files/features/update-my-audio-file/update-my-audio-file.schema.js';
import { uploadAudioFileController } from '#src/modules/audio-files/features/upload-audio-file/upload-audio-file.controller.js';

const audioFileIdSchema = { params: objectIdParamsSchema('id') };

export async function audioFilesRoutes(fastify) {
  fastify.addHook('onRequest', checkUserIsLoggedInHook);

  fastify.post('/', uploadAudioFileController);

  fastify.get(
    '/',
    { schema: listMyAudioFilesSchema },
    listMyAudioFilesController,
  );

  fastify.post(
    '/bulk-delete',
    { schema: bulkDeleteMyAudioFilesSchema },
    bulkDeleteMyAudioFilesController,
  );

  fastify.post(
    '/bulk-favorite',
    { schema: bulkFavoriteMyAudioFilesSchema },
    bulkFavoriteMyAudioFilesController,
  );

  fastify.get('/:id', { schema: audioFileIdSchema }, getMyAudioFileController);

  fastify.patch(
    '/:id',
    { schema: updateMyAudioFileSchema },
    updateMyAudioFileController,
  );

  fastify.delete(
    '/:id',
    { schema: audioFileIdSchema },
    deleteMyAudioFileController,
  );

  fastify.get(
    '/:id/download',
    { schema: audioFileIdSchema },
    getMyAudioFileDownloadController,
  );
}
