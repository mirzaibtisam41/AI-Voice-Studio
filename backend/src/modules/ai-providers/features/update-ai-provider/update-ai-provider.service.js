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

function buildChanges({ data }) {
  const changes = {};

  if (data.name !== undefined) changes.name = data.name.trim();
  if (data.description !== undefined) {
    changes.description = data.description?.trim() || null;
  }

  return changes;
}

export function updateAiProviderService({ actor, id, data }) {
  const changes = buildChanges({ data });

  return runInTransactionUtil({
    work: async ({ session }) => {
      const existing = await findAiProviderByIdRepository({ session, id });

      if (!existing) {
        throw new NotFoundError('Provider not found');
      }

      const changedFields = Object.keys(changes).filter(
        (field) => existing[field] !== changes[field],
      );

      if (changedFields.length === 0) return existing;

      const after = Object.fromEntries(
        changedFields.map((field) => [field, changes[field]]),
      );
      const provider = await updateAiProviderRepository({
        session,
        id,
        data: after,
      });

      await recordAuditLogService({
        session,
        actor,
        action: AUDIT_ACTION.PROVIDER_UPDATED,
        targetType: AUDIT_TARGET_TYPE.PROVIDER,
        targetId: provider._id,
        targetLabel: provider.name,
        details: {
          before: Object.fromEntries(
            changedFields.map((field) => [field, existing[field]]),
          ),
          after,
        },
      });

      return provider;
    },
  });
}
