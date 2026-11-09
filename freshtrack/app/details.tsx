import { StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import { Button } from '@/components/Button';
import { Container } from '@/components/Container';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  adjustQuantity,
  deletePantryItem,
  patchPantryQuantity,
  removeItem,
} from '@/store/pantrySlice';

export default function Details() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const itemId = Number(id);
  const item = useAppSelector((state) =>
    state.pantry.items.find((row) => row.id === itemId),
  );
  const quantity = item ? Number(item.quantity) : 0;
  const canDecrease = Number.isFinite(quantity) && quantity > 0;

  function nextQuantity(delta: number) {
    if (!item) {
      return null;
    }
    const current = Number(item.quantity);
    if (!Number.isFinite(current)) {
      return null;
    }
    return String(Math.max(0, Math.round((current + delta) * 100) / 100));
  }

  function handleStep(delta: number) {
    if (!item) {
      return;
    }
    const quantityValue = nextQuantity(delta);
    if (quantityValue === null) {
      return;
    }
    dispatch(patchPantryQuantity({ id: item.id, quantity: quantityValue }))
      .unwrap()
      .then(() => {
        if (Number(quantityValue) <= 0) {
          router.back();
        }
      })
      .catch(() => {
        dispatch(adjustQuantity({ id: item.id, delta }));
        if (Number(quantityValue) <= 0) {
          router.back();
        }
      });
  }

  function handleRemove() {
    if (!item) {
      return;
    }
    dispatch(deletePantryItem(item.id))
      .unwrap()
      .then(() => router.back())
      .catch(() => {
        dispatch(removeItem(item.id));
        router.back();
      });
  }

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ title: item?.name ?? 'Item details' }} />
      <Container>
        {item ? (
          <>
            <Text style={styles.label}>Quantity</Text>
            <View style={styles.qtyRow}>
              <Button
                title="−"
                disabled={!canDecrease}
                onPress={() => handleStep(-1)}
                style={styles.step}
              />
              <Text style={styles.value}>
                {item.quantity} {item.unit}
              </Text>
              <Button
                title="+"
                onPress={() => handleStep(1)}
                style={styles.step}
              />
            </View>
            <Text style={styles.hint}>
              Use − / + for spills, snacks, or anything that isn't a saved recipe. Quantity
              cannot go below 0.
            </Text>
            <Text style={styles.label}>Storage</Text>
            <Text style={styles.value}>{item.storage_zone}</Text>
            <Text style={styles.label}>Status</Text>
            <Text style={styles.value}>{item.status}</Text>
            <Text style={styles.label}>Expiry</Text>
            <Text style={styles.value}>{item.expiry_date ?? 'Not set'}</Text>
            <Button title="Remove from pantry" onPress={handleRemove} />
          </>
        ) : (
          <Text style={styles.missing}>That pantry item is not in the store.</Text>
        )}
      </Container>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: 'white',
    flex: 1,
  },
  label: {
    color: '#6b7280',
    fontSize: 13,
    marginTop: 12,
    textTransform: 'uppercase',
  },
  qtyRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  step: {
    marginHorizontal: 0,
    minWidth: 56,
    padding: 12,
  },
  value: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  hint: {
    color: '#6b7280',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
    marginTop: 4,
  },
  missing: {
    fontSize: 16,
    textAlign: 'center',
  },
});
