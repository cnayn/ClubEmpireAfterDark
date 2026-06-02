import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useGameStore } from '@/state/store';
import { colors } from '@/theme/tokens';

export default function RootLayout() {
  const hydrate = useGameStore((s) => s.hydrate);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.bg },
          headerTintColor: colors.textPrimary,
          headerTitleStyle: { fontWeight: '700' },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.bg },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="dashboard" options={{ title: 'Club Dashboard', headerBackVisible: false }} />
        <Stack.Screen name="day-prep" options={{ title: 'Tonight' }} />
        <Stack.Screen name="results" options={{ title: 'Last Night', headerBackVisible: false }} />
        <Stack.Screen name="shop" options={{ title: 'Upgrades' }} />
        <Stack.Screen name="staff" options={{ title: 'Staff' }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
