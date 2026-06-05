import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card, StatCard } from '@/components/Card';
import { Pill, ResultRow } from '@/components/Controls';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { djCost } from '@/domain/dj';
import { stockCost } from '@/domain/drinks';
import { getEvent } from '@/domain/events';
import { buildBossReport, type DebriefTone } from '@/lib/debrief';
import { MENTOR_LABEL, resultMentorLine } from '@/lib/mentor';
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
  const [showDetails, setShowDetails] = useState(false);

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
        {(() => {
          const stock = stockCost(club?.lastConfig.drinkPrep, result.capacity);
          return stock > 0 ? (
            <ResultRow label="Stock order" value={`-${money(stock)}`} valueColor={colors.warning} />
          ) : null;
        })()}
        {(() => {
          const fee = djCost(club?.lastConfig.dj);
          return fee > 0 ? (
            <ResultRow label="DJ booking" value={`-${money(fee)}`} valueColor={colors.warning} />
          ) : null;
        })()}
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

      {club && club.day <= 6 ? (
        <Card title={MENTOR_LABEL} accent={colors.neonCyan}>
          <Text variant="body" style={{ lineHeight: 21 }}>
            {resultMentorLine(result)}
          </Text>
        </Card>
      ) : null}

      {(() => {
        const report = buildBossReport(result, club ?? undefined, bossActions);
        return (
          <Card title="Manager's Debrief">
            <Text variant="body" color={DEBRIEF_COLOR[report.summary.tone]} style={styles.summary}>
              {report.summary.text}
            </Text>
            {report.bullets.map((line) => (
              <View key={line.key} style={styles.note}>
                <View style={[styles.dot, { backgroundColor: DEBRIEF_COLOR[line.tone] }]} />
                <Text variant="body" style={{ flex: 1, lineHeight: 21 }}>
                  {line.text}
                </Text>
              </View>
            ))}
            <View style={styles.fixRow}>
              <Text variant="body" color={DEBRIEF_COLOR[report.fix.tone]}>
                Tomorrow:{' '}
              </Text>
              <Text variant="body" style={{ flex: 1, lineHeight: 21 }}>
                {report.fix.text}
              </Text>
            </View>

            <Pressable onPress={() => setShowDetails((s) => !s)} accessibilityRole="button" style={styles.detailsToggle}>
              <Text variant="label" color={colors.neonCyan}>
                {showDetails ? 'Hide details ▴' : 'Details ▾'}
              </Text>
            </Pressable>
            {showDetails
              ? report.full
                  .filter((line) => line.key !== 'summary' && line.key !== 'fix')
                  .map((line) => (
                    <View key={line.key} style={styles.note}>
                      <View style={[styles.dot, { backgroundColor: DEBRIEF_COLOR[line.tone] }]} />
                      <Text variant="body" style={{ flex: 1, lineHeight: 21 }}>
                        <Text variant="body" color={DEBRIEF_COLOR[line.tone]}>
                          {line.label}:{' '}
                        </Text>
                        {line.text}
                      </Text>
                    </View>
                  ))
              : null}
          </Card>
        );
      })()}
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  row: { flexDirection: 'row', gap: spacing.md },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginVertical: spacing.xs },
  note: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start', paddingVertical: spacing.xs },
  dot: { width: 8, height: 8, borderRadius: radius.pill, marginTop: 7 },
  summary: { lineHeight: 22, fontWeight: '600' },
  fixRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: spacing.xs },
  detailsToggle: { paddingVertical: spacing.xs, marginTop: spacing.xs },
});
