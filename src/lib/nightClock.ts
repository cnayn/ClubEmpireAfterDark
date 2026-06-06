/**
 * Real-Time Night v1 — pure timing + curve helpers for the auto-running night.
 *
 * IMPORTANT: the night's ECONOMIC outcome still comes entirely from the
 * deterministic resolver (src/sim/night.ts). These helpers only PACE the live
 * presentation — the wall clock, the crowd-arrival curve, and which phase the
 * clock is in — so the offline/deterministic/test foundation is untouched. Pure +
 * testable; no RNG, no state, no I/O.
 */

/**
 * A full night moves over ~150s of real time at 1× — and that's only the MOVING
 * time: situations auto-pause the clock, so a real night runs longer. Interim
 * value: 240s felt empty with only the four-button tray to watch; once the
 * richer edge-UI / tap-the-room interaction lands, the night can breathe longer
 * again. Speed chip cycles 2× (~75s) / 3× (~50s); the drawer / situations pause.
 */
export const NIGHT_DURATION_MS = 150_000;
export const NIGHT_TICK_MS = 100;

/** Map 0..1 night progress to a phase index for `phaseCount` phases. */
export function phaseForProgress(progress: number, phaseCount: number): number {
  if (phaseCount <= 0) return 0;
  const p = clamp01(progress);
  return Math.min(phaseCount - 1, Math.floor(p * phaseCount));
}

/**
 * Crowd arrival curve over the night: a slow fill at the doors, a packed peak,
 * a thinning last call. Returns 0..1 to scale the live crowd on the floor.
 */
export function liveCrowdFraction(progress: number): number {
  const p = clamp01(progress);
  if (p < 0.2) return 0.2 + (p / 0.2) * 0.4; // doors: 0.2 → 0.6
  if (p < 0.7) return 0.6 + ((p - 0.2) / 0.5) * 0.4; // rush + floor: 0.6 → 1.0
  if (p < 0.85) return 1.0; // peak
  return 1.0 - ((p - 0.85) / 0.15) * 0.45; // last call: 1.0 → 0.55
}

/** A presentational wall-clock label for the night's progress (23:00 → 02:30). */
export function clockLabel(progress: number): string {
  const startMin = 23 * 60; // 23:00
  const span = 3.5 * 60; // 3.5 hours → 02:30
  const t = startMin + clamp01(progress) * span;
  const h = Math.floor(t / 60) % 24;
  const m = Math.floor(t % 60);
  return `${pad(h)}:${pad(m)}`;
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}
function pad(n: number): string {
  return String(n).padStart(2, '0');
}
