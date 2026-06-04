/**
 * Single game-state store (Zustand). Holds the persisted club, the most recent
 * night result, and orchestrates the day/night/shop/staff loop. Auto-saves to
 * AsyncStorage after every state-changing action. See docs/decision-log.md #0003.
 */

import { create } from 'zustand';

import { eventRequirement, getEvent, isUnlocked } from '@/domain/events';
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
import { type Intervention, resolveNight } from '@/sim/night';

interface GameStore {
  club: ClubState | null;
  lastResult: NightResult | null;
  /** In-memory only (not persisted): tonight's prep, carried into the night
   *  playback so the night can resolve AFTER the live intervention beat. */
  plannedConfig: DayConfig | null;
  hydrated: boolean;

  /** Load any existing save on app start. */
  hydrate: () => Promise<void>;
  /** Start a fresh club, replacing any existing save. */
  newClub: (name?: string) => Promise<void>;
  /** Stash tonight's prep without resolving/committing (commit happens after the
   *  night playback / intervention choice). */
  planNight: (config: DayConfig) => void;
  /** Resolve tonight WITHOUT committing — for the cooling check + pre-choice floor. */
  previewNight: (config: DayConfig) => NightResult | null;
  /** Resolve tonight (optionally with a chosen intervention); commits + advances. */
  runNight: (config: DayConfig, intervention?: Intervention) => NightResult | null;
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
  plannedConfig: null,
  hydrated: false,

  hydrate: async () => {
    const club = await loadClub();
    set({ club, hydrated: true });
  },

  newClub: async (name) => {
    const club = createNewClub(name);
    await clearSave();
    await saveClub(club);
    set({ club, lastResult: null, plannedConfig: null });
  },

  planNight: (config) => set({ plannedConfig: config }),

  previewNight: (config) => {
    const club = get().club;
    if (!club) return null;
    // Pure resolve, no commit, no guards — for the cooling check + pre-choice floor.
    return resolveNight(club, config, nightSeed(club)).result;
  },

  runNight: (config, intervention) => {
    const club = get().club;
    if (!club) return null;
    // Schedule must be valid (employed, unique, ≥1 bartender).
    if (!isValidSchedule(club.staff, config.staffOnDuty)) return null;
    // Event must be unlocked and its fee must respect the minimum-night reserve.
    if (!isUnlocked(club, config.eventId)) return null;
    if (!eventRequirement(club, config.eventId).met) return null;
    // Bankruptcy guard: cover tonight's on-duty wages AND the event's upfront cost.
    const eventCost = getEvent(config.eventId).cost;
    if (club.cash < wagesForOnDuty(club.staff, config.staffOnDuty) + eventCost) return null;
    const { result, nextClub } = resolveNight(club, config, nightSeed(club), intervention);
    set({ club: nextClub, lastResult: result, plannedConfig: null });
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
