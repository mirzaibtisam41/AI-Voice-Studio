export const API_URL = String(process.env.NEXT_PUBLIC_API_URL ?? '')
  .trim()
  .replace(/\/+$/, '');
