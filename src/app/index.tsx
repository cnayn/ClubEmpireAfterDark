import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { useGameStore } from '@/state/store';
import { colors, spacing } from '@/theme/tokens';

export default function HomeScreen() {
  const hydrated = useGameStore((s) => s.hydrated);
  const club = useGameStore((s) => s.club);
  const newClub = useGameStore((s) => s.newClub);

  const hasSave = !!club;

  const onContinue = () => router.replace('/dashboard');
  const onNew = async () => {
    await newClub();
    router.replace('/dashboard');
  };

  return (
    <Screen scroll={false} contentStyle={styles.container}>
      <View style={styles.hero}>
        <Text variant="label" color={colors.neonCyan} style={styles.kicker}>
          CLUB EMPIRE
        </Text>
        <Text variant="display" style={styles.title}>
          After Dark
        </Text>
        <Text variant="body" muted style={styles.tagline}>
          Take a run-down basement club and turn it into the best night in the
          city — one risky, neon-soaked night at a time.
        </Text>
      </View>

      <View style={styles.actions}>
        {hasSave ? (
          <>
            <Button label={`Continue — ${club!.name}`} onPress={onContinue} />
            <Button label="New Club" variant="secondary" onPress={onNew} />
          </>
        ) : (
          <Button
            label="New Club"
            onPress={onNew}
            disabled={!hydrated}
            loading={!hydrated}
          />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-between', paddingVertical: spacing.xxl },
  hero: { flex: 1, justifyContent: 'center', gap: spacing.sm },
  kicker: { letterSpacing: 4 },
  title: { fontSize: 44, letterSpacing: -1, color: colors.neonMagenta },
  tagline: { marginTop: spacing.md, lineHeight: 22, maxWidth: 320 },
  actions: { gap: spacing.md },
});
