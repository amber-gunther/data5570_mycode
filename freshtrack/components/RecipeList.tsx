import { StyleSheet, Text, View } from 'react-native';

import { RecipeRow } from '@/components/RecipeRow';
import type { Recipe } from '@/store/recipesSlice';

type RecipeListProps = {
  recipes: Recipe[];
  onSelect: (recipe: Recipe) => void;
};

export function RecipeList({ recipes, onSelect }: RecipeListProps) {
  if (recipes.length === 0) {
    return <Text style={styles.empty}>No saved recipes yet.</Text>;
  }

  return (
    <View style={styles.list}>
      {recipes.map((recipe) => (
        <RecipeRow key={recipe.id} recipe={recipe} onPress={onSelect} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    marginBottom: 16,
  },
  empty: {
    color: '#4b5563',
    textAlign: 'center',
  },
});
