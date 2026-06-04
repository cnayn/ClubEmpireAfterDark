import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { FloorView } from '@/components/FloorView';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { buildFloorView, floorBubbles } from '@/lib/dashboard';
import { type InterventionChoice, type MoodTone, nightMoment } from '@/lib/intervention';
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

export default function NightTimelineScreen() {
  const club = useGameStore((s) => s.club);
  const runNight = useGameStore((s) => s.runNight);
  // Capture tonight's prep + the preview once at mount (the store clears plannedConfig on commit).
  const [plan] = useState(() => useGameStore.getState().plannedConfig);
  const [preview] = useState(() => (plan ? useGameStore.getState().previewNight(plan) : null));

  const [shown, setShown] = useState(1);
  const [phase, setPhase] = useState<'pre' | 'choosing' | 'post'>('pre');
  const [committed, setCommitted] = useState<ReturnType<typeof runNight>>(null);
  const [choice, setChoice] = useState<InterventionChoice | null>(null);

  if (!club || !plan || !preview) {
    router.replace('/dashboard');
    return null;
  }

  const planClub = { ...club, lastConfig: plan };
  const moment = nightMoment(preview); // bar-pressure or cooling or null — one per night
  const shownResult = committed ?? preview;
  const beats = buildTimeline(shownResult, planClub);
  const finished = phase !== 'choosing' && shown >= beats.length;
  const showPreviewMood = !!moment && phase !== 'post';
  // Floor-first: show ONE current beat as the venue situation, not a growing list.
  const beatIndex = Math.min(shown, beats.length) - 1;
  const currentBeat = beats[beatIndex];

  const floor = buildFloorView(planClub, shownResult);
  const moodAccent = choice
    ? MOOD_COLOR[choice.mood.tone]
    : showPreviewMood
      ? MOOD_COLOR[moment.previewMood.tone]
      : undefined;
  const moodLabel = choice ? choice.mood.label : showPreviewMood ? moment.previewMood.label : undefined;
  const bubbles = committed ? floorBubbles(committed) : showPreviewMood ? moment.previewBubbles : [];

  const commit = (intervention = NO_INTERVENTION) => {
    if (committed) return committed;
    const r = runNight(plan, intervention);
    if (r) setCommitted(r);
    return r;
  };

  const advance = () => {
    if (phase === 'pre' && moment && shown >= moment.beatIndex + 1) {
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
    setChoice(c);
    setPhase('post');
  };

  const toResults = () => {
    commit(NO_INTERVENTION); // commits a plain night if no choice was made (no moment / skipped)
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
      <FloorView floor={floor} bubbles={bubbles} moodAccent={moodAccent} moodLabel={moodLabel} title="Tonight" pulse={!finished} />

      {phase === 'choosing' && moment ? (
        <Card title={moment.title} accent={colors.warning}>
          <Text variant="body" muted style={styles.prompt}>
            {moment.prompt}
          </Text>
          {moment.choices.map((c) => (
            <Pressable key={c.id} onPress={() => onChoose(c)} accessibilityRole="button" style={styles.choice}>
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
          <Card title="In the room">
            {currentBeat ? (
              <View style={[styles.beat, { borderLeftColor: TONE_COLOR[currentBeat.tone] }]}>
                <View style={styles.beatHead}>
                  <Text variant="label" color={TONE_COLOR[currentBeat.tone]}>
                    {currentBeat.time}
                  </Text>
                  <Text variant="heading">{currentBeat.title}</Text>
                </View>
                <Text variant="body" muted style={styles.beatText}>
                  {currentBeat.text}
                </Text>
              </View>
            ) : null}
            <View style={styles.progressRow}>
              <Text variant="label" muted>
                Moment {Math.min(shown, beats.length)} of {beats.length}
              </Text>
              <Text variant="label" muted>
                {finished ? 'The night is over.' : 'Tap to continue…'}
              </Text>
            </View>
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
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
});
