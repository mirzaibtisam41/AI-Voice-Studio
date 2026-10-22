import { getMySettingsService } from '#src/modules/user-settings/features/get-my-settings/get-my-settings.service.js';

export async function getMySettingsController(request, reply) {
  const settings = await getMySettingsService({ userId: request.user._id });

  return reply.success({ data: { settings } });
}
