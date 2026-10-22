import {
  checkUserIsAdminHook,
  checkUserIsLoggedInHook,
} from '#src/hooks/index.js';
import { objectIdParamsSchema } from '#src/shared/schemas/index.js';
import { adjustUserCreditsController } from '#src/modules/credit-wallets/features/adjust-user-credits/adjust-user-credits.controller.js';
import { adjustUserCreditsSchema } from '#src/modules/credit-wallets/features/adjust-user-credits/adjust-user-credits.schema.js';
import { exportMyTransactionsController } from '#src/modules/credit-wallets/features/export-my-transactions/export-my-transactions.controller.js';
import { exportMyTransactionsSchema } from '#src/modules/credit-wallets/features/export-my-transactions/export-my-transactions.schema.js';
import { getMyWalletController } from '#src/modules/credit-wallets/features/get-my-wallet/get-my-wallet.controller.js';
import { getUserWalletController } from '#src/modules/credit-wallets/features/get-user-wallet/get-user-wallet.controller.js';
import { listCreditAdjustmentsController } from '#src/modules/credit-wallets/features/list-credit-adjustments/list-credit-adjustments.controller.js';
import { listCreditAdjustmentsSchema } from '#src/modules/credit-wallets/features/list-credit-adjustments/list-credit-adjustments.schema.js';
import { listMyTransactionsController } from '#src/modules/credit-wallets/features/list-my-transactions/list-my-transactions.controller.js';
import { listMyTransactionsSchema } from '#src/modules/credit-wallets/features/list-my-transactions/list-my-transactions.schema.js';

export async function myWalletRoutes(fastify) {
  fastify.addHook('onRequest', checkUserIsLoggedInHook);

  fastify.get('/', getMyWalletController);

  fastify.get(
    '/transactions',
    { schema: listMyTransactionsSchema },
    listMyTransactionsController,
  );

  fastify.get(
    '/transactions/export',
    {
      schema: exportMyTransactionsSchema,
      config: { rateLimit: { max: 10, timeWindow: '1 minute' } },
    },
    exportMyTransactionsController,
  );
}

export async function adminUserWalletRoutes(fastify) {
  fastify.addHook('onRequest', checkUserIsLoggedInHook);
  fastify.addHook('onRequest', checkUserIsAdminHook);

  fastify.get(
    '/credit-adjustments/recent',
    { schema: listCreditAdjustmentsSchema },
    listCreditAdjustmentsController,
  );

  fastify.get(
    '/:userId/wallet',
    { schema: { params: objectIdParamsSchema('userId') } },
    getUserWalletController,
  );

  fastify.post(
    '/:userId/credit-adjustments',
    { schema: adjustUserCreditsSchema },
    adjustUserCreditsController,
  );
}
