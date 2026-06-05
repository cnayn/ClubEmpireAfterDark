/**
 * Core domain types for Club Empire: After Dark.
 * Pure data shapes — no behavior, no React. See docs/game-design.md & economy.md.
 */

export type Level = 'low' | 'med' | 'high';

export type MusicStyle = 'house' | 'hiphop' | 'pop' | 'techno';

export type SecurityLevel = 1 | 2 | 3;

export type SmokingPolicy = 'strict' | 'relaxed';

// --- Club Policies v1 (rules the owner sets before the night) ----------------
export type SmokingRule = 'allowed' | 'restricted' | 'banned';
export type IdPolicy = 'relaxed' | 'standard' | 'strict';
export type SecurityPosture = 'friendly' | 'balanced' | 'hardline';
export type BarServiceStyle = 'fast' | 'standard' | 'premium';

/** Four simple pre-night rules. Middle option of each is neutral (no effect),
 *  so a default config reproduces the pre-policies night exactly. */
export interface PoliciesConfig {
  smoking: SmokingRule;
  idCheck: IdPolicy;
  security: SecurityPosture;
  barService: BarServiceStyle;
}

// --- Drink Prep v1 (bar stock + quality the owner prepares before the night) -
export type StockLevel = 'lean' | 'standard' | 'heavy';
export type DrinkQuality = 'cheap' | 'house' | 'premium';

/** Bar prep for the night. Standard + House is neutral (no upfront cost, no
 *  effect), so a default night is unchanged. */
export interface DrinkPrep {
  stock: StockLevel;
  quality: DrinkQuality;
}

// --- Phase 2A: named staff ---------------------------------------------------

export type StaffRole = 'bartender' | 'bouncer';

/**
 * Small trait enum (Phase 2A). Each trait is flavor + at most ONE mechanical
 * nudge. `visibleTrait` is shown at hire; `hiddenTrait` is concealed and only
 * revealed through a result note when it first bites (see docs/phase2-scope.md).
 */
export type StaffTrait =
  | 'none'
  | 'fast-pour' // bartender: +service
  | 'sticky-fingers' // bartender: +theft risk
  | 'intimidating' // bouncer: +security effectiveness
  | 'by-the-book' // bouncer: +compliance protection
  | 'steady' // any: +reliability
  | 'flaky'; // any: -reliability

export interface StaffMember {
  id: string;
  name: string;
  role: StaffRole;
  salary: number; // $ per night when on duty (paid even on a no-show)
  skill: number; // 0-100, magnitude of the role's positive effect
  honesty: number; // 0-100, low → theft (bartender) / cut corners (bouncer)
  reliability: number; // 0-100, low → seeded chance of a no-show
  visibleTrait: StaffTrait;
  hiddenTrait: StaffTrait;
  description: string;
}

/** Tonight's event (Phase 2B). `regular` (Quiet Night) is the identity-neutral
 *  baseline carried over from Phase 2A. */
export type EventId =
  | 'regular'
  | 'private-party'
  | 'student-night'
  | 'grand-opening'
  | 'industry-night';

/**
 * An event is a modifier vector that re-weights the night — never a self-contained
 * payoff. Quiet Night = all-neutral (draw/spend ×1, risk/repMod +0, amplify ×1,
 * cost/fee 0). See docs/phase2-scope.md (Phase 2B). Unlock/requirement/readiness
 * are derived in src/domain/events.ts, not stored here.
 */
export interface EventDef {
  id: EventId;
  name: string;
  description: string; // one-line fantasy
  cost: number; // upfront $ to throw the event
  bookingFee: number; // guaranteed $ revenue (Private Party)
  drawMod: number; // × attendance
  spendMod: number; // × bar spend per guest
  riskMod: number; // + incident chance
  repMod: number; // flat + to reputation delta
  repAmplify: number; // × the whole reputation swing (spotlight events)
}

