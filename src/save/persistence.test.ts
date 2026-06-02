/**
 * Save migration tests (Phase 2A). A v1 (MVP) save must migrate to a playable
 * v2 club with a named roster, without losing cash/reputation/day/upgrades.
 */

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

import AsyncStorage from '@react-native-async-storage/async-storage';

import { isValidSchedule, minViableNightCost } from '@/domain/staff';
import { createNewClub, loadClub } from './persistence';

const STORAGE_KEY = 'club-empire/save';

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('createNewClub', () => {
  it('seeds a starting roster and a valid default config', () => {
    const club = createNewClub('Test');
    expect(club.staff.length).toBeGreaterThanOrEqual(3);
    expect(club.staff.some((m) => m.role === 'bartender')).toBe(true);
    expect(isValidSchedule(club.staff, club.lastConfig.staffOnDuty)).toBe(true);
    expect(club.lastConfig.eventId).toBe('regular');
  });
});

describe('v1 → v2 migration', () => {
  it('migrates an MVP save into a playable named-staff club', async () => {
    const v1 = {
      schemaVersion: 1,
      club: {
        name: 'Old Club',
        day: 7,
        cash: 1234,
        reputation: 35,
        baseCapacity: 60,
        ownedUpgradeIds: ['pro-lighting'],
        lastConfig: {
          music: 'pop',
          coverLevel: 'med',
          drinkLevel: 'high',
          bartenders: 3,
          securityLevel: 2,
          vipFocus: true,
          smoking: 'relaxed',
        },
      },
    };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(v1));

    const club = await loadClub();
    expect(club).not.toBeNull();
    if (!club) return;

    // progress preserved
    expect(club.day).toBe(7);
    expect(club.cash).toBe(1234);
    expect(club.reputation).toBe(35);
    expect(club.ownedUpgradeIds).toEqual(['pro-lighting']);

    // roster covers the old levers, not downgraded (3 bartenders + 2 bouncers)
    expect(club.staff.filter((m) => m.role === 'bartender').length).toBeGreaterThanOrEqual(3);
    expect(club.staff.filter((m) => m.role === 'bouncer').length).toBeGreaterThanOrEqual(2);

    // config carried over + valid schedule + guards remain meaningful
    expect(club.lastConfig.coverLevel).toBe('med');
    expect(club.lastConfig.vipFocus).toBe(true);
    expect(club.lastConfig.smoking).toBe('relaxed');
    expect(club.lastConfig.eventId).toBe('regular');
    expect(isValidSchedule(club.staff, club.lastConfig.staffOnDuty)).toBe(true);
    expect(minViableNightCost(club.staff)).toBeGreaterThan(0);
  });

  it('handles a v1 save with a missing lastConfig', async () => {
    const v1 = {
      schemaVersion: 1,
      club: {
        name: 'Sparse',
        day: 2,
        cash: 500,
        reputation: 22,
        baseCapacity: 60,
        ownedUpgradeIds: [],
      },
    };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(v1));
    const club = await loadClub();
    expect(club).not.toBeNull();
    if (!club) return;
    expect(club.staff.length).toBeGreaterThanOrEqual(3);
    expect(isValidSchedule(club.staff, club.lastConfig.staffOnDuty)).toBe(true);
  });
});
