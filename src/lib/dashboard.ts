/**
 * Pure, presentation-only derivations for the Dashboard (Floor View + Next Goal).
 * Reads EXISTING game state only — no new sim/saved fields, no RNG, no mutation,
 * and no resolver/economy involvement. Safe to unit-test in isolation.
 */

import { REPUTATION_TIERS, START_CAPACITY } from '@/domain/balance';
import { crowdMix, topCrowd } from '@/domain/crowd';
import { getEvent } from '@/domain/events';
import { equippedIn, getFurniture, getVenue, venueStats } from '@/domain/furniture';
import { getRegularBase } from '@/domain/regulars';
import { CANDIDATE_POOL, hireCost, minViableNightCost } from '@/domain/staff';
import type { ClubState, EventId, NightResult } from '@/domain/types';
import { aggregateEffects, UPGRADES } from '@/domain/upgrades';

// --- Floor View ---------------------------------------------------------------

export type Density = 'empty' | 'sparse' | 'busy' | 'packed';
/** Vibe keys map to existing events only; the component maps these to colors. */
export type Vibe = 'neutral' | 'contained' | 'rowdy' | 'spotlight' | 'sharp';

export interface FloorStaff {
  id: string;
  name: string;
  initials: string;
}

export interface FloorView {
  capacity: number;
  density: Density;
  /** how many crowd dots to render (capped for layout) */
  dots: number;
  eventId: EventId;
  eventName: string;
  vibe: Vibe;
  bartenders: FloorStaff[]; // on duty only
  bouncers: FloorStaff[]; // on duty only
  hasPlayedNight: boolean;
  lastGuests: number | null;
}

const VIBE: Record<EventId, Vibe> = {
  regular: 'neutral',
  'private-party': 'contained',
  'student-night': 'rowdy',
  'grand-opening': 'spotlight',
  'industry-night': 'sharp',
};

const DOT_CAP = 36; // render cap; the floor stays readable on a phone

function toFloorStaff(m: { id: string; name: string }): FloorStaff {
  return { id: m.id, name: m.name, initials: m.name.slice(0, 2).toUpperCase() };
}

/**
 * Build the Floor View from existing state. Crowd density comes from the last
 * resolved night when one exists; a brand-new club shows a small "quiet start"
 * ambient crowd (a presentation approximation, NOT a sim/saved value).
 */
export function buildFloorView(club: ClubState, lastResult: NightResult | null): FloorView {
  const capacity = club.baseCapacity + aggregateEffects(club.ownedUpgradeIds).capacity;
  const onDuty = club.staff.filter((m) => club.lastConfig.staffOnDuty.includes(m.id));
  const bartenders = onDuty.filter((m) => m.role === 'bartender').map(toFloorStaff);
  const bouncers = onDuty.filter((m) => m.role === 'bouncer').map(toFloorStaff);

  const eventId = club.lastConfig.eventId;
  const hasPlayedNight = !!lastResult;
  const guests = lastResult ? lastResult.guests : 0;
  const ratio = capacity > 0 ? guests / capacity : 0;

  let density: Density;
  let dots: number;
  if (!hasPlayedNight) {
    density = 'sparse'; // quiet, growable starting room — never looks "broken"
    dots = Math.max(3, Math.round(capacity * 0.1));
  } else {
    density = ratio < 0.05 ? 'empty' : ratio < 0.3 ? 'sparse' : ratio < 0.7 ? 'busy' : 'packed';
    dots = Math.min(guests, DOT_CAP);
  }

  return {
    capacity,
    density,
    dots,
    eventId,
    eventName: getEvent(eventId).name,
    vibe: VIBE[eventId],
    bartenders,
    bouncers,
    hasPlayedNight,
    lastGuests: hasPlayedNight ? guests : null,
  };
}

/** Equipped furniture names mapped onto the floor's visible zones, so the room
 *  reflects what the owner has set up. Presentation only. */
export interface VenueFloorChips {
  door: string[];
  bar: string[];
  floor: string[];
}
export function venueFloorChips(club: ClubState): VenueFloorChips {
  const v = getVenue(club.venue);
  const names = (zone: 'entrance' | 'bar' | 'dancefloor') =>
    equippedIn(v, zone)
      .map((id) => getFurniture(id)?.name ?? '')
      .filter(Boolean);
  return { door: names('entrance'), bar: names('bar'), floor: names('dancefloor') };
}

