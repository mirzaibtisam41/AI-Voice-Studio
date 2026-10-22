import { getMyAudioFileService } from '#src/modules/audio-files/features/get-my-audio-file/get-my-audio-file.service.js';

export async function getMyAudioFileController(request, reply) {
  const audioFile = await getMyAudioFileService({
    storage: request.server.storage,
    userId: request.user._id,
    audioFileId: request.params.id,
  });

  return reply.success({ data: { audioFile } });
}
