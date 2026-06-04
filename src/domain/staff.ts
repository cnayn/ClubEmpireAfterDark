/**
 * Named staff (Phase 2A). Pure domain logic — no React, no I/O.
 *
 * Staff replace the old abstract bartender-count and security-level levers. The
 * aggregation here maps a scheduled roster onto the SAME internal quantities the
 * night resolver already uses (service capacity, security mod), so the default
 * starting crew reproduces the pre-Phase-2 curve exactly. See docs/phase2-scope.md.
 */

import * as B from '@/domain/balance';
import type { DayConfig, ResultNote, StaffMember, StaffRole, StaffTrait } from '@/domain/types';
import type { Rng } from '@/sim/rng';

// --- Display labels (UI reads these; raw stats stay off card faces, R4) ------

export const ROLE_LABEL: Record<StaffRole, string> = {
  bartender: 'Bartender',
  bouncer: 'Bouncer',
};

export const TRAIT_LABEL: Record<StaffTrait, string> = {
  none: '—',
  'fast-pour': 'Fast Pour',
  'sticky-fingers': 'Sticky Fingers',
  intimidating: 'Intimidating',
  'by-the-book': 'By the Book',
  steady: 'Steady',
  flaky: 'Flaky',
};

/** A coarse, player-facing read on skill — no raw number on the card face. */
export function strengthLabel(skill: number): string {
  if (skill >= 75) return 'Pro';
  if (skill >= 55) return 'Skilled';
  if (skill >= 45) return 'Solid';
  return 'Green';
}

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

function hasTrait(m: StaffMember, trait: StaffTrait): boolean {
  return m.visibleTrait === trait || m.hiddenTrait === trait;
}

function effectiveReliability(m: StaffMember): number {
  let r = m.reliability;
  if (hasTrait(m, 'steady')) r += B.STEADY_RELIABILITY_BONUS;
  if (hasTrait(m, 'flaky')) r -= B.FLAKY_RELIABILITY_PENALTY;
  return clamp(r, 0, 100);
}

// --- Rosters -----------------------------------------------------------------

/** A brand-new club's crew: dependable but ordinary. Honest + reliable so the
 *  baseline night consumes no extra RNG (identity point holds bit-exactly). */
export const STARTING_ROSTER: StaffMember[] = [
  {
    id: 'bar-rosa',
    name: 'Rosa',
    role: 'bartender',
    salary: B.STARTING_BARTENDER_SALARY,
    skill: B.BASELINE_SKILL,
    honesty: 100,
    reliability: 100,
    visibleTrait: 'none',
    hiddenTrait: 'none',
    description: 'Steady hand, knows the regulars by name.',
  },
  {
    id: 'bar-milo',
    name: 'Milo',
    role: 'bartender',
    salary: B.STARTING_BARTENDER_SALARY,
    skill: B.BASELINE_SKILL,
    honesty: 100,
    reliability: 100,
    visibleTrait: 'none',
    hiddenTrait: 'none',
    description: 'Reliable pour, never rattled by a rush.',
  },
  {
    id: 'bnc-dimitri',
    name: 'Dimitri',
    role: 'bouncer',
    salary: B.STARTING_BOUNCER_SALARY,
    skill: B.BASELINE_SKILL,
    honesty: 100,
    reliability: 100,
    visibleTrait: 'none',
    hiddenTrait: 'none',
    description: 'Calm presence on the door.',
  },
];

/** Fixed, static hiring pool (no refresh timers in Phase 2A). Each is a tradeoff:
 *  more skill usually means a higher salary, a flaw, or a hidden surprise. */
