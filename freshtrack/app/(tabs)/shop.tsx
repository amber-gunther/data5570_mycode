import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Container } from '@/components/Container';
import { localDateISO } from '@/lib/expiry';
import { formatShopQty, shopList } from '@/lib/shopList';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addItem, createPantryItem, isOnHand } from '@/store/pantrySlice';
import { toggleSelected } from '@/store/recipesSlice';

export default function Shop() {
  const dispatch = useAppDispatch();
  const recipes = useAppSelector((state) => state.recipes.items);
  const selectedIds = useAppSelector((state) => state.recipes.selectedIds);
  const pantryItems = useAppSelector((state) => state.pantry.items.filter(isOnHand));
  const selected = recipes.filter((recipe) => selectedIds.includes(recipe.id));
  const lines = shopList(selected, pantryItems);

  function handleBought() {
    for (const line of lines) {
      const payload = {
        name: line.name,
        quantity: String(line.buy),
        unit: line.unit,
        storage_zone: 'pantry',
        expiry_date: null as string | null,
        bought_on: localDateISO(),
      };
      dispatch(createPantryItem(payload)).unwrap().catch(() => {
        dispatch(addItem(payload));
      });
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Container>
        <Text style={styles.heading}>Shopping list</Text>
        <Text style={styles.lede}>
          Pick the recipes you want to cook. The list is only what you still need.
        </Text>
        {recipes.map((recipe) => {
          const on = selectedIds.includes(recipe.id);
          return (
            <Button
              key={recipe.id}
              title={on ? `✓ ${recipe.title}` : recipe.title}
              onPress={() => dispatch(toggleSelected(recipe.id))}
              style={on ? styles.picked : styles.unpicked}
            />
          );
        })}
        <Text style={styles.subheading}>Buy</Text>
        {selected.length === 0 ? (
          <Text style={styles.empty}>Select at least one recipe.</Text>
        ) : lines.length === 0 ? (
          <Text style={styles.empty}>You already have everything for those recipes.</Text>
        ) : (
          lines.map((line) => (
            <View key={`${line.name}-${line.unit}`} style={styles.row}>
              <View style={styles.copy}>
                <Text style={styles.name}>{line.name}</Text>
                <Text style={styles.meta}>
                  {formatShopQty(line)} · have {line.have} {line.unit} · {line.recipeTitles.join(', ')}
                </Text>
              </View>
            </View>
          ))
        )}
        {lines.length > 0 ? (
          <Button title="I bought this (add lots)" onPress={handleBought} />
        ) : null}
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
    paddingBottom: 24,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  lede: {
    color: '#4b5563',
    fontSize: 15,
    marginBottom: 16,
  },
  subheading: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  empty: {
    color: '#4b5563',
    marginBottom: 12,
  },
  row: {
    backgroundColor: '#f4f7f4',
    borderRadius: 12,
    marginBottom: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  copy: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  meta: {
    color: '#4b5563',
    fontSize: 14,
    marginTop: 4,
  },
  picked: {
    backgroundColor: '#2f6b4f',
    marginHorizontal: 0,
    marginBottom: 8,
  },
  unpicked: {
    backgroundColor: '#9ca3af',
    marginHorizontal: 0,
    marginBottom: 8,
  },
});
