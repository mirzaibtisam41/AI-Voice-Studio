import { checkUserIsLoggedInHook } from '#src/hooks/index.js';
import { chatWithAgentController } from '#src/modules/agents/features/chat-with-agent/chat-with-agent.controller.js';
import { chatWithAgentSchema } from '#src/modules/agents/features/chat-with-agent/chat-with-agent.schema.js';
import { createAgentController } from '#src/modules/agents/features/create-agent/create-agent.controller.js';
import { createAgentSchema } from '#src/modules/agents/features/create-agent/create-agent.schema.js';
import { deleteMyAgentController } from '#src/modules/agents/features/delete-my-agent/delete-my-agent.controller.js';
import { deleteMyAgentSchema } from '#src/modules/agents/features/delete-my-agent/delete-my-agent.schema.js';
import { duplicateMyAgentController } from '#src/modules/agents/features/duplicate-my-agent/duplicate-my-agent.controller.js';
import { duplicateMyAgentSchema } from '#src/modules/agents/features/duplicate-my-agent/duplicate-my-agent.schema.js';
import { getMyAgentAnalyticsController } from '#src/modules/agents/features/get-my-agent-analytics/get-my-agent-analytics.controller.js';
import { getMyAgentAnalyticsSchema } from '#src/modules/agents/features/get-my-agent-analytics/get-my-agent-analytics.schema.js';
import { getMyAgentController } from '#src/modules/agents/features/get-my-agent/get-my-agent.controller.js';
import { getMyAgentSchema } from '#src/modules/agents/features/get-my-agent/get-my-agent.schema.js';
import { listMyAgentsController } from '#src/modules/agents/features/list-my-agents/list-my-agents.controller.js';
import { listMyAgentsSchema } from '#src/modules/agents/features/list-my-agents/list-my-agents.schema.js';
import { updateMyAgentStatusController } from '#src/modules/agents/features/update-my-agent-status/update-my-agent-status.controller.js';
import { updateMyAgentStatusSchema } from '#src/modules/agents/features/update-my-agent-status/update-my-agent-status.schema.js';
import { updateMyAgentController } from '#src/modules/agents/features/update-my-agent/update-my-agent.controller.js';
import { updateMyAgentSchema } from '#src/modules/agents/features/update-my-agent/update-my-agent.schema.js';

export async function agentsRoutes(fastify) {
  fastify.addHook('onRequest', checkUserIsLoggedInHook);

  fastify.get('/', { schema: listMyAgentsSchema }, listMyAgentsController);

  fastify.post('/', { schema: createAgentSchema }, createAgentController);

  fastify.get('/:id', { schema: getMyAgentSchema }, getMyAgentController);

  fastify.patch(
    '/:id',
    { schema: updateMyAgentSchema },
    updateMyAgentController,
  );

  fastify.delete(
    '/:id',
    { schema: deleteMyAgentSchema },
    deleteMyAgentController,
  );

  fastify.post(
    '/:id/duplicate',
    { schema: duplicateMyAgentSchema },
    duplicateMyAgentController,
  );

  fastify.patch(
    '/:id/status',
    { schema: updateMyAgentStatusSchema },
    updateMyAgentStatusController,
  );

  fastify.post(
    '/:id/chat',
    {
      schema: chatWithAgentSchema,
      config: { rateLimit: { max: 20, timeWindow: 60000 } },
    },
    chatWithAgentController,
  );

  fastify.get(
    '/:id/analytics',
    { schema: getMyAgentAnalyticsSchema },
    getMyAgentAnalyticsController,
  );
}
