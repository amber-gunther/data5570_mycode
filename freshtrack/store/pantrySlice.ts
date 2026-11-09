import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

import { API_URL } from '@/constants/api';

export type PantryItem = {
  id: number;
  name: string;
  quantity: string;
  unit: string;
  storage_zone: string;
  expiry_date: string | null;
  status: string;
};

export const demoPantry: PantryItem[] = [
  {
    id: 1,
    name: 'Milk',
    quantity: '4.00',
    unit: 'cup',
    storage_zone: 'fridge',
    expiry_date: '2026-10-15',
    status: 'active',
  },
  {
    id: 2,
    name: 'Eggs',
    quantity: '12.00',
    unit: 'count',
    storage_zone: 'fridge',
    expiry_date: '2026-10-20',
    status: 'active',
  },
  {
    id: 3,
    name: 'Frozen peas',
    quantity: '16.00',
    unit: 'oz',
    storage_zone: 'freezer',
    expiry_date: null,
    status: 'frozen',
  },
];

export function parsePantryItem(row: unknown): PantryItem {
  const item = row as Record<string, unknown>;
  return {
    id: Number(item.id),
    name: String(item.name ?? 'Unnamed'),
    quantity: String(item.quantity ?? ''),
    unit: String(item.unit ?? ''),
    storage_zone: String(item.storage_zone ?? 'pantry'),
    expiry_date: item.expiry_date ? String(item.expiry_date) : null,
    status: String(item.status ?? 'active'),
  };
}

export function isOnHand(item: PantryItem) {
  if (item.status === 'used_up' || item.status === 'thrown_out') {
    return false;
  }
  const quantity = Number(item.quantity);
  return Number.isFinite(quantity) ? quantity > 0 : true;
}

export function parsePantryItems(payload: unknown): PantryItem[] {
  if (!Array.isArray(payload)) {
    return demoPantry;
  }
  return payload.map(parsePantryItem).filter(isOnHand);
}

type PantryState = {
  items: PantryItem[];
  status: 'idle' | 'ready';
  nextLocalId: number;
};

function dropEmptyLots(state: PantryState) {
  state.items = state.items.filter(isOnHand);
}

const initialState: PantryState = {
  items: [],
  status: 'idle',
  nextLocalId: 100,
};

export const fetchPantry = createAsyncThunk('pantry/fetch', async () => {
  const response = await fetch(`${API_URL}/pantry/`);
  if (!response.ok) {
    throw new Error('Could not load pantry');
  }
  return parsePantryItems(await response.json());
});

export const createPantryItem = createAsyncThunk(
  'pantry/create',
  async (payload: {
    name: string;
    quantity: string;
    unit: string;
    storage_zone: string;
    expiry_date?: string | null;
  }) => {
    const response = await fetch(`${API_URL}/pantry/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: payload.name,
        quantity: payload.quantity,
        unit: payload.unit,
        storage_zone: payload.storage_zone,
        expiry_date: payload.expiry_date || null,
      }),
    });
    if (!response.ok) {
      throw new Error('Could not create pantry item');
    }
    return parsePantryItem(await response.json());
  },
);

export const patchPantryQuantity = createAsyncThunk(
  'pantry/patchQuantity',
  async ({ id, quantity }: { id: number; quantity: string }) => {
    const response = await fetch(`${API_URL}/pantry/${id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity }),
    });
    if (!response.ok) {
      throw new Error('Could not update quantity');
    }
    return parsePantryItem(await response.json());
  },
);

export const deletePantryItem = createAsyncThunk('pantry/delete', async (id: number) => {
  const response = await fetch(`${API_URL}/pantry/${id}/`, { method: 'DELETE' });
  if (!response.ok) {
    throw new Error('Could not delete pantry item');
  }
  return id;
});

export const cookRecipeOnServer = createAsyncThunk(
  'pantry/cook',
  async (deductions: { id: number; amount: number }[], { getState }) => {
    const state = getState() as { pantry: PantryState };
    const totals: Record<number, number> = {};
    for (const deduction of deductions) {
      totals[deduction.id] = (totals[deduction.id] ?? 0) + deduction.amount;
    }

    const updated: PantryItem[] = [];
    for (const [id, amount] of Object.entries(totals)) {
      const pantryId = Number(id);
      const current = state.pantry.items.find((row) => row.id === pantryId);
      if (!current) {
        continue;
      }
      const have = Number(current.quantity);
      const next = Math.max(0, Math.round((have - amount) * 100) / 100);
      const response = await fetch(`${API_URL}/pantry/${pantryId}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: String(next) }),
      });
      if (!response.ok) {
        throw new Error('Could not update pantry after cooking');
      }
      updated.push(parsePantryItem(await response.json()));
    }

    return updated;
  },
);

const pantrySlice = createSlice({
  name: 'pantry',
  initialState,
  reducers: {
    setItems(state, action: PayloadAction<PantryItem[]>) {
      state.items = action.payload;
      state.status = 'ready';
    },
    addItem(
      state,
      action: PayloadAction<Omit<PantryItem, 'id' | 'status'>>,
    ) {
      state.items.unshift({
        id: state.nextLocalId,
        status: 'active',
        expiry_date: action.payload.expiry_date ?? null,
        ...action.payload,
      });
      state.nextLocalId += 1;
    },
    removeItem(state, action: PayloadAction<number>) {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    adjustQuantity(state, action: PayloadAction<{ id: number; delta: number }>) {
      const item = state.items.find((row) => row.id === action.payload.id);
      if (!item) {
        return;
      }
      const current = Number(item.quantity);
      if (!Number.isFinite(current)) {
        return;
      }
      const next = Math.max(0, Math.round((current + action.payload.delta) * 100) / 100);
      item.quantity = String(next);
      if (next <= 0) {
        item.status = 'used_up';
      }
      dropEmptyLots(state);
    },
    useIngredients(state, action: PayloadAction<{ id: number; amount: number }[]>) {
      for (const deduction of action.payload) {
        const item = state.items.find((row) => row.id === deduction.id);
        if (!item) {
          continue;
        }
        const current = Number(item.quantity);
        if (!Number.isFinite(current)) {
          continue;
        }
        const next = Math.max(0, Math.round((current - deduction.amount) * 100) / 100);
        item.quantity = String(next);
        if (next <= 0) {
          item.status = 'used_up';
        }
      }
      dropEmptyLots(state);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPantry.fulfilled, (state, action) => {
        state.items = action.payload.filter(isOnHand);
        state.status = 'ready';
      })
      .addCase(fetchPantry.rejected, (state) => {
        if (state.status === 'idle') {
          state.items = demoPantry;
          state.status = 'ready';
        }
      })
      .addCase(createPantryItem.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        state.status = 'ready';
        dropEmptyLots(state);
      })
      .addCase(patchPantryQuantity.fulfilled, (state, action) => {
        const index = state.items.findIndex((row) => row.id === action.payload.id);
        if (index >= 0) {
          state.items[index] = action.payload;
        }
        dropEmptyLots(state);
      })
      .addCase(deletePantryItem.fulfilled, (state, action) => {
        state.items = state.items.filter((row) => row.id !== action.payload);
      })
      .addCase(cookRecipeOnServer.fulfilled, (state, action) => {
        for (const updated of action.payload) {
          const index = state.items.findIndex((row) => row.id === updated.id);
          if (index >= 0) {
            state.items[index] = updated;
          }
        }
        dropEmptyLots(state);
      });
  },
});

export const { setItems, addItem, removeItem, adjustQuantity, useIngredients } =
  pantrySlice.actions;
export default pantrySlice.reducer;
