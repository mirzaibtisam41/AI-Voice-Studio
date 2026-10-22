import { bulkDeleteMyAudioFilesService } from '#src/modules/audio-files/features/bulk-delete-my-audio-files/bulk-delete-my-audio-files.service.js';

export async function bulkDeleteMyAudioFilesController(request, reply) {
  const deletedIds = await bulkDeleteMyAudioFilesService({
    storage: request.server.storage,
    log: request.log,
    userId: request.user._id,
    ids: request.body.ids,
  });

  return reply.success({
    data: { deletedIds },
    message:
      deletedIds.length === 1
        ? '1 audio file deleted'
        : `${deletedIds.length} audio files deleted`,
  });
}
