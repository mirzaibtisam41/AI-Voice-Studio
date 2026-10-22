import { AudioFileModel } from '#src/modules/audio-files/audio-file.model.js';

export function listUserAudioFilesRepository({
  filter,
  sort,
  collation,
  skip,
  limit,
}) {
  const query = AudioFileModel.find(filter).sort(sort).skip(skip).limit(limit);

  return collation ? query.collation(collation) : query;
}
