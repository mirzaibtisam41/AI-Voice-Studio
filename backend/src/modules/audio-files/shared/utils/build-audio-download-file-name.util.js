const FILE_NAME_MAX_LENGTH = 100;

export function buildAudioDownloadFileNameUtil({ audioFile }) {
  const extension = audioFile.storageKey.split('.').pop();
  const baseName =
    audioFile.title
      .replace(/[\\/:*?"<>|\r\n\t]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, FILE_NAME_MAX_LENGTH) || `audio-${audioFile._id}`;

  return `${baseName}.${extension}`;
}
