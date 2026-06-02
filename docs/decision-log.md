# Decision Log (ADR-lite)

Chronological record of meaningful decisions. Newest at top. Each entry:
context → decision → why → consequences.

---

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
```
