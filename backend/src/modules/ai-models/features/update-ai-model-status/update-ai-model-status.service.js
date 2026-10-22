import { CAPABILITY_DETAILS } from '#src/constants/index.js';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  runInTransactionUtil,
} from '#src/utils/index.js';
import { AI_MODEL_STATUS } from '#src/modules/ai-models/ai-model.constants.js';
import {
  AUDIT_ACTION,
  AUDIT_TARGET_TYPE,
} from '#src/modules/audit-logs/audit-log.constants.js';
import { recordAuditLogService } from '#src/modules/audit-logs/shared/services/index.js';
import {
  findAiModelByIdRepository,
  updateAiModelRepository,
} from '#src/modules/ai-models/shared/repositories/index.js';
import { findReplacementDefaultModelsService } from '#src/modules/ai-models/shared/services/index.js';
import { isCapabilityPricedUtil } from '#src/modules/ai-models/shared/utils/index.js';

function checkModelCanBeActivated({ model }) {
  const hasPricedCapability = model.capabilities.some((capability) =>
    isCapabilityPricedUtil({ capability }),
  );

  if (!hasPricedCapability) {
    throw new BadRequestError(
      'Turn on and price at least one capability before activating this model',
    );
  }
}

async function releaseDefaults({ model }) {
  const defaultCodes = model.capabilities
    .filter((capability) => capability.isDefault)
    .map((capability) => capability.code);

  if (defaultCodes.length === 0) return null;

  const replacements = await findReplacementDefaultModelsService({
    model,
    capabilities: defaultCodes,
  });

  if (replacements.length > 0) {
    const labels = replacements
      .map((item) => CAPABILITY_DETAILS[item.capability].label)
      .join(', ');

    throw new ConflictError(
      `This model is the default for ${labels}. Choose another default model first.`,
    );
  }

  return model.capabilities.map((capability) => ({
    ...capability.toObject(),
    isDefault: false,
  }));
}

export function updateAiModelStatusService({ actor, id, status }) {
  return runInTransactionUtil({
    work: async ({ session }) => {
      const model = await findAiModelByIdRepository({ session, id });

      if (!model) {
        throw new NotFoundError('Model not found');
      }

      const changes = { status };

      if (status === AI_MODEL_STATUS.ACTIVE) {
        checkModelCanBeActivated({ model });
      } else {
        const capabilities = await releaseDefaults({ model });

        if (capabilities) changes.capabilities = capabilities;
      }

      const updated = await updateAiModelRepository({
        session,
        id,
        data: changes,
      });

      await recordAuditLogService({
        session,
        actor,
        action: AUDIT_ACTION.MODEL_STATUS_CHANGED,
        targetType: AUDIT_TARGET_TYPE.MODEL,
        targetId: updated._id,
        targetLabel: updated.name,
        details: { before: { status: model.status }, after: { status } },
      });

      return updated;
    },
  });
}
