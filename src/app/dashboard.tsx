import { router } from 'expo-router';
import { useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, View } from 'react-native';

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

const RESET_TITLE = 'Reset Club?';
const RESET_BODY =
  'This wipes your current club and all progress, and starts a brand-new club from Night 1. This can’t be undone.';

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

  // Actually perform the reset: clears the save and replaces store state with a
  // fresh club (day 1, starting cash/rep/roster, lastResult/plannedConfig cleared).
  const onConfirmReset = async () => {
    setConfirmingReset(false);
    await newClub();
    router.replace('/'); // land on the title screen so the fresh start is unmistakable
  };

  // Platform-aware confirmation. On web, Alert.alert / RN-Modal button taps have
  // been unreliable, so we use the browser's synchronous window.confirm (always
  // works). On native we show the in-app Modal below.
  const requestReset = () => {
    if (Platform.OS === 'web') {
      const webConfirm = (globalThis as unknown as { confirm?: (m?: string) => boolean }).confirm;
      const ok = webConfirm ? webConfirm(`${RESET_TITLE}\n\n${RESET_BODY}`) : true;
      if (ok) void onConfirmReset();
      return;
    }
    setConfirmingReset(true);
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
        <Pressable
          onPress={requestReset}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Reset club"
        >
          <Text variant="label" color={colors.danger}>
            Reset…
          </Text>
        </Pressable>
      </View>

      {/* Native (iOS/Android) reset confirmation. Web uses window.confirm instead.
          The dismiss layer is a sibling BEHIND the card, so taps on the buttons
          are never swallowed by the backdrop. */}
      <Modal
        visible={confirmingReset}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmingReset(false)}
      >
        <View style={styles.backdrop}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setConfirmingReset(false)}
            accessibilityRole="button"
            accessibilityLabel="Dismiss reset"
          />
          <View style={styles.modalCard}>
            <Text variant="heading" color={colors.danger}>
              {RESET_TITLE}
            </Text>
            <Text variant="body" muted style={styles.modalText}>
              {RESET_BODY}
            </Text>
            <Button label="Reset Club" accent={colors.danger} onPress={onConfirmReset} />
            <Button label="Cancel" variant="secondary" onPress={() => setConfirmingReset(false)} />
          </View>
        </View>
      </Modal>

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
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  modalText: { lineHeight: 21 },
  row: { flexDirection: 'row', gap: spacing.md },
  progressTrack: { height: 8, borderRadius: radius.pill, backgroundColor: colors.surfaceAlt, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: radius.pill, backgroundColor: colors.neonMagenta },
});
