import {
  checkUserIsAdminHook,
  checkUserIsLoggedInHook,
} from '#src/hooks/index.js';
import { changeMyPasswordController } from '#src/modules/users/features/change-my-password/change-my-password.controller.js';
import { changeMyPasswordSchema } from '#src/modules/users/features/change-my-password/change-my-password.schema.js';
import { deactivateMyAccountController } from '#src/modules/users/features/deactivate-my-account/deactivate-my-account.controller.js';
import { deactivateMyAccountSchema } from '#src/modules/users/features/deactivate-my-account/deactivate-my-account.schema.js';
import { getUserController } from '#src/modules/users/features/get-user/get-user.controller.js';
import { getUserSchema } from '#src/modules/users/features/get-user/get-user.schema.js';
import { listUsersController } from '#src/modules/users/features/list-users/list-users.controller.js';
import { listUsersSchema } from '#src/modules/users/features/list-users/list-users.schema.js';
import { updateMyProfileController } from '#src/modules/users/features/update-my-profile/update-my-profile.controller.js';
import { updateMyProfileSchema } from '#src/modules/users/features/update-my-profile/update-my-profile.schema.js';
import { updateUserRoleController } from '#src/modules/users/features/update-user-role/update-user-role.controller.js';
import { updateUserRoleSchema } from '#src/modules/users/features/update-user-role/update-user-role.schema.js';
import { updateUserStatusController } from '#src/modules/users/features/update-user-status/update-user-status.controller.js';
import { updateUserStatusSchema } from '#src/modules/users/features/update-user-status/update-user-status.schema.js';

export async function myAccountRoutes(fastify) {
  fastify.addHook('onRequest', checkUserIsLoggedInHook);

  fastify.patch(
    '/profile',
    { schema: updateMyProfileSchema },
    updateMyProfileController,
  );

  fastify.post(
    '/password',
    {
      schema: changeMyPasswordSchema,
      config: { rateLimit: { max: 10, timeWindow: '15 minutes' } },
    },
    changeMyPasswordController,
  );

  fastify.post(
    '/deactivate',
    {
      schema: deactivateMyAccountSchema,
      config: { rateLimit: { max: 5, timeWindow: '15 minutes' } },
    },
    deactivateMyAccountController,
  );
}

export async function adminUsersRoutes(fastify) {
  fastify.addHook('onRequest', checkUserIsLoggedInHook);
  fastify.addHook('onRequest', checkUserIsAdminHook);

  fastify.get('/', { schema: listUsersSchema }, listUsersController);

  fastify.get('/:userId', { schema: getUserSchema }, getUserController);

  fastify.patch(
    '/:userId/status',
    { schema: updateUserStatusSchema },
    updateUserStatusController,
  );

  fastify.patch(
    '/:userId/role',
    { schema: updateUserRoleSchema },
    updateUserRoleController,
  );
}
