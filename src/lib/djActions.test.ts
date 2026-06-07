/**
 * DJ Booth multi-action pilot — pure, bounded, presentation-first. The four
 * actions must be meaningful CHOICES, not four free boosts.
 */

import { defaultDayConfig, STARTING_ROSTER } from '@/domain/staff';
import type { ClubState, NightResult } from '@/domain/types';
import { djFocusCost, djIntervention, djLiveEffect, DJ_ACTIONS, resolveDjAction } from './djActions';

function club(over: Partial<ClubState> = {}): ClubState {
  const staff = STARTING_ROSTER.map((m) => ({ ...m }));
  return {
    name: 'T', day: 4, cash: 1500, reputation: 50, baseCapacity: 60,
    ownedUpgradeIds: [], staff, lastConfig: defaultDayConfig(staff), ...over,
  };
}
function result(over: Partial<NightResult> = {}): NightResult {
  return {
    day: 4, guests: 40, capacity: 60, revenue: 800, costs: 500, net: 300,
    coverRevenue: 200, barRevenue: 560, vipBonus: 0, wages: 340, theft: 0, fines: 0,
    incidents: 0, noShows: 0, eventId: 'regular', eventCost: 0, bookingFee: 0,
    reputationBefore: 50, reputationAfter: 52, reputationDelta: 2,
    vipSatisfaction: 60, regularLoyalty: 60, serviceRatio: 1, notes: [], ...over,
  };
}

describe('DJ_ACTIONS menu', () => {
  it('offers exactly the four pilot actions', () => {
    expect(DJ_ACTIONS.map((a) => a.id)).toEqual(['drop-bass', 'refresh-set', 'dedicate-song', 'read-room']);
  });
  it('reading the room is free; the rest cost one attention', () => {
    expect(djFocusCost('read-room')).toBe(0);
    expect(djFocusCost('drop-bass')).toBe(1);
    expect(djFocusCost('refresh-set')).toBe(1);
    expect(djFocusCost('dedicate-song')).toBe(1);
  });
});

describe('the four actions are different, not four free boosts', () => {
  it('Drop Bass is the strongest energy push but strains the crew (negative morale)', () => {
    const o = resolveDjAction('drop-bass', result(), club(), 0.4);
    expect(o.energy).toBeGreaterThan(0.2);
    expect(o.morale).toBeLessThan(0);
    expect(o.intervention.revenueMod).toBe(1); // never prints money
  });

  it('Drop Bass diminishes on repeat (not spammable)', () => {
    const first = resolveDjAction('drop-bass', result(), club(), 0.4, 0);
    const fourth = resolveDjAction('drop-bass', result(), club(), 0.4, 3);
    expect(fourth.intervention.vibeBonus).toBeLessThan(first.intervention.vibeBonus);
    expect(fourth.energy).toBeLessThan(first.energy);
  });

  it('Refresh Set helps a flat floor but openly does little when the floor is alive', () => {
    const flat = resolveDjAction('refresh-set', result(), club(), 0.2);
    const alive = resolveDjAction('refresh-set', result(), club(), 0.8);
    expect(flat.intervention.vibeBonus).toBeGreaterThan(alive.intervention.vibeBonus);
    expect(alive.note.toLowerCase()).toContain('already');
  });

  it('Dedicate Song lifts happiness more with regulars in, and is weak in an empty room', () => {
    const regularsClub = club({ regularBase: { locals: 40, students: 0, regulars: 30, musicheads: 0, vipcurious: 0, rough: 0 } });
    const withReg = resolveDjAction('dedicate-song', result({ guests: 40, capacity: 60 }), regularsClub, 0.5);
    const empty = resolveDjAction('dedicate-song', result({ guests: 2, capacity: 60 }), club(), 0.5);
    expect(withReg.happy).toBeGreaterThan(empty.happy);
    expect(empty.note.toLowerCase()).toContain('barely');
  });

  it('Read the Room gives no boost but returns a read + a suggestion', () => {
    const o = resolveDjAction('read-room', result(), club(), 0.2);
    expect(o.intervention.vibeBonus).toBe(0);
    expect(o.energy).toBe(0);
    expect(o.read).toBeTruthy();
    expect(o.suggested).toBe('drop-bass'); // cold floor → suggests the jolt
  });
});

describe('djIntervention / djLiveEffect — bounded, deterministic', () => {
  it('combines taken actions and stays clamped', () => {
    const ids = ['drop-bass', 'drop-bass', 'dedicate-song'] as const;
    const iv = djIntervention([...ids], result(), club(), 0.4);
    expect(iv.vibeBonus).toBeLessThanOrEqual(30);
    expect(iv.revenueMod).toBe(1);
  });
  it('is deterministic for the same inputs', () => {
    expect(djLiveEffect(['drop-bass'], result(), club(), 0.4)).toEqual(djLiveEffect(['drop-bass'], result(), club(), 0.4));
  });
  it('no actions = no live effect', () => {
    expect(djLiveEffect([], result(), club(), 0.4)).toEqual({ energy: 0, morale: 0, happy: 0 });
  });
});
