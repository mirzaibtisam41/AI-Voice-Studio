import { bulkFavoriteMyAudioFilesService } from '#src/modules/audio-files/features/bulk-favorite-my-audio-files/bulk-favorite-my-audio-files.service.js';

export async function bulkFavoriteMyAudioFilesController(request, reply) {
  const updatedIds = await bulkFavoriteMyAudioFilesService({
    userId: request.user._id,
    ids: request.body.ids,
    favorite: request.body.favorite,
  });

  return reply.success({
    data: { updatedIds },
    message: request.body.favorite
      ? `${updatedIds.length} added to favorites`
      : `${updatedIds.length} removed from favorites`,
  });
}
