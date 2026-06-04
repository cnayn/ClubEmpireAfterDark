import { router } from 'expo-router';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { GoalBoardList } from '@/components/GoalBoard';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { goalBoard } from '@/lib/dashboard';
import { useGameStore } from '@/state/store';
import { spacing } from '@/theme/tokens';

export default function GoalsScreen() {
  const club = useGameStore((s) => s.club);
  const lastResult = useGameStore((s) => s.lastResult);

  if (!club) {
    return (
      <Screen>
        <Text>No club loaded.</Text>
        <Button label="Go Home" variant="secondary" onPress={() => router.replace('/')} />
      </Screen>
    );
  }

  const goals = goalBoard(club, lastResult);

  return (
    <Screen footer={<Button label="Prepare Tonight" onPress={() => router.push('/day-prep')} />}>
      <Text variant="title">Goal Board</Text>
      <Text variant="label" muted style={{ marginBottom: spacing.sm }}>
        A few things worth chasing right now. Pick whatever fits your plan tonight.
      </Text>
      <Card>
        <GoalBoardList goals={goals} />
      </Card>
    </Screen>
  );
}
