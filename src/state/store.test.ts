/**
 * Store-level tests for the anti-soft-lock guards added in the balance pass:
 * you can't open a night you can't pay for, and you can't shop yourself broke.
 */

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

import { MIN_NIGHT_COST } from '@/domain/balance';
import type { DayConfig } from '@/domain/types';
import { useGameStore } from './store';

const leanNight: DayConfig = {
  music: 'pop',
  coverLevel: 'low',
  drinkLevel: 'med',
  bartenders: 1,
  securityLevel: 1,
  vipFocus: false,
  smoking: 'strict',
};

beforeEach(async () => {
  await useGameStore.getState().newClub('Test');
});

describe('runNight bankruptcy guard', () => {
  it('refuses to open a night the club cannot pay staff for', () => {
    const club = useGameStore.getState().club!;
    useGameStore.setState({ club: { ...club, cash: MIN_NIGHT_COST - 1 } });
    const result = useGameStore.getState().runNight(leanNight);
    expect(result).toBeNull();
    // state untouched: still day 1
    expect(useGameStore.getState().club!.day).toBe(1);
  });

  it('opens the night when the club can afford it', () => {
    const club = useGameStore.getState().club!;
    useGameStore.setState({ club: { ...club, cash: 1000 } });
    const result = useGameStore.getState().runNight(leanNight);
    expect(result).not.toBeNull();
    expect(useGameStore.getState().club!.day).toBe(2);
  });
});

describe('shop reserve guard', () => {
  it('blocks a purchase that would leave less than a minimum night in the bank', () => {
    const club = useGameStore.getState().club!;
    // pro-lighting costs 800; leave only enough that buying would breach reserve
    useGameStore.setState({ club: { ...club, cash: 800 + MIN_NIGHT_COST - 1 } });
    const ok = useGameStore.getState().buyUpgrade('pro-lighting');
    expect(ok).toBe(false);
    expect(useGameStore.getState().club!.ownedUpgradeIds).toHaveLength(0);
  });

  it('allows a purchase that keeps the reserve intact', () => {
    const club = useGameStore.getState().club!;
    useGameStore.setState({ club: { ...club, cash: 800 + MIN_NIGHT_COST } });
    const ok = useGameStore.getState().buyUpgrade('pro-lighting');
    expect(ok).toBe(true);
    expect(useGameStore.getState().club!.ownedUpgradeIds).toContain('pro-lighting');
  });
});
