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

export type RecipeDraft = {
  title: string;
  notes: string;
  servings: number;
  ingredients: { name: string; quantity: string; unit: string }[];
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

function parseRecipe(row: unknown): Recipe {
  const item = row as Record<string, unknown>;
  const rawIngredients = Array.isArray(item.ingredients) ? item.ingredients : [];
  return {
    id: Number(item.id),
    title: String(item.title ?? 'Untitled recipe'),
    notes: String(item.notes ?? ''),
    servings: Number(item.servings ?? 1),
    ingredients: rawIngredients.map((line, index) => {
      const ingredient = line as Record<string, unknown>;
      return {
        id: Number(ingredient.id ?? index + 1),
        name: String(ingredient.name ?? ''),
        quantity: String(ingredient.quantity ?? ''),
        unit: String(ingredient.unit ?? ''),
      };
    }),
  };
}

export function parseRecipes(payload: unknown): Recipe[] {
  if (!Array.isArray(payload)) {
    return [];
  }
  return payload.map(parseRecipe);
}

type RecipesState = {
  items: Recipe[];
  status: 'idle' | 'ready';
  selectedIds: number[];
  nextLocalId: number;
};

const initialState: RecipesState = {
  items: [],
  status: 'idle',
  selectedIds: [],
  nextLocalId: 500,
};

export const fetchRecipes = createAsyncThunk('recipes/fetch', async () => {
  const response = await fetch(`${API_URL}/recipes/`);
  if (!response.ok) {
    throw new Error('Could not load recipes');
  }
  const payload = await response.json();
  if (!Array.isArray(payload)) {
    throw new Error('Could not load recipes');
  }
  return parseRecipes(payload);
});

export const createRecipe = createAsyncThunk('recipes/create', async (draft: RecipeDraft) => {
  const response = await fetch(`${API_URL}/recipes/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(draft),
  });
  if (!response.ok) {
    throw new Error('Could not create recipe');
  }
  return parseRecipe(await response.json());
});

export const updateRecipe = createAsyncThunk(
  'recipes/update',
  async ({ id, draft }: { id: number; draft: RecipeDraft }) => {
    const response = await fetch(`${API_URL}/recipes/${id}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(draft),
    });
    if (!response.ok) {
      throw new Error('Could not update recipe');
    }
    return parseRecipe(await response.json());
  },
);

export const deleteRecipe = createAsyncThunk('recipes/delete', async (id: number) => {
  const response = await fetch(`${API_URL}/recipes/${id}/`, { method: 'DELETE' });
  if (!response.ok) {
    throw new Error('Could not delete recipe');
  }
  return id;
});

const recipesSlice = createSlice({
  name: 'recipes',
  initialState,
  reducers: {
    setRecipes(state, action: PayloadAction<Recipe[]>) {
      state.items = action.payload;
      state.status = 'ready';
    },
    toggleSelected(state, action: PayloadAction<number>) {
      if (state.selectedIds.includes(action.payload)) {
        state.selectedIds = state.selectedIds.filter((id) => id !== action.payload);
      } else {
        state.selectedIds.push(action.payload);
      }
    },
    addRecipeLocal(state, action: PayloadAction<RecipeDraft>) {
      state.items.unshift({
        id: state.nextLocalId,
        title: action.payload.title,
        notes: action.payload.notes,
        servings: action.payload.servings,
        ingredients: action.payload.ingredients.map((line, index) => ({
          id: state.nextLocalId * 10 + index,
          ...line,
        })),
      });
      state.nextLocalId += 1;
      state.status = 'ready';
    },
    replaceRecipeLocal(state, action: PayloadAction<{ id: number; draft: RecipeDraft }>) {
      const index = state.items.findIndex((row) => row.id === action.payload.id);
      if (index < 0) {
        return;
      }
      state.items[index] = {
        id: action.payload.id,
        title: action.payload.draft.title,
        notes: action.payload.draft.notes,
        servings: action.payload.draft.servings,
        ingredients: action.payload.draft.ingredients.map((line, lineIndex) => ({
          id: action.payload.id * 10 + lineIndex,
          ...line,
        })),
      };
    },
    removeRecipeLocal(state, action: PayloadAction<number>) {
      state.items = state.items.filter((row) => row.id !== action.payload);
      state.selectedIds = state.selectedIds.filter((id) => id !== action.payload);
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
      })
      .addCase(createRecipe.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        state.status = 'ready';
      })
      .addCase(updateRecipe.fulfilled, (state, action) => {
        const index = state.items.findIndex((row) => row.id === action.payload.id);
        if (index >= 0) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteRecipe.fulfilled, (state, action) => {
        state.items = state.items.filter((row) => row.id !== action.payload);
        state.selectedIds = state.selectedIds.filter((id) => id !== action.payload);
      });
  },
});

export const {
  setRecipes,
  toggleSelected,
  addRecipeLocal,
  replaceRecipeLocal,
  removeRecipeLocal,
} = recipesSlice.actions;
export default recipesSlice.reducer;
