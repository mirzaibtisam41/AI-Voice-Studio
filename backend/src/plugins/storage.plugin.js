import fp from 'fastify-plugin';
import {
  buildR2ClientIntegration,
  createR2SignedUrlIntegration,
  deleteR2FileIntegration,
  downloadR2FileIntegration,
  uploadR2FileIntegration,
} from '#src/integrations/index.js';

function buildR2Storage({ appConfig }) {
  const client = buildR2ClientIntegration({ appConfig });
  const bucket = appConfig.STORAGE_R2_BUCKET;

  return {
    uploadFile: (file) => uploadR2FileIntegration({ client, bucket, ...file }),
    deleteFile: ({ key }) => deleteR2FileIntegration({ client, bucket, key }),
    downloadFile: ({ key }) =>
      downloadR2FileIntegration({ client, bucket, key }),
    createSignedUrl: ({ key, downloadFileName }) =>
      createR2SignedUrlIntegration({ client, bucket, key, downloadFileName }),
    close: () => client.destroy(),
  };
}

async function registerStorage(fastify, { storage }) {
  const fileStorage = storage ?? buildR2Storage({ appConfig: fastify.config });

  fastify.decorate('storage', fileStorage);

  fastify.addHook('onClose', async () => {
    fileStorage.close?.();
  });
}

export const storagePlugin = fp(registerStorage);
