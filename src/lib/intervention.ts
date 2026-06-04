/**
 * Live-night intervention beats (prototype). Pure helpers — triggers + choices.
 * Each choice is a deterministic `Intervention` modifier (src/sim/night.ts); same
 * prep + seed + choice ⇒ same result. No new systems, no real-time sim, no new RNG.
 *
 * Two moment TYPES exist and BOTH may fire in one night (different beats, different
 * problems): Bar Pressure (23:45, service/money) and Crowd Cooling (00:30, energy).
 * Their chosen modifiers are combined into one deterministic resolve.
 */

import type { FloorBubble } from '@/lib/dashboard';
import type { NightResult } from '@/domain/types';
import type { Intervention } from '@/sim/night';

// --- Triggers (derived from existing result fields) --------------------------

export const COOLING_LOYALTY = 52;
export const COOLING_FILL = 0.4;
export const BAR_SERVICE = 0.8; // serviceRatio below this = bar can't keep up
export const BAR_MIN_FILL = 0.5; // ...but only if there's a real crowd to serve

const fillOf = (r: NightResult) => (r.capacity > 0 ? r.guests / r.capacity : 0);

/** Crowd cooling / DJ not holding the room. */
export function isCoolingNight(result: NightResult): boolean {
  return result.regularLoyalty < COOLING_LOYALTY || fillOf(result) < COOLING_FILL;
}

/** Bar backing up — a busy floor the bar can't serve fast enough. */
export function isBarPressureNight(result: NightResult): boolean {
  return result.serviceRatio < BAR_SERVICE && fillOf(result) >= BAR_MIN_FILL;
}

// --- Choices -----------------------------------------------------------------

export type InterventionChoiceId =
  | 'push-dj'
  | 'crowd-promo'
  | 'crowd-ride'
  | 'pull-bouncer'
  | 'happy-hour'
  | 'bar-ride';
export type MoodTone = 'good' | 'warn' | 'info' | 'neutral';

export interface InterventionChoice {
  id: InterventionChoiceId;
  label: string;
  blurb: string;
  intervention: Intervention;
  mood: { label: string; tone: MoodTone };
  /** Optional floor reaction shown after this choice (presentation only). */
  reactionBubble?: FloorBubble;
}

/** Crowd-cooling moment choices (energy/reputation). */
export const INTERVENTION_CHOICES: InterventionChoice[] = [
  {
    id: 'push-dj',
    label: 'Push the DJ',
    blurb: 'Lift the energy — the room dances and your name grows, but a few drift off the bar.',
    intervention: { vibeBonus: 12, revenueMod: 0.97 },
    mood: { label: 'Energy lifting', tone: 'good' },
  },
  {
    id: 'crowd-promo',
    label: 'Send them to the bar',
    blurb: 'Run a quick promo — the tills ring, though the energy stays flat.',
    intervention: { vibeBonus: 3, revenueMod: 1.12 },
    mood: { label: 'Crowd to the bar', tone: 'info' },
  },
  {
    id: 'crowd-ride',
    label: 'Ride it out',
    blurb: 'Do nothing. The room stays exactly as it is.',
    intervention: { vibeBonus: 0, revenueMod: 1 },
    mood: { label: 'Still cooling', tone: 'neutral' },
  },
];

/** Bar-pressure moment choices (service/money/patience). */
export const BAR_CHOICES: InterventionChoice[] = [
  {
    id: 'pull-bouncer',
    label: 'Pull a bouncer to the bar',
    blurb: 'Clear the backlog fast — but the door runs thin and the room gets rougher.',
    intervention: { vibeBonus: -3, revenueMod: 1.12 },
    mood: { label: 'Bar easing', tone: 'good' },
    reactionBubble: { id: 'door-thin', label: 'Door thin', tone: 'warn', zone: 'door' },
  },
  {
    id: 'happy-hour',
    label: 'Push a happy-hour promo',
    blurb: 'Move drinks faster and keep the crowd patient — at a thinner margin.',
    intervention: { vibeBonus: 5, revenueMod: 0.93 },
    mood: { label: 'Happy hour on', tone: 'info' },
    reactionBubble: { id: 'happy-hour', label: 'Happy hour', tone: 'info', zone: 'bar' },
  },
  {
    id: 'bar-ride',
    label: 'Ride it out',
    blurb: 'Do nothing — sometimes the rush passes on its own.',
    intervention: { vibeBonus: 0, revenueMod: 1 },
    mood: { label: 'Still slammed', tone: 'neutral' },
  },
];

export function getChoice(id: InterventionChoiceId): InterventionChoice {
  return [...INTERVENTION_CHOICES, ...BAR_CHOICES].find((c) => c.id === id) ?? INTERVENTION_CHOICES[2];
}

// --- Moments (one per night) -------------------------------------------------

export type MomentKind = 'bar' | 'cooling';

export interface NightMoment {
  kind: MomentKind;
  beatIndex: number; // pause once this beat has been revealed (Bar Pressure=1, The Room=2)
  title: string;
  prompt: string;
  choices: InterventionChoice[];
  previewBubbles: FloorBubble[];
  previewMood: { label: string; tone: MoodTone };
}

const BAR_MOMENT: NightMoment = {
  kind: 'bar',
  beatIndex: 1, // after "Bar Pressure" (23:45)
  title: 'The bar is backing up',
  prompt: 'The bar is slammed, drinks are stacking up, guests are getting impatient. One call —',
  choices: BAR_CHOICES,
  previewBubbles: [{ id: 'bar-pressure', label: 'Bar backing up', tone: 'warn', zone: 'bar' }],
  previewMood: { label: 'Bar slammed', tone: 'warn' },
};

const COOLING_MOMENT: NightMoment = {
  kind: 'cooling',
  beatIndex: 2, // after "The Room" (00:30)
  title: 'The room is cooling',
  prompt: "The DJ isn't holding the crowd. One call —",
  choices: INTERVENTION_CHOICES,
  previewBubbles: [{ id: 'cooling', label: 'Energy dipping', tone: 'warn', zone: 'floor' }],
  previewMood: { label: 'Cooling', tone: 'neutral' },
};

/** The single live moment this night offers, or null. Bar pressure (a concrete
 *  operational crisis) takes priority over crowd cooling. Deterministic. */
export function nightMoment(result: NightResult): NightMoment | null {
  if (isBarPressureNight(result)) return BAR_MOMENT;
  if (isCoolingNight(result)) return COOLING_MOMENT;
  return null;
}
