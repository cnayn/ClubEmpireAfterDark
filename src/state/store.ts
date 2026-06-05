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
} from '@/domain/staff';
import type { BossActionId } from '@/lib/bossActions';
import type { ClubState, DayConfig, NightResult, VenueZone } from '@/domain/types';
import { aggregateEffects, getUpgrade } from '@/domain/upgrades';
import { djCost } from '@/domain/dj';
import { stockCost } from '@/domain/drinks';
import { canEquip, getFurniture, getVenue } from '@/domain/furniture';
import { clearSave, createNewClub, loadClub, saveClub } from '@/save/persistence';
import { type Intervention, resolveNight } from '@/sim/night';

interface GameStore {
  club: ClubState | null;
  lastResult: NightResult | null;
  /** In-memory only (not persisted): tonight's prep, carried into the night
   *  playback so the night can resolve AFTER the live intervention beat. */
  plannedConfig: DayConfig | null;
  /** In-memory only (not persisted): the boss actions taken on the most recent
   *  night, so the results debrief can reference them. */
  lastBossActions: BossActionId[];
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
  /** Resolve tonight (optionally with a chosen intervention + the boss actions
   *  taken); commits + advances. */
  runNight: (config: DayConfig, intervention?: Intervention, bossActions?: BossActionId[]) => NightResult | null;
  /** Buy an upgrade if affordable and not already owned. Returns success. */
  buyUpgrade: (id: string) => boolean;
  /** Hire a candidate from the static pool (pays an upfront fee). Returns success. */
  hireStaff: (candidateId: string) => boolean;
  /** Fire a roster member; refuses to fire the last bartender. Returns success. */
  fireStaff: (id: string) => boolean;
  /** Buy a furniture item if affordable (reserve-aware) and not already owned. */
  buyFurniture: (id: string) => boolean;
  /** Equip an owned item into a compatible, free zone slot. Returns success. */
  equipFurniture: (id: string, zone: VenueZone) => boolean;
  /** Remove an equipped item from a zone (stays owned). */
  unequipFurniture: (id: string, zone: VenueZone) => boolean;
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
  lastBossActions: [],
  hydrated: false,

  hydrate: async () => {
    const club = await loadClub();
    set({ club, hydrated: true });
  },

  newClub: async (name) => {
    const club = createNewClub(name);
    await clearSave();
    await saveClub(club);
    set({ club, lastResult: null, plannedConfig: null, lastBossActions: [] });
  },

  planNight: (config) => set({ plannedConfig: config }),

  previewNight: (config) => {
    const club = get().club;
    if (!club) return null;
    // Pure resolve, no commit, no guards — for the cooling check + pre-choice floor.
    return resolveNight(club, config, nightSeed(club)).result;
  },

  runNight: (config, intervention, bossActions) => {
    const club = get().club;
    if (!club) return null;
    // Schedule must be valid (employed, unique, ≥1 bartender).
    if (!isValidSchedule(club.staff, config.staffOnDuty)) return null;
    // Event must be unlocked and its fee must respect the minimum-night reserve.
    if (!isUnlocked(club, config.eventId)) return null;
    if (!eventRequirement(club, config.eventId).met) return null;
    // Upfront guard: only genuine upfront costs (tonight: the event fee; future:
    // stock / DJ booking). Crew WAGES are settled AFTER the night via `net`, so a
    // low (even negative) cash balance must never block scheduled crew. A free
    // night (e.g. Quiet Night) stays openable from negative cash, so the player
    // can always run a lean recovery night.
    const capacity = club.baseCapacity + aggregateEffects(club.ownedUpgradeIds).capacity;
    const upfront = getEvent(config.eventId).cost + stockCost(config.drinkPrep, capacity) + djCost(config.dj);
    if (upfront > 0 && club.cash < upfront) return null;
    const { result, nextClub } = resolveNight(club, config, nightSeed(club), intervention);
    set({ club: nextClub, lastResult: result, plannedConfig: null, lastBossActions: bossActions ?? [] });
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

  buyFurniture: (id) => {
    const club = get().club;
    if (!club) return false;
    const item = getFurniture(id);
    if (!item) return false;
    const venue = getVenue(club.venue);
    if (venue.owned.includes(id)) return false; // one copy is enough in v1
    // Keep a minimum night in reserve so furniture can never soft-lock the player.
    if (club.cash - item.cost < minViableNightCost(club.staff)) return false;

    const nextClub: ClubState = {
      ...club,
      cash: club.cash - item.cost,
      venue: { owned: [...venue.owned, id], equipped: { ...venue.equipped } },
    };
    set({ club: nextClub });
    void saveClub(nextClub);
    return true;
  },

  equipFurniture: (id, zone) => {
    const club = get().club;
    if (!club) return false;
    if (!canEquip(club.venue, id, zone)) return false;
    const venue = getVenue(club.venue);
    const nextClub: ClubState = {
      ...club,
      venue: { owned: venue.owned, equipped: { ...venue.equipped, [zone]: [...(venue.equipped[zone] ?? []), id] } },
    };
    set({ club: nextClub });
    void saveClub(nextClub);
    return true;
  },

  unequipFurniture: (id, zone) => {
    const club = get().club;
    if (!club) return false;
    const venue = getVenue(club.venue);
    const inZone = venue.equipped[zone] ?? [];
    if (!inZone.includes(id)) return false;
    const nextClub: ClubState = {
      ...club,
      venue: { owned: venue.owned, equipped: { ...venue.equipped, [zone]: inZone.filter((x) => x !== id) } },
    };
    set({ club: nextClub });
    void saveClub(nextClub);
    return true;
  },
}));
