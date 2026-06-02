# Roadmap

Incremental. Each phase ends in something playable. We do **not** build
everything at once.

## Phase 0 — Foundations (scaffold)
- Expo + TypeScript project, navigation, folder structure.
- Design tokens + base components (`Screen`, `Card`, `StatCard`, buttons,
  `SegmentedControl`, `Toggle`, `Stepper`).
- Domain types + `balance.ts` constants.
- Zustand store + AsyncStorage versioned save/load.
- **Exit:** app boots to Home, can create/continue a club, state persists.

## Phase 1 — Playable Prototype (MVP) ← first implementation target
- Six screens: Home, Dashboard, Day Prep, Night Results, Upgrade Shop, save.
- Pure simulation core (`src/sim`) with seeded RNG; unit tests.
- MVP levers: music, cover, drink price, bartenders, security, VIP toggle,
  smoking policy.
- MVP outputs: guests, revenue, costs, net, reputation Δ, incidents, VIP
  satisfaction, regular loyalty, flavor notes.
- 4–6 upgrades.
- **Exit:** full day/night/shop loop, decisions matter, saves survive restart.

## Phase 2 — Depth: Staff & Events
- Named staff (skill/wage/morale), more roles (DJ, host, cleaners, promoters).
- Events / themed nights with gates and payoffs.
- Day-of-week rhythm and crowd archetypes.
- Richer vibe model.

## Phase 3 — Risk, Compliance & Progression
- Expanded satirical risk dials with clear odds/consequences.
- Compliance/inspection events; reputation crises and recovery.
- City ranking ladder + soft goals/milestones.

## Phase 4 — Polish & Feel
- Motion (doors-open reveal, deltas), sound/music optional, haptics.
- Light onboarding, settings, achievements.
- Balancing pass with real play data; difficulty curve.

## Phase 5 — Content & Longevity
- More upgrades, music styles, events, club identities/themes.
- Prestige / "open a second club" loop (still single-player, offline).
- (Only if ever desired, and out of current scope: monetization, accounts.)

## Guardrails (all phases)
Offline-only, no backend/multiplayer/3D/ads/IAP, no real celebrity names,
shady content stays satire/risk/compliance — never instructional.
```
