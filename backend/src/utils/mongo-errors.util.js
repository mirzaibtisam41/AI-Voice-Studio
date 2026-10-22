const DUPLICATE_KEY_CODE = 11000;

export function isDuplicateKeyErrorUtil({ error }) {
  return (error?.code ?? error?.cause?.code) === DUPLICATE_KEY_CODE;
}
