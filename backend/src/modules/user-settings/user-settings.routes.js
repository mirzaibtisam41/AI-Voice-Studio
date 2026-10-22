import { checkUserIsLoggedInHook } from '#src/hooks/index.js';
import { getMySettingsController } from '#src/modules/user-settings/features/get-my-settings/get-my-settings.controller.js';
import { updateMySettingsController } from '#src/modules/user-settings/features/update-my-settings/update-my-settings.controller.js';
import { updateMySettingsSchema } from '#src/modules/user-settings/features/update-my-settings/update-my-settings.schema.js';

export async function userSettingsRoutes(fastify) {
  fastify.addHook('onRequest', checkUserIsLoggedInHook);

  fastify.get('/', getMySettingsController);

  fastify.patch(
    '/',
    { schema: updateMySettingsSchema },
    updateMySettingsController,
  );
}
