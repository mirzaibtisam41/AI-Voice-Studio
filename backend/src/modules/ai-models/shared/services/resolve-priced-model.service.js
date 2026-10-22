import { CAPABILITY_DETAILS } from '#src/constants/index.js';
import { BadRequestError, ServiceUnavailableError } from '#src/utils/index.js';
import { listPricedModelsService } from '#src/modules/ai-models/shared/services/list-priced-models.service.js';

export async function resolvePricedModelService({ capability, modelId }) {
  const pricedModels = await listPricedModelsService({ capability });
  const label = CAPABILITY_DETAILS[capability].label;

  if (pricedModels.length === 0) {
    throw new ServiceUnavailableError(
      `${label} is not available right now, please try again later`,
    );
  }

  if (modelId) {
    const chosen = pricedModels.find(
      (item) => item.model._id.toString() === modelId,
    );

    if (!chosen) {
      throw new BadRequestError(`This model is not available for ${label}`);
    }

    return chosen;
  }

  return pricedModels.find((item) => item.isDefault) ?? pricedModels[0];
}
