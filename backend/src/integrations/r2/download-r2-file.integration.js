import { GetObjectCommand } from '@aws-sdk/client-s3';

export async function downloadR2FileIntegration({ client, bucket, key }) {
  const response = await client.send(
    new GetObjectCommand({ Bucket: bucket, Key: key }),
  );

  return Buffer.from(await response.Body.transformToByteArray());
}
