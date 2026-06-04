import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card, StatCard } from '@/components/Card';
import { Pill } from '@/components/Controls';
import { FloorView } from '@/components/FloorView';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { reputationTier } from '@/domain/balance';
import { buildFloorView, floorBubbles, nextGoal } from '@/lib/dashboard';
import { money } from '@/lib/format';
import { useGameStore } from '@/state/store';
import { colors, radius, spacing } from '@/theme/tokens';

export default function DashboardScreen() {
  const club = useGameStore((s) => s.club);
  const lastResult = useGameStore((s) => s.lastResult);
  const newClub = useGameStore((s) => s.newClub);
  const [confirmingReset, setConfirmingReset] = useState(false);

  if (!club) {
    return (
      <Screen>
        <Text>No club loaded.</Text>
        <Button label="Go Home" variant="secondary" onPress={() => router.replace('/')} />
      </Screen>
    );
  }

  const goal = nextGoal(club);
  const floor = buildFloorView(club, lastResult);
  const bubbles = floorBubbles(lastResult);

  // Cross-platform, deliberate two-step reset (Alert.alert buttons don't fire on web).
  const onConfirmReset = () => {
    setConfirmingReset(false);
    void newClub();
  };

  return (
    <Screen
      footer={
        <View style={{ gap: spacing.sm }}>
          <Button label="Prepare Tonight" onPress={() => router.push('/day-prep')} />
          <View style={styles.row}>
            <Button label="Crew" variant="secondary" onPress={() => router.push('/staff')} style={{ flex: 1 }} />
            <Button label="Upgrades" variant="secondary" onPress={() => router.push('/shop')} style={{ flex: 1 }} />
          </View>
        </View>
      }
    >
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text variant="title">{club.name}</Text>
          <Text variant="label" muted>
            Night {club.day} · {reputationTier(club.reputation)}
          </Text>
        </View>
        {confirmingReset ? (
          <View style={styles.resetConfirm}>
            <Text variant="label" color={colors.danger}>
              Erase save & start over?
            </Text>
            <View style={styles.resetRow}>
              <Pressable onPress={() => setConfirmingReset(false)} hitSlop={8} accessibilityRole="button">
                <Text variant="label" muted>
                  Cancel
                </Text>
              </Pressable>
              <Pressable onPress={onConfirmReset} hitSlop={8} accessibilityRole="button" accessibilityLabel="Confirm reset club">
                <Text variant="label" color={colors.danger}>
                  Reset Club
                </Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <Pressable onPress={() => setConfirmingReset(true)} hitSlop={8} accessibilityRole="button" accessibilityLabel="Reset club">
            <Text variant="label" color={colors.danger}>
              Reset…
            </Text>
          </Pressable>
        )}
      </View>

      {/* HUD overlays */}
      <View style={styles.row}>
        <StatCard label="Cash" value={money(club.cash)} accent={club.cash < 0 ? colors.danger : colors.success} />
        <StatCard label="Reputation" value={`${club.reputation}`} accent={colors.neonMagenta} />
      </View>

      {/* One primary goal */}
      <Card title="Next Goal">
        <Text variant="heading">{goal.title}</Text>
        {goal.detail ? (
          <Text variant="label" muted>
            {goal.detail}
          </Text>
        ) : null}
        {goal.progress !== undefined ? (
          <View style={styles.progressTrack}>
            <View
              style={[styles.progressFill, { width: `${Math.round(Math.max(0, Math.min(1, goal.progress)) * 100)}%` }]}
            />
          </View>
        ) : null}
      </Card>

      {/* The living venue — the home screen's centerpiece */}
      <FloorView floor={floor} bubbles={bubbles} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  resetConfirm: { alignItems: 'flex-end', gap: spacing.xs },
  resetRow: { flexDirection: 'row', gap: spacing.md },
  row: { flexDirection: 'row', gap: spacing.md },
  progressTrack: { height: 8, borderRadius: radius.pill, backgroundColor: colors.surfaceAlt, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: radius.pill, backgroundColor: colors.neonMagenta },
});
