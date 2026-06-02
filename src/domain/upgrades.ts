/**
 * Upgrade catalog and aggregation helpers. See docs/economy.md (Upgrades table).
 * Upgrades are permanent, bought with cash, and contribute additive effects.
 */

import type { UpgradeDef, UpgradeEffect } from './types';

export const UPGRADES: UpgradeDef[] = [
  {
    id: 'bigger-floor',
    name: 'Bigger Floor',
    description: 'Knock down a wall. +30 guest capacity.',
    cost: 1500,
    effect: { capacity: 30 },
  },
  {
    id: 'better-sound',
    name: 'Better Sound System',
    description: 'Crisper sound lifts the vibe and music fit.',
    cost: 1200,
    effect: { musicFitBonus: 0.06 },
  },
  {
    id: 'extra-bar',
    name: 'Extra Bar Station',
    description: 'More taps, faster service. +1 effective bartender.',
    cost: 1000,
    effect: { serviceBartenders: 1 },
  },
  {
    id: 'pro-lighting',
    name: 'Pro Lighting Rig',
    description: 'Atmosphere that keeps the room buzzing. +vibe.',
    cost: 800,
    effect: { vibeBonus: 5 },
  },
  {
    id: 'security-office',
    name: 'Security Office',
    description: 'Cameras and a command desk make security more effective.',
    cost: 1400,
    effect: { securityDiscount: true },
  },
  {
    id: 'vip-lounge',
    name: 'VIP Lounge',
    description: 'Bottle service and a velvet rope. Boosts VIP earnings.',
    cost: 2000,
    effect: { vipBonus: true },
  },
];

export function getUpgrade(id: string): UpgradeDef | undefined {
  return UPGRADES.find((u) => u.id === id);
}

/** Sum the effects of all owned upgrades into a single aggregate. */
export function aggregateEffects(ownedIds: string[]): Required<UpgradeEffect> {
  const acc: Required<UpgradeEffect> = {
    capacity: 0,
    musicFitBonus: 0,
    serviceBartenders: 0,
    vibeBonus: 0,
    vipBonus: false,
    securityDiscount: false,
  };
  for (const id of ownedIds) {
    const e = getUpgrade(id)?.effect;
    if (!e) continue;
    acc.capacity += e.capacity ?? 0;
    acc.musicFitBonus += e.musicFitBonus ?? 0;
    acc.serviceBartenders += e.serviceBartenders ?? 0;
    acc.vibeBonus += e.vibeBonus ?? 0;
    acc.vipBonus = acc.vipBonus || !!e.vipBonus;
    acc.securityDiscount = acc.securityDiscount || !!e.securityDiscount;
  }
  return acc;
}
