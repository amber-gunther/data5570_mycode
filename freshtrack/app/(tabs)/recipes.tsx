import { ScrollView, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';

import { Container } from '@/components/Container';
import { RecipeList } from '@/components/RecipeList';
import { useAppSelector } from '@/store/hooks';
import type { Recipe } from '@/store/recipesSlice';

export default function Recipes() {
  const router = useRouter();
  const recipes = useAppSelector((state) => state.recipes.items);

  function openRecipe(recipe: Recipe) {
    router.push(`/recipe/${recipe.id}`);
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Container>
        <Text style={styles.heading}>Saved recipes</Text>
        <Text style={styles.lede}>
          Open a recipe to see which ingredients you already have in the pantry.
        </Text>
        <RecipeList recipes={recipes} onSelect={openRecipe} />
      </Container>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: 'white',
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  lede: {
    color: '#4b5563',
    fontSize: 15,
    marginBottom: 16,
  },
});
