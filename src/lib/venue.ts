/**
 * Venue presence helpers — pure reads of an (already-resolved or previewed)
 * NightResult into per-zone pressure states for the floor view. Presentation
 * only: no new state, no RNG, no gameplay. "Where is the pressure right now?"
 */

import type { NightResult } from '@/domain/types';

export type ZoneTone = 'calm' | 'busy' | 'warn';
export type ZoneKey = 'door' | 'bar' | 'floor';

export interface NightZones {
  door: ZoneTone;
  bar: ZoneTone;
  floor: ZoneTone;
}

const COOLING_LOYALTY = 52; // mirrors the cooling read used elsewhere

/** Derive door / bar / floor pressure from existing aggregate signals. */
export function nightZones(result: NightResult): NightZones {
  const fill = result.capacity > 0 ? result.guests / result.capacity : 0;

  // Bar: strained service is the loudest signal; otherwise busy when full.
  const bar: ZoneTone =
    result.guests === 0 ? 'calm' : result.serviceRatio < 0.85 ? 'warn' : fill >= 0.5 ? 'busy' : 'calm';

  // Door: incidents = trouble; a packed door is busy; else calm.
  const door: ZoneTone = result.incidents > 0 ? 'warn' : fill >= 0.85 ? 'busy' : 'calm';

  // Floor: a cooling room (low loyalty) is the warning; full = busy; else calm.
  const floor: ZoneTone =
    result.guests === 0 ? 'calm' : result.regularLoyalty < COOLING_LOYALTY ? 'warn' : fill >= 0.5 ? 'busy' : 'calm';

  return { door, bar, floor };
}
