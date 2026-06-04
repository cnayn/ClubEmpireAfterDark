/**
 * Manager's Debrief — a pure, boss-level read of a finished night, derived ONLY
 * from the existing NightResult (+ the club's on-duty list for staff flavor). It
 * does NOT touch the resolver, RNG, economy, or save schema, and adds no new
 * data — every line is an honest manager interpretation of aggregate signals.
 *
 * 3–5 sharp category lines (Money / Crowd / Bar / Door / Reputation) plus one
 * optional crew-relationship flavor line (John / Caramel) when they were on duty.
 * Deterministic: same (result, club) → same lines (copy varies by result.day, no
 * RNG). This is presentation flavor only — NOT a relationship system.
 */

import type { ClubState, NightResult } from '@/domain/types';
import { signed, signedMoney } from './format';

export type DebriefTone = 'good' | 'bad' | 'warn' | 'info' | 'neutral';

export interface DebriefLine {
  key: string;
  label: string; // Money / Crowd / Bar / Door / Reputation / Crew
  tone: DebriefTone;
  text: string;
}

// Current-role bouncer character ids whose pairing creates flavor (item 5).
const JOHN = 'bnc-john';
const CARAMEL = 'bnc-kareem';

function onDutyBouncers(club: ClubState | undefined): number {
  if (!club) return -1; // unknown → don't assume a thin door
  const onDuty = new Set(club.lastConfig.staffOnDuty);
  return club.staff.filter((m) => m.role === 'bouncer' && onDuty.has(m.id)).length;
}

/** Static crew-relationship flavor (presentation only — no affinity/memory/loyalty). */
function crewFlavor(result: NightResult, club: ClubState | undefined): DebriefLine | null {
  if (!club) return null;
  const onDuty = new Set(club.lastConfig.staffOnDuty);
  const johnOn = onDuty.has(JOHN);
  const caramelOn = onDuty.has(CARAMEL);
  // Deterministic copy choice (no RNG).
  const pick = (arr: string[]) => arr[result.day % arr.length];
  const fill = result.capacity > 0 ? result.guests / result.capacity : 0;

  if (johnOn && caramelOn) {
    return {
      key: 'crew',
      label: 'Crew',
      tone: 'info',
      text: pick([
        'Caramel kept John from turning the door into a scene.',
        'John watched the line. Caramel watched John.',
        'Door had muscle tonight — but it also had tension.',
      ]),
    };
  }
  if (johnOn) {
    const tense = result.incidents > 0 || fill >= 0.6;
    if (tense) {
      return {
        key: 'crew',
        label: 'Crew',
        tone: 'warn',
        text: pick(['John handled it fast. Maybe too fast.', 'The door stayed protected, but the mood took a hit.']),
      };
    }
  }
  if (caramelOn) {
    return {
      key: 'crew',
      label: 'Crew',
      tone: 'good',
      text: pick([
        'Caramel read the room before trouble reached the floor.',
        'Caramel kept the door calm enough for the bar to breathe.',
      ]),
    };
  }
  return null;
}

