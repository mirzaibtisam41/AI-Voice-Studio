import { listAiProvidersRepository } from '#src/modules/ai-providers/shared/repositories/index.js';

export function listAiProvidersService() {
  return listAiProvidersRepository();
}
