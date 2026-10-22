export const CREDIT_PACKAGES = [
  { id: 'topup-s', name: 'Top-up S', credits: 50000, price: 9 },
  {
    id: 'topup-m',
    name: 'Top-up M',
    credits: 150000,
    price: 24,
    popular: true,
  },
  { id: 'topup-l', name: 'Top-up L', credits: 400000, price: 59 },
  { id: 'topup-xl', name: 'Top-up XL', credits: 1000000, price: 129 },
];

export function formatPrice(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

export function pricePerThousand(creditPackage) {
  return formatPrice(
    Math.round((creditPackage.price / creditPackage.credits) * 100000) / 100,
  );
}
