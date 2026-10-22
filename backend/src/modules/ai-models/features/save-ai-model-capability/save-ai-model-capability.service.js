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

function pickSettings({ capability }) {
  return {
    enabled: capability?.enabled ?? false,
    creditsPerUnit: capability?.creditsPerUnit ?? null,
  };
}

async function resolveIsDefault({ model, code, current, nextCapability }) {
  if (!current?.isDefault) return false;
  if (isCapabilityPricedUtil({ capability: nextCapability })) return true;
  if (model.status !== AI_MODEL_STATUS.ACTIVE) return false;

  const replacements = await findReplacementDefaultModelsService({
    model,
    capabilities: [code],
  });

  if (replacements.length > 0) {
    throw new ConflictError(
      `This model is the default for ${CAPABILITY_DETAILS[code].label}. Choose another default model first.`,
    );
  }

  return false;
}

export function saveAiModelCapabilityService({ actor, id, code, data }) {
  return runInTransactionUtil({
    work: async ({ session }) => {
      const model = await findAiModelByIdRepository({ session, id });

      if (!model) {
        throw new NotFoundError('Model not found');
      }

      const current = model.capabilities.find((item) => item.code === code);
      const nextCapability = {
        code,
        enabled: data.enabled,
        creditsPerUnit:
          data.creditsPerUnit === undefined
            ? (current?.creditsPerUnit ?? null)
            : data.creditsPerUnit,
      };

      if (nextCapability.enabled && !nextCapability.creditsPerUnit) {
        throw new BadRequestError(
          'Set the credits per unit before turning this capability on',
        );
      }

      nextCapability.isDefault = await resolveIsDefault({
        model,
        code,
        current,
        nextCapability,
      });

      const capabilities = current
        ? model.capabilities.map((item) =>
            item.code === code ? nextCapability : item.toObject(),
          )
        : [
            ...model.capabilities.map((item) => item.toObject()),
            nextCapability,
          ];

      if (
        model.status === AI_MODEL_STATUS.ACTIVE &&
        !capabilities.some((capability) =>
          isCapabilityPricedUtil({ capability }),
        )
      ) {
        throw new BadRequestError(
          'An active model needs at least one capability turned on. Disable the model first.',
        );
      }

      const updated = await updateAiModelRepository({
        session,
        id,
        data: { capabilities },
      });

      await recordAuditLogService({
        session,
        actor,
        action: AUDIT_ACTION.MODEL_CAPABILITY_UPDATED,
        targetType: AUDIT_TARGET_TYPE.MODEL,
        targetId: updated._id,
        targetLabel: updated.name,
        details: {
          capability: code,
          before: pickSettings({ capability: current }),
          after: pickSettings({ capability: nextCapability }),
        },
      });

      return updated;
    },
  });
}
