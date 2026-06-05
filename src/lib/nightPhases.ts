/**
 * Living Night v1 — the night as a lived sequence of PHASES instead of a flat list
 * of beats. PURE + DETERMINISTIC: derives 5 ordered phases (Doors Open → Bar Rush
 * → Floor Heat → The Turn → Last Call) from an ALREADY-resolved/previewed
 * NightResult plus the roster (for staff names). No RNG, no resolver/economy/save
 * touch — copy varies only by result.day. Each phase carries a focus zone so the
 * floor visibly reacts as the owner advances through the night, and a CTA label so
 * advancing feels like moving through venue moments, not flipping text slides.
 */

import type { BeatTone } from '@/lib/timeline';
import type { ZoneKey } from '@/lib/venue';
import type { ClubState, NightResult } from '@/domain/types';

const COOLING_LOYALTY = 52; // mirrors nightZones / regulars cooling read

export type PhaseKey = 'doors' | 'bar-rush' | 'floor-heat' | 'turn' | 'last-call';

export interface NightPhase {
  key: PhaseKey;
  time: string;
  title: string;
  /** Short floor situation line, in the room's voice. */
  situation: string;
  tone: BeatTone;
  /** Floor zone in focus this phase (drives the floor highlight). */
  zone: ZoneKey;
  /** CTA to advance INTO the next phase. null on the final phase. */
  advanceLabel: string | null;
}

const DOORS: Record<NightResult['eventId'], string> = {
  regular: 'The first faces drift in. The door starts to form.',
  'private-party': 'A private list tonight — quiet out front, the booking locked.',
  'student-night': "Word got out — the queue's already students deep.",
  'grand-opening': "Tonight's a statement. The line's around the block.",
  'industry-night': 'A sharper crowd filters in, quietly taking note.',
};

/** The phase an encounter belongs to, by the zone it lives in. */
export function encounterPhaseKey(zone: ZoneKey): PhaseKey {
  return zone === 'bar' ? 'bar-rush' : zone === 'door' ? 'turn' : 'floor-heat';
}

/** Build the night's five phases. Deterministic for a given (result, club). */
export function buildNightPhases(result: NightResult, club: ClubState): NightPhase[] {
  const onDuty = club.staff.filter((m) => club.lastConfig.staffOnDuty.includes(m.id));
  const firstBartender = onDuty.find((m) => m.role === 'bartender');
  const firstBouncer = onDuty.find((m) => m.role === 'bouncer');
  const barActor = result.noShows > 0 || !firstBartender ? 'The bar' : firstBartender.name;
  const doorActor = result.noShows > 0 || !firstBouncer ? 'Security' : firstBouncer.name;
  const fill = result.capacity > 0 ? result.guests / result.capacity : 0;

  // 1 — Doors Open.
  const doors: NightPhase = {
    key: 'doors', time: '23:00', title: 'Doors Open', tone: 'info', zone: 'door',
    situation: DOORS[result.eventId], advanceLabel: 'Into the bar rush →',
  };

  // 2 — Bar Rush (service pressure).
  const barRush: NightPhase = {
    key: 'bar-rush', time: '23:45', title: 'Bar Rush', zone: 'bar',
    advanceLabel: 'Onto the floor →',
    ...(result.serviceRatio < 0.85
      ? { tone: 'bad' as BeatTone, situation: `${barActor} is drowning — the bar line won't move.` }
      : result.serviceRatio < 1
        ? { tone: 'warn' as BeatTone, situation: `${barActor} is slammed but holding the line.` }
        : { tone: 'good' as BeatTone, situation: `${barActor} keeps the pours moving — the bar's flowing.` }),
  };

  // 3 — Floor Heat (crowd + cooling).
  const floorHeat: NightPhase = {
    key: 'floor-heat', time: '00:30', title: 'Floor Heat', zone: 'floor',
    advanceLabel: 'See how it turns →',
    ...(result.guests === 0 || fill < 0.3
      ? { tone: 'neutral' as BeatTone, situation: "The floor never really fills — it's a slow one." }
      : result.regularLoyalty < COOLING_LOYALTY
        ? { tone: 'warn' as BeatTone, situation: "The room's full enough, but the energy is cooling." }
        : fill >= 0.9
          ? { tone: 'info' as BeatTone, situation: 'The floor is packed and loud — a real crowd tonight.' }
          : { tone: 'info' as BeatTone, situation: 'The floor is alive — a steady crowd works the room.' }),
  };

  // 4 — The Turn (the night's most notable moment — trouble or opportunity).
  const turn = theTurn(result, doorActor, fill);

  // 5 — Last Call (net + reputation direction).
  const lastCall = theLastCall(result);

  return [doors, barRush, floorHeat, turn, lastCall];
}

function theTurn(result: NightResult, doorActor: string, fill: number): NightPhase {
  const base = { key: 'turn' as PhaseKey, time: '01:20', advanceLabel: 'To last call →' };
  if (result.incidents > 0) {
    return {
      ...base, title: 'Trouble', tone: 'bad', zone: 'door',
      situation:
        result.incidents === 1
          ? `${doorActor} steps in — a scuffle handled before it became a scene.`
          : `${doorActor} is stretched — ${result.incidents} incidents nearly get away tonight.`,
    };
  }
  if (result.theft > 0) {
    return { ...base, title: 'Shortfall', tone: 'bad', zone: 'bar', situation: "The till doesn't add up — money's walking out behind the bar." };
  }
  if (result.fines > 0) {
    return { ...base, title: 'The Inspector', tone: 'warn', zone: 'door', situation: 'Someone official walks the floor. The relaxed policy just got expensive.' };
  }
  if (result.noShows > 0) {
    return { ...base, title: 'Short-Handed', tone: 'warn', zone: 'floor', situation: 'A no-show leaves a gap; the rest of the crew covers.' };
  }
  if (result.vipBonus > 0) {
    return { ...base, title: 'Opportunity', tone: 'good', zone: 'floor', situation: 'The big table is spending — bottles keep coming.' };
  }
  if (result.serviceRatio >= 1 && fill >= 0.5) {
    return { ...base, title: 'Opportunity', tone: 'good', zone: 'floor', situation: 'The room peaks — music, crowd, and bar all in sync.' };
  }
  return { ...base, title: 'The Lull', tone: 'neutral', zone: 'floor', situation: 'A quiet stretch; the crew catches its breath.' };
}

function theLastCall(result: NightResult): NightPhase {
  const repClause =
    result.reputationDelta >= 2
      ? ' Your name grew around the neighborhood.'
      : result.reputationDelta <= -2
        ? ' Your name took a knock tonight.'
        : '';
  const base = { key: 'last-call' as PhaseKey, time: '02:00', title: 'Last Call', zone: 'floor' as ZoneKey, advanceLabel: null };
  if (result.net > 0) {
    return { ...base, tone: 'good', situation: `The floor thins out — a good night's takings.${repClause}` };
  }
  if (result.net < 0) {
    return { ...base, tone: 'bad', situation: `The floor thins out, and the books sting — you ran at a loss.${repClause}` };
  }
  return { ...base, tone: 'neutral', situation: `The floor thins out — about even.${repClause}` };
}
