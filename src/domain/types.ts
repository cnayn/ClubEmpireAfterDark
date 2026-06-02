/**
 * Core domain types for Club Empire: After Dark.
 * Pure data shapes — no behavior, no React. See docs/game-design.md & economy.md.
 */

export type Level = 'low' | 'med' | 'high';

export type MusicStyle = 'house' | 'hiphop' | 'pop' | 'techno';

export type SecurityLevel = 1 | 2 | 3;

export type SmokingPolicy = 'strict' | 'relaxed';

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
  bartenders: number;
  securityLevel: SecurityLevel;
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
  wages: number;
  securityCost: number;
  fines: number;
  incidents: number;
  reputationBefore: number;
  reputationAfter: number;
  reputationDelta: number;
  vipSatisfaction: number;
  regularLoyalty: number;
  serviceRatio: number; // 0-1, <1 means understaffed
  notes: ResultNote[];
}
