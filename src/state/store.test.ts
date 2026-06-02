/**
 * Store-level tests (Phase 2A): anti-soft-lock guards now compute off staff
 * salaries, plus the new hire/fire/scheduling rules.
 */

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

import { hireCost, minViableNightCost, wagesForOnDuty } from '@/domain/staff';
import { getCandidate } from '@/domain/staff';
import type { DayConfig } from '@/domain/types';
import { useGameStore } from './store';

function configFromRoster(): DayConfig {
  const club = useGameStore.getState().club!;
  return { ...club.lastConfig, staffOnDuty: club.staff.map((m) => m.id) };
}

beforeEach(async () => {
  await useGameStore.getState().newClub('Test');
});

describe('runNight guards', () => {
  it('refuses to open with an invalid schedule (no bartender on duty)', () => {
    const club = useGameStore.getState().club!;
    const bouncerOnly = club.staff.filter((m) => m.role === 'bouncer').map((m) => m.id);
    const result = useGameStore.getState().runNight({ ...club.lastConfig, staffOnDuty: bouncerOnly });
    expect(result).toBeNull();
    expect(useGameStore.getState().club!.day).toBe(1);
  });

  it('refuses to open when cash cannot cover on-duty wages', () => {
    const club = useGameStore.getState().club!;
    const cfg = configFromRoster();
    useGameStore.setState({
      club: { ...club, cash: wagesForOnDuty(club.staff, cfg.staffOnDuty) - 1 },
    });
    expect(useGameStore.getState().runNight(cfg)).toBeNull();
  });

  it('opens and advances the day when affordable and valid', () => {
    const result = useGameStore.getState().runNight(configFromRoster());
    expect(result).not.toBeNull();
    expect(useGameStore.getState().club!.day).toBe(2);
  });
});

describe('shop reserve uses staff salaries', () => {
  it('blocks a purchase that would leave less than a minimum night', () => {
    const club = useGameStore.getState().club!;
    useGameStore.setState({ club: { ...club, cash: 800 + minViableNightCost(club.staff) - 1 } });
    expect(useGameStore.getState().buyUpgrade('pro-lighting')).toBe(false);
    expect(useGameStore.getState().club!.ownedUpgradeIds).toHaveLength(0);
  });
});

describe('hire / fire', () => {
  it('hires a candidate for an upfront fee and adds them to the roster', () => {
    const club = useGameStore.getState().club!;
    useGameStore.setState({ club: { ...club, cash: 5000 } });
    const ok = useGameStore.getState().hireStaff('bar-jin');
    expect(ok).toBe(true);
    const after = useGameStore.getState().club!;
    expect(after.staff.some((m) => m.id === 'bar-jin')).toBe(true);
    expect(after.cash).toBe(5000 - hireCost(getCandidate('bar-jin')!));
  });

  it('refuses to hire when the fee would breach the night reserve', () => {
    const club = useGameStore.getState().club!;
    const fee = hireCost(getCandidate('bnc-marcus')!);
    useGameStore.setState({ club: { ...club, cash: fee + minViableNightCost(club.staff) - 1 } });
    expect(useGameStore.getState().hireStaff('bnc-marcus')).toBe(false);
  });

  it('cannot hire the same candidate twice', () => {
    const club = useGameStore.getState().club!;
    useGameStore.setState({ club: { ...club, cash: 5000 } });
    expect(useGameStore.getState().hireStaff('bar-jin')).toBe(true);
    expect(useGameStore.getState().hireStaff('bar-jin')).toBe(false);
  });

  it('fires a bouncer and strips them from the saved schedule', () => {
    const ok = useGameStore.getState().fireStaff('bnc-dimitri');
    expect(ok).toBe(true);
    const after = useGameStore.getState().club!;
    expect(after.staff.some((m) => m.id === 'bnc-dimitri')).toBe(false);
    expect(after.lastConfig.staffOnDuty).not.toContain('bnc-dimitri');
  });

  it('refuses to fire the last bartender', () => {
    // fire one of the two starting bartenders, then the second must be protected
    expect(useGameStore.getState().fireStaff('bar-rosa')).toBe(true);
    expect(useGameStore.getState().fireStaff('bar-milo')).toBe(false);
  });
});
