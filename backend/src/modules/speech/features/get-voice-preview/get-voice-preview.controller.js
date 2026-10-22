import { getVoicePreviewService } from '#src/modules/speech/features/get-voice-preview/get-voice-preview.service.js';

export async function getVoicePreviewController(request, reply) {
  const url = await getVoicePreviewService({
    server: request.server,
    log: request.log,
    voiceId: request.params.voiceId,
  });

  return reply.success({ data: { url } });
}
