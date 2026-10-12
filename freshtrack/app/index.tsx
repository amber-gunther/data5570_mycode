import { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';

import { Button } from '@/components/Button';
import { Container } from '@/components/Container';
import { PantryList } from '@/components/PantryList';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addItem, demoPantry, PantryItem, setItems } from '@/store/pantrySlice';

const API_URL = 'https://freshtrack-4k21.onrender.com/api';

function toPantryItems(payload: unknown): PantryItem[] {
  if (!Array.isArray(payload)) {
    return demoPantry;
  }

  return payload.map((row) => {
    const item = row as Record<string, unknown>;
    return {
      id: Number(item.id),
      name: String(item.name ?? 'Unnamed'),
      quantity: String(item.quantity ?? ''),
      unit: String(item.unit ?? ''),
      storage_zone: String(item.storage_zone ?? 'pantry'),
      expiry_date: item.expiry_date ? String(item.expiry_date) : null,
      status: String(item.status ?? 'active'),
    };
  });
}

export default function Home() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const items = useAppSelector((state) => state.pantry.items);
  const loadStatus = useAppSelector((state) => state.pantry.status);

  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('count');

  useEffect(() => {
    if (loadStatus !== 'idle') {
      return;
    }

    let cancelled = false;

    async function loadPantry() {
      try {
        const response = await fetch(`${API_URL}/pantry/`);
        if (!response.ok) {
          throw new Error('Could not load pantry');
        }
        const payload = await response.json();
        if (!cancelled) {
          dispatch(setItems(toPantryItems(payload)));
        }
      } catch {
        if (!cancelled) {
          dispatch(setItems(demoPantry));
        }
      }
    }

    loadPantry();

    return () => {
      cancelled = true;
    };
  }, [dispatch, loadStatus]);

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
    <View style={styles.screen}>
      <Stack.Screen options={{ title: 'FreshTrack pantry' }} />
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
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: 'white',
    flex: 1,
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