export const CANDIDATE_POOL: StaffMember[] = [
  {
    id: 'bar-vince',
    name: 'Vince',
    role: 'bartender',
    salary: 160,
    skill: 78,
    honesty: 45,
    reliability: 85,
    visibleTrait: 'fast-pour',
    hiddenTrait: 'sticky-fingers',
    description: 'Lightning behind the bar. The tips never quite add up.',
  },
  {
    id: 'bar-jin',
    name: 'Jin',
    role: 'bartender',
    salary: 100,
    skill: 46,
    honesty: 92,
    reliability: 96,
    visibleTrait: 'steady',
    hiddenTrait: 'none',
    description: 'Unflashy, dependable, and cheap.',
  },
  {
    id: 'bnc-marcus',
    name: 'Marcus',
    role: 'bouncer',
    salary: 150,
    skill: 72,
    honesty: 88,
    reliability: 92,
    visibleTrait: 'intimidating',
    hiddenTrait: 'none',
    description: 'One look and the queue behaves.',
  },
  {
    id: 'bnc-pavel',
    name: 'Pavel',
    role: 'bouncer',
    salary: 90,
    skill: 55,
    honesty: 70,
    reliability: 70,
    visibleTrait: 'none',
    hiddenTrait: 'flaky',
    description: 'Solid when he shows up. Big when he does.',
  },
  {
    id: 'bnc-grace',
    name: 'Grace',
    role: 'bouncer',
    salary: 130,
    skill: 60,
    honesty: 95,
    reliability: 90,
    visibleTrait: 'by-the-book',
    hiddenTrait: 'none',
    description: 'Runs a tight, compliant door.',
  },
  // Character-bible bouncers (current role). Flavor/identity lives in
  // src/domain/characters.ts; mechanically they use the existing trait vocab and
  // sit as peers in the pool. Their concealed bible traits are metadata only —
  // no hidden-trait mechanic is wired up this pass (hiddenTrait stays 'none').
  {
    id: 'bnc-john',
    name: 'John',
    role: 'bouncer',
    salary: 155,
    skill: 72,
    honesty: 85,
    reliability: 95,
    visibleTrait: 'intimidating',
    hiddenTrait: 'none',
    description: 'Fearless on the door — walks into anything.',
  },
  {
    id: 'bnc-kareem',
    name: 'Kareem',
    role: 'bouncer',
    salary: 140,
    skill: 68,
    honesty: 95,
    reliability: 90,
    visibleTrait: 'intimidating',
    hiddenTrait: 'none',
    description: 'Warm with regulars, immovable with troublemakers.',
  },
];

export function getCandidate(id: string): StaffMember | undefined {
  return CANDIDATE_POOL.find((m) => m.id === id);
}

// --- Costs & defaults --------------------------------------------------------

/** Total wages owed tonight — every scheduled member is paid, even a no-show. */
export function wagesForOnDuty(roster: StaffMember[], onDutyIds: string[]): number {
  return roster
    .filter((m) => onDutyIds.includes(m.id))
    .reduce((sum, m) => sum + m.salary, 0);
}

/** Cheapest viable night = the single cheapest bartender (0 bouncers allowed).
 *  Used by the shop reserve / soft-lock guard. */
export function minViableNightCost(roster: StaffMember[]): number {
  const bartenderSalaries = roster.filter((m) => m.role === 'bartender').map((m) => m.salary);
  return bartenderSalaries.length ? Math.min(...bartenderSalaries) : 0;
}

/** Upfront fee to hire a candidate (salary is then paid per on-duty night). */
export function hireCost(member: StaffMember): number {
  return Math.round(member.salary * B.HIRE_COST_MULT);
}

/** Default day config for a roster: everyone on duty, neutral Regular Night.
 *  With the starting roster this equals the old default (2 bartenders, sec 1). */
export function defaultDayConfig(roster: StaffMember[]): DayConfig {
  return {
    music: 'house',
    coverLevel: 'low',
    drinkLevel: 'med',
    staffOnDuty: roster.map((m) => m.id),
    eventId: 'regular',
    vipFocus: false,
    smoking: 'strict',
  };
}

// --- Validation --------------------------------------------------------------

/** A schedule is valid if ids are unique, all employed, and include ≥1 bartender. */
export function isValidSchedule(roster: StaffMember[], onDutyIds: string[]): boolean {
  if (new Set(onDutyIds).size !== onDutyIds.length) return false;
  const members = onDutyIds.map((id) => roster.find((m) => m.id === id));
  if (members.some((m) => !m)) return false;
  return members.some((m) => m!.role === 'bartender');
}

/** Can't fire the last bartender (the club must always be able to open a night). */
export function canFireStaff(roster: StaffMember[], id: string): boolean {
  const m = roster.find((x) => x.id === id);
  if (!m) return false;
  if (m.role === 'bartender') {
    return roster.filter((x) => x.role === 'bartender').length > 1;
  }
  return true;
}

// --- Night aggregation -------------------------------------------------------

/**
 * Deterministic best-case crew strength (assumes everyone shows; no RNG). Used
 * by the event readiness advisory — never by the resolver. Mirrors the per-role
 * math in aggregateOnDuty minus the no-show roll.
 */
