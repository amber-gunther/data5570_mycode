import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';

import { Container } from '@/components/Container';
import { pantryHasIngredient } from '@/lib/matchPantry';
import { useAppSelector } from '@/store/hooks';

export default function RecipeDetails() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const recipeId = Number(id);
  const pantryItems = useAppSelector((state) => state.pantry.items);
  const recipe = useAppSelector((state) =>
    state.recipes.items.find((row) => row.id === recipeId),
  );

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ title: recipe?.title ?? 'Recipe' }} />
      <ScrollView contentContainerStyle={styles.content}>
        <Container>
          {recipe ? (
            <>
              <Text style={styles.label}>Servings</Text>
              <Text style={styles.value}>{recipe.servings}</Text>
              {recipe.notes ? (
                <>
                  <Text style={styles.label}>Notes</Text>
                  <Text style={styles.notes}>{recipe.notes}</Text>
                </>
              ) : null}
              <Text style={styles.label}>Ingredients vs pantry</Text>
              {recipe.ingredients.map((line) => {
                const have = pantryHasIngredient(line.name, pantryItems);
                return (
                  <View key={line.id} style={styles.ingredient}>
                    <View style={styles.copy}>
                      <Text style={styles.ingredientName}>{line.name}</Text>
                      <Text style={styles.meta}>
                        {line.quantity} {line.unit}
                      </Text>
                    </View>
                    <Text style={have ? styles.have : styles.need}>
                      {have ? 'Have' : 'Need'}
                    </Text>
                  </View>
                );
              })}
            </>
          ) : (
            <Text style={styles.missing}>That recipe is not in the store.</Text>
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
  },
  label: {
    color: '#6b7280',
    fontSize: 13,
    marginTop: 12,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  notes: {
    fontSize: 16,
    lineHeight: 22,
    marginTop: 4,
  },
  ingredient: {
    alignItems: 'center',
    backgroundColor: '#f4f7f4',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  copy: {
    flex: 1,
  },
  ingredientName: {
    fontSize: 16,
    fontWeight: '600',
  },
  meta: {
    color: '#4b5563',
    fontSize: 14,
    marginTop: 2,
  },
  have: {
    color: '#2f6b4f',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
  },
  need: {
    color: '#b45309',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
  },
  missing: {
    fontSize: 16,
    textAlign: 'center',
  },
});
