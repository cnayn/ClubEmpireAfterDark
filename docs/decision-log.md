# Decision Log (ADR-lite)

Chronological record of meaningful decisions. Newest at top. Each entry:
context → decision → why → consequences.

---

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
