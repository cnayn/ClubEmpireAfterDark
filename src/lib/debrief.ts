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

import type { BossActionId } from '@/lib/bossActions';
import { CROWD_SEGMENTS, crowdMix, topCrowd } from '@/domain/crowd';
import { topRegulars } from '@/domain/regulars';
import { venueStats } from '@/domain/furniture';
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

function onDutyBartenders(club: ClubState | undefined): number {
  if (!club) return 0;
  const onDuty = new Set(club.lastConfig.staffOnDuty);
  return club.staff.filter((m) => m.role === 'bartender' && onDuty.has(m.id)).length;
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

/** Up to 2 policy-related lines when a non-neutral policy actually mattered. */
function policyLines(result: NightResult, club: ClubState | undefined): DebriefLine[] {
  const p = club?.lastConfig.policies;
  if (!p) return [];
  const out: DebriefLine[] = [];
  if (p.idCheck === 'strict' && result.incidents === 0) {
    out.push({ key: 'pol-id', label: 'Policy', tone: 'good', text: 'Strict IDs slowed the line, but the door stayed clean.' });
  } else if (p.idCheck === 'relaxed' && (result.incidents > 0 || result.fines > 0)) {
    out.push({ key: 'pol-id', label: 'Policy', tone: 'warn', text: 'Relaxed IDs filled the room — and gave the door more to handle.' });
  }
  if (p.security === 'hardline') {
    out.push({ key: 'pol-sec', label: 'Policy', tone: 'info', text: 'Hardline security kept trouble down, but the room felt tense.' });
  } else if (p.security === 'friendly' && result.incidents > 0) {
    out.push({ key: 'pol-sec', label: 'Policy', tone: 'warn', text: 'Friendly security kept the mood warm — but a few things slipped through.' });
  }
  if (p.barService === 'fast') {
    out.push({ key: 'pol-bar', label: 'Policy', tone: 'warn', text: 'Fast Pour moved drinks quickly, but service felt rough around the edges.' });
  } else if (p.barService === 'premium') {
    out.push({ key: 'pol-bar', label: 'Policy', tone: 'good', text: "Premium Care lifted the room's mood, though the bar ran slower." });
  }
  if (p.smoking === 'banned') {
    out.push({ key: 'pol-smoke', label: 'Policy', tone: 'info', text: 'Banned smoking kept the room cleaner, but part of the crowd lost energy.' });
  } else if (p.smoking === 'allowed') {
    out.push({ key: 'pol-smoke', label: 'Policy', tone: 'warn', text: 'Letting the room smoke lifted the vibe — mind the inspection risk.' });
  }
  return out.slice(0, 2); // keep it sharp — at most two policy lines
}

/** Up to 2 lines connecting the boss actions the player took to how the night
 *  actually went (uses existing result data only). */
function bossActionLines(result: NightResult, bossActions: BossActionId[] | undefined): DebriefLine[] {
  if (!bossActions || bossActions.length === 0) return [];
  const out: DebriefLine[] = [];
  for (const id of bossActions) {
    if (id === 'push-dj') {
      out.push(
        result.reputationDelta >= 0
          ? { key: 'ba-dj', label: 'Your call', tone: 'good', text: 'You pushed the booth at the right time — the room held its energy.' }
          : { key: 'ba-dj', label: 'Your call', tone: 'warn', text: 'You pushed the booth, but the room still cooled tonight.' }
      );
    } else if (id === 'check-bar') {
      out.push(
        result.serviceRatio >= 0.85
          ? { key: 'ba-bar', label: 'Your call', tone: 'good', text: 'Checking the bar kept the pours moving.' }
          : { key: 'ba-bar', label: 'Your call', tone: 'warn', text: 'Checking the bar helped, but service was already cracking.' }
      );
    } else if (id === 'send-bouncer') {
      out.push(
        result.incidents === 0
          ? { key: 'ba-door', label: 'Your call', tone: 'good', text: 'Sending a bouncer steadied the door before trouble spread.' }
          : { key: 'ba-door', label: 'Your call', tone: 'warn', text: 'You sent a bouncer, but the door still saw trouble.' }
      );
    } else if (id === 'work-room') {
      out.push(
        result.reputationDelta >= 0
          ? { key: 'ba-room', label: 'Your call', tone: 'good', text: 'Working the room protected your name more than the till.' }
          : { key: 'ba-room', label: 'Your call', tone: 'info', text: 'You worked the room — it softened the blow.' }
      );
    }
  }
  return out.slice(0, 2); // at most two, keep it sharp
}

/** Up to 2 drink-prep lines when the night's stock/quality choice mattered. */
function drinkPrepLines(result: NightResult, club: ClubState | undefined): DebriefLine[] {
  const dp = club?.lastConfig.drinkPrep;
  if (!dp) return [];
  const out: DebriefLine[] = [];
  const fill = result.capacity > 0 ? result.guests / result.capacity : 0;
  if (dp.stock === 'lean' && fill >= 0.7) {
    out.push({ key: 'dp-stock', label: 'Bar prep', tone: 'warn', text: 'Lean stock saved cash up front, but the bar ran thin when the room filled.' });
  } else if (dp.stock === 'heavy' && fill >= 0.7) {
    out.push({ key: 'dp-stock', label: 'Bar prep', tone: 'good', text: 'Heavy stock kept drinks moving through the rush.' });
  }
  if (dp.quality === 'cheap') {
    out.push({ key: 'dp-quality', label: 'Bar prep', tone: 'warn', text: 'Cheap spirits protected the margin, but the room felt it.' });
  } else if (dp.quality === 'premium') {
    out.push({ key: 'dp-quality', label: 'Bar prep', tone: 'good', text: 'Premium quality helped your name — the till paid for it.' });
  }
  return out.slice(0, 2);
}

/** One DJ line when a real act (not the house playlist) was booked. */
function djLine(result: NightResult, club: ClubState | undefined): DebriefLine | null {
  const booking = club?.lastConfig.dj;
  if (!booking || booking === 'house') return null;
  const lifted = result.reputationDelta >= 0;
  if (booking === 'hype') {
    return lifted
      ? { key: 'dj', label: 'DJ', tone: 'good', text: 'The hype DJ earned the fee — the room had real energy tonight.' }
      : { key: 'dj', label: 'DJ', tone: 'warn', text: 'You paid for a name on the decks, but the room never caught fire.' };
  }
  return lifted
    ? { key: 'dj', label: 'DJ', tone: 'good', text: 'The DJ kept the floor moving — a fair booking for the night.' }
    : { key: 'dj', label: 'DJ', tone: 'info', text: 'The DJ did their job; the rest of the night let them down.' };
}

/** One venue line when the room's look/hygiene is doing something. */
function venueLine(club: ClubState | undefined): DebriefLine | null {
  if (!club?.venue) return null;
  const v = venueStats(club.venue);
  if (v.hygiene >= 4) {
    return { key: 'venue', label: 'Venue', tone: 'good', text: 'Bathroom upgrades never make headlines — but they quietly prevent complaints.' };
  }
  if (v.style + v.doorAppeal >= 6) {
    return { key: 'venue', label: 'Venue', tone: 'good', text: 'The room is starting to look like a real club — guests noticed.' };
  }
  if (v.style + v.comfort + v.sound + v.hygiene + v.doorAppeal > 0) {
    return { key: 'venue', label: 'Venue', tone: 'info', text: 'The new touches around the room are starting to show.' };
  }
  return null;
}

/** One crowd line about who came and what it meant (aggregate, no fake guests). */
function crowdLine(result: NightResult, club: ClubState | undefined): DebriefLine | null {
  if (!club) return null;
  const top = topCrowd(crowdMix(club, club.lastConfig), 1)[0];
  if (!top) return null;
  switch (top) {
    case 'students':
      return result.serviceRatio < 0.85
        ? { key: 'crowd-seg', label: 'Crowd', tone: 'warn', text: 'Students packed the room, but the bar felt every one of them.' }
        : { key: 'crowd-seg', label: 'Crowd', tone: 'info', text: 'Students filled the place — cheap rounds, loud room.' };
    case 'rough':
      return result.incidents > 0
        ? { key: 'crowd-seg', label: 'Crowd', tone: 'warn', text: 'The rougher crowd brought energy — and the door had to stay sharp.' }
        : { key: 'crowd-seg', label: 'Crowd', tone: 'info', text: 'A rougher crowd came in, but the door held it together.' };
    case 'musicheads':
      return { key: 'crowd-seg', label: 'Crowd', tone: 'good', text: 'Music heads noticed the sound tonight.' };
    case 'vipcurious':
      return { key: 'crowd-seg', label: 'Crowd', tone: 'good', text: 'VIP-curious guests clocked the entrance — the club’s starting to look worth the line.' };
    case 'regulars':
      return { key: 'crowd-seg', label: 'Crowd', tone: 'good', text: 'Regulars liked seeing familiar faces behind the bar.' };
    case 'locals':
    default:
      return { key: 'crowd-seg', label: 'Crowd', tone: 'info', text: 'Locals kept the night steady — that trust is worth more than one big spike.' };
  }
}

/** One line about the regulars who are starting to come back (aggregate). */
function regularsLine(result: NightResult, club: ClubState | undefined): DebriefLine | null {
  if (!club) return null;
  const top = topRegulars(club.regularBase, 1)[0];
  if (!top || top.score < 15) return null; // only once a base is genuinely forming
  switch (top.id) {
    case 'regulars':
      return { key: 'reg', label: 'Regulars', tone: 'good', text: 'Regulars came back tonight. That is not luck.' };
    case 'locals':
      return { key: 'reg', label: 'Regulars', tone: 'good', text: 'Locals are starting to treat this place like theirs.' };
    case 'musicheads':
      return { key: 'reg', label: 'Regulars', tone: 'good', text: 'Music heads noticed the sound again — that reputation is building.' };
    case 'students':
      return result.serviceRatio < 0.85
        ? { key: 'reg', label: 'Regulars', tone: 'warn', text: 'Students brought bodies, but the bar paid the price.' }
        : { key: 'reg', label: 'Regulars', tone: 'info', text: 'Students keep coming for the cheap, loud nights.' };
    case 'rough':
      return { key: 'reg', label: 'Regulars', tone: 'warn', text: 'The wrong crowd is also a reputation. Watch the door.' };
    case 'vipcurious':
    default:
      return { key: 'reg', label: 'Regulars', tone: 'info', text: 'A sharper crowd is circling — the club is getting noticed.' };
  }
}

/** One sharp headline that frames the whole night, boss-report style. */
function summaryLine(result: NightResult, fill: number): DebriefLine {
  const strained = result.serviceRatio < 0.85;
  if (result.net < 0 && result.incidents > 0) {
    return { key: 'summary', label: 'Boss', tone: 'bad', text: 'Loud night, red books — you bled money and the door bled trust.' };
  }
  if (result.net < 0) {
    return { key: 'summary', label: 'Boss', tone: 'bad', text: 'You opened, but the night cost you more than it made.' };
  }
  if (result.incidents > 0) {
    return { key: 'summary', label: 'Boss', tone: 'warn', text: 'You made profit — and you also taught the crowd what you tolerate.' };
  }
  if (strained) {
    return { key: 'summary', label: 'Boss', tone: 'warn', text: "The bar made money, but it wasn't clean money — service was stretched." };
  }
  if (result.guests === 0 || fill < 0.3) {
    return { key: 'summary', label: 'Boss', tone: 'info', text: 'A thin room. The night was calm, but the floor needs bodies.' };
  }
  if (result.reputationDelta >= 2) {
    return { key: 'summary', label: 'Boss', tone: 'good', text: 'A real night — the room left happy and the books agree.' };
  }
  return { key: 'summary', label: 'Boss', tone: 'good', text: 'A steady night. Nothing broke; build on it.' };
}

/** The single most important thing to fix before tomorrow. */
function fixLine(result: NightResult, club: ClubState | undefined, fill: number): DebriefLine {
  if (result.incidents > 0) {
    return { key: 'fix', label: 'Tomorrow', tone: 'warn', text: 'Fix the door first — more security on, or tighten the policy.' };
  }
  if (result.serviceRatio < 0.85) {
    return { key: 'fix', label: 'Tomorrow', tone: 'warn', text: 'Fix the bar before you chase a bigger night — more hands or fewer bodies.' };
  }
  if (result.net < 0) {
    return { key: 'fix', label: 'Tomorrow', tone: 'warn', text: 'Tighten costs or pull a bigger crowd before you spend on anything.' };
  }
  if (result.guests === 0 || fill < 0.3) {
    return { key: 'fix', label: 'Tomorrow', tone: 'info', text: 'Pull a crowd first — a cheaper door, an event, or a DJ to get a name.' };
  }
  if (result.reputationDelta < 0) {
    return { key: 'fix', label: 'Tomorrow', tone: 'warn', text: 'Win the room back — a clean, well-served night, no shortcuts.' };
  }
  if (onDutyBouncers(club) === 0) {
    return { key: 'fix', label: 'Tomorrow', tone: 'info', text: 'You ran the door bare tonight. Put a bouncer on before it bites.' };
  }
  return { key: 'fix', label: 'Tomorrow', tone: 'good', text: 'Hold this and push for more — try an event or grow the room.' };
}

/** Build the boss-level debrief lines for a finished night. */
export function buildDebrief(result: NightResult, club?: ClubState, bossActions?: BossActionId[]): DebriefLine[] {
  const fill = result.capacity > 0 ? result.guests / result.capacity : 0;
  const lines: DebriefLine[] = [];

  // --- Boss summary (headline) ---
  lines.push(summaryLine(result, fill));

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
    lines.push(
      onDutyBartenders(club) >= 3
        ? { key: 'bar', label: 'Bar', tone: 'good', text: 'Plenty of hands on the bar — drinks never stopped and the room felt it.' }
        : { key: 'bar', label: 'Bar', tone: 'good', text: 'Bar held up — guests got served before patience snapped.' }
    );
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

  // --- Context lines (optional), gathered by priority then CAPPED so the report
  //     stays a sharp boss read, not a wall of text. Your Calls + crew (Staff)
  //     come first, then the single most relevant bit of night colour. ---
  const optional: DebriefLine[] = [];
  optional.push(...bossActionLines(result, bossActions)); // "Your call" (≤2)
  const crew = crewFlavor(result, club); // Staff
  if (crew) optional.push(crew);
  const crowd = crowdLine(result, club);
  if (crowd) optional.push(crowd);
  const regs = regularsLine(result, club);
  if (regs) optional.push(regs);
  const dj = djLine(result, club);
  if (dj) optional.push(dj);
  optional.push(...drinkPrepLines(result, club));
  optional.push(...policyLines(result, club));
  const venue = venueLine(club);
  if (venue) optional.push(venue);
  lines.push(...optional.slice(0, 3));

  // --- What to fix before tomorrow (closing call) ---
  lines.push(fixLine(result, club, fill));

  return lines;
}

export interface BossReport {
  /** One-line headline. */
  summary: DebriefLine;
  /** The 3 sharpest read lines. */
  bullets: DebriefLine[];
  /** The single "fix tomorrow" call. */
  fix: DebriefLine;
  /** The full report, for an optional "Details" expander. */
  full: DebriefLine[];
}

/**
 * Debrief v3 — a TIGHT boss report: a summary headline, the 3 sharpest bullets,
 * and the fix line. Built by selecting from the full debrief, so nothing new is
 * invented and the full report stays available behind a "Details" expander.
 */
export function buildBossReport(result: NightResult, club?: ClubState, bossActions?: BossActionId[]): BossReport {
  const full = buildDebrief(result, club, bossActions);
  const summary = full.find((l) => l.key === 'summary') ?? full[0];
  const fix = full.find((l) => l.key === 'fix') ?? full[full.length - 1];
  // Sharpest-first: the decision-relevant lines come before flavour.
  const priority = ['door', 'bar', 'money', 'ba-dj', 'ba-bar', 'ba-door', 'ba-room', 'crew', 'rep', 'crowd', 'crowd-seg', 'reg', 'dj'];
  const rank = (k: string) => {
    const i = priority.indexOf(k);
    return i < 0 ? 99 : i;
  };
  const bullets = full
    .filter((l) => l.key !== 'summary' && l.key !== 'fix')
    .sort((a, b) => rank(a.key) - rank(b.key))
    .slice(0, 3);
  return { summary, bullets, fix, full };
}
