import {
  BadRequestError,
  ConflictError,
  isDuplicateKeyErrorUtil,
  runInTransactionUtil,
} from '#src/utils/index.js';
import { AI_MODEL_STATUS } from '#src/modules/ai-models/ai-model.constants.js';
import {
  AUDIT_ACTION,
  AUDIT_TARGET_TYPE,
} from '#src/modules/audit-logs/audit-log.constants.js';
import { recordAuditLogService } from '#src/modules/audit-logs/shared/services/index.js';
import { findAiProviderByIdRepository } from '#src/modules/ai-providers/shared/repositories/index.js';
import { createAiModelRepository } from '#src/modules/ai-models/shared/repositories/index.js';

export async function createAiModelService({ actor, data }) {
  const newModel = {
    providerId: data.providerId,
    name: data.name.trim(),
    slug: data.slug.trim().toLowerCase(),
    providerModelId: data.providerModelId.trim(),
    description: data.description?.trim() || null,
    status: AI_MODEL_STATUS.DRAFT,
    capabilities: [],
  };

  try {
    return await runInTransactionUtil({
      work: async ({ session }) => {
        const provider = await findAiProviderByIdRepository({
          session,
          id: newModel.providerId,
        });

        if (!provider) {
          throw new BadRequestError('The selected provider does not exist');
        }

        const model = await createAiModelRepository({
          session,
          data: newModel,
        });

        await recordAuditLogService({
          session,
          actor,
          action: AUDIT_ACTION.MODEL_CREATED,
          targetType: AUDIT_TARGET_TYPE.MODEL,
          targetId: model._id,
          targetLabel: model.name,
          details: {
            after: {
              providerId: newModel.providerId,
              name: newModel.name,
              slug: newModel.slug,
              providerModelId: newModel.providerModelId,
              description: newModel.description,
            },
          },
        });

        return model;
      },
    });
  } catch (error) {
    if (isDuplicateKeyErrorUtil({ error })) {
      throw new ConflictError('A model with this slug already exists');
    }

    throw error;
  }
}
