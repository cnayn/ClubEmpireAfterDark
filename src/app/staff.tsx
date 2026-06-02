import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Pill } from '@/components/Controls';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import {
  canFireStaff,
  CANDIDATE_POOL,
  hireCost,
  minViableNightCost,
  ROLE_LABEL,
  strengthLabel,
  TRAIT_LABEL,
} from '@/domain/staff';
import type { StaffMember } from '@/domain/types';
import { money } from '@/lib/format';
import { useGameStore } from '@/state/store';
import { colors, spacing } from '@/theme/tokens';

export default function StaffScreen() {
  const club = useGameStore((s) => s.club);
  const hireStaff = useGameStore((s) => s.hireStaff);
  const fireStaff = useGameStore((s) => s.fireStaff);

  if (!club) {
    router.replace('/');
    return null;
  }

  const reserve = minViableNightCost(club.staff);
  const candidates = CANDIDATE_POOL.filter((c) => !club.staff.some((m) => m.id === c.id));

  const roleAccent = (m: StaffMember) =>
    m.role === 'bouncer' ? colors.neonCyan : colors.neonViolet;

  return (
    <Screen
      footer={
        <Button label="Back to Dashboard" variant="secondary" onPress={() => router.replace('/dashboard')} />
      }
    >
      <View style={styles.header}>
        <Text variant="heading">Your Crew</Text>
        <Pill label={money(club.cash)} color={colors.success} />
      </View>

      {club.staff.map((m) => (
        <Card key={m.id} accent={roleAccent(m)}>
          <View style={styles.cardHead}>
            <Text variant="heading" style={{ flex: 1 }}>
              {m.name}
            </Text>
            <Pill label={ROLE_LABEL[m.role]} color={roleAccent(m)} />
          </View>
          <Text variant="label" muted>
            {money(m.salary)}/night · {strengthLabel(m.skill)}
            {m.visibleTrait !== 'none' ? ` · ${TRAIT_LABEL[m.visibleTrait]}` : ''}
          </Text>
          <Text variant="body" muted style={styles.desc}>
            {m.description}
          </Text>
          <Button
            label={canFireStaff(club.staff, m.id) ? 'Let go' : 'Last bartender — keep'}
            variant="secondary"
            disabled={!canFireStaff(club.staff, m.id)}
            onPress={() => fireStaff(m.id)}
          />
        </Card>
      ))}

      <Text variant="heading" style={styles.sectionTitle}>
        For Hire
      </Text>
      {candidates.length === 0 ? (
        <Text variant="body" muted>
          You've hired everyone available.
        </Text>
      ) : (
        candidates.map((c) => {
          const fee = hireCost(c);
          const canHire = club.cash - fee >= reserve;
          return (
            <Card key={c.id} accent={roleAccent(c)}>
              <View style={styles.cardHead}>
                <Text variant="heading" style={{ flex: 1 }}>
                  {c.name}
                </Text>
                <Pill label={ROLE_LABEL[c.role]} color={roleAccent(c)} />
              </View>
              <Text variant="label" muted>
                {strengthLabel(c.skill)}
                {c.visibleTrait !== 'none' ? ` · ${TRAIT_LABEL[c.visibleTrait]}` : ''} ·{' '}
                {money(c.salary)}/night
              </Text>
              <Text variant="body" muted style={styles.desc}>
                {c.description}
              </Text>
              <Button
                label={`Hire — ${money(fee)} fee`}
                accent={colors.neonMagenta}
                disabled={!canHire}
                onPress={() => hireStaff(c.id)}
              />
            </Card>
          );
        })
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  desc: { lineHeight: 20 },
  sectionTitle: { marginTop: spacing.sm },
});
