/**
 * Offline persistence for the club state. AsyncStorage only — no backend.
 *
 * The save is a single versioned blob. `SCHEMA_VERSION` + `migrate()` let us
 * evolve ClubState across roadmap phases without breaking existing saves.
 * See docs/decision-log.md #0005 and phase2-scope.md §E.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

import * as B from '@/domain/balance';
import { defaultDayConfig, STARTING_ROSTER } from '@/domain/staff';
import type { ClubState, StaffMember } from '@/domain/types';

const STORAGE_KEY = 'club-empire/save';
/** v1 = MVP (abstract bartenders/securityLevel). v2 = named staff (Phase 2A). */
export const SCHEMA_VERSION = 2;

interface SaveEnvelope {
  schemaVersion: number;
  club: ClubState;
}

export function createNewClub(name = 'The Basement'): ClubState {
  const staff = STARTING_ROSTER.map((m) => ({ ...m }));
  return {
    name,
    day: 1,
    cash: B.START_CASH,
    reputation: B.START_REPUTATION,
    baseCapacity: B.START_CAPACITY,
    ownedUpgradeIds: [],
    staff,
    lastConfig: defaultDayConfig(staff),
  };
}

// --- Migration ---------------------------------------------------------------

function genericStaff(role: 'bartender' | 'bouncer', index: number): StaffMember {
  return {
    id: `${role === 'bartender' ? 'bar' : 'bnc'}-crew-${index}`,
    name: role === 'bartender' ? 'Spare Bartender' : 'Spare Bouncer',
    role,
    salary: role === 'bartender' ? B.STARTING_BARTENDER_SALARY : B.STARTING_BOUNCER_SALARY,
    skill: B.BASELINE_SKILL,
    honesty: 100,
    reliability: 100,
    visibleTrait: 'none',
    hiddenTrait: 'none',
    description: 'Carried over from your old crew.',
  };
}

/**
 * Build a v2 roster from a v1 club's abstract levers so the player is never
 * *downgraded*: at least the starting roster, topped up to cover whatever
 * `bartenders` count and `securityLevel` (→ that many bouncers) they ran on.
 */
function migratedRoster(oldBartenders: number, oldSecurityLevel: number): StaffMember[] {
  const roster = STARTING_ROSTER.map((m) => ({ ...m }));
  const wantBartenders = Math.max(2, Math.floor(oldBartenders) || 2);
  const wantBouncers = Math.max(1, Math.floor(oldSecurityLevel) || 1);

  let bartenders = roster.filter((m) => m.role === 'bartender').length;
  let bouncers = roster.filter((m) => m.role === 'bouncer').length;
  while (bartenders < wantBartenders) roster.push(genericStaff('bartender', bartenders++));
  while (bouncers < wantBouncers) roster.push(genericStaff('bouncer', bouncers++));
  return roster;
}

/** Forward-migrate an older save to the current schema. Never throws away cash,
 *  reputation, day, or upgrades. */
function migrate(envelope: SaveEnvelope): ClubState {
  // The stored club may predate Phase 2A; treat shape loosely while migrating.
  const club = envelope.club as ClubState & {
    lastConfig?: { bartenders?: number; securityLevel?: number } & Partial<ClubState['lastConfig']>;
  };

  if (envelope.schemaVersion < 2 || !club.staff) {
    const old = club.lastConfig ?? {};
    const staff = migratedRoster(old.bartenders ?? 2, old.securityLevel ?? 1);
    return {
      name: club.name,
      day: club.day,
      cash: club.cash,
      reputation: club.reputation,
      baseCapacity: club.baseCapacity,
      ownedUpgradeIds: club.ownedUpgradeIds ?? [],
      staff,
      lastConfig: {
        music: old.music ?? 'house',
        coverLevel: old.coverLevel ?? 'low',
        drinkLevel: old.drinkLevel ?? 'med',
        staffOnDuty: staff.map((m) => m.id),
        eventId: 'regular',
        vipFocus: old.vipFocus ?? false,
        smoking: old.smoking ?? 'strict',
      },
    };
  }

  // Already v2; guard against a malformed lastConfig.
  if (!club.lastConfig || !Array.isArray(club.lastConfig.staffOnDuty)) {
    return { ...club, lastConfig: defaultDayConfig(club.staff) };
  }
  return club;
}

export async function loadClub(): Promise<ClubState | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const envelope = JSON.parse(raw) as SaveEnvelope;
    return migrate(envelope);
  } catch (err) {
    console.warn('[persistence] failed to load save', err);
    return null;
  }
}

export async function saveClub(club: ClubState): Promise<void> {
  try {
    const envelope: SaveEnvelope = { schemaVersion: SCHEMA_VERSION, club };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(envelope));
  } catch (err) {
    console.warn('[persistence] failed to save', err);
  }
}

export async function clearSave(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('[persistence] failed to clear save', err);
  }
}