/** Build the boss-level debrief lines for a finished night. */
export function buildDebrief(result: NightResult, club?: ClubState): DebriefLine[] {
  const fill = result.capacity > 0 ? result.guests / result.capacity : 0;
  const lines: DebriefLine[] = [];

  // --- Money ---
  if (result.net < 0) {
    lines.push({ key: 'money', label: 'Money', tone: 'bad', text: `The books took a hit — ${signedMoney(result.net)} on the night.` });
  } else if (result.net === 0) {
    lines.push({ key: 'money', label: 'Money', tone: 'neutral', text: 'About even — nothing banked tonight.' });
  } else if (result.theft > 0) {
    lines.push({ key: 'money', label: 'Money', tone: 'warn', text: `Money came in (${signedMoney(result.net)}), but the till came up short behind the bar.` });
  } else if (result.net >= 800) {
    lines.push({ key: 'money', label: 'Money', tone: 'good', text: `Strong take — ${signedMoney(result.net)} banked. The till did its job.` });
  } else {
    lines.push({ key: 'money', label: 'Money', tone: 'good', text: `Profitable night — ${signedMoney(result.net)} banked.` });
  }

  // --- Crowd ---
  if (result.guests === 0) {
    lines.push({ key: 'crowd', label: 'Crowd', tone: 'neutral', text: 'Barely anyone showed — the floor stayed empty.' });
  } else if (fill >= 0.95) {
    lines.push({ key: 'crowd', label: 'Crowd', tone: 'warn', text: 'Packed to the doors — you were turning people away.' });
  } else if (fill >= 0.6) {
    lines.push({ key: 'crowd', label: 'Crowd', tone: 'good', text: 'The floor looked alive — a real crowd in tonight.' });
  } else if (fill >= 0.3) {
    lines.push({ key: 'crowd', label: 'Crowd', tone: 'info', text: 'A steady crowd, with room to grow.' });
  } else {
    lines.push({ key: 'crowd', label: 'Crowd', tone: 'bad', text: 'The floor stayed thin — word still needs to spread.' });
  }

  // --- Bar ---
  if (result.guests === 0) {
    lines.push({ key: 'bar', label: 'Bar', tone: 'neutral', text: 'Quiet bar — nothing to push tonight.' });
  } else if (result.serviceRatio >= 1) {
    lines.push({ key: 'bar', label: 'Bar', tone: 'good', text: 'Bar held up — guests got served before patience snapped.' });
  } else if (result.serviceRatio >= 0.85) {
    lines.push({ key: 'bar', label: 'Bar', tone: 'warn', text: 'Bar stayed just ahead of the crowd — a close one.' });
  } else if (result.serviceRatio >= 0.6) {
    lines.push({ key: 'bar', label: 'Bar', tone: 'warn', text: 'Service slipped — the bar fell behind and tabs went unpoured.' });
  } else {
    lines.push({ key: 'bar', label: 'Bar', tone: 'bad', text: 'The bar nearly broke — long waits cost you drinks and money.' });
  }

  // --- Door / incidents ---
  const bouncers = onDutyBouncers(club);
  if (result.incidents >= 2) {
    lines.push({ key: 'door', label: 'Door', tone: 'bad', text: `The door lost control — ${result.incidents} incidents got loose tonight.` });
  } else if (result.incidents === 1) {
    lines.push({ key: 'door', label: 'Door', tone: 'warn', text: 'One incident at the door — handled, but it landed.' });
  } else if (bouncers === 0) {
    lines.push({ key: 'door', label: 'Door', tone: 'warn', text: 'No incidents — but you ran the door with no bouncer. You got away with it.' });
  } else if (fill >= 0.6) {
    lines.push({ key: 'door', label: 'Door', tone: 'info', text: 'No major incident — but that crowd was testing the door all night.' });
  } else {
    lines.push({ key: 'door', label: 'Door', tone: 'good', text: 'Door stayed calm — no trouble reached the floor.' });
  }

  // --- Reputation / next warning ---
  const rd = result.reputationDelta;
  if (rd >= 2) {
    lines.push({ key: 'rep', label: 'Reputation', tone: 'good', text: `Word's spreading — your name grew tonight (${signed(rd)}).` });
  } else if (rd <= -2) {
    lines.push({ key: 'rep', label: 'Reputation', tone: 'bad', text: `Your name took a knock (${signed(rd)}). Win the room back next time.` });
  } else if (rd > 0) {
    lines.push({ key: 'rep', label: 'Reputation', tone: 'info', text: `Reputation ticked up (${signed(rd)}).` });
  } else if (rd < 0) {
    lines.push({ key: 'rep', label: 'Reputation', tone: 'warn', text: `Reputation slipped (${signed(rd)}) — watch the room.` });
  } else {
    lines.push({ key: 'rep', label: 'Reputation', tone: 'neutral', text: 'Reputation held steady — no real movement.' });
  }

  // --- Crew relationship flavor (optional, presentation only) ---
  const crew = crewFlavor(result, club);
  if (crew) lines.push(crew);

  return lines;
}
