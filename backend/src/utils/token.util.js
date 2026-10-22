import { createHash, randomBytes } from 'node:crypto';

export function generateTokenUtil() {
  return randomBytes(32).toString('base64url');
}

export function hashTokenUtil({ token }) {
  return createHash('sha256').update(token).digest('hex');
}
