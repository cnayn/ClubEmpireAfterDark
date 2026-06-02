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
Split into two slices to avoid overloading implementation. See
[phase2-scope.md](phase2-scope.md) for the locked boundaries.

### Phase 2A — Named Staff (first slice) ← current planning target
- Named staff **replace** the abstract bartender-count + security-level levers.
- Roles: **bartender, bouncer** only (DJ deferred to 2B).
- New `/staff` screen: roster + hire/fire from a fixed static candidate pool.
- Day Prep schedules `staffOnDuty`; wages = sum of on-duty salaries.
- Save migration v1 → v2; `eventId: "regular"` kept as an identity-neutral
  placeholder. **Preserve the Phase 0/1 early-game balance (non-negotiable).**

### Phase 2B — Events (second slice, after 2A is stable)
- Tiny static event catalog (Regular, Student, Hip-Hop, Techno, VIP Birthday,
  Local Influencer) + event picker, modifiers, result lines, tests.
- **DJ role** ships here (its vibe/music-match hooks need events to matter).
- Widens `eventId` to a union — no new save migration (field exists from 2A).

### Later in Phase 2 (future)
- Staff morale; more roles (host, etc.); day-of-week rhythm; crowd archetypes;
  richer vibe model.

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
