import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Pill, ResultRow, SegmentedControl, Toggle } from '@/components/Controls';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { MUSIC_LABEL } from '@/domain/balance';
import {
  DEFAULT_DRINK_PREP,
  QUALITY_BLURB,
  QUALITY_OPTIONS,
  STOCK_BLURB,
  STOCK_OPTIONS,
  stockCost,
} from '@/domain/drinks';
import { CROWD_SEGMENTS, crowdMix, topCrowd } from '@/domain/crowd';
import { eventReadiness, eventRequirement, getEvent, unlockedEvents } from '@/domain/events';
import { aggregateEffects } from '@/domain/upgrades';
import {
  DEFAULT_POLICIES,
  legacySmoking,
  POLICY_BLURB,
  POLICY_OPTIONS,
} from '@/domain/policies';
import { isValidSchedule, ROLE_LABEL, strengthLabel, TRAIT_LABEL, wagesForOnDuty } from '@/domain/staff';
import type { DayConfig, DrinkPrep, Level, MusicStyle, PoliciesConfig, ResultNote, SmokingRule } from '@/domain/types';
import { money } from '@/lib/format';
import { useGameStore } from '@/state/store';
import { colors, radius, spacing } from '@/theme/tokens';

const LEVELS: { value: Level; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'med', label: 'Med' },
  { value: 'high', label: 'High' },
];

const MUSIC: { value: MusicStyle; label: string }[] = (
  Object.keys(MUSIC_LABEL) as MusicStyle[]
).map((m) => ({ value: m, label: MUSIC_LABEL[m] }));

const NOTE_COLOR: Record<ResultNote['tone'], string> = {
  good: colors.success,
  bad: colors.danger,
  warn: colors.warning,
  info: colors.neonCyan,
};

