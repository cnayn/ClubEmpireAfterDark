import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Pill } from '@/components/Controls';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { minViableNightCost } from '@/domain/staff';
import { UPGRADES } from '@/domain/upgrades';
import { money } from '@/lib/format';
import { useGameStore } from '@/state/store';
import { colors, spacing } from '@/theme/tokens';

export default function ShopScreen() {
  const club = useGameStore((s) => s.club);
  const buyUpgrade = useGameStore((s) => s.buyUpgrade);

  if (!club) {
    router.replace('/');
    return null;
  }

  return (
    <Screen
      footer={
        <Button label="Back to Dashboard" variant="secondary" onPress={() => router.replace('/dashboard')} />
      }
    >
      <View style={styles.header}>
        <Text variant="heading">Upgrades</Text>
        <Pill label={money(club.cash)} color={colors.success} />
      </View>

      {UPGRADES.map((u) => {
        const owned = club.ownedUpgradeIds.includes(u.id);
        // Keep one minimum night in reserve so the player can always reopen.
        const affordable = club.cash - u.cost >= minViableNightCost(club.staff);
        return (
          <Card key={u.id} title={undefined} accent={owned ? colors.success : undefined}>
            <View style={styles.cardHead}>
              <Text variant="heading" style={{ flex: 1 }}>
                {u.name}
              </Text>
              {owned ? <Pill label="OWNED" color={colors.success} /> : null}
            </View>
            <Text variant="body" muted style={{ lineHeight: 21 }}>
              {u.description}
            </Text>
            {!owned ? (
              <Button
                label={`Buy — ${money(u.cost)}`}
                onPress={() => buyUpgrade(u.id)}
                disabled={!affordable}
                accent={colors.neonViolet}
              />
            ) : null}
          </Card>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
});
