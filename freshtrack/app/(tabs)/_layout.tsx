import { useEffect } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchPantry } from '@/store/pantrySlice';
import { fetchRecipes } from '@/store/recipesSlice';

export default function TabLayout() {
  const dispatch = useAppDispatch();
  const pantryStatus = useAppSelector((state) => state.pantry.status);
  const recipesStatus = useAppSelector((state) => state.recipes.status);

  useEffect(() => {
    if (pantryStatus === 'idle') {
      dispatch(fetchPantry());
    }
  }, [dispatch, pantryStatus]);

  useEffect(() => {
    if (recipesStatus === 'idle') {
      dispatch(fetchRecipes());
    }
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
