import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';

import { Button } from '@/components/Button';
import { Container } from '@/components/Container';
import { planCook } from '@/lib/matchPantry';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useIngredients } from '@/store/pantrySlice';

export default function RecipeDetails() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const dispatch = useAppDispatch();
  const recipeId = Number(id);
  const pantryItems = useAppSelector((state) => state.pantry.items);
  const recipe = useAppSelector((state) =>
    state.recipes.items.find((row) => row.id === recipeId),
  );
  const plan = recipe ? planCook(recipe, pantryItems) : null;
  const [message, setMessage] = useState('');

  function handleMadeThis() {
    if (!plan?.ok) {
      return;
    }
    dispatch(useIngredients(plan.deductions));
    setMessage('Pantry updated for this recipe.');
  }

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
                const check = plan?.lines.find((row) => row.ingredientId === line.id);
                const kind = check?.kind ?? 'missing';
                const badge =
                  kind === 'ok' ? 'Have' : kind === 'unit' ? 'Unit' : kind === 'short' ? 'Short' : 'Need';
                const badgeStyle =
                  kind === 'ok'
                    ? styles.have
                    : kind === 'unit' || kind === 'short'
                      ? styles.warn
                      : styles.need;
                return (
                  <View key={line.id} style={styles.ingredient}>
                    <View style={styles.copy}>
                      <Text style={styles.ingredientName}>{line.name}</Text>
                      <Text style={styles.meta}>
                        {line.quantity} {line.unit}
                        {check && check.kind !== 'ok' ? ` · ${check.message}` : ''}
                      </Text>
                    </View>
                    <Text style={badgeStyle}>{badge}</Text>
                  </View>
                );
              })}
              <View style={styles.actions}>
                <Button
                  title="I made this"
                  disabled={!plan?.ok}
                  onPress={handleMadeThis}
                />
              </View>
              {plan && !plan.ok ? (
                <Text style={styles.blocked}>
                  This only logs when every ingredient is in the pantry, uses the same unit,
                  and you have enough. Nothing is skipped.
                </Text>
              ) : null}
              {message ? <Text style={styles.success}>{message}</Text> : null}
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
    paddingBottom: 24,
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
  warn: {
    color: '#b45309',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
  },
  actions: {
    marginTop: 20,
  },
  blocked: {
    color: '#6b7280',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12,
  },
  success: {
    color: '#2f6b4f',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 12,
  },
  missing: {
    fontSize: 16,
    textAlign: 'center',
  },
});
