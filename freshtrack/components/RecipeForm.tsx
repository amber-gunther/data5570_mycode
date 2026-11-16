import { StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/Button';
import type { RecipeDraft } from '@/store/recipesSlice';

type RecipeFormProps = {
  draft: RecipeDraft;
  onChange: (draft: RecipeDraft) => void;
  onSubmit: () => void;
  submitLabel: string;
};

export function RecipeForm({ draft, onChange, onSubmit, submitLabel }: RecipeFormProps) {
  function setField<K extends keyof RecipeDraft>(key: K, value: RecipeDraft[K]) {
    onChange({ ...draft, [key]: value });
  }

  function setIngredient(index: number, field: 'name' | 'quantity' | 'unit', value: string) {
    const ingredients = draft.ingredients.map((line, lineIndex) =>
      lineIndex === index ? { ...line, [field]: value } : line,
    );
    onChange({ ...draft, ingredients });
  }

  function addIngredient() {
    onChange({
      ...draft,
      ingredients: [...draft.ingredients, { name: '', quantity: '', unit: 'count' }],
    });
  }

  function removeIngredient(index: number) {
    onChange({
      ...draft,
      ingredients: draft.ingredients.filter((_, lineIndex) => lineIndex !== index),
    });
  }

  return (
    <View>
      <TextInput
        style={styles.input}
        placeholder="Title"
        value={draft.title}
        onChangeText={(value) => setField('title', value)}
      />
      <TextInput
        style={styles.input}
        placeholder="Servings"
        keyboardType="numeric"
        value={String(draft.servings || '')}
        onChangeText={(value) => setField('servings', Number(value) || 1)}
      />
      <TextInput
        style={[styles.input, styles.notes]}
        placeholder="Notes (optional)"
        multiline
        value={draft.notes}
        onChangeText={(value) => setField('notes', value)}
      />
      <Text style={styles.subheading}>Ingredients</Text>
      {draft.ingredients.map((line, index) => (
        <View key={index} style={styles.ingredient}>
          <TextInput
            style={styles.input}
            placeholder="Name"
            value={line.name}
            onChangeText={(value) => setIngredient(index, 'name', value)}
          />
          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.half]}
              placeholder="Qty"
              keyboardType="numeric"
              value={line.quantity}
              onChangeText={(value) => setIngredient(index, 'quantity', value)}
            />
            <TextInput
              style={[styles.input, styles.half]}
              placeholder="Unit"
              value={line.unit}
              onChangeText={(value) => setIngredient(index, 'unit', value)}
            />
          </View>
          {draft.ingredients.length > 1 ? (
            <Button title="Remove line" onPress={() => removeIngredient(index)} />
          ) : null}
        </View>
      ))}
      <Button title="Add ingredient" onPress={addIngredient} />
      <Button title={submitLabel} onPress={onSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderColor: '#d1d5db',
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 16,
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  notes: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  subheading: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 8,
  },
  ingredient: {
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  half: {
    flex: 1,
  },
});
