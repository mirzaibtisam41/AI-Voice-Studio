export class ProviderError extends Error {
  constructor({ category, cause }) {
    super(`AI provider request failed: ${category}`, { cause });
    this.name = 'ProviderError';
    this.category = category;
  }
}
