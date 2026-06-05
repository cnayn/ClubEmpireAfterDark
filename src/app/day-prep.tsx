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
import { DJ_BLURB, DJ_OPTIONS, djCost } from '@/domain/dj';
import { firstNightChecklist, isFirstNight, MENTOR_LABEL, prepMentorLine } from '@/lib/mentor';
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
  // First-night tutorial gate: which basics the owner has reviewed (in-screen only).
  const [acked, setAcked] = useState<Set<string>>(() => new Set());

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
  const djFee = djCost(config.dj); // upfront, like the event fee
  const upfront = event.cost + stock + djFee;
  const validSchedule = isValidSchedule(club.staff, onDuty);
  // Upfront = event fee + stock order; crew wages settle after the night. A free
  // night (Quiet + Lean/Standard stock) stays openable even from negative cash.
  const canAffordUpfront = upfront === 0 || club.cash >= upfront;
  // First-night gate: a brand-new owner reviews the basics before opening blind.
  const firstNight = isFirstNight(club);
  const checklist = firstNightChecklist();
  const ready = !firstNight || acked.size >= checklist.length;
  const ackItem = (id: string) => setAcked((s) => new Set(s).add(id));
  const canOpen = validSchedule && canAffordUpfront && requirement.met && ready;

  // Derived readouts (rendered at the BOTTOM, below every selector, so changing a
  // selector never reflows content above the control you just tapped — this is the
  // scroll-jump fix).
  const crowdTags = topCrowd(crowdMix(club, { ...config, eventId, staffOnDuty: onDuty }), 3);
  const mentorTip = prepMentorLine(club, { ...config, eventId, staffOnDuty: onDuty });

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
          {mentorTip ? (
            <Text variant="label" color={colors.neonCyan} style={styles.footerTip}>
              {MENTOR_LABEL}: {mentorTip}
            </Text>
          ) : null}
          {event.cost > 0 ? (
            <ResultRow label={`${event.name} cost (upfront)`} value={`-${money(event.cost)}`} valueColor={colors.warning} />
          ) : null}
          {stock > 0 ? (
            <ResultRow label="Stock order (upfront)" value={`-${money(stock)}`} valueColor={colors.warning} />
          ) : null}
          {djFee > 0 ? (
            <ResultRow label="DJ booking (upfront)" value={`-${money(djFee)}`} valueColor={colors.warning} />
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
          ) : !ready ? (
            <Text variant="label" color={colors.warning}>
              Don't open blind — review the basics above first ({acked.size}/{checklist.length}).
            </Text>
          ) : null}
          <Button label={ready ? 'Open the Doors' : 'Review setup first'} onPress={onOpen} disabled={!canOpen} />
        </View>
      }
    >
      <Text variant="title">Prepare the Club</Text>
      <Text variant="label" muted style={styles.subhead}>
        Set the room before you open. Your plan for the night lives at the bottom.
      </Text>

      {firstNight ? (
        <Card title="Before You Open" accent={colors.neonCyan}>
          <Text variant="label" muted>
            {MENTOR_LABEL}: Don't open blind. Tap each as you set it — then the doors are yours.
          </Text>
          {checklist.map((item) => {
            const done = acked.has(item.id);
            return (
              <Pressable
                key={item.id}
                onPress={() => ackItem(item.id)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: done }}
                style={styles.checkRow}
              >
                <View style={[styles.checkBox, done && styles.checkBoxOn]}>
                  <Text variant="label" color={done ? colors.bg : colors.textMuted}>
                    {done ? '✓' : ''}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="body" color={done ? colors.success : colors.textPrimary}>
                    {item.label}
                  </Text>
                  <Text variant="label" muted>
                    {item.hint}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </Card>
      ) : null}

      <Card title="Tonight's Booking">
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
      </Card>

      <Card title="Music / DJ">
        <SegmentedControl label="Genre" value={config.music} options={MUSIC} onChange={(v) => set('music', v)} />
        <SegmentedControl
          label="Booking"
          value={config.dj ?? 'house'}
          options={DJ_OPTIONS}
          onChange={(v) => set('dj', v)}
          accent={colors.neonMagenta}
        />
        <Text variant="label" muted>{DJ_BLURB[config.dj ?? 'house']}</Text>
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
          Low = accessible · Med = house · High = premium margin, fewer guests.
        </Text>
      </Card>

      <Card title="Bar Stock">
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
      </Card>

      <Card title="Crew on Duty">
        <Text variant="label" muted>
          Toggle off to rest someone — they stay hired, and you only pay who works.
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
                  : `Off duty · no wage tonight · ${strengthLabel(m.skill)}${trait}`
              }
              value={working}
              onChange={() => toggleStaff(m.id)}
              accent={m.role === 'bouncer' ? colors.neonCyan : colors.neonViolet}
            />
          );
        })}
        <Button label="Hire / Fire Staff" variant="secondary" onPress={() => router.push('/staff')} />
      </Card>

      <Card title="House Rules">
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

      {/* Derived readouts — kept LAST so a selector change never pushes a control
          above it up the page (the scroll-jump fix). */}
      <Card title="Tonight's Plan" accent={colors.neonViolet}>
        <Text variant="label" muted>Expected crowd</Text>
        <View style={styles.crowdTags}>
          {crowdTags.map((id) => (
            <Pill key={id} label={CROWD_SEGMENTS[id].name} color={colors.neonCyan} />
          ))}
        </View>
        <Text variant="label" muted>{CROWD_SEGMENTS[crowdTags[0]].likes}</Text>
        {readiness.messages.length > 0 ? <View style={styles.planDivider} /> : null}
        {readiness.messages.map((m, i) => (
          <Text key={i} variant="label" color={NOTE_COLOR[m.tone]}>
            {m.text}
          </Text>
        ))}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  subhead: { marginTop: -spacing.xs },
  footerTip: { lineHeight: 18 },
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
  planDivider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginVertical: spacing.xs },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xs },
  checkBox: {
    width: 24,
    height: 24,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
  },
  checkBoxOn: { backgroundColor: colors.success, borderColor: colors.success },
});