// --- Floor bubbles (interpretations of EXISTING aggregate signals) ------------

export type BubbleTone = 'bad' | 'warn' | 'info' | 'good';
export type BubbleZone = 'door' | 'bar' | 'floor';

export interface FloorBubble {
  id: string;
  label: string;
  tone: BubbleTone;
  zone: BubbleZone;
}

/**
 * Re-present last night's aggregate outcomes as floor bubbles. These are
 * INTERPRETATIONS of fields the sim already produces (incidents, theft, noShows,
 * fines, serviceRatio, reputationDelta, net) — never per-guest or located
 * incidents, and never new state. No last result → no bubbles (quiet room).
 */
export function floorBubbles(lastResult: NightResult | null): FloorBubble[] {
  if (!lastResult) return [];
  const r = lastResult;
  const bubbles: FloorBubble[] = [];

  if (r.incidents > 0) {
    bubbles.push({
      id: 'incidents',
      label: r.incidents === 1 ? 'Trouble at the door' : `${r.incidents} incidents`,
      tone: 'bad',
      zone: 'door',
    });
  }
  // incidents === 0 here means any fine is a compliance ("inspector") fine.
  if (r.fines > 0 && r.incidents === 0) {
    bubbles.push({ id: 'inspector', label: 'Inspector dropped by', tone: 'warn', zone: 'door' });
  }
  if (r.theft > 0) {
    bubbles.push({ id: 'theft', label: `Till short — $${r.theft.toLocaleString('en-US')}`, tone: 'bad', zone: 'bar' });
  }
  if (r.serviceRatio < 0.85) {
    bubbles.push({ id: 'service', label: 'Bar backing up', tone: 'warn', zone: 'bar' });
  }
  if (r.noShows > 0) {
    bubbles.push({ id: 'noshow', label: r.noShows === 1 ? 'Short-handed' : 'Crew missing', tone: 'warn', zone: 'floor' });
  }
  if (r.reputationDelta < 0) {
    bubbles.push({ id: 'rep', label: 'Bad word travelled', tone: 'bad', zone: 'floor' });
  }
  if (r.net < 0) {
    bubbles.push({ id: 'net', label: 'Books took a hit', tone: 'bad', zone: 'floor' });
  }
  return bubbles;
}

// --- Guest emotes (ambient "voices" from aggregate signals) -------------------

/**
 * Ambient guest reactions for the live floor — quoted speech-bubble emotes read
 * from EXISTING aggregate signals (service, incidents, fill, crowd identity,
 * regulars, venue look). No named guests, no per-guest sim, no new state. Capped
 * so the floor reads as a room of people, not a wall of metrics.
 */
export function floorEmotes(result: NightResult | null, club: ClubState): FloorBubble[] {
  if (!result || result.guests <= 0) return [];
  const fill = result.capacity > 0 ? result.guests / result.capacity : 0;
  const out: FloorBubble[] = [];

  // Bar — the loudest signal first.
  if (result.serviceRatio < 0.85) {
    out.push({ id: 'emo-bar', label: '“Where’s my drink?”', tone: 'warn', zone: 'bar' });
  } else if (result.serviceRatio >= 1 && fill >= 0.5) {
    out.push({ id: 'emo-bar', label: '“Quick pour — nice.”', tone: 'good', zone: 'bar' });
  }

  // Door — trouble reads here.
  if (result.incidents > 0) {
    out.push({ id: 'emo-door', label: '“Door’s tense.”', tone: 'bad', zone: 'door' });
  }

  // Floor — density, then who's in and how the room feels.
  if (fill >= 0.95) {
    out.push({ id: 'emo-floor', label: '“Too crowded.”', tone: 'warn', zone: 'floor' });
  } else if (fill < 0.3) {
    out.push({ id: 'emo-floor', label: '“This is dead.”', tone: 'info', zone: 'floor' });
  } else {
    const top = topCrowd(crowdMix(club, club.lastConfig), 2);
    const v = venueStats(club.venue);
    if (top.includes('musicheads')) {
      out.push({ id: 'emo-floor', label: '“Sound is good.”', tone: 'good', zone: 'floor' });
    } else if (top.includes('regulars') || getRegularBase(club.regularBase).regulars >= 20) {
      out.push({ id: 'emo-floor', label: '“Same faces tonight.”', tone: 'info', zone: 'floor' });
    } else if (v.style + v.doorAppeal >= 4) {
      out.push({ id: 'emo-door', label: '“This place looks better.”', tone: 'good', zone: 'door' });
    }
  }

  return out.slice(0, 3);
}

