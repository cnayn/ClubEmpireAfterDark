/**
 * 2D Club Board v1 — the pure MODEL behind the playable club board.
 *
 * This file is the single source of truth for "what is where" on the floor: the
 * board zones (Door / Bar / Dance Floor / DJ Booth / Bathroom / Staff / locked
 * VIP), the boss actions reachable by tapping each zone, the furniture objects
 * that sit in each zone, and the staff/DJ tokens placed as board pieces. PURE +
 * DETERMINISTIC — no RNG, no resolver, no save schema, no per-guest sim. The
 * FloorView renders from this so the visuals and the zone-tap commands stay in
 * sync; keeping it here means the board can be unit-tested without the UI.
 */

import type { BossActionId } from '@/lib/bossActions';
import { DJ_FLOOR_LABEL } from '@/domain/dj';
import { equippedIn, getFurniture, getVenue } from '@/domain/furniture';
import type { ClubState, VenueZone } from '@/domain/types';

export type BoardZone = 'door' | 'bar' | 'floor' | 'dj' | 'bathroom' | 'staff' | 'vip';

export type CrewRole = 'bartender' | 'bouncer' | 'dj' | 'owner';

/**
 * A tappable thing on the floor. The night UI inspects the EXACT target the
 * player touched — a specific crew member, the station background, or a guest
 * cluster/queue — instead of collapsing every tap to the zone. Pure data; the
 * UI builds the right card from it.
 */
export type InspectTarget =
  | { kind: 'station'; zone: BoardZone }
  | { kind: 'crew'; zone: BoardZone; staffId: string; role: 'bartender' | 'bouncer' }
  | { kind: 'queue'; zone: BoardZone };

/** The zone an InspectTarget belongs to (used for clock-pause + zone glow). */
export function targetZone(t: InspectTarget): BoardZone {
  return t.zone;
}

/**
 * Where each crew role is ALLOWED to work — the foundation for future
 * fixed-station assignment (Nightclub-City flavour), NOT free movement: no drag,
 * no pathfinding, no per-NPC motion, no economy change. Pure data + lookups;
 * nothing consumes this for gameplay yet, it just defines the legal stations.
 */
export const CREW_STATIONS: Record<CrewRole, BoardZone[]> = {
  bartender: ['bar', 'floor', 'staff'],
  bouncer: ['door', 'floor', 'staff'],
  dj: ['dj'],
  owner: ['floor', 'bar', 'door', 'dj', 'staff'],
};
export function allowedStations(role: CrewRole): BoardZone[] {
  return CREW_STATIONS[role] ?? [];
}
export function canAssign(role: CrewRole, zone: BoardZone): boolean {
  return allowedStations(role).includes(zone);
}

export interface BoardZoneDef {
  id: BoardZone;
  label: string;
  /** The venue furniture zone whose equipped items sit here (if any). */
  venueZone?: VenueZone;
  /** Boss actions reachable by tapping this zone (a subset of BOSS_ACTIONS). */
  actions: BossActionId[];
  /** Locked / future zone — shown on the board but not yet playable. */
  locked?: boolean;
}

/**
 * The club as a board. Order is the natural top→bottom reading of the room: door
 * at the back, the dance floor + DJ booth in the middle, the bar up front, with
 * bathroom + staff + a locked VIP off to the sides.
 */
export const BOARD_ZONES: BoardZoneDef[] = [
  { id: 'door', label: 'Door', venueZone: 'entrance', actions: ['send-bouncer'] },
  { id: 'dj', label: 'DJ Booth', actions: ['push-dj'] },
  { id: 'floor', label: 'Dance Floor', venueZone: 'dancefloor', actions: ['push-dj', 'work-room'] },
  { id: 'bar', label: 'Bar', venueZone: 'bar', actions: ['check-bar'] },
  { id: 'bathroom', label: 'Bathroom', venueZone: 'toilets', actions: [] },
  { id: 'staff', label: 'Staff', actions: [] },
  { id: 'vip', label: 'VIP', venueZone: 'vip', actions: [], locked: true },
];

const ZONE_BY_ID: Record<BoardZone, BoardZoneDef> = BOARD_ZONES.reduce(
  (acc, z) => {
    acc[z.id] = z;
    return acc;
  },
  {} as Record<BoardZone, BoardZoneDef>
);

