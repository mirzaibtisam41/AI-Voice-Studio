import { listPricedModelsService } from '#src/modules/ai-models/shared/services/list-priced-models.service.js';

export async function findReplacementDefaultModelsService({
  model,
  capabilities,
}) {
  const replacements = [];

  for (const capability of capabilities) {
    const pricedModels = await listPricedModelsService({ capability });
    const others = pricedModels.filter(
      (item) => !item.model._id.equals(model._id),
    );

    if (others.length > 0) {
      replacements.push({ capability, models: others });
    }
  }

  return replacements;
}
