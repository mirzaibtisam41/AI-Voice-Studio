import {
  buildPaginationMetaUtil,
  buildPaginationUtil,
} from '#src/utils/index.js';
import {
  countUserTranscriptionsRepository,
  listUserTranscriptionsRepository,
} from '#src/modules/transcriptions/shared/repositories/index.js';
import { presentTranscriptionsService } from '#src/modules/transcriptions/shared/services/index.js';
import { buildTranscriptionsFilterUtil } from '#src/modules/transcriptions/shared/utils/index.js';

export async function listMyTranscriptionsService({ userId, query }) {
  const { page, limit } = query;
  const { skip } = buildPaginationUtil({ page, limit });
  const filter = buildTranscriptionsFilterUtil({
    userId,
    audioFileId: query.audioFileId,
    search: query.search,
  });

  const [transcriptions, total] = await Promise.all([
    listUserTranscriptionsRepository({ filter, skip, limit }),
    countUserTranscriptionsRepository({ filter }),
  ]);

  return {
    transcriptions: await presentTranscriptionsService({
      userId,
      transcriptions,
    }),
    meta: buildPaginationMetaUtil({ page, limit, total }),
  };
}
