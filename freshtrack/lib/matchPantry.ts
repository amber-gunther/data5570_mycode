import type { PantryItem } from '@/store/pantrySlice';
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

function findPantryMatch(ingredient: RecipeIngredient, items: PantryItem[]) {
  const unitMatches = items.filter(
    (item) => namesMatch(ingredient.name, item.name) && unitsMatch(ingredient.unit, item.unit),
  );
  if (unitMatches.length > 0) {
    return { kind: 'unit' as const, item: unitMatches[0] };
  }

  const nameMatches = items.filter((item) => namesMatch(ingredient.name, item.name));
  if (nameMatches.length > 0) {
    return { kind: 'name' as const, item: nameMatches[0] };
  }

  return { kind: 'none' as const, item: null };
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

    const match = findPantryMatch(ingredient, items);
    if (match.kind === 'none' || !match.item) {
      lines.push({
        ingredientId: ingredient.id,
        kind: 'missing',
        message: 'Not in pantry',
      });
      continue;
    }

    if (match.kind === 'name') {
      lines.push({
        ingredientId: ingredient.id,
        kind: 'unit',
        message: `Pantry has ${match.item.unit}, recipe uses ${ingredient.unit}`,
      });
      continue;
    }

    const have = parseQty(match.item.quantity);
    if (!Number.isFinite(have)) {
      lines.push({
        ingredientId: ingredient.id,
        kind: 'invalid',
        message: 'Pantry quantity is not a number',
      });
      continue;
    }

    const alreadyReserved = reserved[match.item.id] ?? 0;
    const remaining = have - alreadyReserved;
    if (remaining + 1e-9 < needed) {
      lines.push({
        ingredientId: ingredient.id,
        kind: 'short',
        message: `Only ${formatQty(remaining)} ${match.item.unit} left`,
      });
      continue;
    }

    reserved[match.item.id] = alreadyReserved + needed;
    deductions.push({ id: match.item.id, amount: needed });
    lines.push({
      ingredientId: ingredient.id,
      kind: 'ok',
      message: 'Have',
    });
  }

  return {
    ok: lines.length > 0 && lines.every((line) => line.kind === 'ok'),
    deductions,
    lines,
  };
}
