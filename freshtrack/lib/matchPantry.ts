import type { PantryItem } from '@/store/pantrySlice';

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

export function pantryHasIngredient(ingredientName: string, items: PantryItem[]) {
  const wanted = normalize(ingredientName);
  if (!wanted) {
    return false;
  }

  return items.some((item) => {
    const have = normalize(item.name);
    return have === wanted || have.includes(wanted) || wanted.includes(have);
  });
}
