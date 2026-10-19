import { useEffect } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';

import { API_URL } from '@/constants/api';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { demoPantry, PantryItem, setItems } from '@/store/pantrySlice';
import { demoRecipes, parseRecipes, setRecipes } from '@/store/recipesSlice';

function toPantryItems(payload: unknown): PantryItem[] {
  if (!Array.isArray(payload)) {
    return demoPantry;
  }

  return payload.map((row) => {
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
  });
}

export default function TabLayout() {
  const dispatch = useAppDispatch();
  const pantryStatus = useAppSelector((state) => state.pantry.status);
  const recipesStatus = useAppSelector((state) => state.recipes.status);

  useEffect(() => {
    if (pantryStatus !== 'idle') {
      return;
    }

    let cancelled = false;

    async function loadPantry() {
      try {
        const response = await fetch(`${API_URL}/pantry/`);
        if (!response.ok) {
          throw new Error('Could not load pantry');
        }
        const payload = await response.json();
        if (!cancelled) {
          dispatch(setItems(toPantryItems(payload)));
        }
      } catch {
        if (!cancelled) {
          dispatch(setItems(demoPantry));
        }
      }
    }

    loadPantry();

    return () => {
      cancelled = true;
    };
  }, [dispatch, pantryStatus]);

  useEffect(() => {
    if (recipesStatus !== 'idle') {
      return;
    }

    let cancelled = false;

    async function loadRecipes() {
      try {
        const response = await fetch(`${API_URL}/recipes/`);
        if (!response.ok) {
          throw new Error('Could not load recipes');
        }
        const payload = await response.json();
        if (!cancelled) {
          dispatch(setRecipes(parseRecipes(payload)));
        }
      } catch {
        if (!cancelled) {
          dispatch(setRecipes(demoRecipes));
        }
      }
    }

    loadRecipes();

    return () => {
      cancelled = true;
    };
  }, [dispatch, recipesStatus]);

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: '#2f6b4f' },
        headerTintColor: '#ffffff',
        headerTitleStyle: { fontWeight: '700' },
        tabBarActiveTintColor: '#2f6b4f',
        tabBarInactiveTintColor: '#6b7280',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Pantry',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="nutrition-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="recipes"
        options={{
          title: 'Recipes',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
