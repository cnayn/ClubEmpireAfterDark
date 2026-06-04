import { Tabs } from 'expo-router';
import { Text } from 'react-native';

import { colors } from '@/theme/tokens';

/** Small text/emoji tab icon (avoids pulling in an icon font dependency). */
function TabIcon({ glyph }: { glyph: string }) {
  return <Text style={{ fontSize: 18 }}>{glyph}</Text>;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.neonMagenta,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{ title: 'Club', tabBarIcon: () => <TabIcon glyph="🪩" /> }}
      />
      <Tabs.Screen
        name="goals"
        options={{ title: 'Goals', tabBarIcon: () => <TabIcon glyph="🎯" /> }}
      />
      <Tabs.Screen
        name="staff"
        options={{ title: 'Crew', tabBarIcon: () => <TabIcon glyph="👥" /> }}
      />
      <Tabs.Screen
        name="venue"
        options={{ title: 'Venue', tabBarIcon: () => <TabIcon glyph="🛋️" /> }}
      />
      <Tabs.Screen
        name="shop"
        options={{ title: 'Shop', tabBarIcon: () => <TabIcon glyph="🛠️" /> }}
      />
      <Tabs.Screen
        name="more"
        options={{ title: 'More', tabBarIcon: () => <TabIcon glyph="☰" /> }}
      />
    </Tabs>
  );
}
