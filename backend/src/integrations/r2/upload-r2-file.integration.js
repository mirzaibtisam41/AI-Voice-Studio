import { PutObjectCommand } from '@aws-sdk/client-s3';

export async function uploadR2FileIntegration({
  client,
  bucket,
  key,
  body,
  contentType,
}) {
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
}
