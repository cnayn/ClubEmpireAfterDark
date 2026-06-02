import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card, StatCard } from '@/components/Card';
import { ResultRow } from '@/components/Controls';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import type { ResultNote } from '@/domain/types';
import { money, moneyColor, signed, signedMoney } from '@/lib/format';
import { useGameStore } from '@/state/store';
import { colors, radius, spacing } from '@/theme/tokens';

const NOTE_COLOR: Record<ResultNote['tone'], string> = {
  good: colors.success,
  bad: colors.danger,
  warn: colors.warning,
  info: colors.neonCyan,
};

export default function ResultsScreen() {
  const result = useGameStore((s) => s.lastResult);

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
      <Text variant="label" muted>
        NIGHT {result.day} — THE MORNING AFTER
      </Text>

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
        <ResultRow label="Revenue" value={money(result.revenue)} strong valueColor={colors.success} />
        <View style={styles.divider} />
        <ResultRow label="Wages" value={`-${money(result.wages)}`} />
        <ResultRow label="Security" value={`-${money(result.securityCost)}`} />
        {result.fines > 0 ? (
          <ResultRow label="Fines" value={`-${money(result.fines)}`} valueColor={colors.danger} />
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
        {result.notes.length === 0 ? (
          <Text variant="body" muted>
            A quiet, uneventful night.
          </Text>
        ) : (
          result.notes.map((note, i) => (
            <View key={i} style={styles.note}>
              <View style={[styles.dot, { backgroundColor: NOTE_COLOR[note.tone] }]} />
              <Text variant="body" style={{ flex: 1, lineHeight: 21 }}>
                {note.text}
              </Text>
            </View>
          ))
        )}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.md },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginVertical: spacing.xs },
  note: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start', paddingVertical: spacing.xs },
  dot: { width: 8, height: 8, borderRadius: radius.pill, marginTop: 7 },
});
