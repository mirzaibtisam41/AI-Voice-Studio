export function isCapabilityPricedUtil({ capability }) {
  return Boolean(capability?.enabled && capability.creditsPerUnit >= 1);
}
