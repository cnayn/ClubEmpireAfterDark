import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
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

export default function NightTimelineScreen() {
  const result = useGameStore((s) => s.lastResult);
  const club = useGameStore((s) => s.club);
  const [shown, setShown] = useState(1);

  // No resolved night to narrate — go straight to the books.
  if (!result || !club) {
    router.replace('/results');
    return null;
  }

  const beats = buildTimeline(result, club);
  const finished = shown >= beats.length;
  const advance = () => setShown((n) => Math.min(n + 1, beats.length));

  return (
    <Screen
      footer={
        finished ? (
          <Button label="See the books" onPress={() => router.replace('/results')} />
        ) : (
          <Button label="Skip to the books" variant="secondary" onPress={() => router.replace('/results')} />
        )
      }
    >
      <Text variant="label" muted>
        TONIGHT, AS IT HAPPENED · {Math.min(shown, beats.length)}/{beats.length}
      </Text>

      <Pressable onPress={advance} disabled={finished} accessibilityRole="button" accessibilityLabel="Next moment">
        <View style={{ gap: spacing.md }}>
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
        </View>

        {!finished ? (
          <Text variant="label" muted style={styles.tapHint}>
            Tap to continue…
          </Text>
        ) : null}
      </Pressable>
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
  tapHint: { textAlign: 'center', marginTop: spacing.lg },
});
