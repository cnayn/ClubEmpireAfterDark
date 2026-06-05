import { router } from 'expo-router';
import { useEffect, useState } from 'react';
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
import { clockLabel, liveCrowdFraction, NIGHT_DURATION_MS, NIGHT_TICK_MS, phaseForProgress } from '@/lib/nightClock';
import { nightZones, type ZoneKey } from '@/lib/venue';
import type { ClubState, DayConfig } from '@/domain/types';
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
  const plan = useGameStore((s) => s.plannedConfig);
  if (!club || !plan) {
    router.replace('/dashboard');
    return null;
  }
  // Inner component owns all the clock hooks with guaranteed-present props, so the
  // hook order is unconditional (no rules-of-hooks violation behind a guard).
  return <LivingNight club={club} plan={plan} />;
}

function LivingNight({ club, plan }: { club: ClubState; plan: DayConfig }) {
  const runNight = useGameStore((s) => s.runNight);
  const [preview] = useState(() => useGameStore.getState().previewNight(plan));

  const planClub = { ...club, lastConfig: plan };
  const phases = preview ? buildNightPhases(preview, planClub) : [];
  const phaseCount = phases.length;

  // The transient situation for tonight + the phase it belongs to (start fraction).
  const [encounter] = useState<Encounter | null>(() => (preview ? pickEncounter(preview, planClub) : null));
  const encIndex = encounter ? phases.findIndex((p) => p.key === encounterPhaseKey(encounter.zone)) : -1;
  const encStart = encIndex >= 0 && phaseCount > 0 ? encIndex / phaseCount : null;

  // Real-time clock state.
  const [progress, setProgress] = useState(0); // 0..1 across the whole night
  const [running, setRunning] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [committed, setCommitted] = useState<ReturnType<typeof runNight>>(null);

  // Owner calls + their live floor reactions.
  const [chosen, setChosen] = useState<BossActionId[]>([]);
  const [reactions, setReactions] = useState<FloorBubble[]>([]);
  const [mood, setMood] = useState<{ label: string; tone: MoodTone } | null>(null);
  const [recap, setRecap] = useState<string[]>([]);
  const [flashZone, setFlashZone] = useState<ZoneKey | undefined>(undefined);
  const [encChoice, setEncChoice] = useState<EncounterChoice | null>(null);

  // The night runs itself: advance the clock while playing.
  useEffect(() => {
    if (committed || !running) return;
    const id = setInterval(() => {
      setProgress((p) => Math.min(1, p + (NIGHT_TICK_MS * speed) / NIGHT_DURATION_MS));
    }, NIGHT_TICK_MS);
    return () => clearInterval(id);
  }, [committed, running, speed]);

  // Stop the clock at last call.
  useEffect(() => {
    if (progress >= 1 && running) setRunning(false);
  }, [progress, running]);

  // Auto-pause when the night throws a situation, so the owner has to respond.
  useEffect(() => {
    if (committed || encStart == null || encChoice || phaseCount === 0) return;
    const end = encStart + 1 / phaseCount;
    if (progress >= encStart && progress < end && running) setRunning(false);
  }, [progress, committed, encStart, encChoice, phaseCount, running]);

  if (!preview) {
    router.replace('/dashboard');
    return null;
  }

  const shownResult = committed ?? preview;
  const lastStep = Math.max(0, phaseCount - 1);
  const step = committed ? lastStep : phaseForProgress(progress, phaseCount);
  const phase = phases[Math.min(step, lastStep)];
  const atEnd = committed != null || progress >= 1;
  const encounterDue = !!encounter && !committed && step >= encIndex;
  const encounterBlocking = encounterDue && !encChoice; // night paused on this call

  const floor = buildFloorView(planClub, shownResult);
  const zones = nightZones(shownResult);
  const moodAccent = committed ? undefined : mood ? MOOD_COLOR[mood.tone] : TONE_COLOR[phase.tone];
  const moodLabel = committed ? undefined : mood ? mood.label : phase.title;
  const bubbles = committed ? floorBubbles(committed) : [...floorEmotes(preview, planClub), ...reactions];
  const liveFlash = committed ? undefined : flashZone ?? phase.zone;
  const liveScale = committed ? 1 : liveCrowdFraction(progress);

  const commit = () => {
    if (committed) return committed;
    const combined = combineInterventions([
      bossIntervention(chosen, preview, planClub),
      ...(encChoice ? [encChoice.intervention] : []),
    ]);
    const r = runNight(plan, combined, chosen);
    if (r) setCommitted(r);
    return r;
  };

  const onChoose = (ch: EncounterChoice) => {
    if (committed || encChoice) return;
    setEncChoice(ch);
    setReactions((b) => [...b.filter((x) => x.zone !== ch.bubble.zone), ch.bubble]);
    setFlashZone(ch.bubble.zone);
    setRecap((r) => [...r, ch.outcome]);
    setRunning(true); // resume the night after the call
  };

  const onAction = (id: BossActionId) => {
    if (committed || chosen.includes(id)) return; // once each; you can act anytime
    const outcome = resolveBossAction(id, preview, planClub);
    setChosen((c) => [...c, id]);
    setReactions((b) => [...b.filter((x) => x.zone !== outcome.bubble.zone), outcome.bubble]);
    setMood(outcome.mood);
    setFlashZone(outcome.bubble.zone);
    setRecap((r) => [...r, outcome.call]);
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
          <View style={styles.footerRow}>
            <View style={styles.footerBtn}>
              <Button
                label={encounterBlocking ? 'Make the call ↑' : running ? 'Pause' : 'Resume'}
                variant={encounterBlocking ? 'secondary' : 'primary'}
                onPress={() => !encounterBlocking && setRunning((r) => !r)}
                disabled={encounterBlocking}
              />
            </View>
            <View style={styles.footerBtn}>
              <Button label="Skip to the books" variant="secondary" onPress={toResults} />
            </View>
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
        liveScale={liveScale}
      />

      {/* Live clock + the moment unfolding right now. */}
      <Card title={`The Night · ${committed ? '02:30' : clockLabel(progress)}`}>
        <View style={styles.clockHead}>
          <Text variant="heading" color={TONE_COLOR[phase.tone]}>
            {phase.title}
          </Text>
          {!committed ? (
            <Pressable onPress={() => setSpeed((s) => (s === 1 ? 2 : 1))} accessibilityRole="button" style={styles.speed}>
              <Text variant="label" color={colors.neonCyan}>
                {speed}× {running ? '▶' : '❚❚'}
              </Text>
            </Pressable>
          ) : null}
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.round((committed ? 1 : progress) * 100)}%`, backgroundColor: TONE_COLOR[phase.tone] }]} />
        </View>
        <Text variant="body" muted style={styles.beatText}>
          {phase.situation}
        </Text>
      </Card>

      {/* A situation on the floor — it pauses the night until you respond. */}
      {encounterDue && encounter ? (
        <Card title="Situation" accent={colors.warning}>
          <Text variant="heading">{encounter.situation}</Text>
          {!encChoice ? (
            <View style={styles.tray}>
              {encounter.choices.map((ch) => (
                <Pressable key={ch.id} onPress={() => onChoose(ch)} accessibilityRole="button" style={styles.action}>
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

      {/* Boss Actions — calls you make on the floor, anytime, once each. */}
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
  footerRow: { flexDirection: 'row', gap: spacing.sm },
  footerBtn: { flex: 1 },
  clockHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  speed: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
  },
  progressTrack: {
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    overflow: 'hidden',
  },
  progressFill: { height: 6, borderRadius: radius.pill },
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
