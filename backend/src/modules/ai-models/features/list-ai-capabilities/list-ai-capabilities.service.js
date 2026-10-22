import { AI_CAPABILITIES, CAPABILITY_DETAILS } from '#src/constants/index.js';

export function listAiCapabilitiesService() {
  return AI_CAPABILITIES.map((code) => ({
    code,
    label: CAPABILITY_DETAILS[code].label,
    unit: CAPABILITY_DETAILS[code].unit,
  }));
}
