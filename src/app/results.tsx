import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card, StatCard } from '@/components/Card';
import { Pill, ResultRow } from '@/components/Controls';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { getEvent } from '@/domain/events';
import { buildDebrief, type DebriefTone } from '@/lib/debrief';
import { money, moneyColor, signed, signedMoney } from '@/lib/format';
import { useGameStore } from '@/state/store';
import { colors, radius, spacing } from '@/theme/tokens';

const DEBRIEF_COLOR: Record<DebriefTone, string> = {
  good: colors.success,
  bad: colors.danger,
  warn: colors.warning,
  info: colors.neonCyan,
  neutral: colors.textMuted,
};

export default function ResultsScreen() {
  const result = useGameStore((s) => s.lastResult);
  const club = useGameStore((s) => s.club);
  const bossActions = useGameStore((s) => s.lastBossActions);

  if (!result) {
    return (
      <Screen>
        <Text>No results yet.</Text>
        <Button label="Go to Dashboard" variant="secondary" onPress={() => router.replace('/dashboard')} />
      </Screen>
    );
  }

  const repColor = result.reputationDelta >= 0 ? colors.success : colors.danger;

  return (
    <Screen
      footer={
        <View style={{ gap: spacing.sm }}>
          <Button label="Upgrade Shop" onPress={() => router.replace('/shop')} />
          <Button
            label="Next Night"
            variant="secondary"
            onPress={() => router.replace('/dashboard')}
          />
        </View>
      }
    >
      <View style={styles.headerRow}>
        <Text variant="label" muted style={{ flex: 1 }}>
          NIGHT {result.day} — THE MORNING AFTER
        </Text>
        <Pill label={getEvent(result.eventId).name} color={colors.neonViolet} />
      </View>

      {club && club.cash < 0 ? (
        <Card title="In the red" accent={colors.danger}>
          <Text variant="body" color={colors.danger}>
            Wages outran the till — you're {money(club.cash)} in the bank.
          </Text>
          <Text variant="label" muted>
            Run a lean Quiet Night (cut the crew back) to earn your way out — you can always open the doors.
          </Text>
        </Card>
      ) : null}

      <View style={styles.row}>
        <StatCard
          label="Net"
          value={signedMoney(result.net)}
          accent={moneyColor(result.net)}
        />
        <StatCard
          label="Guests"
          value={`${result.guests} / ${result.capacity}`}
          accent={colors.neonCyan}
        />
      </View>
      <View style={styles.row}>
        <StatCard
          label="Reputation"
          value={`${result.reputationAfter}`}
          delta={`${signed(result.reputationDelta)}`}
          deltaColor={repColor}
          accent={colors.neonMagenta}
        />
        <StatCard label="Incidents" value={`${result.incidents}`} accent={result.incidents ? colors.danger : colors.textPrimary} />
      </View>

      <Card title="The Books">
        <ResultRow label="Cover charge" value={money(result.coverRevenue)} />
        <ResultRow label="Bar" value={money(result.barRevenue)} />
        {result.vipBonus > 0 ? <ResultRow label="VIP spend" value={money(result.vipBonus)} /> : null}
        {result.bookingFee !== 0 ? (
          <ResultRow
            label="Booking fee"
            value={money(result.bookingFee)}
            valueColor={result.bookingFee > 0 ? colors.success : colors.danger}
          />
        ) : null}
        <ResultRow label="Revenue" value={money(result.revenue)} strong valueColor={colors.success} />
        <View style={styles.divider} />
        <ResultRow label="Wages" value={`-${money(result.wages)}`} />
        {result.eventCost > 0 ? (
          <ResultRow
            label={`${getEvent(result.eventId).name} cost`}
            value={`-${money(result.eventCost)}`}
            valueColor={colors.warning}
          />
        ) : null}
        {result.fines > 0 ? (
          <ResultRow label="Fines" value={`-${money(result.fines)}`} valueColor={colors.danger} />
        ) : null}
        {result.theft > 0 ? (
          <ResultRow label="Theft" value={`-${money(result.theft)}`} valueColor={colors.danger} />
        ) : null}
        <ResultRow label="Costs" value={`-${money(result.costs)}`} strong valueColor={colors.danger} />
        <View style={styles.divider} />
        <ResultRow label="Net" value={signedMoney(result.net)} strong valueColor={moneyColor(result.net)} />
      </Card>

      <View style={styles.row}>
        <StatCard label="VIP Satisfaction" value={`${result.vipSatisfaction}`} />
        <StatCard label="Regular Loyalty" value={`${result.regularLoyalty}`} />
      </View>

      <Card title="Manager's Debrief">
        {buildDebrief(result, club ?? undefined, bossActions).map((line) => (
          <View key={line.key} style={styles.note}>
            <View style={[styles.dot, { backgroundColor: DEBRIEF_COLOR[line.tone] }]} />
            <Text variant="body" style={{ flex: 1, lineHeight: 21 }}>
              <Text variant="body" color={DEBRIEF_COLOR[line.tone]}>
                {line.label}:{' '}
              </Text>
              {line.text}
            </Text>
          </View>
        ))}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  row: { flexDirection: 'row', gap: spacing.md },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginVertical: spacing.xs },
  note: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start', paddingVertical: spacing.xs },
  dot: { width: 8, height: 8, borderRadius: radius.pill, marginTop: 7 },
});
