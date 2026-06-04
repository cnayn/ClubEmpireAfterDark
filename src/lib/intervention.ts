/**
 * ONE live-night intervention beat (prototype). Pure helpers — the trigger and
 * the three choices. Each choice is a deterministic `Intervention` modifier
 * (src/sim/night.ts); same prep + seed + choice ⇒ same result. No DJ system, no
 * staff role, no real-time sim — the DJ is abstract and this is the only beat.
 */

import type { NightResult } from '@/domain/types';
import type { Intervention } from '@/sim/night';

/** Trigger thresholds — derived from existing result fields (Phase A). */
export const COOLING_LOYALTY = 52; // regularLoyalty carries the music-energy signal
export const COOLING_FILL = 0.4; // guests/capacity — a thin/cooling floor

/** Does the night look like it's cooling / the room isn't being held?
 *  Deterministic from the (preview) result, so the same night always offers the
 *  same beat — and healthy nights pass through untouched. */
export function isCoolingNight(result: NightResult): boolean {
  const fill = result.capacity > 0 ? result.guests / result.capacity : 0;
  return result.regularLoyalty < COOLING_LOYALTY || fill < COOLING_FILL;
}

export type InterventionChoiceId = 'push-dj' | 'bar-promo' | 'ride';
export type MoodTone = 'good' | 'warn' | 'info' | 'neutral';

export interface InterventionChoice {
  id: InterventionChoiceId;
  label: string;
  blurb: string;
  intervention: Intervention;
  /** Drives the floor's visible reaction after the choice. */
  mood: { label: string; tone: MoodTone };
}

export const INTERVENTION_CHOICES: InterventionChoice[] = [
  {
    id: 'push-dj',
    label: 'Push the DJ',
    blurb: 'Lift the energy — the room dances and your name grows, but a few drift off the bar.',
    intervention: { vibeBonus: 12, revenueMod: 0.97 },
    mood: { label: 'Energy lifting', tone: 'good' },
  },
  {
    id: 'bar-promo',
    label: 'Send them to the bar',
    blurb: 'Run a quick promo — the tills ring, though the energy stays flat.',
    intervention: { vibeBonus: 3, revenueMod: 1.12 },
    mood: { label: 'Crowd to the bar', tone: 'info' },
  },
  {
    id: 'ride',
    label: 'Ride it out',
    blurb: 'Do nothing. The room stays exactly as it is.',
    intervention: { vibeBonus: 0, revenueMod: 1 },
    mood: { label: 'Still cooling', tone: 'neutral' },
  },
];

export function getChoice(id: InterventionChoiceId): InterventionChoice {
  return INTERVENTION_CHOICES.find((c) => c.id === id) ?? INTERVENTION_CHOICES[2];
}
