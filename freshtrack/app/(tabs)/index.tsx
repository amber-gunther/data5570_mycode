import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Button } from '@/components/Button';
import { Container } from '@/components/Container';
import { PantryList } from '@/components/PantryList';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addItem, PantryItem } from '@/store/pantrySlice';

export default function Home() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const items = useAppSelector((state) => state.pantry.items);

  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('count');

  function handleAdd() {
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }

    dispatch(
      addItem({
        name: trimmed,
        quantity: quantity.trim() || '1',
        unit: unit.trim() || 'count',
        storage_zone: 'pantry',
      }),
    );
    setName('');
    setQuantity('');
    setUnit('count');
  }

  function openDetails(item: PantryItem) {
    router.push({ pathname: '/details', params: { id: String(item.id) } });
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Container>
        <Text style={styles.heading}>What's in the kitchen</Text>
        <PantryList items={items} onSelect={openDetails} />

        <Text style={styles.subheading}>Add an item</Text>
        <TextInput
          style={styles.input}
          placeholder="Name (e.g. yogurt)"
          value={name}
          onChangeText={setName}
        />
        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.half]}
            placeholder="Qty"
            keyboardType="numeric"
            value={quantity}
            onChangeText={setQuantity}
          />
          <TextInput
            style={[styles.input, styles.half]}
            placeholder="Unit"
            value={unit}
            onChangeText={setUnit}
          />
        </View>
        <Button title="Add to pantry" onPress={handleAdd} />
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
    marginBottom: 16,
  },
  subheading: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderColor: '#d1d5db',
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 16,
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  half: {
    flex: 1,
  },
});
