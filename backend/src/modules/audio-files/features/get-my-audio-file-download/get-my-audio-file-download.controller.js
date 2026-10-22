import { getMyAudioFileDownloadService } from '#src/modules/audio-files/features/get-my-audio-file-download/get-my-audio-file-download.service.js';

export async function getMyAudioFileDownloadController(request, reply) {
  const url = await getMyAudioFileDownloadService({
    storage: request.server.storage,
    userId: request.user._id,
    audioFileId: request.params.id,
  });

  return reply.success({ data: { url } });
}
