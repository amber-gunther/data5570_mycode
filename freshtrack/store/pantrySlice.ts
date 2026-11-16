import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

import { supabase, throwIfError } from '@/lib/supabase';

export type PantryItem = {
  id: number;
  name: string;
  quantity: string;
  unit: string;
  storage_zone: string;
  expiry_date: string | null;
  bought_on: string | null;
  status: string;
};

export function parsePantryItem(row: unknown): PantryItem {
  const item = row as Record<string, unknown>;
  return {
    id: Number(item.id),
    name: String(item.name ?? 'Unnamed'),
    quantity: String(item.quantity ?? ''),
    unit: String(item.unit ?? ''),
    storage_zone: String(item.storage_zone ?? 'pantry'),
    expiry_date: item.expiry_date ? String(item.expiry_date) : null,
    bought_on: item.bought_on ? String(item.bought_on) : null,
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
    return [];
  }
  return payload.map(parsePantryItem).filter(isOnHand);
}

export type LotSnapshot = Pick<
  PantryItem,
  'id' | 'name' | 'quantity' | 'unit' | 'storage_zone' | 'expiry_date' | 'bought_on' | 'status'
>;

type PantryState = {
  items: PantryItem[];
  status: 'idle' | 'ready';
  nextLocalId: number;
  lastCook: LotSnapshot[] | null;
};

function dropEmptyLots(state: PantryState) {
  state.items = state.items.filter(isOnHand);
}

const initialState: PantryState = {
  items: [],
  status: 'idle',
  nextLocalId: 100,
  lastCook: null,
};

export const fetchPantry = createAsyncThunk('pantry/fetch', async () => {
  const { data, error } = await supabase.from('pantry').select('*');
  throwIfError(error);
  return parsePantryItems(data ?? []);
});

export const createPantryItem = createAsyncThunk(
  'pantry/create',
  async (payload: {
    name: string;
    quantity: string;
    unit: string;
    storage_zone: string;
    expiry_date?: string | null;
    bought_on?: string | null;
  }) => {
    const { data, error } = await supabase
      .from('pantry')
      .insert({
        name: payload.name,
        quantity: payload.quantity,
        unit: payload.unit,
        storage_zone: payload.storage_zone,
        expiry_date: payload.expiry_date || null,
        bought_on: payload.bought_on || null,
      })
      .select()
      .single();
    throwIfError(error);
    return parsePantryItem(data);
  },
);

export const patchPantryQuantity = createAsyncThunk(
  'pantry/patchQuantity',
  async ({ id, quantity }: { id: number; quantity: string }) => {
    const { data, error } = await supabase
      .from('pantry')
      .update({ quantity })
      .eq('id', id)
      .select()
      .single();
    throwIfError(error);
    return parsePantryItem(data);
  },
);

export const patchPantryStatus = createAsyncThunk(
  'pantry/patchStatus',
  async ({ id, status }: { id: number; status: string }) => {
    const { data, error } = await supabase
      .from('pantry')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    throwIfError(error);
    return parsePantryItem(data);
  },
);

export const deletePantryItem = createAsyncThunk('pantry/delete', async (id: number) => {
  const { error } = await supabase.from('pantry').delete().eq('id', id);
  throwIfError(error);
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

    const restores: LotSnapshot[] = [];
    const updated: PantryItem[] = [];
    for (const [id, amount] of Object.entries(totals)) {
      const pantryId = Number(id);
      const current = state.pantry.items.find((row) => row.id === pantryId);
      if (!current) {
        continue;
      }
      restores.push({
        id: current.id,
        name: current.name,
        quantity: current.quantity,
        unit: current.unit,
        storage_zone: current.storage_zone,
        expiry_date: current.expiry_date,
        bought_on: current.bought_on,
        status: current.status,
      });
      const have = Number(current.quantity);
      const next = Math.max(0, Math.round((have - amount) * 100) / 100);
      const { data, error } = await supabase
        .from('pantry')
        .update({ quantity: String(next) })
        .eq('id', pantryId)
        .select()
        .single();
      throwIfError(error);
      updated.push(parsePantryItem(data));
    }

    return { updated, restores };
  },
);

export const undoLastCookOnServer = createAsyncThunk(
  'pantry/undoCook',
  async (_: void, { getState }) => {
    const state = getState() as { pantry: PantryState };
    const restores = state.pantry.lastCook ?? [];
    const updated: PantryItem[] = [];
    for (const snapshot of restores) {
      const { data, error } = await supabase
        .from('pantry')
        .update({
          quantity: snapshot.quantity,
          status: snapshot.status,
        })
        .eq('id', snapshot.id)
        .select()
        .single();
      throwIfError(error);
      updated.push(parsePantryItem(data));
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
        bought_on: action.payload.bought_on ?? null,
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
      const restores: LotSnapshot[] = [];
      for (const deduction of action.payload) {
        const item = state.items.find((row) => row.id === deduction.id);
        if (!item) {
          continue;
        }
        restores.push({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          storage_zone: item.storage_zone,
          expiry_date: item.expiry_date,
          bought_on: item.bought_on,
          status: item.status,
        });
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
      if (restores.length > 0) {
        state.lastCook = restores;
      }
      dropEmptyLots(state);
    },
    markThrownOut(state, action: PayloadAction<number>) {
      const item = state.items.find((row) => row.id === action.payload);
      if (item) {
        item.status = 'thrown_out';
      }
      dropEmptyLots(state);
    },
    restoreLots(state, action: PayloadAction<LotSnapshot[]>) {
      for (const snapshot of action.payload) {
        const item = state.items.find((row) => row.id === snapshot.id);
        if (item) {
          item.quantity = snapshot.quantity;
          item.status = snapshot.status;
        } else {
          state.items.unshift({ ...snapshot });
        }
      }
      state.lastCook = null;
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
          state.items = [];
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
      .addCase(patchPantryStatus.fulfilled, (state, action) => {
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
        for (const updated of action.payload.updated) {
          const index = state.items.findIndex((row) => row.id === updated.id);
          if (index >= 0) {
            state.items[index] = updated;
          }
        }
        state.lastCook = action.payload.restores;
        dropEmptyLots(state);
      })
      .addCase(undoLastCookOnServer.fulfilled, (state, action) => {
        for (const updated of action.payload) {
          const index = state.items.findIndex((row) => row.id === updated.id);
          if (index >= 0) {
            state.items[index] = updated;
          } else {
            state.items.unshift(updated);
          }
        }
        state.lastCook = null;
        dropEmptyLots(state);
      });
  },
});

export const {
  setItems,
  addItem,
  removeItem,
  adjustQuantity,
  useIngredients,
  markThrownOut,
  restoreLots,
} = pantrySlice.actions;
export default pantrySlice.reducer;
