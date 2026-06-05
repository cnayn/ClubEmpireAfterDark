/**
 * Random Encounter v1 — a small, transient "situation" the night can throw at the
 * owner, layered on the EXISTING boss-action / Intervention surface. PURE +
 * DETERMINISTIC: an encounter is selected only when a real condition in the
 * night's PREVIEW holds (so calm, well-run nights get none), and each choice maps
 * to a bounded Intervention that combines with boss actions at commit. No new RNG,
 * no resolver change, no save schema, no story/event engine, no named guests.
 */

import { crowdMix, topCrowd } from '@/domain/crowd';
import type { FloorBubble } from '@/lib/dashboard';
import type { ZoneKey } from '@/lib/venue';
import type { ClubState, NightResult } from '@/domain/types';
import type { Intervention } from '@/sim/night';

const JOHN = 'bnc-john';
const CARAMEL = 'bnc-kareem';
const COOLING_LOYALTY = 52; // mirrors nightZones / regulars cooling read

export type EncounterId = 'bar-backlog' | 'door-tension' | 'music-dip';

export interface EncounterChoice {
  id: string;
  label: string;
  /** Reaction line shown the instant the choice is made. */
  outcome: string;
  /** Bounded modifier, combined with boss actions at commit. */
  intervention: Intervention;
  /** Floor reaction in the encounter's zone. */
  bubble: FloorBubble;
}

export interface Encounter {
  id: EncounterId;
  zone: ZoneKey;
  /** Short situation line, in the room's voice. */
  situation: string;
  choices: EncounterChoice[];
}

/**
 * Pick at most one encounter for the night, by priority (door safety → bar money →
 * music vibe). Returns null when nothing is pressing — so "not every night" falls
 * out of the actual state, deterministically. `preview` is the no-intervention
 * resolve, so its serviceRatio / incidents / loyalty are stable.
 */
export function pickEncounter(preview: NightResult, club: ClubState): Encounter | null {
  if (preview.guests <= 0) return null;
  const fill = preview.capacity > 0 ? preview.guests / preview.capacity : 0;
  const top = topCrowd(crowdMix(club, club.lastConfig), 3);
  const onDuty = new Set(club.lastConfig.staffOnDuty);

  // 1 — Door Tension (safety first).
  const doorRisk = preview.incidents > 0 || top.includes('rough') || fill >= 0.9;
  if (doorRisk) {
    const calmer = onDuty.has(CARAMEL)
      ? 'Caramel walked it down before it spread.'
      : onDuty.has(JOHN)
        ? 'John shut it down hard. It worked — and people noticed.'
        : 'Your bouncer stepped in and held the line.';
    return {
      id: 'door-tension',
      zone: 'door',
      situation: "Voices are rising at the door — it could tip into something.",
      choices: [
        {
          id: 'send-bouncer',
          label: 'Send a bouncer',
          outcome: calmer,
          intervention: { vibeBonus: 7, revenueMod: 1 },
          bubble: { id: 'enc-door', label: 'Door handled', tone: 'info', zone: 'door' },
        },
        {
          id: 'slow-line',
          label: 'Slow the line',
          outcome: 'You throttled the door — calmer inside, a few walked off.',
          intervention: { vibeBonus: 3, revenueMod: 0.98 },
          bubble: { id: 'enc-door', label: 'Line slowed', tone: 'warn', zone: 'door' },
        },
        {
          id: 'let-ride',
          label: 'Let it ride',
          outcome: "You let it ride. The door stayed tense all night.",
          intervention: { vibeBonus: -8, revenueMod: 1 },
          bubble: { id: 'enc-door', label: 'Door left tense', tone: 'bad', zone: 'door' },
        },
      ],
    };
  }

  // 2 — Bar Backlog (money).
  const barBacklog = preview.serviceRatio < 0.9 || fill >= 0.85;
  if (barBacklog) {
    return {
      id: 'bar-backlog',
      zone: 'bar',
      situation: "The bar's three deep and the line isn't moving.",
      choices: [
        {
          id: 'help-bar',
          label: 'Help the bar',
          outcome: 'You jumped behind the bar — the line finally broke.',
          intervention: { vibeBonus: 2, revenueMod: 1.06 },
          bubble: { id: 'enc-bar', label: 'Backlog cleared', tone: 'info', zone: 'bar' },
        },
        {
          id: 'comp-delay',
          label: 'Comp the delay',
          outcome: 'Free rounds for the wait — they forgave it, the till felt it.',
          intervention: { vibeBonus: 8, revenueMod: 0.97 },
          bubble: { id: 'enc-bar', label: 'Comped the wait', tone: 'info', zone: 'bar' },
        },
        {
          id: 'ignore',
          label: 'Ignore it',
          outcome: 'You let it ride — the room felt every minute of the wait.',
          intervention: { vibeBonus: -6, revenueMod: 1 },
          bubble: { id: 'enc-bar', label: 'Wait ignored', tone: 'bad', zone: 'bar' },
        },
      ],
    };
  }

  // 3 — Music Dip (vibe).
  const musicDip = preview.regularLoyalty < COOLING_LOYALTY || top.includes('musicheads');
  if (musicDip) {
    return {
      id: 'music-dip',
      zone: 'floor',
      situation: "The floor's thinning out — the energy is slipping.",
      choices: [
        {
          id: 'push-dj',
          label: 'Push the DJ',
          outcome: 'You pushed the booth — the floor found it again.',
          intervention: { vibeBonus: 10, revenueMod: 1 },
          bubble: { id: 'enc-floor', label: 'Booth pushed', tone: 'info', zone: 'floor' },
        },
        {
          id: 'change-energy',
          label: 'Change the room energy',
          outcome: 'You reset the room — it breathed and came back.',
          intervention: { vibeBonus: 5, revenueMod: 0.99 },
          bubble: { id: 'enc-floor', label: 'Room reset', tone: 'info', zone: 'floor' },
        },
        {
          id: 'let-breathe',
          label: 'Let it breathe',
          outcome: 'You let it breathe — it never fully recovered.',
          intervention: { vibeBonus: -4, revenueMod: 1 },
          bubble: { id: 'enc-floor', label: 'Energy left to slip', tone: 'warn', zone: 'floor' },
        },
      ],
    };
  }

  return null;
}
