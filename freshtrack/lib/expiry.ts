import type { PantryItem } from '@/store/pantrySlice';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function localDateISO(value = new Date()) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function startOfDay(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime();
}

export function daysUntilExpiry(expiry: string | null, today = new Date()) {
  if (!expiry) {
    return null;
  }
  const stamp = Date.parse(`${expiry}T00:00:00`);
  if (!Number.isFinite(stamp)) {
    return null;
  }
  return Math.round((stamp - startOfDay(today)) / MS_PER_DAY);
}

export function expiryBucket(item: PantryItem, today = new Date()) {
  const days = daysUntilExpiry(item.expiry_date, today);
  if (days === null) {
    return 'none' as const;
  }
  if (days < 0) {
    return 'past' as const;
  }
  if (days <= 2) {
    return 'critical' as const;
  }
  if (days <= 5) {
    return 'soon' as const;
  }
  return 'ok' as const;
}

export function sortByExpiry(items: PantryItem[]) {
  const rank = { past: 0, critical: 1, soon: 2, ok: 3, none: 4 };
  return [...items].sort((a, b) => {
    const left = expiryBucket(a);
    const right = expiryBucket(b);
    if (rank[left] !== rank[right]) {
      return rank[left] - rank[right];
    }
    return a.name.localeCompare(b.name);
  });
}

export function useSoonItems(items: PantryItem[], today = new Date()) {
  return items.filter((item) => {
    const bucket = expiryBucket(item, today);
    return bucket === 'past' || bucket === 'critical' || bucket === 'soon';
  });
}