// --- Next Goal ----------------------------------------------------------------

export type GoalKind = 'recovery' | 'almost' | 'tier' | 'growth';

export interface Goal {
  kind: GoalKind;
  title: string;
  detail?: string;
  /** 0..1 progress for an optional bar */
  progress?: number;
}

interface ReachItem {
  name: string;
  cost: number;
}

/** The single unowned upgrade or unhired candidate the player is closest to
 *  affording but can't quite yet (cash in [50%, 100%) of its cost). */
function nearestAlmostAffordable(club: ClubState, cash: number): ReachItem | null {
  const items: ReachItem[] = [];
  for (const u of UPGRADES) {
    if (!club.ownedUpgradeIds.includes(u.id)) items.push({ name: u.name, cost: u.cost });
  }
  for (const c of CANDIDATE_POOL) {
    if (!club.staff.some((m) => m.id === c.id)) items.push({ name: `Hire ${c.name}`, cost: hireCost(c) });
  }
  const near = items
    .filter((i) => cash < i.cost && cash >= i.cost * 0.5)
    .sort((a, b) => cash / b.cost - cash / a.cost);
  return near[0] ?? null;
}

const TIER_UNLOCK: Record<number, string> = {
  20: 'Establish yourself as a Local Spot.',
  40: 'Unlocks bigger events — Grand Opening and Industry Night.',
  60: 'A City Favorite — bigger crowds and standing.',
  80: 'The best club in the city.',
};

function nextTier(reputation: number): { label: string; min: number; unlock: string } | null {
  const next = REPUTATION_TIERS.filter((t) => t.min > reputation).sort((a, b) => a.min - b.min)[0];
  if (!next) return null;
  return { label: next.label, min: next.min, unlock: TIER_UNLOCK[next.min] ?? 'Stronger opportunities ahead.' };
}

const money = (n: number) => `$${n.toLocaleString('en-US')}`;

/**
 * Pick ONE primary goal. Precedence: a recovery interrupt when the club can
 * barely operate, then an almost-affordable upgrade/hire, then the next
 * reputation tier, then a general growth fallback. (Recovery is checked first
 * rather than third because a near-broke club can't pursue anything else.)
 */
export function nextGoal(club: ClubState): Goal {
  const cash = club.cash;

  // Recovery interrupt — below ~two minimum nights of runway.
  if (cash < minViableNightCost(club.staff) * 2) {
    return {
      kind: 'recovery',
      title: 'Rebuild cash after a rough night',
      detail: `${money(cash)} on hand — run a lean, safe night to recover.`,
    };
  }

  // Almost-affordable upgrade or hire.
  const near = nearestAlmostAffordable(club, cash);
  if (near) {
    return {
      kind: 'almost',
      title: `Almost there: ${near.name}`,
      detail: `${money(near.cost)} — you have ${money(cash)}`,
      progress: cash / near.cost,
    };
  }

  // Next reputation tier.
  const tier = nextTier(club.reputation);
  if (tier) {
    return {
      kind: 'tier',
      title: `${tier.label}: ${club.reputation} / ${tier.min}`,
      detail: tier.unlock,
      progress: club.reputation / tier.min,
    };
  }

  // General growth.
  return {
    kind: 'growth',
    title: 'Grow reputation to unlock stronger opportunities',
    detail: 'Run strong nights to keep your name climbing.',
  };
}

