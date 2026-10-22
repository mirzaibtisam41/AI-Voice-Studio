import { DeleteObjectCommand } from '@aws-sdk/client-s3';

export async function deleteR2FileIntegration({ client, bucket, key }) {
  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}
