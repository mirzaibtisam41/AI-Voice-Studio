import { getPlatformSettingsService } from '#src/modules/platform-settings/shared/services/index.js';

export async function getPlatformSettingsController(request, reply) {
  const settings = await getPlatformSettingsService();

  return reply.success({ data: { settings } });
}
