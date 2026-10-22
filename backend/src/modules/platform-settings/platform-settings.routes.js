import {
  checkUserIsAdminHook,
  checkUserIsLoggedInHook,
} from '#src/hooks/index.js';
import { getPlatformSettingsController } from '#src/modules/platform-settings/features/get-platform-settings/get-platform-settings.controller.js';
import { getPublicPlatformSettingsController } from '#src/modules/platform-settings/features/get-public-platform-settings/get-public-platform-settings.controller.js';
import { updatePlatformSettingsController } from '#src/modules/platform-settings/features/update-platform-settings/update-platform-settings.controller.js';
import { updatePlatformSettingsSchema } from '#src/modules/platform-settings/features/update-platform-settings/update-platform-settings.schema.js';

export async function platformSettingsRoutes(fastify) {
  fastify.addHook('onRequest', checkUserIsLoggedInHook);
  fastify.addHook('onRequest', checkUserIsAdminHook);

  fastify.get('/', getPlatformSettingsController);
  fastify.patch(
    '/',
    { schema: updatePlatformSettingsSchema },
    updatePlatformSettingsController,
  );
}

export async function publicPlatformSettingsRoutes(fastify) {
  fastify.get('/', getPublicPlatformSettingsController);
}
