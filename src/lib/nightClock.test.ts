/**
 * Real-Time Night v1 — pure pacing helpers. Presentation only; the night's books
 * still come from the deterministic resolver.
 */

import { clockLabel, liveCrowdFraction, phaseForProgress } from './nightClock';

describe('phaseForProgress', () => {
  it('maps progress across the phases and clamps the ends', () => {
    expect(phaseForProgress(0, 5)).toBe(0);
    expect(phaseForProgress(0.5, 5)).toBe(2);
    expect(phaseForProgress(1, 5)).toBe(4);
    expect(phaseForProgress(-1, 5)).toBe(0);
    expect(phaseForProgress(2, 5)).toBe(4);
    expect(phaseForProgress(0.5, 0)).toBe(0);
  });
});

describe('liveCrowdFraction', () => {
  it('stays within 0..1 across the whole night', () => {
    for (let p = 0; p <= 1.0001; p += 0.05) {
      const f = liveCrowdFraction(p);
      expect(f).toBeGreaterThanOrEqual(0);
      expect(f).toBeLessThanOrEqual(1);
    }
  });

  it('fills toward a peak and thins at last call', () => {
    expect(liveCrowdFraction(0)).toBeLessThan(liveCrowdFraction(0.5)); // filling
    expect(liveCrowdFraction(0.75)).toBeCloseTo(1, 5); // peak
    expect(liveCrowdFraction(1)).toBeLessThan(liveCrowdFraction(0.8)); // thinning
  });
});

describe('clockLabel', () => {
  it('runs from doors to last call', () => {
    expect(clockLabel(0)).toBe('23:00');
    expect(clockLabel(1)).toBe('02:30');
    expect(clockLabel(0.5)).toMatch(/^\d{2}:\d{2}$/);
  });
});
