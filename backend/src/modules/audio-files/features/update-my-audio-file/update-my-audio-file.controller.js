import { updateMyAudioFileService } from '#src/modules/audio-files/features/update-my-audio-file/update-my-audio-file.service.js';

export async function updateMyAudioFileController(request, reply) {
  const audioFile = await updateMyAudioFileService({
    storage: request.server.storage,
    userId: request.user._id,
    audioFileId: request.params.id,
    title: request.body.title,
    favorite: request.body.favorite,
  });

  return reply.success({ data: { audioFile }, message: 'Audio file updated' });
}
