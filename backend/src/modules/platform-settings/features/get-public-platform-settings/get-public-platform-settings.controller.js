import { getPublicPlatformSettingsService } from '#src/modules/platform-settings/features/get-public-platform-settings/get-public-platform-settings.service.js';

export async function getPublicPlatformSettingsController(request, reply) {
  const { settings, rates } = await getPublicPlatformSettingsService();

  return reply.success({ data: { settings, rates } });
}
