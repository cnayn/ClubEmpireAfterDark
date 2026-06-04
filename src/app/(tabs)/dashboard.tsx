import { router } from 'expo-router';
import { useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card, StatCard } from '@/components/Card';
import { FloorView } from '@/components/FloorView';
import { GoalBoardList } from '@/components/GoalBoard';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { reputationTier } from '@/domain/balance';
import { buildFloorView, floorBubbles, goalBoard, venueFloorChips } from '@/lib/dashboard';
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

  // Compact board on the dashboard; the full board lives on the Goals tab.
  const goals = goalBoard(club, lastResult).slice(0, 3);
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
    <Screen footer={<Button label="Prepare Tonight" onPress={() => router.push('/day-prep')} />}>
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

      {/* Compact Goal Board — full board is on the Goals tab. */}
      <Card title="Goals">
        <GoalBoardList goals={goals} />
        <Pressable onPress={() => router.push('/goals')} accessibilityRole="button" hitSlop={8}>
          <Text variant="label" color={colors.neonCyan} style={styles.seeAll}>
            See all goals →
          </Text>
        </Pressable>
      </Card>

      {/* The living venue — the home screen's centerpiece */}
      <FloorView floor={floor} bubbles={bubbles} venueChips={venueFloorChips(club)} />
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
  seeAll: { marginTop: spacing.sm, textAlign: 'right' },
});