export default function DayPrepScreen() {
  const club = useGameStore((s) => s.club);
  const planNight = useGameStore((s) => s.planNight);
  const [config, setConfig] = useState<DayConfig>(() => ({
    ...club!.lastConfig,
    policies: club!.lastConfig.policies ?? DEFAULT_POLICIES,
    drinkPrep: club!.lastConfig.drinkPrep ?? DEFAULT_DRINK_PREP,
  }));

  if (!club) {
    router.replace('/');
    return null;
  }

  const set = <K extends keyof DayConfig>(key: K, value: DayConfig[K]) =>
    setConfig((c) => ({ ...c, [key]: value }));

  const policies = config.policies ?? DEFAULT_POLICIES;
  const setPolicy = <K extends keyof PoliciesConfig>(key: K, value: PoliciesConfig[K]) =>
    setConfig((c) => {
      const nextPolicies = { ...(c.policies ?? DEFAULT_POLICIES), [key]: value };
      // Keep the legacy smoking lever in sync so the resolver's smoking math runs.
      const smoking = key === 'smoking' ? legacySmoking(value as SmokingRule) : c.smoking;
      return { ...c, policies: nextPolicies, smoking };
    });

  // Drop scheduled ids no longer employed (fired since last night).
  const onDuty = config.staffOnDuty.filter((id) => club.staff.some((m) => m.id === id));
  const toggleStaff = (id: string) =>
    set('staffOnDuty', onDuty.includes(id) ? onDuty.filter((x) => x !== id) : [...onDuty, id]);

  // Locked-event fallback: a saved event that's no longer unlocked reverts to Quiet.
  const available = unlockedEvents(club);
  const eventId = available.some((e) => e.id === config.eventId) ? config.eventId : 'regular';
  const event = getEvent(eventId);
  const requirement = eventRequirement(club, eventId);
  const readiness = eventReadiness(club, { ...config, eventId, staffOnDuty: onDuty });

  const drink = config.drinkPrep ?? DEFAULT_DRINK_PREP;
  const setDrink = <K extends keyof DrinkPrep>(key: K, value: DrinkPrep[K]) =>
    setConfig((c) => ({ ...c, drinkPrep: { ...(c.drinkPrep ?? DEFAULT_DRINK_PREP), [key]: value } }));

  const wages = wagesForOnDuty(club.staff, onDuty); // post-night estimate, not upfront
  const capacity = club.baseCapacity + aggregateEffects(club.ownedUpgradeIds).capacity;
  const stock = stockCost(config.drinkPrep, capacity); // upfront, like the event fee
  const upfront = event.cost + stock;
  const validSchedule = isValidSchedule(club.staff, onDuty);
  // Upfront = event fee + stock order; crew wages settle after the night. A free
  // night (Quiet + Lean/Standard stock) stays openable even from negative cash.
  const canAffordUpfront = upfront === 0 || club.cash >= upfront;
  const canOpen = validSchedule && canAffordUpfront && requirement.met;

  const onOpen = () => {
    // Defer resolution: the night resolves during playback (after the live
    // intervention beat), so we only stash tonight's prep here.
    planNight({ ...config, eventId, staffOnDuty: onDuty });
    router.replace('/night-timeline');
  };

  return (
    <Screen
      footer={
        <View style={{ gap: 8 }}>
          {event.cost > 0 ? (
            <ResultRow label={`${event.name} cost (upfront)`} value={`-${money(event.cost)}`} valueColor={colors.warning} />
          ) : null}
          {stock > 0 ? (
            <ResultRow label="Stock order (upfront)" value={`-${money(stock)}`} valueColor={colors.warning} />
          ) : null}
          {event.bookingFee > 0 ? (
            <ResultRow label="Booking fee (up to, if you deliver)" value={`+${money(event.bookingFee)}`} valueColor={colors.success} />
          ) : null}
          <ResultRow label="Crew wages (paid after the night)" value={`~${money(wages)}`} valueColor={colors.textMuted} />
          {!validSchedule ? (
            <Text variant="label" color={colors.danger}>
              You need at least one bartender on duty to open.
            </Text>
          ) : !requirement.met ? (
            <Text variant="label" color={colors.danger}>
              {requirement.reason}
            </Text>
          ) : !canAffordUpfront ? (
            <Text variant="label" color={colors.danger}>
              You can't cover tonight's upfront {money(upfront)} ({money(club.cash)} in the bank). Try
              Lean stock or a Quiet Night.
            </Text>
          ) : null}
          <Button label="Open the Doors" onPress={onOpen} disabled={!canOpen} />
        </View>
      }
    >
      <Card title="Tonight's Event">
        {available.map((e) => {
          const selected = e.id === eventId;
          return (
            <Pressable
              key={e.id}
              onPress={() => set('eventId', e.id)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              style={[styles.eventRow, selected && styles.eventRowSel]}
            >
              <View style={{ flex: 1, gap: 2 }}>
                <Text variant="body" color={selected ? colors.neonMagenta : colors.textPrimary}>
                  {e.name}
                </Text>
                <Text variant="label" muted>
                  {e.description}
                </Text>
              </View>
              {e.cost > 0 ? (
                <Pill label={`-${money(e.cost)}`} color={colors.warning} />
              ) : e.bookingFee > 0 ? (
                <Pill label={`+${money(e.bookingFee)}`} color={colors.success} />
              ) : null}
            </Pressable>
          );
        })}
        {readiness.messages.map((m, i) => (
          <Text key={i} variant="label" color={NOTE_COLOR[m.tone]}>
            {m.text}
          </Text>
        ))}
      </Card>

      <Card title="Expected Crowd">
        {(() => {
          const tags = topCrowd(crowdMix(club, { ...config, eventId, staffOnDuty: onDuty }), 3);
          return (
            <>
              <View style={styles.crowdTags}>
                {tags.map((id) => (
                  <Pill key={id} label={CROWD_SEGMENTS[id].name} color={colors.neonCyan} />
                ))}
              </View>
              <Text variant="label" muted>
                {CROWD_SEGMENTS[tags[0]].likes}
              </Text>
            </>
          );
        })()}
      </Card>

      <Card title="Music">
        <SegmentedControl value={config.music} options={MUSIC} onChange={(v) => set('music', v)} />
      </Card>

      <Card title="Pricing">
        <SegmentedControl
          label="Cover charge"
          value={config.coverLevel}
          options={LEVELS}
          onChange={(v) => set('coverLevel', v)}
        />
        <SegmentedControl
          label="Menu price"
          value={config.drinkLevel}
          options={LEVELS}
          onChange={(v) => set('drinkLevel', v)}
        />
        <Text variant="label" muted>
          Low = accessible · Med = house pricing · High = premium margin, fewer guests.
        </Text>
      </Card>

      <Card title="Drink Prep">
        <Text variant="label" muted>
          Order the bar for tonight. Standard + House is the safe, free middle.
        </Text>
        <SegmentedControl
          label="Stock level"
          value={drink.stock}
          options={STOCK_OPTIONS}
          onChange={(v) => setDrink('stock', v)}
          accent={colors.warning}
        />
        <Text variant="label" muted>{STOCK_BLURB[drink.stock]}</Text>
        <SegmentedControl
          label="Drink quality"
          value={drink.quality}
          options={QUALITY_OPTIONS}
          onChange={(v) => setDrink('quality', v)}
        />
        <Text variant="label" muted>{QUALITY_BLURB[drink.quality]}</Text>
        <Text variant="label" color={stock > 0 ? colors.warning : colors.textMuted}>
          {stock > 0 ? `Stock order: ${money(stock)} upfront` : 'No stock order cost tonight.'}
        </Text>
      </Card>

      <Card title="On Duty Tonight">
        <Text variant="label" muted>
          Toggle off to rest someone tonight — they stay hired, and you only pay who works.
        </Text>
        {club.staff.map((m) => {
          const working = onDuty.includes(m.id);
          const trait = m.visibleTrait !== 'none' ? ` · ${TRAIT_LABEL[m.visibleTrait]}` : '';
          return (
            <Toggle
              key={m.id}
              label={`${m.name} · ${ROLE_LABEL[m.role]}`}
              description={
                working
                  ? `On duty · paid ${money(m.salary)} tonight · ${strengthLabel(m.skill)}${trait}`
                  : `Off duty · not scheduled, no wage tonight · ${strengthLabel(m.skill)}${trait}`
              }
              value={working}
              onChange={() => toggleStaff(m.id)}
              accent={m.role === 'bouncer' ? colors.neonCyan : colors.neonViolet}
            />
          );
        })}
        <Button label="Hire / Fire Staff" variant="secondary" onPress={() => router.push('/staff')} />
      </Card>

      <Card title="Club Policies">
        <Text variant="label" muted>
          Set the house rules. The middle option of each is the safe, balanced choice.
        </Text>

        <SegmentedControl
          label="Smoking"
          value={policies.smoking}
          options={POLICY_OPTIONS.smoking}
          onChange={(v) => setPolicy('smoking', v)}
          accent={colors.warning}
        />
        <Text variant="label" muted>{POLICY_BLURB.smoking[policies.smoking]}</Text>

        <SegmentedControl
          label="ID Strictness"
          value={policies.idCheck}
          options={POLICY_OPTIONS.idCheck}
          onChange={(v) => setPolicy('idCheck', v)}
        />
        <Text variant="label" muted>{POLICY_BLURB.idCheck[policies.idCheck]}</Text>

        <SegmentedControl
          label="Security Posture"
          value={policies.security}
          options={POLICY_OPTIONS.security}
          onChange={(v) => setPolicy('security', v)}
        />
        <Text variant="label" muted>{POLICY_BLURB.security[policies.security]}</Text>

        <SegmentedControl
          label="Bar Service"
          value={policies.barService}
          options={POLICY_OPTIONS.barService}
          onChange={(v) => setPolicy('barService', v)}
        />
        <Text variant="label" muted>{POLICY_BLURB.barService[policies.barService]}</Text>

        <Toggle
          label="VIP focus"
          description="Court the big spenders. Pays off once you have a name."
          value={config.vipFocus}
          onChange={(v) => set('vipFocus', v)}
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
  },
  eventRowSel: { borderColor: colors.neonMagenta },
  crowdTags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
