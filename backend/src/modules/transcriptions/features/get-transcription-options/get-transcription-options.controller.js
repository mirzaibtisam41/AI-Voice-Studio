import { getTranscriptionOptionsService } from '#src/modules/transcriptions/features/get-transcription-options/get-transcription-options.service.js';

export async function getTranscriptionOptionsController(_request, reply) {
  const options = await getTranscriptionOptionsService();

  return reply.success({ data: options });
}
