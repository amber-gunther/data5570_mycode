import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { PantryItem } from '@/store/pantrySlice';

type PantryRowProps = {
  item: PantryItem;
  onPress: (item: PantryItem) => void;
};

export function PantryRow({ item, onPress }: PantryRowProps) {
  return (
    <Pressable onPress={() => onPress(item)} style={styles.row}>
      <View style={styles.copy}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.meta}>
          {item.quantity} {item.unit} · {item.storage_zone}
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
