import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export function createR2SignedUrlIntegration({
  client,
  bucket,
  key,
  downloadFileName,
}) {
  return getSignedUrl(
    client,
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
      ResponseContentDisposition: downloadFileName
        ? `attachment; filename="${downloadFileName}"`
        : undefined,
    }),
    { expiresIn: 3600 },
  );
}
