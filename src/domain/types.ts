/**
 * Core domain types for Club Empire: After Dark.
 * Pure data shapes — no behavior, no React. See docs/game-design.md & economy.md.
 */

export type Level = 'low' | 'med' | 'high';

export type MusicStyle = 'house' | 'hiphop' | 'pop' | 'techno';

export type SecurityLevel = 1 | 2 | 3;

export type SmokingPolicy = 'strict' | 'relaxed';

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

/** Tonight's event. Frozen to the identity-neutral baseline in Phase 2A;
 *  widened to a union in Phase 2B. */
export type EventId = 'regular';

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
  reputationBefore: number;
  reputationAfter: number;
  reputationDelta: number;
  vipSatisfaction: number;
  regularLoyalty: number;
  serviceRatio: number; // 0-1, <1 means understaffed
  notes: ResultNote[];
}
