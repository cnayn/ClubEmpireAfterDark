import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ResultRow, SegmentedControl, Stepper, Toggle } from '@/components/Controls';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { MAX_BARTENDERS, MUSIC_LABEL, nightFixedCosts } from '@/domain/balance';
import type { DayConfig, Level, MusicStyle, SecurityLevel, SmokingPolicy } from '@/domain/types';
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

const SECURITY: { value: SecurityLevel; label: string }[] = [
  { value: 1, label: 'Light' },
  { value: 2, label: 'Standard' },
  { value: 3, label: 'Heavy' },
];

export default function DayPrepScreen() {
  const club = useGameStore((s) => s.club);
  const runNight = useGameStore((s) => s.runNight);
  const [config, setConfig] = useState<DayConfig>(() => ({ ...(club?.lastConfig ?? defaultConfig()) }));

  if (!club) {
    router.replace('/');
    return null;
  }

  const set = <K extends keyof DayConfig>(key: K, value: DayConfig[K]) =>
    setConfig((c) => ({ ...c, [key]: value }));

  const fixedCosts = nightFixedCosts(config);
  const canAfford = club.cash >= fixedCosts;

  const onOpen = () => {
    if (runNight(config)) router.replace('/results');
  };

  return (
    <Screen
      footer={
        <View style={{ gap: 8 }}>
          <ResultRow
            label="Tonight's fixed costs"
            value={money(fixedCosts)}
            valueColor={canAfford ? colors.warning : colors.danger}
          />
          {!canAfford ? (
            <Text variant="label" color={colors.danger}>
              You can't cover tonight's staff ({money(club.cash)} in the bank).
              Cut bartenders or security to open the doors.
            </Text>
          ) : null}
          <Button label="Open the Doors" onPress={onOpen} disabled={!canAfford} />
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

      <Card title="Staffing">
        <Stepper
          label="Bartenders"
          value={config.bartenders}
          min={1}
          max={MAX_BARTENDERS}
          onChange={(v) => set('bartenders', v)}
        />
        <SegmentedControl
          label="Security level"
          value={config.securityLevel}
          options={SECURITY}
          onChange={(v) => set('securityLevel', v)}
        />
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

function defaultConfig(): DayConfig {
  return {
    music: 'house',
    coverLevel: 'low',
    drinkLevel: 'med',
    bartenders: 2,
    securityLevel: 1,
    vipFocus: false,
    smoking: 'strict',
  };
}
