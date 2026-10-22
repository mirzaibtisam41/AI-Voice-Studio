import { CAPABILITY_DETAILS } from '#src/constants/index.js';
import { AI_PROVIDER_STATUS } from '#src/modules/ai-providers/ai-provider.constants.js';
import { findActiveModelsWithCapabilityRepository } from '#src/modules/ai-models/shared/repositories/index.js';

export async function listPricedModelsService({ capability }) {
  const models = await findActiveModelsWithCapabilityRepository({
    capability,
  });

  return models
    .filter((model) => model.providerId?.status === AI_PROVIDER_STATUS.ACTIVE)
    .map((model) => {
      const settings = model.capabilities.find(
        (item) => item.code === capability,
      );

      return {
        model,
        provider: model.providerId,
        capability,
        unit: CAPABILITY_DETAILS[capability].unit,
        creditsPerUnit: settings.creditsPerUnit,
        isDefault: settings.isDefault,
      };
    });
}
