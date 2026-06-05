import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { FloorView } from '@/components/FloorView';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import {
  BOSS_ACTIONS,
  type BossActionId,
  bossIntervention,
  combineInterventions,
  type MoodTone,
  resolveBossAction,
} from '@/lib/bossActions';
import { CROWD_SEGMENTS, crowdMix, topCrowd } from '@/domain/crowd';
import { DJ_FLOOR_LABEL } from '@/domain/dj';
import { topRegulars } from '@/domain/regulars';
import { nightMentorLine } from '@/lib/mentor';
import { type Encounter, type EncounterChoice, pickEncounter } from '@/lib/encounters';
import { buildFloorView, type FloorBubble, floorBubbles, floorEmotes, venueFloorChips } from '@/lib/dashboard';
import type { BeatTone } from '@/lib/timeline';
import { buildNightPhases, encounterPhaseKey } from '@/lib/nightPhases';
import { nightZones, type ZoneKey } from '@/lib/venue';
import { useGameStore } from '@/state/store';
import { colors, radius, spacing } from '@/theme/tokens';

const TONE_COLOR: Record<BeatTone, string> = {
  good: colors.success,
  bad: colors.danger,
  warn: colors.warning,
  info: colors.neonCyan,
  neutral: colors.textMuted,
};
const MOOD_COLOR: Record<MoodTone, string> = {
  good: colors.success,
  info: colors.neonCyan,
  warn: colors.warning,
  neutral: colors.textMuted,
};

