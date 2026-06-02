---
name: nightclub-staff-system
description: Use when working on Club Empire After Dark named staff — bartenders/bouncers, traits, hiring/firing, scheduling, the /staff screen, or staff effects in the night sim. Keeps staff a swap, not an addition.
---

# Nightclub Staff System (Phase 2A)

Core principle:
**Named staff is a swap, not an addition.**

Staff replaced the abstract bartender-count and security-level levers. They must
keep mapping onto the SAME internal sim quantities — never bolt on a parallel
system. See `src/domain/staff.ts`, `src/sim/night.ts`, and docs/phase2-scope.md §C–D.

## How staff map to existing sim variables

- **Bartender → service capacity & theft.** `service = Σ SERVICE_PER_BARTENDER ×
  (skill/BASELINE_SKILL)`; low `honesty` skims bar revenue (`resolveTheft`).
- **Bouncer → security mod & compliance.** on-duty units → `bouncerSecurityMod`
  (reproduces old tiers at 1/2/3 units); low honesty weakens the door; the
  `by-the-book` trait lowers compliance-fine chance.
- **reliability → no-shows.** Seeded chance a member doesn't turn up (still paid).
- **Traits** (`visibleTrait`/`hiddenTrait`) each add at most ONE mechanical nudge
  to an existing variable — never a new subsystem.

## The identity point (non-negotiable)

Regular Night + the honest/reliable starting roster must reproduce the pre-Phase-2
night **bit-for-bit**. New RNG draws (theft, no-shows) run only for imperfect staff
and are ordered AFTER existing draws. Any staff change must preserve this; verify
with the early-game balance tests and a throwaway harness.

## Card readability (UI guidance)

Staff/candidate cards surface: name, role, salary, headline strength label
(`strengthLabel`), visible trait, short description. Do **not** dump raw
honesty/reliability/skill bars on the card face — the hidden trait stays hidden
until revealed through a result note.

## When to use

- Editing staff data, traits, aggregation, hiring/firing, scheduling, or the
  `/staff` screen.
- Adding/adjusting a trait or staff effect.

## When NOT to use

- Events or DJ work (Phase 2B — use the scope guard).
- Pure economy retuning (use nightclub-economy-balancing).

## Hard boundaries (Phase 2A excludes)

morale, XP, leveling, referrals, cliques/relationships, **DJs**, waiters, bathroom
attendants, technicians, cleaners, promoters, managers, city heat, the VIP/regular
axis, equipment/condition, interiors, and club policy. Roles are **bartender and
bouncer only**. Keep the roster and candidate pool small and readable. Never let a
trait or stat reach into a system that doesn't exist yet.
