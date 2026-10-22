import { PRICING_UNIT } from '#src/constants/index.js';

export function calculateCreditsUtil({ unit, creditsPerUnit, quantity }) {
  if (!quantity || quantity <= 0) return 0;

  if (unit === PRICING_UNIT.PER_100_CHARACTERS) {
    return Math.ceil(quantity / 100) * creditsPerUnit;
  }

  if (unit === PRICING_UNIT.PER_MINUTE) {
    return Math.ceil(quantity / 60) * creditsPerUnit;
  }

  return Math.ceil(quantity) * creditsPerUnit;
}
