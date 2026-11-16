import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import { Container } from '@/components/Container';
import { RecipeForm } from '@/components/RecipeForm';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { replaceRecipeLocal, updateRecipe, type RecipeDraft } from '@/store/recipesSlice';

export default function EditRecipe() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const recipeId = Number(id);
  const recipe = useAppSelector((state) =>
    state.recipes.items.find((row) => row.id === recipeId),
  );
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [draft, setDraft] = useState<RecipeDraft>(() =>
    recipe
      ? {
          title: recipe.title,
          notes: recipe.notes,
          servings: recipe.servings,
          ingredients: recipe.ingredients.map((line) => ({
            name: line.name,
            quantity: line.quantity,
            unit: line.unit,
          })),
        }
      : {
          title: '',
          notes: '',
          servings: 1,
          ingredients: [{ name: '', quantity: '', unit: 'count' }],
        },
  );

  function handleSubmit() {
    if (!recipe) {
      return;
    }
    const title = draft.title.trim();
    const ingredients = draft.ingredients.filter((line) => line.name.trim());
    if (!title || ingredients.length === 0) {
      return;
    }
    const payload = { ...draft, title, ingredients };
    dispatch(updateRecipe({ id: recipe.id, draft: payload }))
      .unwrap()
      .then(() => router.back())
      .catch(() => {
        dispatch(replaceRecipeLocal({ id: recipe.id, draft: payload }));
        router.back();
      });
  }

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ title: 'Edit recipe' }} />
      <ScrollView contentContainerStyle={styles.content}>
        <Container>
          {recipe ? (
            <RecipeForm
              draft={draft}
              onChange={setDraft}
              onSubmit={handleSubmit}
              submitLabel="Save changes"
            />
          ) : (
            <Text>That recipe is not in the store.</Text>
          )}
        </Container>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: 'white',
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingBottom: 24,
  },
});
