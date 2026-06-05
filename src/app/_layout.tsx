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
        {/* Main app lives in the bottom-tab group (Club / Goals / Crew / Shop / More). */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        {/* The night sequence runs full-screen, above the tabs. */}
        <Stack.Screen name="day-prep" options={{ title: 'Tonight' }} />
        <Stack.Screen name="night-timeline" options={{ title: 'The Night', headerBackVisible: false }} />
        <Stack.Screen name="results" options={{ title: 'Last Night', headerBackVisible: false }} />
        <Stack.Screen name="phone" options={{ title: 'Phone' }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
