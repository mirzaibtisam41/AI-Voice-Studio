import {
  ConflictError,
  isDuplicateKeyErrorUtil,
  runInTransactionUtil,
} from '#src/utils/index.js';
import { AI_PROVIDER_STATUS } from '#src/modules/ai-providers/ai-provider.constants.js';
import {
  AUDIT_ACTION,
  AUDIT_TARGET_TYPE,
} from '#src/modules/audit-logs/audit-log.constants.js';
import { recordAuditLogService } from '#src/modules/audit-logs/shared/services/index.js';
import { createAiProviderRepository } from '#src/modules/ai-providers/shared/repositories/index.js';

export async function createAiProviderService({ actor, data }) {
  const newProvider = {
    code: data.code.trim().toLowerCase(),
    name: data.name.trim(),
    description: data.description?.trim() || null,
    status: data.status ?? AI_PROVIDER_STATUS.ACTIVE,
  };

  try {
    return await runInTransactionUtil({
      work: async ({ session }) => {
        const provider = await createAiProviderRepository({
          session,
          data: newProvider,
        });

        await recordAuditLogService({
          session,
          actor,
          action: AUDIT_ACTION.PROVIDER_CREATED,
          targetType: AUDIT_TARGET_TYPE.PROVIDER,
          targetId: provider._id,
          targetLabel: provider.name,
          details: { after: newProvider },
        });

        return provider;
      },
    });
  } catch (error) {
    if (isDuplicateKeyErrorUtil({ error })) {
      throw new ConflictError('A provider with this code already exists');
    }

    throw error;
  }
}
