import { StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import { Button } from '@/components/Button';
import { Container } from '@/components/Container';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { removeItem } from '@/store/pantrySlice';

export default function Details() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const itemId = Number(id);
  const item = useAppSelector((state) =>
    state.pantry.items.find((row) => row.id === itemId),
  );

  function handleRemove() {
    if (!item) {
      return;
    }
    dispatch(removeItem(item.id));
    router.back();
  }

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ title: item?.name ?? 'Item details' }} />
      <Container>
        {item ? (
          <>
            <Text style={styles.label}>Quantity</Text>
            <Text style={styles.value}>
              {item.quantity} {item.unit}
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
  value: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  missing: {
    fontSize: 16,
    textAlign: 'center',
  },
});