export function crewPotential(
  roster: StaffMember[],
  onDutyIds: string[]
): { service: number; bouncerUnits: number } {
  let service = 0;
  let bouncerUnits = 0;
  for (const m of roster.filter((x) => onDutyIds.includes(x.id))) {
    if (m.role === 'bartender') {
      const fast = hasTrait(m, 'fast-pour') ? 1.1 : 1;
      service += B.SERVICE_PER_BARTENDER * (m.skill / B.BASELINE_SKILL) * fast;
    } else {
      const honestyFactor = B.BOUNCER_HONESTY_FLOOR + (1 - B.BOUNCER_HONESTY_FLOOR) * (m.honesty / 100);
      const intimidating = hasTrait(m, 'intimidating') ? B.INTIMIDATING_UNIT_BONUS : 0;
      bouncerUnits += (m.skill / B.BASELINE_SKILL) * honestyFactor + intimidating;
    }
  }
  return { service, bouncerUnits };
}

export interface OnDutyAggregate {
  /** Bartender service capacity (excludes upgrade bonuses, applied by the sim). */
  service: number;
  /** Effective bouncer units → feeds bouncerSecurityMod. */
  bouncerUnits: number;
  /** Multiplier on the compliance-fine chance (By-the-Book lowers it). */
  complianceMult: number;
  /** Bartenders who actually showed up (for theft resolution). */
  showedBartenders: StaffMember[];
  noShows: number;
  notes: ResultNote[];
}

/**
 * Resolve who shows up and what the on-duty crew is worth.
 *
 * RNG contract (R3): consumes RNG **only** for staff with effective reliability
 * < 100. The starting roster is fully reliable, so this draws nothing and the
 * baseline night's RNG stream is identical to the pre-Phase-2 resolver. Staff are
 * processed in roster order for determinism.
 */
export function aggregateOnDuty(
  roster: StaffMember[],
  onDutyIds: string[],
  rng: Rng
): OnDutyAggregate {
  const onDuty = roster.filter((m) => onDutyIds.includes(m.id)); // roster order preserved
  let service = 0;
  let bouncerUnits = 0;
  let complianceMult = 1;
  let noShows = 0;
  const showedBartenders: StaffMember[] = [];
  const notes: ResultNote[] = [];

  for (const m of onDuty) {
    const effRel = effectiveReliability(m);
    if (effRel < 100 && rng.chance((1 - effRel / 100) * B.NOSHOW_CHANCE_FACTOR)) {
      noShows++;
      notes.push({
        tone: 'bad',
        text:
          m.hiddenTrait === 'flaky'
            ? `${m.name} didn't show — turns out they're flaky.`
            : `${m.name} didn't show up tonight (still on the payroll).`,
      });
      continue;
    }

    if (m.role === 'bartender') {
      const fast = hasTrait(m, 'fast-pour') ? 1.1 : 1;
      service += B.SERVICE_PER_BARTENDER * (m.skill / B.BASELINE_SKILL) * fast;
      showedBartenders.push(m);
    } else {
      const honestyFactor = B.BOUNCER_HONESTY_FLOOR + (1 - B.BOUNCER_HONESTY_FLOOR) * (m.honesty / 100);
      const intimidating = hasTrait(m, 'intimidating') ? B.INTIMIDATING_UNIT_BONUS : 0;
      bouncerUnits += (m.skill / B.BASELINE_SKILL) * honestyFactor + intimidating;
      if (hasTrait(m, 'by-the-book')) complianceMult *= B.BY_THE_BOOK_COMPLIANCE_MULT;
    }
  }

  return { service, bouncerUnits, complianceMult, showedBartenders, noShows, notes };
}

export interface TheftOutcome {
  theft: number;
  notes: ResultNote[];
}

/**
 * Dishonest bartenders skim a slice of bar revenue. RNG contract (R3): draws
 * **only** for bartenders who can steal (honesty < 100 or Sticky Fingers), so an
 * honest crew consumes nothing. Called after bar revenue is known; bartenders
 * processed in the order they showed up (roster order).
 */
export function resolveTheft(
  showedBartenders: StaffMember[],
  barRevenue: number,
  rng: Rng
): TheftOutcome {
  const notes: ResultNote[] = [];
  let theft = 0;
  if (showedBartenders.length === 0 || barRevenue <= 0) return { theft, notes };

  const share = barRevenue / showedBartenders.length;
  for (const m of showedBartenders) {
    let chance = (1 - m.honesty / 100) * B.THEFT_CHANCE_FACTOR;
    if (hasTrait(m, 'sticky-fingers')) chance += B.STICKY_FINGERS_CHANCE_BONUS;
    if (chance <= 0) continue;
    if (rng.chance(chance)) {
      theft += Math.round(share * B.THEFT_SKIM);
      notes.push({
        tone: 'bad',
        text:
          m.hiddenTrait === 'sticky-fingers'
            ? `Cash went missing behind the bar — ${m.name} has sticky fingers.`
            : `${m.name} skimmed a little from the till tonight.`,
      });
    }
  }
  return { theft, notes };
}
