import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Recipe } from '@/store/recipesSlice';

type RecipeRowProps = {
  recipe: Recipe;
  onPress: (recipe: Recipe) => void;
};

export function RecipeRow({ recipe, onPress }: RecipeRowProps) {
  const count = recipe.ingredients.length;

  return (
    <Pressable onPress={() => onPress(recipe)} style={styles.row}>
      <View style={styles.copy}>
        <Text style={styles.name}>{recipe.title}</Text>
        <Text style={styles.meta}>
          {recipe.servings} serving{recipe.servings === 1 ? '' : 's'} · {count}{' '}
          ingredient{count === 1 ? '' : 's'}
        </Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    backgroundColor: '#f4f7f4',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  copy: {
    flex: 1,
  },
  name: {
    fontSize: 17,
    fontWeight: '600',
  },
  meta: {
    color: '#4b5563',
    fontSize: 14,
    marginTop: 4,
  },
  chevron: {
    color: '#6b7280',
    fontSize: 24,
    marginLeft: 8,
  },
});
