import {
  ConflictError,
  NotFoundError,
  runInTransactionUtil,
} from '#src/utils/index.js';
import {
  AUDIT_ACTION,
  AUDIT_TARGET_TYPE,
} from '#src/modules/audit-logs/audit-log.constants.js';
import { recordAuditLogService } from '#src/modules/audit-logs/shared/services/index.js';
import {
  deleteAiProviderRepository,
  findAiProviderByIdRepository,
} from '#src/modules/ai-providers/shared/repositories/index.js';
import { countProviderAiModelsRepository } from '#src/modules/ai-models/shared/repositories/index.js';

export function deleteAiProviderService({ actor, id }) {
  return runInTransactionUtil({
    work: async ({ session }) => {
      const provider = await findAiProviderByIdRepository({ session, id });

      if (!provider) {
        throw new NotFoundError('Provider not found');
      }

      const modelsCount = await countProviderAiModelsRepository({
        session,
        providerId: provider._id,
      });

      if (modelsCount > 0) {
        throw new ConflictError(
          'This provider has models and cannot be deleted. Disable it instead.',
        );
      }

      await deleteAiProviderRepository({ session, id });

      await recordAuditLogService({
        session,
        actor,
        action: AUDIT_ACTION.PROVIDER_DELETED,
        targetType: AUDIT_TARGET_TYPE.PROVIDER,
        targetId: provider._id,
        targetLabel: provider.name,
        details: {
          before: {
            name: provider.name,
            code: provider.code,
            status: provider.status,
          },
        },
      });
    },
  });
}
