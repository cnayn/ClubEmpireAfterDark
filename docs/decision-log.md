# Decision Log (ADR-lite)

Chronological record of meaningful decisions. Newest at top. Each entry:
context → decision → why → consequences.

---

## 0011 — Grand Opening tuning pass (2026-06-02)
- **Context:** Harness flagged Grand Opening as a near-repeatable cash machine on
  established clubs (strongly net-positive, small rep cost) rather than a
  high-stakes bet (#0010 open note).
- **Decision:** Focused single-event tuning — cost **$600 → $850**, riskMod
  **+0.06 → +0.10**. No other event, the resolver, unlocks, UI, or save schema
  changed.
- **Result (harness, vs Quiet):** balanced +333→**+76**, aggressive +313→**+63**,
  hot +606→**+352** (prepared clubs still profit), weak +93→**−158**, fresh
  −254→**−512** (clear downside when unprepared). Other events' rows unchanged.
  All invariants hold: every event has a Quiet-better state, none beats Quiet on
  both net and reputation, no soft-lock, Quiet stays bit-identical to Phase 2A.
- **Status:** Grand Opening now reads as a high-stakes spotlight. DJs / Phase 3
  not started.

## 0010 — Phase 2B implementation complete: events (2026-06-02)
- **Context:** Implemented the events-only slice (#0008 plan), built on Phase 2A.
  Corrected invariant locked at the owner's request: **Quiet-Night-only play must
  preserve the Phase 2A baseline exactly**; *event* play may move the curve but
  must pass no-dominance, survivability, requirement-bites, and no-soft-lock.
- **Decision:** Shipped a static catalog (`src/domain/events.ts`) of five events —
  Quiet Night (`regular`, identity), Private Party, Student Night, Grand Opening,
  Industry Night (Happy Hour deferred; **no DJ** — still behind the baseline-neutral
  gate). An event is a modifier vector (draw/spend/risk/cost/bookingFee/repMod/
  repAmplify) applied in `night.ts` with **no new RNG draws**. Three gates:
  Unlock (reputation tier OR milestone), Requirement (reserve-aware affordability —
  the only hard block), Readiness (advisory, never blocks). Spotlight events use
  **symmetric** reputation amplification.
- **Save:** **No migration** — `SCHEMA_VERSION` stays 2 (gates derive from
  `ClubState`; `eventId` default stays `regular`; the union only widens; locked
  saved events fall back to Quiet at runtime).
- **Verification:** 56 tests pass, `tsc --noEmit` clean, web bundle exports. The
  throwaway telemetry harness ({balanced, weak, aggressive, fresh, hot} × 60 seeds)
  confirmed every event has a Quiet-better state, none dominates on both net and
  reputation, paid events can't soft-lock, and Private Party's niche is the fresh
  small club. Quiet Night = `regular` no-op preserves the 2A baseline bit-for-bit.
- **Open tuning note:** Grand Opening behaves more like a cash machine than a
  high-variance bet on established clubs (passes all hard rules; revisit later).
- **Status:** Phase 2B done. DJs / Phase 3 not started.

## 0009 — Phase 2A implementation complete (2026-06-02)
- **Context:** Implemented the named-staff slice planned in #0008, holding the
  early-game economy locked in #0007.
- **Decision:** Shipped bartenders + bouncers as a named roster replacing the
  abstract levers; `/staff` screen with a static candidate pool; `staffOnDuty` +
  frozen `eventId: "regular"` in `DayConfig`; save migration v1 → v2; wages,
  bankruptcy guard, and shop reserve recompute from staff salaries.
- **Why:** Add depth (hiring tradeoffs, honesty/reliability/theft/no-show gambles)
  without disturbing the balanced first 10 nights.
- **Verification:** 39 tests pass, `tsc --noEmit` clean, web bundle exports.
  Identity point held bit-exact where staffing maps 1:1 (conservative/aggressive
  match the MVP per-night); balanced reaches "Rising Name" by ~night 7–8; no
  meaningful balance drift (only seed-shift variance + a slightly cheaper second
  bouncer, open risk R1).
- **Status:** Phase 2B (events + DJ) **not started** — awaiting approval.

## 0008 — Phase 2 planning: staff-first split, DJ/events deferred (2026-06-02)
- **Context:** Phase 2 (named staff + events) risked overloading one
  implementation. We need to add depth without breaking the locked early-game
  economy (decision-log #0007). Planning only; no code yet. See
  [phase2-scope.md](phase2-scope.md).
- **Decision:**
  1. **Split Phase 2** into **2A (named staff)** then **2B (events)**; 2B starts
     only after 2A is stable and approved.
  2. **Named staff replace** the abstract `bartenders` count + `securityLevel`
     lever (not layered on top) — cleaner and matches the fantasy.
  3. **2A roles = bartender + bouncer only. DJ deferred to 2B** — a DJ's only
     hooks (vibe, music-match) are inert or curve-disturbing without events.
  4. **Events deferred to 2B**, but keep `eventId: "regular"` as a frozen,
     identity-neutral placeholder in `DayConfig` from 2A so the **save schema
     (v2) is stable** and 2B needs no further migration.
  5. **New `/staff` screen** with a **fixed static candidate pool** (no refresh
     timers); per-night scheduling stays in Day Prep.
  6. **StaffMember** fields: id, name, role, salary, skill, honesty, reliability,
     **visibleTrait**, **hiddenTrait**, description. Hidden trait = satirical
     "you don't fully know your hire" gamble. Deeper attributes deferred.
  7. **Identity point is non-negotiable:** Regular Night + starting roster
     (2 skill-50 bartenders + 1 skill-50 bouncer) reproduces the current curve;
     all #0007 invariants must still pass, re-verified via the sim harness.
  8. **Save migration v1 → v2** must never break existing saves; bankruptcy
     guard + shop reserve keep working off staff salaries.
- **Why:** Smallest stable increments; protect the balanced first-10 nights;
  avoid a second save migration later; keep Day Prep uncluttered.
- **Consequences:** `DayConfig` and `ClubState` shapes change in 2A;
  `nightFixedCosts` / `MIN_NIGHT_COST` recompute from salaries. Open risks
  tracked in phase2-scope.md §I (bouncer salary calibration, zero-bouncer
  freedom, RNG determinism, roster UI, hidden-trait reveal).

## 0007 — Early-game balance pass (2026-06-02)
- **Context:** Simulating the first 10 nights through the real `resolveNight`
  exposed serious problems: the default config *lost* money on opening night,
  sensible ("Balanced") play death-spiralled to −$1,200, reputation crept
  +1–2/night (tiers unreachable), upgrades were front-loaded then starved, and
  relaxed smoking was pure downside (no reward).
- **Decision:** Five tuning changes + an anti-soft-lock guard:
  1. **Attendance floor** `REP_FLOOR = 0.30` so small clubs are viable from
     night 1 while reputation still drives absolute numbers.
  2. **Reputation rework** to an anchored satisfaction index (anchor 55, gain
     0.20): solid night +3, great +5, bad −5. Reaches "Rising Name" by ~night 8.
  3. **Start cash $2,000 → $600** so the first upgrade is earned, not gifted.
  4. **Relaxed smoking gains a +10% attendance draw** — a genuine risk/reward
     dial against its fine + reputation risk.
  5. **Kept fixed costs** (wages/security) to preserve the staffing tradeoff.
  Plus: **bankruptcy guard** (can't open a night you can't pay for) and a
  **shop reserve** (`MIN_NIGHT_COST`) so a purchase can never soft-lock the
  player — the cheapest night is always affordable and always profitable.
- **Why:** Make the first 10 nights fun, fair, and dead-end-free before adding
  systems. No single strategy dominates: aggressive earns more cash but stalls
  reputation; balanced climbs tiers; risk is real but punishing when stacked.
- **Consequences:** Verified by sim + 9 new tests (`early-game balance`,
  store guards). Phase 2 (named staff + events) builds on this baseline.

## 0006 — Centralize balancing in `balance.ts`
- **Decision:** All economy constants and curves live in `src/domain/balance.ts`;
  the sim and UI read from it.
- **Why:** Tuning is the most frequent change in a tycoon game; isolate it.
- **Consequences:** Easy retuning; sim functions take config/constants as input.

## 0005 — Versioned save schema in AsyncStorage
- **Decision:** Single persisted game-state blob with a `schemaVersion` and a
  migration hook; auto-save after each night and key actions.
- **Why:** Offline-first requirement; avoid corrupt/incompatible saves as the
  model evolves through roadmap phases.
- **Consequences:** Must write a migration when state shape changes; cheap now.

## 0004 — Pure, seeded simulation core (no React in `src/sim`)
- **Decision:** Night resolution is pure functions `(state, dayConfig, seed) →
  result`, with a seeded RNG.
- **Why:** Determinism, unit-testability, and clean separation from UI; lets us
  reason about and balance the game without the app running.
- **Consequences:** UI calls the sim and renders results; no game math in
  components. Slight upfront structure cost.

## 0003 — Zustand for state management
- **Decision:** Use Zustand as the single game-state store.
- **Why:** Minimal boilerplate, no provider tree gymnastics, plays well with a
  plain TS store and persistence; lighter than Redux for a solo offline game.
- **Consequences:** One store module; persistence layer wraps it. Revisit only
  if state grows unexpectedly complex.

## 0002 — MVP = six screens + subset of systems
- **Decision:** Ship Home, Dashboard, Day Prep, Night Results, Upgrade Shop,
  save — with a reduced system set (counts/levels instead of named staff,
  no events yet). See mvp-scope.md.
- **Why:** Prove the core loop is fun and legible before adding depth.
- **Consequences:** Some systems are stubbed/deferred; roadmap tracks the rest.

## 0001 — Tone via risk/compliance framing
- **Decision:** Model "shady" nightlife pressures strictly as satirical
  risk / reputation / compliance tradeoffs with stated odds and consequences;
  no real-world illicit instruction, no real celebrity names.
- **Why:** Keep the edgy fantasy while staying firmly within content guardrails.
- **Consequences:** Risk features are abstract mechanics; copy stays playful and
  satirical, never how-to.

## 0000 — Stack: React Native + Expo + TypeScript, offline-only
- **Decision:** Per brief — Expo-managed RN app, TS throughout, local storage
  only. No backend, multiplayer, 3D, ads, or IAP.
- **Why:** Matches product brief and fastest path to a mobile prototype.
- **Consequences:** All persistence is on-device; design around offline play.
- **Clarification (2026-06-02, does not amend the original decision):** "no 3D"
  here meant *not in the build then*, not *never*. 3D/isometric is now framed as
  a long-term presentation goal that reads from sim outputs and must not affect
  current scope or the tested economy. Backend/multiplayer/ads/IAP remain out.
  See docs/roadmap.md → "Visual presentation & 3D".
```
