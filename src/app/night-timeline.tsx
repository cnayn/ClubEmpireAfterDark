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
  type MoodTone,
  resolveBossAction,
} from '@/lib/bossActions';
import { buildFloorView, type FloorBubble, floorBubbles } from '@/lib/dashboard';
import type { BeatTone } from '@/lib/timeline';
import { buildTimeline } from '@/lib/timeline';
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

  const [shown, setShown] = useState(1);
  const [committed, setCommitted] = useState<ReturnType<typeof runNight>>(null);
  // Boss Actions taken tonight (once per action), with their live floor reactions.
  const [chosen, setChosen] = useState<BossActionId[]>([]);
  const [reactions, setReactions] = useState<FloorBubble[]>([]);
  const [mood, setMood] = useState<{ label: string; tone: MoodTone } | null>(null);
  const [recap, setRecap] = useState<string[]>([]);

  if (!club || !plan || !preview) {
    router.replace('/dashboard');
    return null;
  }

  const planClub = { ...club, lastConfig: plan };
  const shownResult = committed ?? preview;
  const beats = buildTimeline(shownResult, planClub);
  const finished = shown >= beats.length;
  const beatIndex = Math.min(shown, beats.length) - 1;
  const currentBeat = beats[beatIndex];

  const floor = buildFloorView(planClub, shownResult);
  const moodAccent = !committed && mood ? MOOD_COLOR[mood.tone] : undefined;
  const moodLabel = !committed && mood ? mood.label : undefined;
  const bubbles = committed ? floorBubbles(committed) : reactions;

  const commit = () => {
    if (committed) return committed;
    const r = runNight(plan, bossIntervention(chosen, preview, planClub));
    if (r) setCommitted(r);
    return r;
  };

  const onAction = (id: BossActionId) => {
    if (committed || chosen.includes(id)) return; // once per action; locked after commit
    const outcome = resolveBossAction(id, preview, planClub);
    setChosen((c) => [...c, id]);
    setReactions((b) => [...b.filter((x) => x.zone !== outcome.bubble.zone), outcome.bubble]);
    setMood(outcome.mood);
    setRecap((r) => [...r, outcome.note]);
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
        <Button
          label={finished ? 'See the books' : 'Skip to the books'}
          variant={finished ? 'primary' : 'secondary'}
          onPress={toResults}
        />
      }
    >
      <FloorView floor={floor} bubbles={bubbles} moodAccent={moodAccent} moodLabel={moodLabel} title="Tonight" pulse={!finished} />

      {/* Current beat — short, floor-supporting. Tap to move the night along. */}
      <Pressable onPress={() => setShown((s) => Math.min(s + 1, beats.length))} disabled={finished} accessibilityRole="button" accessibilityLabel="Next moment">
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

      {/* Boss Actions tray — make calls inside the club, anytime, once each. */}
      {!committed ? (
        <Card title="Your Call">
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
  beatHead: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.md },
  beatText: { lineHeight: 22 },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
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
