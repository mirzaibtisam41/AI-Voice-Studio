import { updateMySettingsService } from '#src/modules/user-settings/features/update-my-settings/update-my-settings.service.js';

export async function updateMySettingsController(request, reply) {
  const settings = await updateMySettingsService({
    userId: request.user._id,
    data: request.body,
  });

  return reply.success({ data: { settings }, message: 'Settings saved' });
}
