export function buildAudioStorageKeyUtil({
  userId,
  folder,
  audioFileId,
  extension,
}) {
  return `users/${userId}/${folder}/${audioFileId}.${extension}`;
}

export function buildVoicePreviewStorageKeyUtil({ voiceCode }) {
  return `voices/previews/${voiceCode}.mp3`;
}
