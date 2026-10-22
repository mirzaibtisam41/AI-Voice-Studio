import { S3Client } from '@aws-sdk/client-s3';

export function buildR2ClientIntegration({ appConfig }) {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${appConfig.STORAGE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: appConfig.STORAGE_R2_ACCESS_KEY_ID,
      secretAccessKey: appConfig.STORAGE_R2_SECRET_ACCESS_KEY,
    },
  });
}
