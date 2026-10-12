import { StyleSheet, Text, View } from 'react-native';

import { PantryRow } from '@/components/PantryRow';
import type { PantryItem } from '@/store/pantrySlice';

type PantryListProps = {
  items: PantryItem[];
  onSelect: (item: PantryItem) => void;
};

export function PantryList({ items, onSelect }: PantryListProps) {
  if (items.length === 0) {
    return <Text style={styles.empty}>No pantry items yet. Add one below.</Text>;
  }

  return (
    <View style={styles.list}>
      {items.map((item) => (
        <PantryRow key={item.id} item={item} onPress={onSelect} />
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
    marginBottom: 16,
    textAlign: 'center',
  },
});
