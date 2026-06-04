/**
 * Goal Board presentation — a compact list of goal cards. Pure UI over the
 * existing `BoardGoal` data (src/lib/dashboard.ts goalBoard); no new state.
 * Shared by the Dashboard (compact) and the Goals tab (full board).
 */
import { StyleSheet, View } from 'react-native';

import { Pill } from '@/components/Controls';
import { Text } from '@/components/Text';
import type { BoardGoal, BoardGoalCategory } from '@/lib/dashboard';
import { colors, radius, spacing } from '@/theme/tokens';

const CATEGORY_ACCENT: Record<BoardGoalCategory, string> = {
  tutorial: colors.neonCyan,
  business: colors.success,
  reputation: colors.neonMagenta,
  staff: colors.neonViolet,
  venue: colors.warning,
};
const CATEGORY_LABEL: Record<BoardGoalCategory, string> = {
  tutorial: 'Tutorial',
  business: 'Business',
  reputation: 'Reputation',
  staff: 'Staff',
  venue: 'Venue',
};

function GoalRow({ goal }: { goal: BoardGoal }) {
  const accent = CATEGORY_ACCENT[goal.category];
  const completed = goal.status === 'completed';
  return (
    <View style={[styles.goalRow, { borderLeftColor: completed ? colors.success : accent }]}>
      <View style={styles.goalHead}>
        <Text variant="label" color={completed ? colors.success : accent}>
          {CATEGORY_LABEL[goal.category]}
        </Text>
        <Pill label={completed ? 'Done' : 'Active'} color={completed ? colors.success : accent} />
      </View>
      <Text variant="heading">{goal.title}</Text>
      <Text variant="label" muted>
        {goal.instruction}
      </Text>
      {!completed ? (
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.round(goal.progress * 100)}%`, backgroundColor: accent }]} />
        </View>
      ) : null}
      {goal.benefit ? (
        <Text variant="label" color={completed ? colors.success : colors.textMuted}>
          {completed ? '✓ ' : '★ '}
          {goal.benefit}
        </Text>
      ) : null}
    </View>
  );
}

/** Renders a list of goal cards. */
export function GoalBoardList({ goals }: { goals: BoardGoal[] }) {
  return (
    <View style={styles.board}>
      {goals.map((g) => (
        <GoalRow key={g.id} goal={g} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  board: { gap: spacing.sm },
  goalRow: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    borderLeftWidth: 3,
    padding: spacing.md,
    gap: spacing.xs,
  },
  goalHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  progressTrack: { height: 8, borderRadius: radius.pill, backgroundColor: colors.surface, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: radius.pill, backgroundColor: colors.neonMagenta },
});
