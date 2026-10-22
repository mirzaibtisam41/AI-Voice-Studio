import { deleteMyAudioFileService } from '#src/modules/audio-files/features/delete-my-audio-file/delete-my-audio-file.service.js';

export async function deleteMyAudioFileController(request, reply) {
  await deleteMyAudioFileService({
    storage: request.server.storage,
    userId: request.user._id,
    audioFileId: request.params.id,
  });

  return reply.success({ message: 'Audio file deleted' });
}
