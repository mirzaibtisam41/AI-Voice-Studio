import { updateVoiceService } from '#src/modules/voices/features/update-voice/update-voice.service.js';

export async function updateVoiceController(request, reply) {
  const voice = await updateVoiceService({
    actor: request.user,
    id: request.params.id,
    data: request.body,
  });

  return reply.success({ data: { voice }, message: 'Voice updated' });
}
