import {
  buildPaginationMetaUtil,
  buildPaginationUtil,
  escapeRegexUtil,
} from '#src/utils/index.js';
import { AUDIO_FILE_SORT } from '#src/modules/audio-files/audio-file.constants.js';
import {
  countUserAudioFilesRepository,
  listUserAudioFilesRepository,
} from '#src/modules/audio-files/shared/repositories/index.js';
import { presentAudioFileService } from '#src/modules/audio-files/shared/services/index.js';

const SORTS = {
  [AUDIO_FILE_SORT.NEWEST]: { createdAt: -1, _id: -1 },
  [AUDIO_FILE_SORT.OLDEST]: { createdAt: 1, _id: 1 },
  [AUDIO_FILE_SORT.LONGEST]: { durationSeconds: -1, createdAt: -1, _id: -1 },
  [AUDIO_FILE_SORT.NAME]: { title: 1, _id: 1 },
};

const NAME_COLLATION = { locale: 'en', strength: 2 };

function buildFilter({ userId, query }) {
  const filter = { userId };

  if (query.kind) filter.kind = query.kind;
  if (query.transcribed) filter.hasTranscript = true;
  if (query.favorite) filter.favorite = true;

  const search = query.search?.trim();

  if (search) {
    filter.title = {
      $regex: escapeRegexUtil({ text: search }),
      $options: 'i',
    };
  }

  return filter;
}

export async function listMyAudioFilesService({ storage, userId, query }) {
  const { page, limit, sort } = query;
  const filter = buildFilter({ userId, query });
  const { skip } = buildPaginationUtil({ page, limit });

  const [audioFiles, total] = await Promise.all([
    listUserAudioFilesRepository({
      filter,
      sort: SORTS[sort],
      collation: sort === AUDIO_FILE_SORT.NAME ? NAME_COLLATION : null,
      skip,
      limit,
    }),
    countUserAudioFilesRepository({ filter }),
  ]);

  return {
    audioFiles: await Promise.all(
      audioFiles.map((audioFile) =>
        presentAudioFileService({ storage, audioFile }),
      ),
    ),
    meta: buildPaginationMetaUtil({ page, limit, total }),
  };
}
