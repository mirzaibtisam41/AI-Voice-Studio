import { settleStuckGenerationsService } from '#src/modules/generations/shared/services/index.js';

export function startJobs({ fastify }) {
  let isRunning = false;

  async function settleStuckGenerations() {
    if (isRunning) return;

    isRunning = true;

    try {
      const settledCount = await settleStuckGenerationsService();

      if (settledCount > 0) {
        fastify.log.warn(
          { settledCount },
          'Settled generations and sessions that were stuck in processing',
        );
      }
    } catch (error) {
      fastify.log.error({ err: error }, 'Stuck generation job failed');
    } finally {
      isRunning = false;
    }
  }

  settleStuckGenerations();
  setInterval(settleStuckGenerations, 60 * 1000).unref();
}
