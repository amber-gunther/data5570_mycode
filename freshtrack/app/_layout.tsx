import { Stack } from 'expo-router';
import { Provider } from 'react-redux';

import { store } from '@/store';

export default function Layout() {
  return (
    <Provider store={store}>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#2f6b4f' },
          headerTintColor: '#ffffff',
          headerTitleStyle: { fontWeight: '700' },
        }}
      />
    </Provider>
  );
}
