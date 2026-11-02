import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

import { API_URL } from '@/constants/api';

export type RecipeIngredient = {
  id: number;
  name: string;
  quantity: string;
  unit: string;
};

export type Recipe = {
  id: number;
  title: string;
  notes: string;
  servings: number;
  ingredients: RecipeIngredient[];
};

export const demoRecipes: Recipe[] = [
  {
    id: 2,
    title: 'Scrambled eggs',
    notes: 'Beat eggs with a splash of milk and cook in a buttered pan.',
    servings: 1,
    ingredients: [
      { id: 1, name: 'Eggs', quantity: '2', unit: 'count' },
      { id: 2, name: 'Milk', quantity: '0.25', unit: 'cup' },
    ],
  },
  {
    id: 1,
    title: 'Peanut butter and jelly sandwich',
    notes: 'Spread peanut butter and jelly on bread, then close the sandwich.',
    servings: 1,
    ingredients: [
      { id: 3, name: 'Bread', quantity: '2', unit: 'slices' },
      { id: 4, name: 'Peanut butter', quantity: '2', unit: 'Tbsp' },
      { id: 5, name: 'Jelly/Jam', quantity: '1', unit: 'Tbsp' },
    ],
  },
];

export function parseRecipes(payload: unknown): Recipe[] {
  if (!Array.isArray(payload)) {
    return demoRecipes;
  }

  return payload.map((row) => {
    const item = row as Record<string, unknown>;
    const rawIngredients = Array.isArray(item.ingredients) ? item.ingredients : [];
    return {
      id: Number(item.id),
      title: String(item.title ?? 'Untitled recipe'),
      notes: String(item.notes ?? ''),
      servings: Number(item.servings ?? 1),
      ingredients: rawIngredients.map((line) => {
        const ingredient = line as Record<string, unknown>;
        return {
          id: Number(ingredient.id),
          name: String(ingredient.name ?? ''),
          quantity: String(ingredient.quantity ?? ''),
          unit: String(ingredient.unit ?? ''),
        };
      }),
    };
  });
}

type RecipesState = {
  items: Recipe[];
  status: 'idle' | 'ready';
};

const initialState: RecipesState = {
  items: [],
  status: 'idle',
};

export const fetchRecipes = createAsyncThunk('recipes/fetch', async () => {
  const response = await fetch(`${API_URL}/recipes/`);
  if (!response.ok) {
    throw new Error('Could not load recipes');
  }
  return parseRecipes(await response.json());
});

const recipesSlice = createSlice({
  name: 'recipes',
  initialState,
  reducers: {
    setRecipes(state, action: PayloadAction<Recipe[]>) {
      state.items = action.payload;
      state.status = 'ready';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecipes.fulfilled, (state, action) => {
        state.items = action.payload;
        state.status = 'ready';
      })
      .addCase(fetchRecipes.rejected, (state) => {
        if (state.status === 'idle') {
          state.items = demoRecipes;
          state.status = 'ready';
        }
      });
  },
});

export const { setRecipes } = recipesSlice.actions;
export default recipesSlice.reducer;
