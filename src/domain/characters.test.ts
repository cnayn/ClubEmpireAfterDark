/**
 * Character foundation tests. Proves the flavor layer covers current staff,
 * stays in sync with the roster, and does NOT smuggle in a hidden-trait mechanic
 * or a future role.
 */

import { CANDIDATE_POOL, STARTING_ROSTER } from './staff';
import { getCharacter, hasHiddenTrait } from './characters';

const ALL_STAFF = [...STARTING_ROSTER, ...CANDIDATE_POOL];

describe('character profiles', () => {
  it('every current staff member has a profile whose role matches', () => {
    for (const m of ALL_STAFF) {
      const p = getCharacter(m.id);
      expect(p).toBeDefined();
      expect(p!.role).toBe(m.role);
      expect(p!.roleStatus).toBe('current');
      expect(p!.displayName.length).toBeGreaterThan(0);
      expect(p!.oneSentence.length).toBeGreaterThan(0);
      expect(p!.dialogueLines.length).toBeGreaterThan(0);
    }
  });

  it('only current roles (bartender/bouncer) appear — no future roles', () => {
    for (const m of ALL_STAFF) {
      expect(['bartender', 'bouncer']).toContain(getCharacter(m.id)!.role);
    }
  });

  it('John "The Pitbull" and Kareem "Caramel" exist as current bouncers', () => {
    const john = CANDIDATE_POOL.find((m) => m.id === 'bnc-john');
    const kareem = CANDIDATE_POOL.find((m) => m.id === 'bnc-kareem');
    expect(john?.role).toBe('bouncer');
    expect(kareem?.role).toBe('bouncer');
    expect(getCharacter('bnc-john')?.nickname).toBe('The Pitbull');
    expect(getCharacter('bnc-kareem')?.nickname).toBe('Caramel');
  });

  it('bartenders carry richer identity (archetype + dialogue)', () => {
    for (const m of ALL_STAFF.filter((s) => s.role === 'bartender')) {
      const p = getCharacter(m.id)!;
      expect(p.archetype.length).toBeGreaterThan(0);
      expect(p.dialogueLines[0].length).toBeGreaterThan(0);
    }
  });

  it('no hidden-trait MECHANIC was added: concealed-trait staff keep mechanical hiddenTrait "none"', () => {
    // John & Kareem have a bible hidden trait recorded as metadata only.
    expect(hasHiddenTrait(getCharacter('bnc-john'))).toBe(true);
    expect(hasHiddenTrait(getCharacter('bnc-kareem'))).toBe(true);
    expect(CANDIDATE_POOL.find((m) => m.id === 'bnc-john')!.hiddenTrait).toBe('none');
    expect(CANDIDATE_POOL.find((m) => m.id === 'bnc-kareem')!.hiddenTrait).toBe('none');
  });
});
