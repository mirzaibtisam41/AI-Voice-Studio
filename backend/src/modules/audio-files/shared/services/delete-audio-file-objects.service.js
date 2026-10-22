export async function deleteAudioFileObjectsService({ storage, log, keys }) {
  await Promise.all(
    keys.filter(Boolean).map((key) =>
      storage.deleteFile({ key }).catch((error) => {
        log?.error(
          { err: error, storageKey: key },
          'Audio file could not be removed from storage',
        );
      }),
    ),
  );
}
