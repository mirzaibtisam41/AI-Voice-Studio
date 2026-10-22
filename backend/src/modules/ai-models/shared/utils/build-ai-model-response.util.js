import { AI_CAPABILITIES, CAPABILITY_DETAILS } from '#src/constants/index.js';

function buildProvider({ provider }) {
  if (!provider?.name) return null;

  return {
    id: provider._id.toString(),
    name: provider.name,
    code: provider.code,
    status: provider.status,
  };
}

export function buildAiModelResponseUtil({ model }) {
  const provider = buildProvider({ provider: model.providerId });

  return {
    id: model._id.toString(),
    providerId: provider?.id ?? model.providerId?.toString() ?? null,
    provider,
    name: model.name,
    slug: model.slug,
    providerModelId: model.providerModelId,
    description: model.description,
    status: model.status,
    capabilities: AI_CAPABILITIES.map((code) => {
      const settings = model.capabilities.find((item) => item.code === code);

      return {
        code,
        label: CAPABILITY_DETAILS[code].label,
        unit: CAPABILITY_DETAILS[code].unit,
        enabled: settings?.enabled ?? false,
        creditsPerUnit: settings?.creditsPerUnit ?? null,
        isDefault: settings?.isDefault ?? false,
        configured: Boolean(settings),
      };
    }),
    createdAt: model.createdAt,
    updatedAt: model.updatedAt,
  };
}
