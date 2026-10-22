import { CAPABILITY_DETAILS } from '#src/constants/index.js';
import {
  BadRequestError,
  NotFoundError,
  runInTransactionUtil,
} from '#src/utils/index.js';
import { AI_MODEL_STATUS } from '#src/modules/ai-models/ai-model.constants.js';
import { AI_PROVIDER_STATUS } from '#src/modules/ai-providers/ai-provider.constants.js';
import {
  AUDIT_ACTION,
  AUDIT_TARGET_TYPE,
} from '#src/modules/audit-logs/audit-log.constants.js';
import { recordAuditLogService } from '#src/modules/audit-logs/shared/services/index.js';
import {
  findAiModelByIdRepository,
  findCapabilityDefaultModelRepository,
  setAiModelCapabilityDefaultRepository,
  unsetCapabilityDefaultOnOtherModelsRepository,
} from '#src/modules/ai-models/shared/repositories/index.js';
import { isCapabilityPricedUtil } from '#src/modules/ai-models/shared/utils/index.js';

function checkModelCanBeDefault({ model, code }) {
  if (model.status !== AI_MODEL_STATUS.ACTIVE) {
    throw new BadRequestError(
      'Activate this model before making it the default',
    );
  }

  if (model.providerId?.status !== AI_PROVIDER_STATUS.ACTIVE) {
    throw new BadRequestError(
      'Activate this model provider before making it the default',
    );
  }

  const capability = model.capabilities.find((item) => item.code === code);

  if (!isCapabilityPricedUtil({ capability })) {
    throw new BadRequestError(
      `Turn on and price ${CAPABILITY_DETAILS[code].label} for this model before making it the default`,
    );
  }
}

export function setAiModelCapabilityDefaultService({ actor, id, code }) {
  return runInTransactionUtil({
    work: async ({ session }) => {
      const model = await findAiModelByIdRepository({ session, id });

      if (!model) {
        throw new NotFoundError('Model not found');
      }

      checkModelCanBeDefault({ model, code });

      const previous = await findCapabilityDefaultModelRepository({
        session,
        capability: code,
        exceptModelId: model._id,
      });

      await unsetCapabilityDefaultOnOtherModelsRepository({
        session,
        capability: code,
        exceptModelId: model._id,
      });

      const updated = await setAiModelCapabilityDefaultRepository({
        session,
        id,
        capability: code,
      });

      await recordAuditLogService({
        session,
        actor,
        action: AUDIT_ACTION.MODEL_DEFAULT_CHANGED,
        targetType: AUDIT_TARGET_TYPE.MODEL,
        targetId: updated._id,
        targetLabel: updated.name,
        details: {
          capability: code,
          before: previous
            ? { modelId: previous._id.toString(), modelName: previous.name }
            : null,
          after: { modelId: updated._id.toString(), modelName: updated.name },
        },
      });

      return updated;
    },
  });
}
