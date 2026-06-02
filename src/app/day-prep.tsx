import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ResultRow, SegmentedControl, Toggle } from '@/components/Controls';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { MUSIC_LABEL } from '@/domain/balance';
import {
  isValidSchedule,
  ROLE_LABEL,
  strengthLabel,
  TRAIT_LABEL,
  wagesForOnDuty,
} from '@/domain/staff';
import type { DayConfig, Level, MusicStyle, SmokingPolicy } from '@/domain/types';
import { money } from '@/lib/format';
import { useGameStore } from '@/state/store';
import { colors } from '@/theme/tokens';

const LEVELS: { value: Level; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'med', label: 'Med' },
  { value: 'high', label: 'High' },
];

const MUSIC: { value: MusicStyle; label: string }[] = (
  Object.keys(MUSIC_LABEL) as MusicStyle[]
).map((m) => ({ value: m, label: MUSIC_LABEL[m] }));

export default function DayPrepScreen() {
  const club = useGameStore((s) => s.club);
  const runNight = useGameStore((s) => s.runNight);
  const [config, setConfig] = useState<DayConfig>(() => ({ ...club!.lastConfig }));

  if (!club) {
    router.replace('/');
    return null;
  }

  const set = <K extends keyof DayConfig>(key: K, value: DayConfig[K]) =>
    setConfig((c) => ({ ...c, [key]: value }));

  // Drop any scheduled ids that are no longer employed (e.g. fired since last night).
  const onDuty = config.staffOnDuty.filter((id) => club.staff.some((m) => m.id === id));
  const toggleStaff = (id: string) =>
    set('staffOnDuty', onDuty.includes(id) ? onDuty.filter((x) => x !== id) : [...onDuty, id]);

  const fixedCosts = wagesForOnDuty(club.staff, onDuty);
  const validSchedule = isValidSchedule(club.staff, onDuty);
  const canAfford = club.cash >= fixedCosts;
  const canOpen = validSchedule && canAfford;

  const onOpen = () => {
    if (runNight({ ...config, staffOnDuty: onDuty })) router.replace('/results');
  };

  return (
    <Screen
      footer={
        <View style={{ gap: 8 }}>
          <ResultRow
            label="Tonight's wages"
            value={money(fixedCosts)}
            valueColor={canAfford ? colors.warning : colors.danger}
          />
          {!validSchedule ? (
            <Text variant="label" color={colors.danger}>
              You need at least one bartender on duty to open.
            </Text>
          ) : !canAfford ? (
            <Text variant="label" color={colors.danger}>
              You can't cover tonight's wages ({money(club.cash)} in the bank).
              Send someone home to open the doors.
            </Text>
          ) : null}
          <Button label="Open the Doors" onPress={onOpen} disabled={!canOpen} />
        </View>
      }
    >
      <Card title="Music">
        <SegmentedControl
          value={config.music}
          options={MUSIC}
          onChange={(v) => set('music', v)}
        />
      </Card>

      <Card title="Pricing">
        <SegmentedControl
          label="Cover charge"
          value={config.coverLevel}
          options={LEVELS}
          onChange={(v) => set('coverLevel', v)}
        />
        <SegmentedControl
          label="Drink prices"
          value={config.drinkLevel}
          options={LEVELS}
          onChange={(v) => set('drinkLevel', v)}
        />
        <Text variant="label" muted>
          Higher prices mean fewer guests but fatter tabs — and grumpier regulars.
        </Text>
      </Card>

      <Card title="Tonight's Crew">
        {club.staff.map((m) => (
          <Toggle
            key={m.id}
            label={`${m.name} · ${ROLE_LABEL[m.role]}`}
            description={`${money(m.salary)}/night · ${strengthLabel(m.skill)}${
              m.visibleTrait !== 'none' ? ` · ${TRAIT_LABEL[m.visibleTrait]}` : ''
            }`}
            value={onDuty.includes(m.id)}
            onChange={() => toggleStaff(m.id)}
            accent={m.role === 'bouncer' ? colors.neonCyan : colors.neonViolet}
          />
        ))}
        <Button label="Manage Staff" variant="secondary" onPress={() => router.push('/staff')} />
      </Card>

      <Card title="Policy">
        <Toggle
          label="VIP focus"
          description="Court the big spenders. Pays off once you have a name."
          value={config.vipFocus}
          onChange={(v) => set('vipFocus', v)}
        />
        <Toggle
          label="Relaxed smoking policy"
          description="Pleases part of the crowd, but raises compliance risk (fines)."
          value={config.smoking === 'relaxed'}
          onChange={(v) => set('smoking', (v ? 'relaxed' : 'strict') as SmokingPolicy)}
          accent={colors.warning}
        />
      </Card>
    </Screen>
  );
}