export default function NightTimelineScreen() {
  const club = useGameStore((s) => s.club);
  const runNight = useGameStore((s) => s.runNight);
  // Capture tonight's prep + the preview once at mount (store clears plannedConfig on commit).
  const [plan] = useState(() => useGameStore.getState().plannedConfig);
  const [preview] = useState(() => (plan ? useGameStore.getState().previewNight(plan) : null));

  // Which phase of the night we're living through (0-based).
  const [step, setStep] = useState(0);
  const [committed, setCommitted] = useState<ReturnType<typeof runNight>>(null);
  // Boss Actions taken tonight (once per action), with their live floor reactions.
  const [chosen, setChosen] = useState<BossActionId[]>([]);
  const [reactions, setReactions] = useState<FloorBubble[]>([]);
  const [mood, setMood] = useState<{ label: string; tone: MoodTone } | null>(null);
  const [recap, setRecap] = useState<string[]>([]);
  const [flashZone, setFlashZone] = useState<ZoneKey | undefined>(undefined);
  // A transient "situation" the night may throw — derived once from the preview.
  const [encounter] = useState<Encounter | null>(() => {
    const c = useGameStore.getState().club;
    if (!plan || !preview || !c) return null;
    return pickEncounter(preview, { ...c, lastConfig: plan });
  });
  const [encChoice, setEncChoice] = useState<EncounterChoice | null>(null);

  if (!club || !plan || !preview) {
    router.replace('/dashboard');
    return null;
  }

  const planClub = { ...club, lastConfig: plan };
  const shownResult = committed ?? preview;

  const phases = buildNightPhases(shownResult, planClub);
  const lastStep = phases.length - 1;
  const atEnd = step >= lastStep;
  const phase = phases[Math.min(step, lastStep)];

  // The encounter fires inside the phase that matches its zone, and stays until commit.
  const encPhaseIndex = encounter ? phases.findIndex((p) => p.key === encounterPhaseKey(encounter.zone)) : -1;
  const encounterDue = !!encounter && !committed && step >= encPhaseIndex;

  const floor = buildFloorView(planClub, shownResult);
  const zones = nightZones(shownResult);
  // The floor's headline reacts to the live night: a boss-action mood overrides,
  // otherwise the current phase sets the tone/accent so the room visibly shifts.
  const moodAccent = committed ? undefined : mood ? MOOD_COLOR[mood.tone] : TONE_COLOR[phase.tone];
  const moodLabel = committed ? undefined : mood ? mood.label : phase.title;
  // Live floor: ambient guest emotes + the boss/encounter reactions. After the
  // night commits, switch to the outcome bubbles.
  const bubbles = committed ? floorBubbles(committed) : [...floorEmotes(preview, planClub), ...reactions];
  // Highlight the zone in focus this phase (a boss/encounter call overrides).
  const liveFlash = committed ? undefined : flashZone ?? phase.zone;

  const advance = () => setStep((s) => Math.min(s + 1, lastStep));

  const commit = () => {
    if (committed) return committed;
    // Fold any boss actions AND the encounter choice into ONE bounded intervention.
    const combined = combineInterventions([
      bossIntervention(chosen, preview, planClub),
      ...(encChoice ? [encChoice.intervention] : []),
    ]);
    const r = runNight(plan, combined, chosen);
    if (r) setCommitted(r);
    return r;
  };

  const onChoose = (ch: EncounterChoice) => {
    if (committed || encChoice) return; // one call per situation; locked after
    setEncChoice(ch);
    setReactions((b) => [...b.filter((x) => x.zone !== ch.bubble.zone), ch.bubble]);
    setFlashZone(ch.bubble.zone);
    setRecap((r) => [...r, ch.outcome]);
  };

  const onAction = (id: BossActionId) => {
    if (committed || chosen.includes(id)) return; // once per action; locked after commit
    const outcome = resolveBossAction(id, preview, planClub);
    setChosen((c) => [...c, id]);
    setReactions((b) => [...b.filter((x) => x.zone !== outcome.bubble.zone), outcome.bubble]);
    setMood(outcome.mood);
    setFlashZone(outcome.bubble.zone);
    setRecap((r) => [...r, outcome.call]); // short "boss call" line
  };

  const toResults = () => {
    if (!commit()) {
      router.replace('/dashboard');
      return;
    }
    router.replace('/results');
  };

  return (
    <Screen
      footer={
        atEnd ? (
          <Button label="See the books" onPress={toResults} />
        ) : (
          <View style={{ gap: spacing.sm }}>
            <Button label={phase.advanceLabel ?? 'Next moment →'} onPress={advance} />
            <Button label="Skip to the books" variant="secondary" onPress={toResults} />
          </View>
        )
      }
    >
      <FloorView
        floor={floor}
        bubbles={bubbles}
        moodAccent={moodAccent}
        moodLabel={moodLabel}
        title="Tonight"
        pulse={!committed}
        zones={zones}
        flashZone={liveFlash}
        venueChips={venueFloorChips(planClub)}
        crowdTags={topCrowd(crowdMix(planClub, plan), 3).map((id) => CROWD_SEGMENTS[id].name)}
        regularTags={topRegulars(club.regularBase, 2).filter((r) => r.score >= 15).map((r) => `${r.name} back`)}
        djLabel={DJ_FLOOR_LABEL[plan.dj ?? 'house']}
      />

      {/* The phase you're living through right now. */}
      <Card title={`The Night · ${phase.time}`}>
        <View style={[styles.beat, { borderLeftColor: TONE_COLOR[phase.tone] }]}>
          <View style={styles.beatHead}>
            <Text variant="heading" color={TONE_COLOR[phase.tone]}>
              {phase.title}
            </Text>
            <Text variant="label" muted>
              Phase {Math.min(step + 1, phases.length)} of {phases.length}
            </Text>
          </View>
          <Text variant="body" muted style={styles.beatText}>
            {phase.situation}
          </Text>
        </View>
      </Card>

      {/* A situation on the floor — fires in the phase it belongs to. */}
      {encounterDue && encounter ? (
        <Card title="Situation" accent={colors.warning}>
          <Text variant="heading">{encounter.situation}</Text>
          {!encChoice ? (
            <View style={styles.tray}>
              {encounter.choices.map((ch) => (
                <Pressable
                  key={ch.id}
                  onPress={() => onChoose(ch)}
                  accessibilityRole="button"
                  style={styles.action}
                >
                  <Text variant="heading" color={colors.neonMagenta}>
                    {ch.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : (
            <Text variant="body" muted style={styles.beatText}>
              {encChoice.outcome}
            </Text>
          )}
        </Card>
      ) : null}

      {/* Boss Actions tray — calls you make on the floor, anytime, once each. */}
      {!committed ? (
        <Card title="Your Call">
          {club.day <= 6 && nightMentorLine(chosen.length) ? (
            <Text variant="label" color={colors.neonCyan} style={{ lineHeight: 18 }}>
              {nightMentorLine(chosen.length)}
            </Text>
          ) : null}
          <View style={styles.tray}>
            {BOSS_ACTIONS.map((a) => {
              const used = chosen.includes(a.id);
              return (
                <Pressable
                  key={a.id}
                  onPress={() => onAction(a.id)}
                  disabled={used}
                  accessibilityRole="button"
                  accessibilityState={{ disabled: used }}
                  style={[styles.action, used && styles.actionUsed]}
                >
                  <Text variant="heading" color={used ? colors.textMuted : colors.neonMagenta}>
                    {a.label}
                  </Text>
                  <Text variant="label" muted>
                    {used ? 'Done' : a.hint}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {recap.length > 0 ? (
            <View style={styles.recap}>
              {recap.map((line, i) => (
                <Text key={i} variant="label" muted style={styles.recapLine}>
                  • {line}
                </Text>
              ))}
            </View>
          ) : null}
        </Card>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  beat: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderLeftWidth: 3,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  beatHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: spacing.md },
  beatText: { lineHeight: 22 },
  tray: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  action: {
    flexGrow: 1,
    flexBasis: '47%',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: 2,
  },
  actionUsed: { opacity: 0.5 },
  recap: { gap: 2, marginTop: spacing.sm },
  recapLine: { lineHeight: 18 },
});
