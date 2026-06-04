import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { FloorView } from '@/components/FloorView';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { buildFloorView, floorBubbles } from '@/lib/dashboard';
import {
  getChoice,
  INTERVENTION_CHOICES,
  type InterventionChoice,
  type MoodTone,
  isCoolingNight,
} from '@/lib/intervention';
import type { BeatTone } from '@/lib/timeline';
import { buildTimeline } from '@/lib/timeline';
import { NO_INTERVENTION } from '@/sim/night';
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

const ROOM_BEAT_INDEX = 2; // Doors(0) → Bar(1) → The Room(2): the intervention beat

export default function NightTimelineScreen() {
  const club = useGameStore((s) => s.club);
  const runNight = useGameStore((s) => s.runNight);
  // Capture tonight's prep + the preview once at mount (the store clears plannedConfig on commit).
  const [plan] = useState(() => useGameStore.getState().plannedConfig);
  const [preview] = useState(() => (plan ? useGameStore.getState().previewNight(plan) : null));

  const [shown, setShown] = useState(1);
  const [phase, setPhase] = useState<'pre' | 'choosing' | 'post'>('pre');
  const [committed, setCommitted] = useState<ReturnType<typeof runNight>>(null);
  const [choiceId, setChoiceId] = useState<InterventionChoice['id'] | null>(null);

  if (!club || !plan || !preview) {
    router.replace('/dashboard');
    return null;
  }

  // Use the planned config for staff/event naming; reputation/day don't affect the floor or beats.
  const planClub = { ...club, lastConfig: plan };
  const cooling = isCoolingNight(preview);
  const shownResult = committed ?? preview;
  const beats = buildTimeline(shownResult, planClub);
  const finished = phase !== 'choosing' && shown >= beats.length;

  const choice = choiceId ? getChoice(choiceId) : null;
  const floor = buildFloorView(planClub, shownResult);
  const moodAccent = choice ? MOOD_COLOR[choice.mood.tone] : cooling ? colors.textMuted : undefined;
  const moodLabel = choice ? choice.mood.label : cooling && phase !== 'post' ? 'Cooling' : undefined;
  const bubbles = committed ? floorBubbles(committed) : [];

  const commit = (intervention = NO_INTERVENTION) => {
    if (committed) return committed;
    const r = runNight(plan, intervention);
    if (r) setCommitted(r);
    return r;
  };

  const advance = () => {
    if (phase === 'pre' && cooling && shown >= ROOM_BEAT_INDEX + 1) {
      setPhase('choosing');
      return;
    }
    setShown((s) => Math.min(s + 1, beats.length));
  };

  const onChoose = (c: InterventionChoice) => {
    const r = commit(c.intervention);
    if (!r) {
      router.replace('/dashboard');
      return;
    }
    setChoiceId(c.id);
    setPhase('post');
  };

  const toResults = () => {
    commit(NO_INTERVENTION); // commits a plain night if no choice was made (non-cooling / skipped)
    router.replace('/results');
  };

  return (
    <Screen
      footer={
        <View style={{ gap: spacing.sm }}>
          {finished ? (
            <Button label="See the books" onPress={toResults} />
          ) : (
            <Button label="Skip to the books" variant="secondary" onPress={toResults} />
          )}
        </View>
      }
    >
      <FloorView floor={floor} bubbles={bubbles} moodAccent={moodAccent} moodLabel={moodLabel} title="Tonight" />

      {phase === 'choosing' ? (
        <Card title="The room is cooling" accent={colors.warning}>
          <Text variant="body" muted style={styles.prompt}>
            The DJ isn&apos;t holding the crowd. One call —
          </Text>
          {INTERVENTION_CHOICES.map((c) => (
            <Pressable
              key={c.id}
              onPress={() => onChoose(c)}
              accessibilityRole="button"
              style={styles.choice}
            >
              <Text variant="heading" color={MOOD_COLOR[c.mood.tone]}>
                {c.label}
              </Text>
              <Text variant="label" muted>
                {c.blurb}
              </Text>
            </Pressable>
          ))}
        </Card>
      ) : (
        <Pressable onPress={advance} disabled={finished} accessibilityRole="button" accessibilityLabel="Next moment">
          <Card title="Tonight, as it happened">
            {beats.slice(0, shown).map((b, i) => (
              <View key={i} style={[styles.beat, { borderLeftColor: TONE_COLOR[b.tone] }]}>
                <View style={styles.beatHead}>
                  <Text variant="label" color={TONE_COLOR[b.tone]}>
                    {b.time}
                  </Text>
                  <Text variant="heading">{b.title}</Text>
                </View>
                <Text variant="body" muted style={styles.beatText}>
                  {b.text}
                </Text>
              </View>
            ))}
            {!finished ? (
              <Text variant="label" muted style={styles.tapHint}>
                Tap to continue…
              </Text>
            ) : null}
          </Card>
        </Pressable>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  prompt: { lineHeight: 21 },
  choice: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: 2,
  },
  beat: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderLeftWidth: 3,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  beatHead: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.md },
  beatText: { lineHeight: 22 },
  tapHint: { textAlign: 'center', marginTop: spacing.sm },
});
