import { formatQty, namesMatch, parseQty } from '@/lib/matchPantry';
import { convertQuantity } from '@/lib/units';
import { isOnHand, type PantryItem } from '@/store/pantrySlice';
import type { Recipe } from '@/store/recipesSlice';

export type ShopLine = {
  name: string;
  unit: string;
  need: number;
  have: number;
  buy: number;
  recipeTitles: string[];
};

function pantryHave(name: string, unit: string, items: PantryItem[]) {
  let total = 0;
  for (const item of items) {
    if (!isOnHand(item) || !namesMatch(name, item.name)) {
      continue;
    }
    const qty = parseQty(item.quantity);
    if (!Number.isFinite(qty)) {
      continue;
    }
    const converted = convertQuantity(qty, item.unit, unit);
    if (converted === null) {
      continue;
    }
    total += converted;
  }
  return total;
}

export function shopList(recipes: Recipe[], items: PantryItem[]): ShopLine[] {
  const buckets: Record<string, ShopLine> = {};

  for (const recipe of recipes) {
    for (const ingredient of recipe.ingredients) {
      const need = parseQty(ingredient.quantity);
      if (!Number.isFinite(need) || need <= 0) {
        continue;
      }
      const key = `${ingredient.name.toLowerCase()}|${ingredient.unit.toLowerCase()}`;
      const existing = buckets[key];
      if (existing) {
        existing.need += need;
        if (!existing.recipeTitles.includes(recipe.title)) {
          existing.recipeTitles.push(recipe.title);
        }
      } else {
        buckets[key] = {
          name: ingredient.name,
          unit: ingredient.unit,
          need,
          have: pantryHave(ingredient.name, ingredient.unit, items),
          buy: 0,
          recipeTitles: [recipe.title],
        };
      }
    }
  }

  return Object.values(buckets)
    .map((line) => ({
      ...line,
      need: Math.round(line.need * 100) / 100,
      have: Math.round(line.have * 100) / 100,
      buy: Math.max(0, Math.round((line.need - line.have) * 100) / 100),
    }))
    .filter((line) => line.buy > 0)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function formatShopQty(line: ShopLine) {
  return `${formatQty(line.buy)} ${line.unit}`;
}
