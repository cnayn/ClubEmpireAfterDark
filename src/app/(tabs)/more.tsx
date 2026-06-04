import { router } from 'expo-router';
import { View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { reputationTier } from '@/domain/balance';
import { useGameStore } from '@/state/store';
import { spacing } from '@/theme/tokens';

/** A small hub for the less-frequent screens, so the tab bar stays focused. */
export default function MoreScreen() {
  const club = useGameStore((s) => s.club);
  const lastResult = useGameStore((s) => s.lastResult);

  return (
    <Screen>
      <Text variant="title">More</Text>
      {club ? (
        <Card title={club.name}>
          <Text variant="label" muted>
            Night {club.day} · {reputationTier(club.reputation)}
          </Text>
        </Card>
      ) : null}

      <View style={{ gap: spacing.sm }}>
        <Button
          label="Last Night's Results"
          variant="secondary"
          disabled={!lastResult}
          onPress={() => router.push('/results')}
        />
        <Button label="Title Screen" variant="secondary" onPress={() => router.replace('/')} />
      </View>
    </Screen>
  );
}