// --- Goal Board (multiple active goals) ---------------------------------------
//
// A compact board of 3–5 goals chosen for the club's CURRENT state. Every goal
// is derived purely from existing state (ClubState + last NightResult) — no new
// saved fields, no RNG, nothing the player can't actually complete with the
// systems that ship today. "Benefit" is descriptive only (the natural upside of
// finishing the goal); there are NO claimable cash/rep payouts, so no claim
// bookkeeping and no save-schema change is needed for this prototype.

export type BoardGoalCategory = 'tutorial' | 'business' | 'reputation' | 'staff' | 'venue';
export type BoardGoalStatus = 'active' | 'completed';

export interface BoardGoal {
  id: string;
  category: BoardGoalCategory;
  title: string;
  /** One short, actionable instruction ("how to make progress"). */
  instruction: string;
  /** 0..1 for the progress bar. */
  progress: number;
  status: BoardGoalStatus;
  /** Optional descriptive upside (not a claimable reward). */
  benefit?: string;
}

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

const CASH_MILESTONES = [1000, 2500, 5000, 10000];
const BIG_NIGHT_TARGET = 500; // a strong single-night net
/** Upgrades that have their own named venue goal — excluded from "next upgrade". */
const NAMED_UPGRADE_IDS = new Set(['pro-lighting', 'extra-bar', 'bigger-floor']);

/** Build every applicable goal for this state, grouped by selection priority.
 *  Recovery goals are only included when their triggering condition holds (so the
 *  board never shows a fake one). Exported for testing the full catalog directly. */
