import { router } from 'expo-router';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card, StatCard } from '@/components/Card';
import { Pill } from '@/components/Controls';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { reputationTier } from '@/domain/balance';
import { aggregateEffects } from '@/domain/upgrades';
import { money } from '@/lib/format';
import { useGameStore } from '@/state/store';
import { colors, spacing } from '@/theme/tokens';

export default function DashboardScreen() {
  const club = useGameStore((s) => s.club);
  const newClub = useGameStore((s) => s.newClub);

  const onReset = () => {
    Alert.alert('Reset Club?', 'This will erase your current save and start over.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset Club', style: 'destructive', onPress: () => void newClub() },
    ]);
  };

  if (!club) {
    return (
      <Screen>
        <Text>No club loaded.</Text>
        <Button label="Go Home" variant="secondary" onPress={() => router.replace('/')} />
      </Screen>
    );
  }

  const capacity = club.baseCapacity + aggregateEffects(club.ownedUpgradeIds).capacity;

  return (
    <Screen
      footer={
        <View style={{ gap: spacing.sm }}>
          <Button label="Prepare Tonight" onPress={() => router.push('/day-prep')} />
          <View style={styles.row}>
            <Button
              label="Staff"
              variant="secondary"
              onPress={() => router.push('/staff')}
              style={{ flex: 1 }}
            />
            <Button
              label="Upgrades"
              variant="secondary"
              onPress={() => router.push('/shop')}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      }
    >
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text variant="title">{club.name}</Text>
          <Text variant="label" muted>
            Night {club.day}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <Pill label={reputationTier(club.reputation)} color={colors.neonCyan} />
          <Pressable onPress={onReset} hitSlop={8} accessibilityRole="button" accessibilityLabel="Reset club">
            <Text variant="label" color={colors.danger}>
              Reset Club
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.row}>
        <StatCard label="Cash" value={money(club.cash)} accent={colors.success} />
        <StatCard label="Reputation" value={`${club.reputation}`} accent={colors.neonMagenta} />
      </View>
      <View style={styles.row}>
        <StatCard label="Capacity" value={`${capacity}`} />
        <StatCard label="Crew" value={`${club.staff.length}`} accent={colors.neonViolet} />
      </View>

      <Card title="The Plan">
        <Text variant="body" muted style={{ lineHeight: 22 }}>
          Set your music, prices, staff and door policy for tonight, then open
          the doors and see how the night plays out. Profit buys upgrades; good
          nights build your reputation toward the best club in the city.
        </Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  headerRight: { alignItems: 'flex-end', gap: spacing.sm },
  row: { flexDirection: 'row', gap: spacing.md },
});