/** Permanent effects an upgrade contributes once owned. All optional/additive. */
export interface UpgradeEffect {
  capacity?: number; // flat +guests to capacity
  musicFitBonus?: number; // added to music fit (vibe)
  serviceBartenders?: number; // +effective bartender slots for service
  vibeBonus?: number; // flat vibe points
  vipBonus?: boolean; // unlocks/strengthens VIP economics
  securityDiscount?: boolean; // security one tier cheaper / stronger
}

export interface UpgradeDef {
  id: string;
  name: string;
  description: string;
  cost: number;
  effect: UpgradeEffect;
}

/** The decisions the player makes during Day Preparation. */
export interface DayConfig {
  music: MusicStyle;
  coverLevel: Level;
  drinkLevel: Level;
  /** ids of roster members working tonight (replaces bartenders/securityLevel). */
  staffOnDuty: string[];
  /** Frozen to 'regular' in Phase 2A (identity-neutral). */
  eventId: EventId;
  vipFocus: boolean;
  smoking: SmokingPolicy;
  /** Club Policies v1. Optional for save back-compat: old saves without it load
   *  fine and are treated as all-neutral. */
  policies?: PoliciesConfig;
  /** Drink Prep v1. Optional for save back-compat: absent = neutral (Standard +
   *  House, no upfront cost). */
  drinkPrep?: DrinkPrep;
}

// --- Venue / Furniture v1 ----------------------------------------------------
export type VenueZone = 'entrance' | 'bar' | 'dancefloor' | 'toilets' | 'vip';

/** Aggregate venue character from equipped furniture. All optional/additive. */
export interface FurnitureStats {
  style?: number;
  comfort?: number;
  sound?: number;
  hygiene?: number;
  doorAppeal?: number;
}

export interface FurnitureDef {
  id: string;
  name: string;
  /** Zones this item can be equipped into (v1 allows multi-zone items). */
  zones: VenueZone[];
  cost: number;
  stats: FurnitureStats;
  description: string;
}

/** Persisted venue customization: items owned + equipped per zone slot. */
export interface VenueState {
  owned: string[];
  equipped: Partial<Record<VenueZone, string[]>>;
}

// --- Regulars Persistence v1 -------------------------------------------------
/** Aggregate crowd-loyalty scores (0–100) per segment — NOT individual guests.
 *  Keys match CrowdSegmentId (src/domain/crowd.ts). */
export interface RegularBase {
  locals: number;
  students: number;
  musicheads: number;
  vipcurious: number;
  rough: number;
  regulars: number;
}

/** Persisted club + meta state (everything that survives between nights). */
export interface ClubState {
  name: string;
  day: number;
  cash: number;
  reputation: number; // 0-100
  baseCapacity: number;
  ownedUpgradeIds: string[];
  /** The club's hired staff (Phase 2A). */
  staff: StaffMember[];
  /** Player's last-used day config, restored as defaults on the prep screen. */
  lastConfig: DayConfig;
  /** Venue / Furniture v1. Optional for save back-compat: old saves without it
   *  load fine and are treated as an empty (neutral) venue. */
  venue?: VenueState;
  /** Regulars Persistence v1. Optional for save back-compat: absent = empty
   *  (neutral) regular base. Aggregate loyalty only — no individual guests. */
  regularBase?: RegularBase;
}

/** A single line in the night results breakdown. */
export interface ResultNote {
  tone: 'good' | 'bad' | 'warn' | 'info';
  text: string;
}

/** Output of resolving one night. Pure data the UI renders. */
export interface NightResult {
  day: number;
  guests: number;
  capacity: number;
  revenue: number;
  costs: number;
  net: number;
  coverRevenue: number;
  barRevenue: number;
  vipBonus: number;
  wages: number; // total on-duty staff salaries
  theft: number; // $ skimmed by dishonest bartenders
  fines: number;
  incidents: number;
  noShows: number; // staff who didn't turn up
  eventId: EventId;
  eventCost: number; // upfront cost paid for tonight's event
  bookingFee: number; // guaranteed revenue from tonight's event
  reputationBefore: number;
  reputationAfter: number;
  reputationDelta: number;
  vipSatisfaction: number;
  regularLoyalty: number;
  serviceRatio: number; // 0-1, <1 means understaffed
  notes: ResultNote[];
}
