import { listVoicesRepository } from '#src/modules/voices/shared/repositories/index.js';

export function listVoicesService() {
  return listVoicesRepository();
}
