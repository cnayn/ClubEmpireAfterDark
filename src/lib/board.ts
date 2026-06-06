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
