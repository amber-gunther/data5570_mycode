import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';

import { Container } from '@/components/Container';
import { RecipeForm } from '@/components/RecipeForm';
import { useAppDispatch } from '@/store/hooks';
import { addRecipeLocal, createRecipe, type RecipeDraft } from '@/store/recipesSlice';

const emptyDraft: RecipeDraft = {
  title: '',
  notes: '',
  servings: 1,
  ingredients: [{ name: '', quantity: '', unit: 'count' }],
};

export default function NewRecipe() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [draft, setDraft] = useState<RecipeDraft>(emptyDraft);

  function handleSubmit() {
    const title = draft.title.trim();
    const ingredients = draft.ingredients.filter((line) => line.name.trim());
    if (!title || ingredients.length === 0) {
      return;
    }
    const payload = { ...draft, title, ingredients };
    dispatch(createRecipe(payload))
      .unwrap()
      .then((recipe) => router.replace(`/recipe/${recipe.id}`))
      .catch(() => {
        dispatch(addRecipeLocal(payload));
        router.back();
      });
  }

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ title: 'New recipe' }} />
      <ScrollView contentContainerStyle={styles.content}>
        <Container>
          <Text style={styles.lede}>Saved here so shopping and cook-from-pantry can use it.</Text>
          <RecipeForm
            draft={draft}
            onChange={setDraft}
            onSubmit={handleSubmit}
            submitLabel="Save recipe"
          />
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
  lede: {
    color: '#4b5563',
    fontSize: 15,
    marginBottom: 16,
  },
});
