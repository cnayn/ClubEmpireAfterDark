# Roadmap

Incremental. Each phase ends in something playable. We do **not** build
everything at once.

> **North-star rule:** Legibility before depth; depend only on what exists; the
> reckoning ships before the reward.

> **Player-feedback lessons** (Nightclub City / Nightclub Story): see
> [player-feedback-lessons.md](player-feedback-lessons.md). Captures what players
> remembered/complained about so it guides design without pulling scope forward.
> Validates the next pass — **Floor View + Next Goal only**; everything else is banked.

> **Long-term vision** — the nightclub *life-management loop* (prepare → stock →
> watch the room → a few timed calls → consequences → grow venues): see
> [vision-life-management-loop.md](vision-life-management-loop.md). Direction only;
> nothing there is approved to build. Current scope stays Floor View + Next Goal.

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

### Phase 2B — Events ✅ done
- Static catalog of 5 events (Quiet Night, Private Party, Student Night, Grand
  Opening / Re-Launch, Industry Night) + Day Prep picker, resolver modifier
  vector, result lines, tests. Happy Hour deferred. Three-gate model
  (unlock / requirement / readiness). Symmetric reputation amplification.
- **DJ role NOT shipped** — deferred behind the baseline-neutral gate (below).
- Widened `eventId` to a union — **no save migration needed** (gates derive from
  state; default stays `regular`). See decision-log #0010.

### Later in Phase 2 (future)
- Staff morale; more roles (host, etc.); day-of-week rhythm; crowd archetypes;
  richer vibe model.

## Phase 3 — Risk, Compliance & Progression
- Expanded satirical risk dials with clear odds/consequences.
- Compliance/inspection events; reputation crises and recovery.
- City ranking ladder + soft goals/milestones.
- **Day Prep Supply & Drink Stock Loop** (future design note):
  [phase3-supply-stock-loop.md](phase3-supply-stock-loop.md) — pre-night stock
  ordering as a business-risk decision (over/under-order, supplier reliability,
  abstract emergency restock). Sequenced *after* Floor View + Next Goal and the
  night-intervention experiment; turn-based, not timer/gem-wall based.
- **Realism systems & conduct boundaries** (future design note):
  [phase3-realism-and-conduct.md](phase3-realism-and-conduct.md) — spirits
  quality dial (Phase 3, w/ supply loop), delayed theft discovery / staff leakage
  (Phase 3+), cleaners/maintenance (gated behind venue condition). Player power is
  **managerial only** — violence against staff is **excluded permanently**.

## Phase 4 — Polish & Feel
- Motion (doors-open reveal, deltas), sound/music optional, haptics.
- Light onboarding, settings, achievements.
- Balancing pass with real play data; difficulty curve.

## Phase 5 — Content & Longevity
- More upgrades, music styles, events, club identities/themes.
- Prestige / "open a second club" loop (still single-player, offline).
- (Only if ever desired, and out of current scope: monetization, accounts.)

## Guardrails (all phases)
Offline-only, no backend/multiplayer/ads/IAP, no real celebrity names,
shady content stays satire/risk/compliance — never instructional.
(3D is **not** a "never" — it's a long-term presentation goal; see Visual
Presentation below.)

## Dependency map (strict build order)

Each layer depends only on layers above it — *depend only on what exists*.

1. **WMT / telemetry** — the legibility layer (results notes, result tags, "why"
   feedback). Everything later leans on the player understanding cause→effect.
2. **Phase 2A — named staff swap** (bartenders + bouncers). ✅ done.
3. **Phase 2B — events** ✅ done (5 events). **DJs not shipped** — still behind the
   baseline-neutral gate below; otherwise the DJ slips to Phase 3.
4. **Phase 3 — VIP vs regulars, interior slots, door stance, compliance,
   equipment, staff trust.**
5. **Phase 4 — city heat, rivals, Clean vs Wild / Club Policy, referrals,
   cliques.**
6. **Hard-deferred — online club visits and free-form interior redesign.**

## Phase 2B DJ gate (note)

A Phase 2B DJ is just a staffer who only touches **draw, quality, cost, and one
existing risk** — and proves it against the balance harness. If it needs anything
else, or if the baseline-neutral version is too dull to ship, it becomes a
**Phase 3 DJ** instead. (Consistent with: named staff is a swap, not an addition.)

## Dangerous-system framing (all risky mechanics)

- mechanics, not methods
- business / reputation risk, not instruction
- manage exposure, not behavior
- no explicit real-world how-to
- no glamorized violence

See `.claude/skills/nightclub-safety-framing` for the working guardrail.

## Visual presentation & 3D (long-term, future design notes)

> 3D/isometric club view is a long-term presentation goal. It must not influence
> near-term gameplay design or pull deferred systems forward. The current sim
> remains the backend; future visuals should represent sim state, not replace it.

- **Future target:** a Nightclub City-style isometric/3D club view.
- **First visual steps should be low-scope:** 2D mood panels, isometric mockups,
  club-state visuals — not a 3D engine.
- **Sequencing:** 3D comes *after* a proven loop, interior slots, staff roles,
  and club identity exist.
- **Reads from existing sim outputs only:** staff on duty, guest count, event,
  incidents, service pressure, reputation tier, upgrades. Visuals are a view over
  the resolved night, never their own source of truth.
- Do **not** build a full real-time NPC simulation.
- Do **not** make 3D a separate economy.
- Do **not** let 3D affect current Phase 2/3 scope.
