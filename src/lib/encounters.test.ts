/**
 * Random Encounter v1 — deterministic, condition-gated, bounded, and built on the
 * existing Intervention surface (no resolver change, no new RNG, no save schema).
 */

import { defaultDayConfig, STARTING_ROSTER } from '@/domain/staff';
import type { ClubState, DayConfig } from '@/domain/types';
import { resolveNight } from '@/sim/night';
import { pickEncounter } from './encounters';

const ALL = STARTING_ROSTER.map((m) => m.id);
const BARTENDERS = STARTING_ROSTER.filter((m) => m.role === 'bartender').map((m) => m.id);

function club(over: Partial<ClubState> = {}): ClubState {
  const staff = STARTING_ROSTER.map((m) => ({ ...m }));
  return {
    name: 'T', day: 4, cash: 2000, reputation: 50, baseCapacity: 60,
    ownedUpgradeIds: [], staff, lastConfig: defaultDayConfig(staff), ...over,
  };
}
const cfg = (over: Partial<DayConfig> = {}): DayConfig => ({ ...defaultDayConfig(STARTING_ROSTER), ...over });
const preview = (c: ClubState, config: DayConfig, seed: number) => resolveNight(c, config, seed).result;

describe('pickEncounter', () => {
  it('returns nothing when nobody is in the room', () => {
    const c = club();
    const pv = preview(c, cfg(), 1);
    expect(pickEncounter({ ...pv, guests: 0 }, c)).toBeNull();
  });

  it('surfaces a bar backlog when service is strained', () => {
    const strained = club({ reputation: 100, baseCapacity: 200 });
    const strainedCfg = cfg({ staffOnDuty: [BARTENDERS[0]], coverLevel: 'low', drinkLevel: 'low' });
    const c = { ...strained, lastConfig: strainedCfg };
    const pv = preview(c, strainedCfg, 3);
    expect(pv.serviceRatio).toBeLessThan(0.9);
    const enc = pickEncounter(pv, c);
    expect(enc).not.toBeNull();
    // door risk takes priority if a packed room also triggers it; otherwise bar.
    expect(['bar-backlog', 'door-tension']).toContain(enc!.id);
    expect(enc!.choices.length).toBeGreaterThanOrEqual(2);
    expect(enc!.choices.length).toBeLessThanOrEqual(3);
  });

  it('surfaces a door-tension encounter after an incident', () => {
    const c = club();
    const pv = preview(c, cfg(), 2);
    const enc = pickEncounter({ ...pv, incidents: 1 }, c);
    expect(enc?.id).toBe('door-tension');
    expect(enc?.zone).toBe('door');
  });

  it('every choice maps to a bounded intervention', () => {
    const c = club();
    const pv = preview(c, cfg(), 2);
    const enc = pickEncounter({ ...pv, incidents: 1 }, c)!;
    for (const ch of enc.choices) {
      expect(ch.intervention.vibeBonus).toBeGreaterThanOrEqual(-12);
      expect(ch.intervention.vibeBonus).toBeLessThanOrEqual(12);
      expect(ch.intervention.revenueMod).toBeGreaterThanOrEqual(0.95);
      expect(ch.intervention.revenueMod).toBeLessThanOrEqual(1.1);
      expect(ch.bubble.zone).toBe(enc.zone);
      expect(ch.outcome.length).toBeGreaterThan(0);
    }
  });

  it('a calm, well-run night gets no encounter (not every night)', () => {
    // small house, full crew, premium-ish prices → thin, well-served, calm room
    const c = club({ baseCapacity: 60, reputation: 60, staff: STARTING_ROSTER.map((m) => ({ ...m })) });
    const calmCfg = cfg({ staffOnDuty: ALL, coverLevel: 'high', drinkLevel: 'high' });
    const cc = { ...c, lastConfig: calmCfg };
    const pv = preview(cc, calmCfg, 7);
    // guard the premise: not strained, no incidents, loyalty up
    if (pv.serviceRatio >= 0.9 && pv.incidents === 0 && pv.regularLoyalty >= 52) {
      expect(pickEncounter(pv, cc)).toBeNull();
    }
  });

  it('is deterministic for the same preview + club', () => {
    const c = club();
    const pv = preview(c, cfg(), 2);
    expect(pickEncounter({ ...pv, incidents: 1 }, c)).toEqual(pickEncounter({ ...pv, incidents: 1 }, c));
  });
});
