/**
 * Single game-state store (Zustand). Holds the persisted club, the most recent
 * night result, and orchestrates the day/night/shop/staff loop. Auto-saves to
 * AsyncStorage after every state-changing action. See docs/decision-log.md #0003.
 */

import { create } from 'zustand';

import {
  canFireStaff,
  getCandidate,
  hireCost,
  isValidSchedule,
  minViableNightCost,
  wagesForOnDuty,
} from '@/domain/staff';
import type { ClubState, DayConfig, NightResult } from '@/domain/types';
import { getUpgrade } from '@/domain/upgrades';
import { clearSave, createNewClub, loadClub, saveClub } from '@/save/persistence';
import { resolveNight } from '@/sim/night';

interface GameStore {
  club: ClubState | null;
  lastResult: NightResult | null;
  hydrated: boolean;

  /** Load any existing save on app start. */
  hydrate: () => Promise<void>;
  /** Start a fresh club, replacing any existing save. */
  newClub: (name?: string) => Promise<void>;
  /** Resolve tonight from a day config; stores result and advances the club. */
  runNight: (config: DayConfig) => NightResult | null;
  /** Buy an upgrade if affordable and not already owned. Returns success. */
  buyUpgrade: (id: string) => boolean;
  /** Hire a candidate from the static pool (pays an upfront fee). Returns success. */
  hireStaff: (candidateId: string) => boolean;
  /** Fire a roster member; refuses to fire the last bartender. Returns success. */
  fireStaff: (id: string) => boolean;
}

/**
 * Seed for the night sim. Deterministic given the club's day + a cash-derived
 * salt, so a given save plays the same night the same way (and tests are stable)
 * while still varying night to night.
 */
function nightSeed(club: ClubState): number {
  return (club.day * 2654435761 + club.cash) >>> 0;
}

export const useGameStore = create<GameStore>((set, get) => ({
  club: null,
  lastResult: null,
  hydrated: false,

  hydrate: async () => {
    const club = await loadClub();
    set({ club, hydrated: true });
  },

  newClub: async (name) => {
    const club = createNewClub(name);
    await clearSave();
    await saveClub(club);
    set({ club, lastResult: null });
  },

  runNight: (config) => {
    const club = get().club;
    if (!club) return null;
    // Schedule must be valid (employed, unique, ≥1 bartender).
    if (!isValidSchedule(club.staff, config.staffOnDuty)) return null;
    // Bankruptcy guard: never open a night the club can't pay its on-duty staff.
    if (club.cash < wagesForOnDuty(club.staff, config.staffOnDuty)) return null;
    const { result, nextClub } = resolveNight(club, config, nightSeed(club));
    set({ club: nextClub, lastResult: result });
    void saveClub(nextClub);
    return result;
  },

  buyUpgrade: (id) => {
    const club = get().club;
    if (!club) return false;
    const upgrade = getUpgrade(id);
    if (!upgrade) return false;
    if (club.ownedUpgradeIds.includes(id)) return false;
    // Reserve one minimum night so a purchase can never soft-lock the player.
    if (club.cash - upgrade.cost < minViableNightCost(club.staff)) return false;

    const nextClub: ClubState = {
      ...club,
      cash: club.cash - upgrade.cost,
      ownedUpgradeIds: [...club.ownedUpgradeIds, id],
    };
    set({ club: nextClub });
    void saveClub(nextClub);
    return true;
  },

  hireStaff: (candidateId) => {
    const club = get().club;
    if (!club) return false;
    if (club.staff.some((m) => m.id === candidateId)) return false; // already hired
    const candidate = getCandidate(candidateId);
    if (!candidate) return false;
    const cost = hireCost(candidate);
    // Keep a minimum night in reserve after paying the hire fee.
    if (club.cash - cost < minViableNightCost(club.staff)) return false;

    const nextClub: ClubState = {
      ...club,
      cash: club.cash - cost,
      staff: [...club.staff, { ...candidate }],
    };
    set({ club: nextClub });
    void saveClub(nextClub);
    return true;
  },

  fireStaff: (id) => {
    const club = get().club;
    if (!club) return false;
    if (!canFireStaff(club.staff, id)) return false; // e.g. last bartender
    const nextClub: ClubState = {
      ...club,
      staff: club.staff.filter((m) => m.id !== id),
      // Safe handling: a fired member can't remain scheduled.
      lastConfig: {
        ...club.lastConfig,
        staffOnDuty: club.lastConfig.staffOnDuty.filter((x) => x !== id),
      },
    };
    set({ club: nextClub });
    void saveClub(nextClub);
    return true;
  },
}));
