import { listEnabledVoicesRepository } from '#src/modules/voices/shared/repositories/index.js';

export function listAvailableVoicesService() {
  return listEnabledVoicesRepository();
}
