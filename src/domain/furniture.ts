/**
 * Venue / Furniture v1 — a tiny fixed catalog + zone slots + aggregate club
 * stats. NOT free placement: items equip into a small number of named zone
 * slots. Pure domain; bounded effects; NEUTRAL when nothing is equipped (so a
 * fresh / old-save club is unchanged). No grid, drag/drop, pathfinding, or 3D.
 */

import type { FurnitureDef, FurnitureStats, VenueState, VenueZone } from './types';

export const VENUE_ZONES: VenueZone[] = ['entrance', 'bar', 'dancefloor', 'toilets', 'vip'];

export const ZONE_LABEL: Record<VenueZone, string> = {
  entrance: 'Entrance',
  bar: 'Bar',
  dancefloor: 'Dance Floor',
  toilets: 'Toilets',
  vip: 'VIP',
};

/** Slots per zone. VIP is locked in v1 (0 slots). */
export const ZONE_SLOTS: Record<VenueZone, number> = {
  entrance: 2,
  bar: 2,
  dancefloor: 2,
  toilets: 1,
  vip: 0,
};

/** Original starter catalog — one copy of each is enough for v1. */
export const FURNITURE: FurnitureDef[] = [
  { id: 'neon-sign', name: 'Cheap Neon Sign', zone: 'entrance', cost: 200, stats: { style: 2, doorAppeal: 3 }, description: 'Cheap neon over the door — but it says you’re open for business.' },
  { id: 'velvet-rope', name: 'Velvet Rope', zone: 'entrance', cost: 350, stats: { doorAppeal: 4, style: 1 }, description: 'A rope and a line — implies you’re worth the wait.' },
  { id: 'backbar-glow', name: 'Backbar Glow Strip', zone: 'bar', cost: 300, stats: { style: 3 }, description: 'A glow behind the bottles. Every drink looks better lit.' },
  { id: 'poster-wall', name: 'Poster Wall', zone: 'bar', cost: 150, stats: { style: 2 }, description: 'Gig posters and old flyers — cheap character.' },
  { id: 'wall-speakers', name: 'Wall Speakers', zone: 'bar', cost: 450, stats: { sound: 4 }, description: 'Push the sound to the bar so nobody shouts their order.' },
  { id: 'dance-lights', name: 'Basic Dance Lights', zone: 'dancefloor', cost: 400, stats: { style: 2, sound: 2 }, description: 'Movement and colour — the floor stops feeling like a room.' },
  { id: 'leather-couch', name: 'Worn Leather Couch', zone: 'dancefloor', cost: 300, stats: { comfort: 4 }, description: 'Somewhere to land between dances. Worn, but inviting.' },
  { id: 'bathroom-mirrors', name: 'Better Bathroom Mirrors', zone: 'toilets', cost: 250, stats: { hygiene: 4 }, description: 'Nobody praises good toilets — but bad ones spread fast.' },
];

export function getFurniture(id: string): FurnitureDef | undefined {
  return FURNITURE.find((f) => f.id === id);
}

export const DEFAULT_VENUE: VenueState = { owned: [], equipped: {} };

export function getVenue(venue: VenueState | undefined): VenueState {
  return venue ?? DEFAULT_VENUE;
}

/** Items equipped in a zone (ids), bounded to the zone's slot count. */
export function equippedIn(venue: VenueState | undefined, zone: VenueZone): string[] {
  return (getVenue(venue).equipped[zone] ?? []).slice(0, ZONE_SLOTS[zone]);
}

export function canEquip(venue: VenueState | undefined, id: string, zone: VenueZone): boolean {
  const item = getFurniture(id);
  if (!item || item.zone !== zone) return false; // wrong zone
  const v = getVenue(venue);
  if (!v.owned.includes(id)) return false; // must own it
  const inZone = v.equipped[zone] ?? [];
  if (inZone.includes(id)) return false; // already equipped here
  return inZone.length < ZONE_SLOTS[zone]; // a free slot
}

export type VenueStats = Required<FurnitureStats>;

const ZERO_STATS: VenueStats = { style: 0, comfort: 0, sound: 0, hygiene: 0, doorAppeal: 0 };

/** Aggregate stats of EQUIPPED furniture (only equipped items count). */
export function venueStats(venue: VenueState | undefined): VenueStats {
  const acc: VenueStats = { ...ZERO_STATS };
  const v = getVenue(venue);
  for (const zone of VENUE_ZONES) {
    for (const id of equippedIn(v, zone)) {
      const s = getFurniture(id)?.stats;
      if (!s) continue;
      acc.style += s.style ?? 0;
      acc.comfort += s.comfort ?? 0;
      acc.sound += s.sound ?? 0;
      acc.hygiene += s.hygiene ?? 0;
      acc.doorAppeal += s.doorAppeal ?? 0;
    }
  }
  return acc;
}

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

export interface VenueEffects {
  drawMod: number; // × attendance (style + door appeal)
  vibeAdd: number; // + vibe (comfort + sound + hygiene)
}

/** Bounded, deliberately gentle — furniture never overpowers crew/policies/drinks.
 *  Zero stats → perfectly neutral (×1 / +0). */
export function venueEffects(stats: VenueStats): VenueEffects {
  const drawMod = 1 + clamp((stats.style + stats.doorAppeal) * 0.004, 0, 0.08); // ≤ +8% draw
  const vibeAdd = clamp(stats.comfort * 0.5 + stats.sound * 0.5 + stats.hygiene * 0.3, 0, 8); // ≤ +8 vibe
  return { drawMod, vibeAdd };
}
