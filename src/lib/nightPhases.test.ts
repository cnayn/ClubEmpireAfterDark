/**
 * Living Night v1 — pure phase derivation. Deterministic, read-only, five phases.
 */

import { defaultDayConfig, STARTING_ROSTER } from '@/domain/staff';
import type { ClubState, NightResult } from '@/domain/types';
import { buildNightPhases, encounterPhaseKey } from './nightPhases';

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

describe('buildNightPhases', () => {
  it('always returns the five canonical phases in order, each with a focus zone', () => {
    const phases = buildNightPhases(result(), club());
    expect(phases.map((p) => p.key)).toEqual(['doors', 'bar-rush', 'floor-heat', 'turn', 'last-call']);
    for (const p of phases) {
      expect(p.situation.length).toBeGreaterThan(0);
      expect(['door', 'bar', 'floor']).toContain(p.zone);
    }
  });

  it('every phase but the last offers a CTA into the next; the last ends the night', () => {
    const phases = buildNightPhases(result(), club());
    for (let i = 0; i < phases.length - 1; i++) expect(phases[i].advanceLabel).toBeTruthy();
    expect(phases[phases.length - 1].advanceLabel).toBeNull();
  });

  it('the bar-rush phase reflects service pressure', () => {
    const drowning = buildNightPhases(result({ serviceRatio: 0.5 }), club()).find((p) => p.key === 'bar-rush')!;
    expect(drowning.tone).toBe('bad');
    const flowing = buildNightPhases(result({ serviceRatio: 1 }), club()).find((p) => p.key === 'bar-rush')!;
    expect(flowing.tone).toBe('good');
  });

  it('the turn becomes Trouble on an incident and Opportunity on a clean peak', () => {
    const trouble = buildNightPhases(result({ incidents: 2 }), club()).find((p) => p.key === 'turn')!;
    expect(trouble.title).toBe('Trouble');
    expect(trouble.zone).toBe('door');
    const opp = buildNightPhases(result({ incidents: 0, serviceRatio: 1, guests: 50, capacity: 60 }), club()).find((p) => p.key === 'turn')!;
    expect(opp.title).toBe('Opportunity');
  });

  it('maps an encounter zone to its night phase', () => {
    expect(encounterPhaseKey('bar')).toBe('bar-rush');
    expect(encounterPhaseKey('door')).toBe('turn');
    expect(encounterPhaseKey('floor')).toBe('floor-heat');
  });

  it('is deterministic for the same (result, club)', () => {
    expect(buildNightPhases(result(), club())).toEqual(buildNightPhases(result(), club()));
  });
});
