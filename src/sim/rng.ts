/**
 * Tiny seeded RNG (mulberry32) for deterministic, testable simulation.
 * No Math.random in the sim — every night is reproducible from its seed.
 */

export interface Rng {
  /** float in [0, 1) */
  next(): number;
  /** float in [min, max) */
  range(min: number, max: number): number;
  /** true with probability p */
  chance(p: number): boolean;
  /** integer in [min, max] inclusive */
  int(min: number, max: number): number;
}

export function createRng(seed: number): Rng {
  let a = seed >>> 0;
  const next = () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    range: (min, max) => min + next() * (max - min),
    chance: (p) => next() < p,
    int: (min, max) => Math.floor(min + next() * (max - min + 1)),
  };
}