export function buildBoardGoals(club: ClubState, lastResult: NightResult | null) {
  const owned = club.ownedUpgradeIds;
  const owns = (id: string) => owned.includes(id);
  const capacity = club.baseCapacity + aggregateEffects(owned).capacity;
  const bartenders = club.staff.filter((m) => m.role === 'bartender').length;
  const bouncers = club.staff.filter((m) => m.role === 'bouncer').length;
  const onDuty = club.staff.filter((m) => club.lastConfig.staffOnDuty.includes(m.id)).length;
  const total = club.staff.length;
  const hasPlayed = club.day > 1;

  const done = (b: boolean): BoardGoalStatus => (b ? 'completed' : 'active');

  // --- Tutorial / onboarding (teach the club loop, not "buy random things") ---
  // These GUIDE goals walk a new owner through cause-and-effect: who your crew is,
  // what they do, open a quiet night, read the debrief, THEN buy an upgrade.
  const learnCrew: BoardGoal = {
    id: 'learn-crew', category: 'tutorial',
    title: 'Know what your crew does',
    instruction:
      'Bartenders keep drinks moving — that is your bar service and revenue. Bouncers protect the door — fewer incidents. Open a night and watch both.',
    progress: hasPlayed ? 1 : 0, status: done(hasPlayed),
    benefit: 'Your staff decide how the night goes.',
  };
  const openFirstNight: BoardGoal = {
    id: 'open-first-night', category: 'tutorial',
    title: 'Open a quiet first night',
    instruction: 'Tap Prepare Tonight, keep it a Quiet Night, and see what your crew can handle.',
    progress: hasPlayed ? 1 : 0, status: done(hasPlayed),
    benefit: 'See what breaks before you spend.',
  };
  const readTheNight: BoardGoal = {
    id: 'read-the-night', category: 'tutorial',
    title: 'Read the morning-after debrief',
    instruction: 'After the night, read what your crew tells you — money, crowd, bar, door. That is how you learn what to fix.',
    progress: hasPlayed ? 1 : 0, status: done(hasPlayed),
    benefit: 'Let the debrief pick your next move.',
  };
  const prepareTheBar: BoardGoal = {
    id: 'prepare-the-bar', category: 'tutorial',
    title: 'Prepare the bar',
    instruction: 'In Day Prep, set a stock plan and drink quality before you open — too lean and the bar runs dry.',
    progress: hasPlayed ? 1 : 0, status: done(hasPlayed),
    benefit: 'Stock and quality shape the night.',
  };
  const setTheRules: BoardGoal = {
    id: 'set-the-rules', category: 'tutorial',
    title: 'Set your house rules',
    instruction: 'Choose your policies in Day Prep — smoking, ID strictness, security, bar service. The middle option is safe; change one on purpose.',
    progress: hasPlayed ? 1 : 0, status: done(hasPlayed),
    benefit: 'Policies shape who comes and how the night goes.',
  };
  const eventChosen = club.lastConfig.eventId !== 'regular' || (!!lastResult && lastResult.eventId !== 'regular');
  const chooseEvent: BoardGoal = {
    id: 'choose-event', category: 'tutorial',
    title: 'Try an event when you are ready',
    instruction: 'Once a quiet night feels easy, pick an event in Day Prep — each one reshapes the crowd and the pressure.',
    progress: eventChosen ? 1 : 0, status: done(eventChosen),
    benefit: 'Events change the kind of night you run.',
  };
  const buyFirstUpgrade: BoardGoal = {
    id: 'buy-first-upgrade', category: 'tutorial',
    title: 'Buy an upgrade once you know why',
    instruction: 'Felt the bar fall behind or the door get rough? Now buy an upgrade in the Shop that shores up that weak spot.',
    progress: owned.length >= 1 ? 1 : 0, status: done(owned.length >= 1),
    benefit: 'Fix a weakness you actually felt.',
  };
  const haveBartender: BoardGoal = {
    id: 'have-bartender', category: 'tutorial',
    title: 'Keep a bartender behind the bar',
    instruction: 'Bartenders set your bar service and revenue — more (or better) pours mean fuller tabs and shorter waits.',
    progress: bartenders >= 1 ? 1 : 0, status: done(bartenders >= 1),
    benefit: 'No bar, no money.',
  };
  const haveBouncer: BoardGoal = {
    id: 'have-bouncer', category: 'tutorial',
    title: 'Keep a bouncer on the door',
    instruction: 'Bouncers protect the door — more (or better) security means fewer incidents and a calmer room.',
    progress: bouncers >= 1 ? 1 : 0, status: done(bouncers >= 1),
    benefit: 'Fewer incidents at the door.',
  };

  // --- Staff -----------------------------------------------------------------
  const fullCrew = total > 0 && onDuty === total;
  const scheduleFullCrew: BoardGoal = {
    id: 'schedule-full-crew', category: 'staff',
    title: 'Schedule a full crew',
    instruction: 'Put every crew member on duty in Day Prep.',
    progress: total > 0 ? clamp01(onDuty / total) : 0, status: done(fullCrew),
    benefit: 'Fewer gaps at the bar and door.',
  };
  const hireAnotherBartender: BoardGoal = {
    id: 'hire-bartender', category: 'staff',
    title: 'Hire another bartender',
    instruction: 'Add a third bartender from Crew.',
    progress: clamp01(bartenders / 3), status: done(bartenders >= 3),
    benefit: 'Faster service, more bar revenue.',
  };
  const hireAnotherBouncer: BoardGoal = {
    id: 'hire-bouncer', category: 'staff',
    title: 'Hire another bouncer',
    instruction: 'Add a second bouncer from Crew.',
    progress: clamp01(bouncers / 2), status: done(bouncers >= 2),
    benefit: 'Calmer door, fewer incidents.',
  };
  const noNoShows: BoardGoal = {
    id: 'no-no-shows', category: 'staff',
    title: 'Run a night with a full turnout',
    instruction: 'Get through a night with no crew no-shows.',
    progress: lastResult && lastResult.noShows === 0 ? 1 : 0,
    status: done(!!lastResult && lastResult.noShows === 0),
    benefit: 'Reliable crew, smoother night.',
  };

  // --- Business --------------------------------------------------------------
  const cashTarget = CASH_MILESTONES.find((m) => club.cash < m) ?? CASH_MILESTONES[CASH_MILESTONES.length - 1];
  const reachCash: BoardGoal = {
    id: 'reach-cash', category: 'business',
    title: `Reach ${money(cashTarget)}`,
    instruction: 'Bank steady profits over several nights.',
    progress: clamp01(club.cash / cashTarget), status: done(club.cash >= cashTarget),
    benefit: 'A buffer for bigger events and upgrades.',
  };
  const profitableNight: BoardGoal = {
    id: 'profitable-night', category: 'business',
    title: 'Earn a profitable night',
    instruction: 'End a night with money left over (positive net).',
    progress: lastResult && lastResult.net > 0 ? 1 : 0,
    status: done(!!lastResult && lastResult.net > 0),
    benefit: 'Profit funds your growth.',
  };
  const bigNight: BoardGoal = {
    id: 'big-night', category: 'business',
    title: `Earn ${money(BIG_NIGHT_TARGET)} in one night`,
    instruction: 'Pull a big single-night profit.',
    progress: lastResult ? clamp01(lastResult.net / BIG_NIGHT_TARGET) : 0,
    status: done(!!lastResult && lastResult.net >= BIG_NIGHT_TARGET),
    benefit: 'Big nights fund big upgrades.',
  };

  // --- Reputation ------------------------------------------------------------
  const tier = nextTier(club.reputation);
  const repTier: BoardGoal = tier
    ? {
        id: 'rep-tier', category: 'reputation',
        title: `${tier.label}: ${club.reputation} / ${tier.min}`,
        instruction: 'Run strong nights to climb the next tier.',
        progress: clamp01(club.reputation / tier.min), status: 'active',
        benefit: tier.unlock,
      }
    : {
        id: 'rep-tier', category: 'reputation',
        title: 'Best in the City',
        instruction: 'Keep your name at the top.',
        progress: 1, status: 'completed',
        benefit: 'The best club in the city.',
      };
  const cleanNight: BoardGoal = {
    id: 'clean-night', category: 'reputation',
    title: 'Run a clean night',
    instruction: 'Get through a night with zero incidents.',
    progress: lastResult && lastResult.guests > 0 && lastResult.incidents === 0 ? 1 : 0,
    status: done(!!lastResult && lastResult.guests > 0 && lastResult.incidents === 0),
    benefit: 'A safe room keeps regulars coming back.',
  };
  const buildRegularBase: BoardGoal = {
    id: 'build-regular-base', category: 'reputation',
    title: 'Build a regular base',
    instruction: 'Grow your name to Rising Name — that is when a crowd starts treating the club as theirs.',
    progress: clamp01(club.reputation / 40), status: done(club.reputation >= 40),
    benefit: 'Regulars steady your nights.',
  };
  const localsBase = getRegularBase(club.regularBase).locals;
  const winOverLocals: BoardGoal = {
    id: 'win-over-locals', category: 'reputation',
    title: 'Win over the locals',
    instruction: 'Run fair, clean, well-served nights so the neighbourhood starts treating the room as theirs.',
    progress: clamp01(localsBase / 30), status: done(localsBase >= 30),
    benefit: 'Locals are your steady base.',
  };

  // --- Venue -----------------------------------------------------------------
  const venue = getVenue(club.venue);
  const buyFirstFurniture: BoardGoal = {
    id: 'buy-first-furniture', category: 'venue',
    title: 'Make the place yours',
    instruction: 'Buy and equip your first furniture in the Venue tab — make the room feel like a real club.',
    progress: venue.owned.length >= 1 ? 1 : 0, status: done(venue.owned.length >= 1),
    benefit: 'Style and comfort lift the room.',
  };
  const buyProLighting: BoardGoal = {
    id: 'buy-pro-lighting', category: 'venue',
    title: 'Buy Pro Lighting',
    instruction: 'Grab the Pro Lighting Rig in Upgrades.',
    progress: owns('pro-lighting') ? 1 : 0, status: done(owns('pro-lighting')),
    benefit: '+vibe every night.',
  };
  const buyExtraBar: BoardGoal = {
    id: 'buy-extra-bar', category: 'venue',
    title: 'Buy an Extra Bar Station',
    instruction: 'Add the Extra Bar Station in Upgrades.',
    progress: owns('extra-bar') ? 1 : 0, status: done(owns('extra-bar')),
    benefit: '+1 effective bartender.',
  };
  const buyBiggerFloor: BoardGoal = {
    id: 'buy-bigger-floor', category: 'venue',
    title: 'Buy Bigger Floor',
    instruction: 'Knock down a wall — more capacity for bigger crowds.',
    progress: owns('bigger-floor') ? 1 : clamp01((capacity - START_CAPACITY) / 30),
    status: done(owns('bigger-floor') || capacity > START_CAPACITY),
    benefit: '+30 guest capacity.',
  };
  // Catch-all for the upgrades without their own named goal (sound/security/VIP).
  const cheapestOther = UPGRADES
    .filter((u) => !owns(u.id) && !NAMED_UPGRADE_IDS.has(u.id))
    .sort((a, b) => a.cost - b.cost)[0];
  const nextUpgrade: BoardGoal = cheapestOther
    ? {
        id: 'next-upgrade', category: 'venue',
        title: `Buy ${cheapestOther.name}`,
        instruction: `Upgrade cost ${money(cheapestOther.cost)}. ${cheapestOther.description}`,
        progress: clamp01(club.cash / cheapestOther.cost), status: 'active',
        benefit: 'Your next permanent boost.',
      }
    : {
        id: 'next-upgrade', category: 'venue',
        title: 'Fully upgraded',
        instruction: 'You own every upgrade in the catalog.',
        progress: 1, status: 'completed',
        benefit: 'Venue maxed out.',
      };

  // --- Recovery interrupts (only when their condition holds) ------------------
  const interrupts: BoardGoal[] = [];
  if (club.cash < 0) {
    interrupts.push({
      id: 'recover-cash', category: 'business',
      title: 'Climb back into the black',
      instruction: 'Run a lean Quiet Night to recover positive cash.',
      progress: 0, status: 'active',
      benefit: 'Stay open and stable.',
    });
  }
  if (lastResult && lastResult.reputationDelta < 0) {
    interrupts.push({
      id: 'recover-rep', category: 'reputation',
      title: 'Win the room back',
      instruction: 'Turn it around — end a night with reputation up.',
      progress: 0, status: 'active',
      benefit: 'Reverse a bad streak.',
    });
  }

  return {
    interrupts,
    // Ordered to TEACH the loop: meet the crew → schedule → open a quiet night →
    // read the debrief → try an event → grow → buy an upgrade last (once the
    // player understands why), never "buy a random upgrade" first.
    early: [
      learnCrew, scheduleFullCrew, prepareTheBar, setTheRules, openFirstNight, readTheNight,
      chooseEvent, haveBartender, haveBouncer, reachCash, repTier, buyFirstUpgrade,
    ],
    // Interleaved by category so the top few span business / reputation / venue /
    // staff (the player should see several different things to chase, not five of
    // one kind).
    late: [
      reachCash,            // business
      repTier,              // reputation
      buyFirstFurniture,    // venue
      buyProLighting,       // venue
      hireAnotherBartender, // staff
      bigNight,             // business
      cleanNight,           // reputation
      buildRegularBase,     // reputation (crowd identity)
      winOverLocals,        // reputation (regulars)
      buyBiggerFloor,       // venue
      hireAnotherBouncer,   // staff
      profitableNight,      // business
      buyExtraBar,          // venue
      noNoShows,            // staff
      nextUpgrade,          // venue (catch-all)
      scheduleFullCrew,     // staff
    ],
  };
}

/**
 * The Goal Board: 3–5 goals chosen for the club's current phase. Recovery
 * interrupts surface first; a fresh club (early nights) gets onboarding goals;
 * an established club gets business / reputation / venue / staff goals. Active
 * goals are preferred; if fewer than three are active, completed goals are shown
 * so the board never looks empty. Pure — safe to unit-test.
 */
export function goalBoard(club: ClubState, lastResult: NightResult | null): BoardGoal[] {
  const { interrupts, early, late } = buildBoardGoals(club, lastResult);
  const isEarly = club.day <= 3;
  const ordered = [...interrupts, ...(isEarly ? early : late)];

  // De-duplicate by id, keeping first (highest-priority) occurrence.
  const seen = new Set<string>();
  const unique = ordered.filter((g) => (seen.has(g.id) ? false : (seen.add(g.id), true)));

  const board = unique.filter((g) => g.status === 'active').slice(0, 5);
  if (board.length < 3) {
    for (const g of unique) {
      if (board.length >= 3) break;
      if (!board.includes(g)) board.push(g);
    }
  }
  return board.slice(0, 5);
}
