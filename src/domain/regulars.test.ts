/**
 * Regulars Persistence v1 — aggregate loyalty drift + bounded effects. Pure,
 * deterministic, save-safe (optional ClubState.regularBase; absent = empty).
 */

import { crowdMix } from '@/domain/crowd';
import { defaultDayConfig, STARTING_ROSTER } from '@/domain/staff';
import type { ClubState, DayConfig, NightResult, RegularBase, VenueState } from '@/domain/types';
import { resolveNight } from '@/sim/night';
import {
  DEFAULT_REGULAR_BASE,
  getRegularBase,
  type NightSignals,
  regularBaseEffects,
  topRegulars,
  updateRegularBase,
} from './regulars';

function club(over: Partial<ClubState> = {}): ClubState {
  const staff = STARTING_ROSTER.map((m) => ({ ...m }));
  return {
    name: 'T', day: 4, cash: 2000, reputation: 50, baseCapacity: 120,
    ownedUpgradeIds: [], staff, lastConfig: defaultDayConfig(staff), ...over,
  };
}
const cfg = (over: Partial<DayConfig> = {}): DayConfig => ({ ...defaultDayConfig(STARTING_ROSTER), ...over });
const goodSignals: NightSignals = { reputationDelta: 3, serviceRatio: 1, incidents: 0, fines: 0, noShows: 0 };

describe('updateRegularBase — bounded drift', () => {
  it('present + good-night segments grow; scores stay within 0–100', () => {
    const mix = crowdMix(club(), cfg({ coverLevel: 'low' })); // locals/students heavy
    const next = updateRegularBase(DEFAULT_REGULAR_BASE, mix, goodSignals);
    for (const v of Object.values(next)) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(100);
    }
    expect(next.locals).toBeGreaterThan(0); // locals were present on a good night
  });

  it('never exceeds 100 even after many strong nights', () => {
    let base: RegularBase = DEFAULT_REGULAR_BASE;
    const mix = crowdMix(club(), cfg());
    for (let i = 0; i < 100; i++) base = updateRegularBase(base, mix, goodSignals);
    for (const v of Object.values(base)) expect(v).toBeLessThanOrEqual(100);
  });

  it('incidents slow/reduce locals & regulars growth vs a clean night', () => {
    const mix = crowdMix(club(), cfg());
    const clean = updateRegularBase(DEFAULT_REGULAR_BASE, mix, goodSignals);
    const messy = updateRegularBase(DEFAULT_REGULAR_BASE, mix, { ...goodSignals, incidents: 2, reputationDelta: -2 });
    expect(messy.locals).toBeLessThan(clean.locals);
    expect(messy.regulars).toBeLessThan(clean.regulars);
  });

  it('repeated stylish/loud nights grow Music Heads', () => {
    const styled: VenueState = { owned: ['backbar-glow', 'wall-speakers'], equipped: { bar: ['backbar-glow', 'wall-speakers'] } };
    let base: RegularBase = DEFAULT_REGULAR_BASE;
    const mix = crowdMix(club({ venue: styled }), cfg());
    for (let i = 0; i < 5; i++) base = updateRegularBase(base, mix, goodSignals);
    expect(base.musicheads).toBeGreaterThan(0);
  });

  it('cheap relaxed nights grow students/rough more than a premium tight night grows them', () => {
    const cheapMix = crowdMix(club(), cfg({ coverLevel: 'low', drinkLevel: 'low', policies: { smoking: 'allowed', idCheck: 'relaxed', security: 'friendly', barService: 'standard' } }));
    const tightMix = crowdMix(club(), cfg({ coverLevel: 'high', drinkLevel: 'high', policies: { smoking: 'banned', idCheck: 'strict', security: 'hardline', barService: 'standard' } }));
    const cheap = updateRegularBase(DEFAULT_REGULAR_BASE, cheapMix, goodSignals);
    const tight = updateRegularBase(DEFAULT_REGULAR_BASE, tightMix, goodSignals);
    expect(cheap.students + cheap.rough).toBeGreaterThan(tight.students + tight.rough);
  });

  it('is deterministic for the same inputs', () => {
    const mix = crowdMix(club(), cfg());
    expect(updateRegularBase(DEFAULT_REGULAR_BASE, mix, goodSignals)).toEqual(updateRegularBase(DEFAULT_REGULAR_BASE, mix, goodSignals));
  });
});

describe('regularBaseEffects — bounded, empty = neutral', () => {
  it('empty base is perfectly neutral', () => {
    expect(regularBaseEffects(undefined)).toEqual({ drawMod: 1, incidentMod: 1, vibeAdd: 0 });
    expect(regularBaseEffects(DEFAULT_REGULAR_BASE)).toEqual({ drawMod: 1, incidentMod: 1, vibeAdd: 0 });
  });
  it('is bounded even at maxed scores', () => {
    const maxed: RegularBase = { locals: 100, students: 100, musicheads: 100, vipcurious: 100, rough: 100, regulars: 100 };
    const e = regularBaseEffects(maxed);
    expect(e.drawMod).toBeLessThanOrEqual(1.08);
    expect(e.incidentMod).toBeLessThanOrEqual(1.2);
    expect(e.vibeAdd).toBeLessThanOrEqual(5);
  });
});

describe('topRegulars', () => {
  it('ranks loyalty desc and drops zero scores', () => {
    const base: RegularBase = { ...DEFAULT_REGULAR_BASE, locals: 20, musicheads: 35, students: 5 };
    const top = topRegulars(base, 3);
    expect(top.map((r) => r.id)).toEqual(['musicheads', 'locals', 'students']);
    expect(topRegulars(DEFAULT_REGULAR_BASE)).toEqual([]);
  });
});

describe('resolveNight + regulars (save-safe)', () => {
  it('old clubs without regularBase resolve and produce a fresh base', () => {
    const c = club();
    delete (c as { regularBase?: unknown }).regularBase;
    const { nextClub } = resolveNight(c, cfg(), 7);
    expect(nextClub.regularBase).toBeDefined();
  });

  it('an empty regular base is neutral vs no base at all (same result)', () => {
    const a = resolveNight(club(), cfg(), 4242).result;
    const b = resolveNight(club({ regularBase: { ...DEFAULT_REGULAR_BASE } }), cfg(), 4242).result;
    expect(a).toEqual(b);
  });

  it('the persisted base carries the night forward (next base differs from empty)', () => {
    const { nextClub } = resolveNight(club(), cfg({ coverLevel: 'low' }), 3);
    expect(getRegularBase(nextClub.regularBase)).not.toEqual(DEFAULT_REGULAR_BASE);
  });
});
