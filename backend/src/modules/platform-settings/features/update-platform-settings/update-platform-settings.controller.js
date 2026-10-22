import { updatePlatformSettingsService } from '#src/modules/platform-settings/features/update-platform-settings/update-platform-settings.service.js';

export async function updatePlatformSettingsController(request, reply) {
  const settings = await updatePlatformSettingsService({
    actor: request.user,
    data: request.body,
  });

  return reply.success({ data: { settings }, message: 'Settings saved' });
}