export function getBoardZone(id: BoardZone): BoardZoneDef {
  return ZONE_BY_ID[id];
}

/** Boss actions reachable from a zone (empty for locked / non-actionable zones). */
export function zoneActions(id: BoardZone): BossActionId[] {
  return ZONE_BY_ID[id]?.actions ?? [];
}

// --- Furniture objects on the board ------------------------------------------

export interface BoardFurniture {
  id: string;
  name: string;
}

/** Equipped furniture sitting in a board zone (maps the zone to its venue zone). */
export function boardFurniture(club: ClubState, id: BoardZone): BoardFurniture[] {
  const venueZone = ZONE_BY_ID[id]?.venueZone;
  if (!venueZone) return [];
  const v = getVenue(club.venue);
  return equippedIn(v, venueZone)
    .map((fid) => {
      const f = getFurniture(fid);
      return f ? { id: f.id, name: f.name } : null;
    })
    .filter((x): x is BoardFurniture => x !== null);
}

// --- Staff / DJ tokens as board pieces ---------------------------------------

export type TokenRole = 'bartender' | 'bouncer' | 'dj';

export interface BoardToken {
  id: string;
  name: string;
  role: TokenRole;
  zone: BoardZone;
}

/**
 * The on-duty crew + booked DJ placed on the board: bartenders at the bar,
 * bouncers at the door, and a real booked act (Local/Hype) at the DJ booth.
 * Deterministic from the club's last config.
 */
export function boardTokens(club: ClubState): BoardToken[] {
  const onDuty = new Set(club.lastConfig.staffOnDuty);
  const tokens: BoardToken[] = club.staff
    .filter((m) => onDuty.has(m.id))
    .map((m) => ({ id: m.id, name: m.name, role: m.role as TokenRole, zone: m.role === 'bouncer' ? 'door' : 'bar' }));

  const dj = club.lastConfig.dj ?? 'house';
  if (dj !== 'house') {
    tokens.push({ id: 'dj-act', name: DJ_FLOOR_LABEL[dj], role: 'dj', zone: 'dj' });
  }
  return tokens;
}

/** Tokens placed in a specific zone (for the board to render per-zone pieces). */
export function tokensInZone(club: ClubState, zone: BoardZone): BoardToken[] {
  return boardTokens(club).filter((t) => t.zone === zone);
}

// --- First-floor plan (spatial layout the board renders from) ----------------

/** Where a zone sits on the floor-plan grid. Pure layout data — the renderer maps
 *  these cells to views; nothing here touches the sim or save. */
export interface ZonePlacement {
  zone: BoardZone;
  /** 0 = back/top row. */
  row: number;
  /** 0 = left column. */
  col: number;
  /** How many of BOARD_COLS columns this zone spans. */
  colSpan: number;
  /** How many rows this zone spans (default 1). */
  rowSpan?: number;
  /** The dominant zone (the dance floor) — rendered largest. */
  hero?: boolean;
}

/** The starter floor is laid out on a 4-column grid. */
export const BOARD_COLS = 4;

/**
 * The STARTER FIRST FLOOR plan: door across the top with a locked VIP in the
 * top-right corner, the dance floor as the central hero, the bar down the right
 * side with the DJ booth above it, and bathroom + staff along the bottom. Future
 * floors (unlocked as the club grows) can define their own plans; this is floor 1.
 */
export const FIRST_FLOOR_LAYOUT: ZonePlacement[] = [
  { zone: 'door', row: 0, col: 0, colSpan: 3 },
  { zone: 'vip', row: 0, col: 3, colSpan: 1 },
  { zone: 'floor', row: 1, col: 0, colSpan: 3, rowSpan: 2, hero: true },
  { zone: 'dj', row: 1, col: 3, colSpan: 1 },
  { zone: 'bar', row: 2, col: 3, colSpan: 1 },
  { zone: 'bathroom', row: 3, col: 0, colSpan: 2 },
  { zone: 'staff', row: 3, col: 2, colSpan: 2 },
];

/** The placement for a zone on the current (first) floor, if any. */
export function zonePlacement(zone: BoardZone): ZonePlacement | undefined {
  return FIRST_FLOOR_LAYOUT.find((p) => p.zone === zone);
}
