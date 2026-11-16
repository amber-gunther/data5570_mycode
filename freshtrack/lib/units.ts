const VOLUME_TO_TSP: Record<string, number> = {
  tsp: 1,
  teaspoon: 1,
  teaspoons: 1,
  tbsp: 3,
  tablespoon: 3,
  tablespoons: 3,
  floz: 6,
  'fl oz': 6,
  cup: 48,
  cups: 48,
  pint: 96,
  pints: 96,
  quart: 192,
  quarts: 192,
  gallon: 768,
  gallons: 768,
  ml: 0.202884,
  milliliter: 0.202884,
  milliliters: 0.202884,
  liter: 202.884,
  liters: 202.884,
  l: 202.884,
};

const WEIGHT_TO_G: Record<string, number> = {
  g: 1,
  gram: 1,
  grams: 1,
  kg: 1000,
  kilogram: 1000,
  kilograms: 1000,
  oz: 28.3495,
  ounce: 28.3495,
  ounces: 28.3495,
  lb: 453.592,
  lbs: 453.592,
  pound: 453.592,
  pounds: 453.592,
};

const COUNT_ALIASES = new Set([
  'count',
  'each',
  'egg',
  'eggs',
  'slice',
  'slices',
  'piece',
  'pieces',
  'item',
  'items',
]);

function key(unit: string) {
  return unit.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

export function unitsMatch(a: string, b: string) {
  return convertQuantity(1, a, b) !== null;
}

export function convertQuantity(amount: number, fromUnit: string, toUnit: string): number | null {
  const from = key(fromUnit);
  const to = key(toUnit);
  if (!from || !to) {
    return null;
  }
  if (from === to) {
    return amount;
  }
  if (COUNT_ALIASES.has(from) && COUNT_ALIASES.has(to)) {
    return amount;
  }
  if (from in VOLUME_TO_TSP && to in VOLUME_TO_TSP) {
    return (amount * VOLUME_TO_TSP[from]) / VOLUME_TO_TSP[to];
  }
  if (from in WEIGHT_TO_G && to in WEIGHT_TO_G) {
    return (amount * WEIGHT_TO_G[from]) / WEIGHT_TO_G[to];
  }
  return null;
}
