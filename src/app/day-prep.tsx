import { router } from 'expo-router';
import { type ReactNode, useState } from 'react';
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
import { checklistDone, firstNightChecklist, firstNightReady, isFirstNight, MENTOR_LABEL, prepMentorLine } from '@/lib/mentor';
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
  // First-night tutorial gate: which setup areas the owner has ACTUALLY engaged
  // (derived from real interaction, never a fakeable manual tick). In-screen only.
  const [touched, setTouched] = useState<Set<string>>(() => new Set());
  // Guided first-night wizard: the current step (0=crew, 1=bar, 2=rules).
  const [wizardStep, setWizardStep] = useState(0);

  if (!club) {
    router.replace('/');
    return null;
  }

  const touch = (id: string) => setTouched((s) => (s.has(id) ? s : new Set(s).add(id)));

  const set = <K extends keyof DayConfig>(key: K, value: DayConfig[K]) =>
    setConfig((c) => ({ ...c, [key]: value }));

  const policies = config.policies ?? DEFAULT_POLICIES;
  const setPolicy = <K extends keyof PoliciesConfig>(key: K, value: PoliciesConfig[K]) => {
    touch('rules');
    setConfig((c) => {
      const nextPolicies = { ...(c.policies ?? DEFAULT_POLICIES), [key]: value };
      // Keep the legacy smoking lever in sync so the resolver's smoking math runs.
      const smoking = key === 'smoking' ? legacySmoking(value as SmokingRule) : c.smoking;
      return { ...c, policies: nextPolicies, smoking };
    });
  };

  // Drop scheduled ids no longer employed (fired since last night).
  const onDuty = config.staffOnDuty.filter((id) => club.staff.some((m) => m.id === id));
  const toggleStaff = (id: string) => {
    touch('crew');
    set('staffOnDuty', onDuty.includes(id) ? onDuty.filter((x) => x !== id) : [...onDuty, id]);
  };

  // Locked-event fallback: a saved event that's no longer unlocked reverts to Quiet.
  const available = unlockedEvents(club);
  const eventId = available.some((e) => e.id === config.eventId) ? config.eventId : 'regular';
  const event = getEvent(eventId);
  const requirement = eventRequirement(club, eventId);
  const readiness = eventReadiness(club, { ...config, eventId, staffOnDuty: onDuty });

  const drink = config.drinkPrep ?? DEFAULT_DRINK_PREP;
  const setDrink = <K extends keyof DrinkPrep>(key: K, value: DrinkPrep[K]) => {
    touch('bar');
    setConfig((c) => ({ ...c, drinkPrep: { ...(c.drinkPrep ?? DEFAULT_DRINK_PREP), [key]: value } }));
  };

  const wages = wagesForOnDuty(club.staff, onDuty); // post-night estimate, not upfront
  const capacity = club.baseCapacity + aggregateEffects(club.ownedUpgradeIds).capacity;
  const stock = stockCost(config.drinkPrep, capacity); // upfront, like the event fee
  const djFee = djCost(config.dj); // upfront, like the event fee
  const upfront = event.cost + stock + djFee;
  const validSchedule = isValidSchedule(club.staff, onDuty);
  const canAffordUpfront = upfront === 0 || club.cash >= upfront;

  // First-night gate: a brand-new owner is walked through three steps, one at a
  // time. "Done" is derived ONLY from real interaction (`touched`), never from
  // default values — nothing is pre-ticked, and each step needs a real choice.
  const firstNight = isFirstNight(club);
  const done = checklistDone(touched);
  const ready = !firstNight || firstNightReady(touched);
  const canOpen = validSchedule && canAffordUpfront && requirement.met && ready;

  const crowdTags = topCrowd(crowdMix(club, { ...config, eventId, staffOnDuty: onDuty }), 3);
  const mentorTip = prepMentorLine(club, { ...config, eventId, staffOnDuty: onDuty });

  const onOpen = () => {
    planNight({ ...config, eventId, staffOnDuty: onDuty });
    router.replace('/night-timeline');
  };

  // --- Section cards (reused by the wizard and the full prep screen) ----------
  const crewCard = (
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
      {firstNight ? (
        done.crew ? (
          <Text variant="label" color={colors.success}>✓ Crew confirmed</Text>
        ) : (
          <>
            <Button label="Confirm crew" onPress={() => touch('crew')} disabled={!validSchedule} />
            {!validSchedule ? (
              <Text variant="label" color={colors.warning}>Put at least one bartender on duty first.</Text>
            ) : null}
          </>
        )
      ) : null}
    </Card>
  );

  const barCard = (
    <Card title="Bar Stock">
      <SegmentedControl
        label="Stock amount"
        value={drink.stock}
        options={STOCK_OPTIONS}
        onChange={(v) => setDrink('stock', v)}
        accent={colors.warning}
      />
      <Text variant="label" muted>{STOCK_BLURB[drink.stock]}</Text>
      <SegmentedControl
        label="Stock quality"
        value={drink.quality}
        options={QUALITY_OPTIONS}
        onChange={(v) => setDrink('quality', v)}
      />
      <Text variant="label" muted>{QUALITY_BLURB[drink.quality]}</Text>
      <Text variant="label" muted>
        This is what you pour. Premium pours need premium stock — the Menu Price (in Pricing) is
        separate, and charging premium for cheap stock will be noticed.
      </Text>
    </Card>
  );

  const rulesCard = (
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
        onChange={(v) => { touch('rules'); set('vipFocus', v); }}
      />
    </Card>
  );

  // --- Guided first-night wizard: one step at a time --------------------------
  const steps: { id: keyof typeof done; n: number; title: string; guide: string; card: ReactNode; done: boolean }[] = [
    { id: 'crew', n: 1, title: 'Pick your crew', guide: 'Spend your starting cash on the right crew — good staff decide how the night goes. Set who works tonight, then confirm.', card: crewCard, done: done.crew },
    { id: 'bar', n: 2, title: 'Set the bar', guide: 'Order tonight’s stock. Tap an option for amount and quality to lock each in.', card: barCard, done: done.bar },
    { id: 'rules', n: 3, title: 'Set house rules', guide: 'Choose your door and bar rules. Tap an option for each to set it on purpose.', card: rulesCard, done: done.rules },
  ];
  const inWizard = firstNight && wizardStep < steps.length;

  if (inWizard) {
    const cur = steps[wizardStep];
    const last = wizardStep === steps.length - 1;
    return (
      <Screen
        footer={
          <View style={{ gap: spacing.sm }}>
            {!cur.done ? (
              <Text variant="label" color={colors.warning}>
                {cur.id === 'crew' ? 'Set your crew, then tap Confirm crew.' : 'Tap an option to set this step.'}
              </Text>
            ) : null}
            <View style={styles.wizardNav}>
              {wizardStep > 0 ? (
                <View style={{ flex: 1 }}>
                  <Button label="Back" variant="secondary" onPress={() => setWizardStep((s) => Math.max(0, s - 1))} />
                </View>
              ) : null}
              <View style={{ flex: 2 }}>
                <Button
                  label={last ? 'Finish setup' : 'Next step'}
                  onPress={() => setWizardStep((s) => s + 1)}
                  disabled={!cur.done}
                />
              </View>
            </View>
          </View>
        }
      >
        <Text variant="title">Before You Open</Text>
        <Card title={`Step ${cur.n} of ${steps.length}`} accent={colors.neonCyan}>
          <Text variant="heading">{cur.title}</Text>
          <Text variant="body" muted style={styles.wizardGuide}>
            {MENTOR_LABEL}: {cur.guide}
          </Text>
          <View style={styles.dots}>
            {steps.map((s, i) => (
              <View
                key={s.id}
                style={[styles.dot, s.done ? styles.dotDone : i === wizardStep ? styles.dotCur : null]}
              />
            ))}
          </View>
        </Card>
        {cur.card}
      </Screen>
    );
  }

  // --- Full prep screen (post-tutorial, or after the wizard) ------------------
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
          ) : null}
          <Button label="Open the Doors" onPress={onOpen} disabled={!canOpen} />
        </View>
      }
    >
      <Text variant="title">Prepare the Club</Text>
      <Text variant="label" muted style={styles.subhead}>
        Set the room before you open. Your plan for the night lives at the bottom.
      </Text>

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

      {barCard}
      {crewCard}
      {rulesCard}

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
  wizardNav: { flexDirection: 'row', gap: spacing.sm },
  wizardGuide: { lineHeight: 21 },
  dots: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  dot: { width: 10, height: 10, borderRadius: radius.pill, backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border },
  dotCur: { borderColor: colors.neonCyan },
  dotDone: { backgroundColor: colors.success, borderColor: colors.success },
});
