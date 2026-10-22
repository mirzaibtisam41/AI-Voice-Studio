import { agentsRoutes } from '#src/modules/agents/agents.routes.js';
import { aiModelsRoutes } from '#src/modules/ai-models/ai-models.routes.js';
import { aiProvidersRoutes } from '#src/modules/ai-providers/ai-providers.routes.js';
import { adminAnalyticsRoutes } from '#src/modules/analytics/analytics.routes.js';
import { audioFilesRoutes } from '#src/modules/audio-files/audio-files.routes.js';
import { auditLogsRoutes } from '#src/modules/audit-logs/audit-logs.routes.js';
import { authRoutes } from '#src/modules/auth/auth.routes.js';
import {
  adminUserWalletRoutes,
  myWalletRoutes,
} from '#src/modules/credit-wallets/credit-wallets.routes.js';
import {
  adminGenerationsRoutes,
  generationsRoutes,
} from '#src/modules/generations/generations.routes.js';
import { healthRoutes } from '#src/modules/health/health.routes.js';
import {
  platformSettingsRoutes,
  publicPlatformSettingsRoutes,
} from '#src/modules/platform-settings/platform-settings.routes.js';
import { realtimeRoutes } from '#src/modules/realtime/realtime.routes.js';
import { speechRoutes } from '#src/modules/speech/speech.routes.js';
import { transcriptionsRoutes } from '#src/modules/transcriptions/transcriptions.routes.js';
import { usageRoutes } from '#src/modules/usage/usage.routes.js';
import { userSettingsRoutes } from '#src/modules/user-settings/user-settings.routes.js';
import {
  adminUsersRoutes,
  myAccountRoutes,
} from '#src/modules/users/users.routes.js';
import {
  adminVoicesRoutes,
  voicesRoutes,
} from '#src/modules/voices/voices.routes.js';

export async function registerRoutes(fastify) {
  await fastify.register(healthRoutes, { prefix: '/health' });
  await fastify.register(authRoutes, { prefix: '/api/auth' });
  await fastify.register(myAccountRoutes, { prefix: '/api/me' });
  await fastify.register(userSettingsRoutes, { prefix: '/api/me/settings' });
  await fastify.register(publicPlatformSettingsRoutes, {
    prefix: '/api/platform',
  });
  await fastify.register(myWalletRoutes, { prefix: '/api/wallet' });
  await fastify.register(usageRoutes, { prefix: '/api/usage' });
  await fastify.register(voicesRoutes, { prefix: '/api/voices' });
  await fastify.register(speechRoutes, { prefix: '/api/speech' });
  await fastify.register(audioFilesRoutes, { prefix: '/api/audio-files' });
  await fastify.register(transcriptionsRoutes, {
    prefix: '/api/transcriptions',
  });
  await fastify.register(realtimeRoutes, { prefix: '/api/realtime' });
  await fastify.register(agentsRoutes, { prefix: '/api/agents' });
  await fastify.register(generationsRoutes, { prefix: '/api/generations' });
  await fastify.register(adminUsersRoutes, { prefix: '/api/admin/users' });
  await fastify.register(adminUserWalletRoutes, { prefix: '/api/admin/users' });
  await fastify.register(aiProvidersRoutes, { prefix: '/api/admin/providers' });
  await fastify.register(aiModelsRoutes, { prefix: '/api/admin/models' });
  await fastify.register(adminVoicesRoutes, { prefix: '/api/admin/voices' });
  await fastify.register(platformSettingsRoutes, {
    prefix: '/api/admin/settings',
  });
  await fastify.register(adminGenerationsRoutes, {
    prefix: '/api/admin/generations',
  });
  await fastify.register(auditLogsRoutes, { prefix: '/api/admin/audit-logs' });
  await fastify.register(adminAnalyticsRoutes, {
    prefix: '/api/admin/analytics',
  });
}
