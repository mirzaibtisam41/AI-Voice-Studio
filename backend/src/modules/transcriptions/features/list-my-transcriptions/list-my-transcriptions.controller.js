import { listMyTranscriptionsService } from '#src/modules/transcriptions/features/list-my-transcriptions/list-my-transcriptions.service.js';

export async function listMyTranscriptionsController(request, reply) {
  const { transcriptions, meta } = await listMyTranscriptionsService({
    userId: request.user._id,
    query: request.query,
  });

  return reply.success({ data: { transcriptions }, meta });
}
