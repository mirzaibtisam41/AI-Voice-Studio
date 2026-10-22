import { NotFoundError, runInTransactionUtil } from '#src/utils/index.js';
import {
  AUDIT_ACTION,
  AUDIT_TARGET_TYPE,
} from '#src/modules/audit-logs/audit-log.constants.js';
import { recordAuditLogService } from '#src/modules/audit-logs/shared/services/index.js';
import {
  findAiProviderByIdRepository,
  updateAiProviderRepository,
} from '#src/modules/ai-providers/shared/repositories/index.js';

export function updateAiProviderStatusService({ actor, id, status }) {
  return runInTransactionUtil({
    work: async ({ session }) => {
      const existing = await findAiProviderByIdRepository({ session, id });

      if (!existing) {
        throw new NotFoundError('Provider not found');
      }

      const provider = await updateAiProviderRepository({
        session,
        id,
        data: { status },
      });

      await recordAuditLogService({
        session,
        actor,
        action: AUDIT_ACTION.PROVIDER_STATUS_CHANGED,
        targetType: AUDIT_TARGET_TYPE.PROVIDER,
        targetId: provider._id,
        targetLabel: provider.name,
        details: { before: { status: existing.status }, after: { status } },
      });

      return provider;
    },
  });
}
