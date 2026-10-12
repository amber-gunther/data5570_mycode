import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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
    quantity: '1.00',
    unit: 'gallon',
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

type PantryState = {
  items: PantryItem[];
  status: 'idle' | 'ready';
  nextLocalId: number;
};

const initialState: PantryState = {
  items: [],
  status: 'idle',
  nextLocalId: 100,
};

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
      action: PayloadAction<Omit<PantryItem, 'id' | 'status' | 'expiry_date'>>,
    ) {
      state.items.unshift({
        id: state.nextLocalId,
        status: 'active',
        expiry_date: null,
        ...action.payload,
      });
      state.nextLocalId += 1;
    },
    removeItem(state, action: PayloadAction<number>) {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
  },
});

export const { setItems, addItem, removeItem } = pantrySlice.actions;
export default pantrySlice.reducer;
