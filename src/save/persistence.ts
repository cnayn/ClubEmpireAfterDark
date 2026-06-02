/**
 * Offline persistence for the club state. AsyncStorage only — no backend.
 *
 * The save is a single versioned blob. `SCHEMA_VERSION` + `migrate()` let us
 * evolve ClubState across roadmap phases without breaking existing saves.
 * See docs/decision-log.md #0005.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

import * as B from '@/domain/balance';
import type { ClubState } from '@/domain/types';

const STORAGE_KEY = 'club-empire/save';
export const SCHEMA_VERSION = 1;

interface SaveEnvelope {
  schemaVersion: number;
  club: ClubState;
}

export function createNewClub(name = 'The Basement'): ClubState {
  return {
    name,
    day: 1,
    cash: B.START_CASH,
    reputation: B.START_REPUTATION,
    baseCapacity: B.START_CAPACITY,
    ownedUpgradeIds: [],
    lastConfig: { ...B.DEFAULT_DAY_CONFIG },
  };
}

/** Forward-migrate an older save to the current schema. */
function migrate(envelope: SaveEnvelope): ClubState {
  let { club } = envelope;
  // Future migrations branch on envelope.schemaVersion here.
  // v0 -> v1 example: ensure lastConfig exists.
  if (!club.lastConfig) {
    club = { ...club, lastConfig: { ...B.DEFAULT_DAY_CONFIG } };
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
