import { listMyAudioFilesService } from '#src/modules/audio-files/features/list-my-audio-files/list-my-audio-files.service.js';

export async function listMyAudioFilesController(request, reply) {
  const { audioFiles, meta } = await listMyAudioFilesService({
    storage: request.server.storage,
    userId: request.user._id,
    query: request.query,
  });

  return reply.success({ data: { audioFiles }, meta });
}
