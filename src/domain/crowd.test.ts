/**
 * Crowd Identity v1 — derived crowd mix + bounded effects. Pure, deterministic,
 * save-safe (no persisted state; derives from existing config/club).
 */

import { defaultDayConfig, STARTING_ROSTER } from '@/domain/staff';
import type { ClubState, DayConfig, VenueState } from '@/domain/types';
import {
  CROWD_SEGMENTS,
  crowdEffects,
  crowdMix,
  type CrowdSegmentId,
  topCrowd,
} from './crowd';

function club(over: Partial<ClubState> = {}): ClubState {
  const staff = STARTING_ROSTER.map((m) => ({ ...m }));
  return {
    name: 'T', day: 4, cash: 2000, reputation: 50, baseCapacity: 120,
    ownedUpgradeIds: [], staff, lastConfig: defaultDayConfig(staff), ...over,
  };
}
const cfg = (over: Partial<DayConfig> = {}): DayConfig => ({ ...defaultDayConfig(STARTING_ROSTER), ...over });
const weightOf = (mix: ReturnType<typeof crowdMix>, id: CrowdSegmentId) => mix.find((s) => s.id === id)?.weight ?? 0;

describe('catalog', () => {
  it('every segment is well-formed and Locals is the neutral anchor', () => {
    for (const id of Object.keys(CROWD_SEGMENTS) as CrowdSegmentId[]) {
      const s = CROWD_SEGMENTS[id];
      expect(s.id).toBe(id);
      expect(s.name.length).toBeGreaterThan(0);
      expect(s.bubble.length).toBeGreaterThan(0);
    }
    const locals = CROWD_SEGMENTS.locals;
    expect([locals.drawDelta, locals.riskDelta, locals.vibeDelta]).toEqual([0, 0, 0]);
  });
});

describe('crowdMix — config shapes the room', () => {
  it('mix is normalized and deterministic for the same inputs', () => {
    const c = club();
    const a = crowdMix(c, cfg());
    const b = crowdMix(c, cfg());
    expect(a).toEqual(b);
    expect(a.reduce((sum, s) => sum + s.weight, 0)).toBeCloseTo(1, 5);
  });

  it('Student Night puts Students in the top crowd', () => {
    expect(topCrowd(crowdMix(club(), cfg({ eventId: 'student-night' })))).toContain('students');
  });

  it('cheap/low setup pulls more Students than a premium high-cover night', () => {
    const cheap = weightOf(crowdMix(club(), cfg({ coverLevel: 'low', drinkLevel: 'low' })), 'students');
    const pricey = weightOf(crowdMix(club(), cfg({ coverLevel: 'high', drinkLevel: 'high' })), 'students');
    expect(cheap).toBeGreaterThan(pricey);
  });

  it('hardline/strict door pulls fewer Rough than a relaxed/friendly door', () => {
    const relaxed = weightOf(crowdMix(club(), cfg({ policies: { smoking: 'allowed', idCheck: 'relaxed', security: 'friendly', barService: 'standard' } })), 'rough');
    const tight = weightOf(crowdMix(club(), cfg({ policies: { smoking: 'banned', idCheck: 'strict', security: 'hardline', barService: 'standard' } })), 'rough');
    expect(relaxed).toBeGreaterThan(tight);
  });

  it('a stylish, loud venue attracts Music Heads / VIP-curious', () => {
    const styled: VenueState = { owned: ['backbar-glow', 'wall-speakers'], equipped: { bar: ['backbar-glow', 'wall-speakers'] } };
    const bare = weightOf(crowdMix(club(), cfg()), 'musicheads');
    const dressed = weightOf(crowdMix(club({ venue: styled }), cfg()), 'musicheads');
    expect(dressed).toBeGreaterThan(bare);
  });
});

describe('crowdEffects — bounded + neutral anchor', () => {
  it('a pure Locals mix is perfectly neutral', () => {
    expect(crowdEffects([{ id: 'locals', weight: 1 }])).toEqual({ drawMod: 1, incidentMod: 1, vibeAdd: 0 });
  });

  it('student/rough-heavy nights raise draw and incident risk, bounded', () => {
    const heavy = crowdEffects([{ id: 'students', weight: 0.6 }, { id: 'rough', weight: 0.4 }]);
    expect(heavy.drawMod).toBeGreaterThan(1);
    expect(heavy.incidentMod).toBeGreaterThan(1);
    expect(heavy.drawMod).toBeLessThanOrEqual(1.1);
    expect(heavy.incidentMod).toBeLessThanOrEqual(1.25);
  });

  it('a hardline night nudges incident risk down vs a relaxed one (fewer rough/students)', () => {
    const relaxed = crowdEffects(crowdMix(club(), cfg({ coverLevel: 'low', policies: { smoking: 'allowed', idCheck: 'relaxed', security: 'friendly', barService: 'standard' } })));
    const tight = crowdEffects(crowdMix(club(), cfg({ coverLevel: 'low', policies: { smoking: 'banned', idCheck: 'strict', security: 'hardline', barService: 'standard' } })));
    expect(tight.incidentMod).toBeLessThan(relaxed.incidentMod);
  });
});

describe('save safety', () => {
  it('works on configs without policies/drinkPrep and clubs without venue', () => {
    const legacyCfg: DayConfig = { ...cfg() };
    delete (legacyCfg as { policies?: unknown }).policies;
    delete (legacyCfg as { drinkPrep?: unknown }).drinkPrep;
    const legacyClub = club();
    delete (legacyClub as { venue?: unknown }).venue;
    expect(() => crowdMix(legacyClub, legacyCfg)).not.toThrow();
    expect(crowdMix(legacyClub, legacyCfg).length).toBeGreaterThan(0);
  });
});
