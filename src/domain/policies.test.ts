/**
 * Club Policies v1 — selectable, bounded, neutral-at-middle, deterministic, and
 * save-safe (the field is optional; absence = neutral).
 */

import { defaultDayConfig, STARTING_ROSTER } from '@/domain/staff';
import type { ClubState, DayConfig, PoliciesConfig } from '@/domain/types';
import { resolveNight } from '@/sim/night';
import { DEFAULT_POLICIES, legacySmoking, policyEffects } from './policies';

function makeClub(over: Partial<ClubState> = {}): ClubState {
  const staff = STARTING_ROSTER.map((m) => ({ ...m }));
  return {
    name: 'T', day: 3, cash: 2000, reputation: 60, baseCapacity: 120,
    ownedUpgradeIds: [], staff, lastConfig: defaultDayConfig(staff), ...over,
  };
}
const base = (): DayConfig => ({ ...defaultDayConfig(STARTING_ROSTER), coverLevel: 'low', drinkLevel: 'low' });
const withPolicies = (p: Partial<PoliciesConfig>): DayConfig => ({
  ...base(),
  policies: { ...DEFAULT_POLICIES, ...p },
  // keep the legacy smoking lever in sync (as the UI does)
  smoking: legacySmoking((p.smoking ?? DEFAULT_POLICIES.smoking)),
});

describe('policyEffects — neutral middle, bounded', () => {
  it('default / all-standard policies are perfectly neutral', () => {
    expect(policyEffects(undefined)).toEqual({ drawMod: 1, incidentMod: 1, barRevenueMod: 1, vibeAdd: 0 });
    expect(policyEffects(DEFAULT_POLICIES)).toEqual({ drawMod: 1, incidentMod: 1, barRevenueMod: 1, vibeAdd: 0 });
  });

  it('moves in the intended direction and stays bounded', () => {
    expect(policyEffects({ ...DEFAULT_POLICIES, idCheck: 'relaxed' }).drawMod).toBeGreaterThan(1);
    expect(policyEffects({ ...DEFAULT_POLICIES, idCheck: 'relaxed' }).incidentMod).toBeGreaterThan(1);
    expect(policyEffects({ ...DEFAULT_POLICIES, idCheck: 'strict' }).drawMod).toBeLessThan(1);
    expect(policyEffects({ ...DEFAULT_POLICIES, security: 'hardline' }).incidentMod).toBeLessThan(1);
    expect(policyEffects({ ...DEFAULT_POLICIES, barService: 'fast' }).barRevenueMod).toBeGreaterThan(1);
    expect(policyEffects({ ...DEFAULT_POLICIES, barService: 'premium' }).barRevenueMod).toBeLessThan(1);
    // bounded: no modifier is wild
    const e = policyEffects({ smoking: 'allowed', idCheck: 'relaxed', security: 'friendly', barService: 'fast' });
    expect(e.drawMod).toBeLessThan(1.2);
    expect(e.incidentMod).toBeLessThan(2);
    expect(e.barRevenueMod).toBeLessThan(1.2);
  });
});

describe('policies affect resolveNight (existing variables only)', () => {
  it('standard policies reproduce the no-policies night exactly (identity)', () => {
    const club = makeClub();
    const noPol: DayConfig = { ...base() };
    delete (noPol as { policies?: unknown }).policies;
    const std = withPolicies({}); // all neutral
    expect(resolveNight(club, std, 4242).result).toEqual(resolveNight(club, noPol, 4242).result);
  });

  it('strict IDs pull fewer guests than relaxed (same seed)', () => {
    const club = makeClub();
    const strict = resolveNight(club, withPolicies({ idCheck: 'strict' }), 7).result;
    const relaxed = resolveNight(club, withPolicies({ idCheck: 'relaxed' }), 7).result;
    expect(strict.guests).toBeLessThan(relaxed.guests);
  });

  it('hardline security has fewer incidents than friendly across seeds', () => {
    const club = makeClub({ reputation: 90, baseCapacity: 200 });
    let hard = 0;
    let friendly = 0;
    for (let seed = 0; seed < 150; seed++) {
      hard += resolveNight(club, withPolicies({ security: 'hardline' }), seed).result.incidents;
      friendly += resolveNight(club, withPolicies({ security: 'friendly' }), seed).result.incidents;
    }
    expect(hard).toBeLessThan(friendly);
  });

  it('fast pour earns more bar revenue than premium care (same seed)', () => {
    const club = makeClub();
    const fast = resolveNight(club, withPolicies({ barService: 'fast' }), 11).result;
    const premium = resolveNight(club, withPolicies({ barService: 'premium' }), 11).result;
    expect(fast.barRevenue).toBeGreaterThan(premium.barRevenue);
  });

  it('same seed + same policies = same result (deterministic)', () => {
    const club = makeClub();
    const cfg = withPolicies({ idCheck: 'strict', security: 'hardline', barService: 'premium', smoking: 'banned' });
    expect(resolveNight(club, cfg, 5).result).toEqual(resolveNight(club, cfg, 5).result);
  });
});

describe('save safety', () => {
  it('new clubs carry neutral policies; an old config without policies still resolves', () => {
    expect(defaultDayConfig(STARTING_ROSTER).policies).toEqual(DEFAULT_POLICIES);
    const club = makeClub();
    const legacy: DayConfig = { ...base() };
    delete (legacy as { policies?: unknown }).policies;
    expect(() => resolveNight(club, legacy, 1)).not.toThrow();
  });
});
