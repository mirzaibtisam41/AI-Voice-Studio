export function createMemoryStorage() {
  const files = new Map();

  return {
    files,

    async uploadFile({ key, body, contentType }) {
      files.set(key, { body, contentType });
    },

    async downloadFile({ key }) {
      return files.get(key).body;
    },

    async deleteFile({ key }) {
      files.delete(key);
    },

    async createSignedUrl({ key, downloadFileName }) {
      const download = downloadFileName
        ? `&download=${encodeURIComponent(downloadFileName)}`
        : '';

      return `https://storage.test/${key}?signature=test${download}`;
    },

    close() {
      files.clear();
    },
  };
}
