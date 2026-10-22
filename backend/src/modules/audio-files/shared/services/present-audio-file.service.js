export async function presentAudioFileService({ storage, audioFile }) {
  const { storageKey: _storageKey, ...details } = audioFile.toJSON();

  return {
    ...details,
    url: await storage.createSignedUrl({ key: audioFile.storageKey }),
  };
}
