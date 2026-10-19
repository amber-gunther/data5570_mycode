import { configureStore } from '@reduxjs/toolkit';

import pantryReducer from './pantrySlice';
import recipesReducer from './recipesSlice';

export const store = configureStore({
  reducer: {
    pantry: pantryReducer,
    recipes: recipesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
