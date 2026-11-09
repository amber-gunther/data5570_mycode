import type { PantryItem } from '@/store/pantrySlice';
import { isOnHand } from '@/store/pantrySlice';
import type { Recipe, RecipeIngredient } from '@/store/recipesSlice';

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

export function namesMatch(a: string, b: string) {
  const left = normalize(a);
  const right = normalize(b);
  if (!left || !right) {
    return false;
  }
  return left === right || left.includes(right) || right.includes(left);
}

export function unitsMatch(a: string, b: string) {
  return normalize(a) === normalize(b);
}

export function parseQty(value: string) {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : NaN;
}

export function formatQty(value: number) {
  const rounded = Math.round(value * 100) / 100;
  return String(rounded);
}

export function pantryHasIngredient(ingredientName: string, items: PantryItem[]) {
  return items.some((item) => namesMatch(ingredientName, item.name));
}

export type LineCheck = {
  ingredientId: number;
  kind: 'ok' | 'missing' | 'unit' | 'short' | 'invalid';
  message: string;
};

export type CookPlan = {
  ok: boolean;
  deductions: { id: number; amount: number }[];
  lines: LineCheck[];
};

function expirySortValue(item: PantryItem) {
  if (!item.expiry_date) {
    return Number.MAX_SAFE_INTEGER;
  }
  const stamp = Date.parse(item.expiry_date);
  return Number.isFinite(stamp) ? stamp : Number.MAX_SAFE_INTEGER;
}

function fifoLots(ingredient: RecipeIngredient, items: PantryItem[]) {
  return items
    .filter(
      (item) =>
        isOnHand(item) &&
        namesMatch(ingredient.name, item.name) &&
        unitsMatch(ingredient.unit, item.unit),
    )
    .sort((a, b) => {
      const byDate = expirySortValue(a) - expirySortValue(b);
      return byDate !== 0 ? byDate : a.id - b.id;
    });
}

export function planCook(recipe: Recipe, items: PantryItem[]): CookPlan {
  const reserved: Record<number, number> = {};
  const deductions: { id: number; amount: number }[] = [];
  const lines: LineCheck[] = [];

  for (const ingredient of recipe.ingredients) {
    const needed = parseQty(ingredient.quantity);
    if (!Number.isFinite(needed) || needed <= 0) {
      lines.push({
        ingredientId: ingredient.id,
        kind: 'invalid',
        message: 'Quantity is not a number',
      });
      continue;
    }

    const lots = fifoLots(ingredient, items);
    if (lots.length === 0) {
      const nameOnly = items.filter(
        (item) => isOnHand(item) && namesMatch(ingredient.name, item.name),
      );
      if (nameOnly.length > 0) {
        lines.push({
          ingredientId: ingredient.id,
          kind: 'unit',
          message: `Pantry has ${nameOnly[0].unit}, recipe uses ${ingredient.unit}`,
        });
      } else {
        lines.push({
          ingredientId: ingredient.id,
          kind: 'missing',
          message: 'Not in pantry',
        });
      }
      continue;
    }

    let remainingNeed = needed;
    const lineDeductions: { id: number; amount: number }[] = [];
    let available = 0;

    for (const lot of lots) {
      const have = parseQty(lot.quantity);
      if (!Number.isFinite(have)) {
        continue;
      }
      const leftover = have - (reserved[lot.id] ?? 0);
      if (leftover <= 0) {
        continue;
      }
      available += leftover;
      const take = Math.min(leftover, remainingNeed);
      if (take > 0) {
        lineDeductions.push({ id: lot.id, amount: take });
        remainingNeed = Math.round((remainingNeed - take) * 100) / 100;
      }
      if (remainingNeed <= 1e-9) {
        break;
      }
    }

    if (remainingNeed > 1e-9) {
      lines.push({
        ingredientId: ingredient.id,
        kind: 'short',
        message: `Only ${formatQty(available)} ${ingredient.unit} left across lots`,
      });
      continue;
    }

    for (const deduction of lineDeductions) {
      reserved[deduction.id] = (reserved[deduction.id] ?? 0) + deduction.amount;
      deductions.push(deduction);
    }
    lines.push({
      ingredientId: ingredient.id,
      kind: 'ok',
      message: lots.length > 1 ? 'Have (use oldest first)' : 'Have',
    });
  }

  return {
    ok: lines.length > 0 && lines.every((line) => line.kind === 'ok'),
    deductions,
    lines,
  };
}
