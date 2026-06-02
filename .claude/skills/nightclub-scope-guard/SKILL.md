---
name: nightclub-scope-guard
description: Use before adding ANY gameplay feature, system, screen, or stat to Club Empire After Dark, to confirm it belongs in the current phase. Enforces the phase boundaries in docs/phase2-scope.md and the roadmap.
---

# Nightclub Scope Guard

The north-star rule for this project:
**Legibility before depth; depend only on what exists; the reckoning ships before the reward.**

Use this skill as a gate. If a requested feature is not in the current phase,
say so and point to where it belongs — do not build it.

## Current phase state (keep in sync with docs/roadmap.md)

- **Phase 2A — DONE.** Named staff = **bartenders + bouncers only**, replacing the
  old abstract bartender-count / security-level levers. Hire/fire from a fixed
  static pool on `/staff`. `DayConfig.eventId` is frozen to `"regular"`.
- **Phase 2B — NOT STARTED.** Events (Regular/Student/Hip-Hop/Techno/VIP
  Birthday/Local Influencer) **and the DJ role** ship here, together.
- **Phase 3+ — deferred.** VIP vs regulars, interior slots, door stance,
  compliance depth, equipment, staff trust, then city heat, rivals, Clean vs
  Wild / Club Policy, referrals, cliques. Online club visits and free-form
  interior redesign are **hard-deferred**.

## When to use

- Before starting work that adds a system, role, screen, stat, or `DayConfig`
  field.
- When a request says "while we're here, also add…".
- When unsure which phase a feature belongs to.

## When NOT to use

- Pure bug fixes, balance tuning of existing constants, content/flavor text, or
  refactors that add no new system (use the relevant specialist skill instead).

## Hard boundaries

- Do **not** add DJs, events, VIP/regular axis, morale, XP, leveling, referrals,
  cliques, equipment, interiors, city heat, rivals, or club-policy systems while
  Phase 2A is the active slice.
- Do **not** widen `DayConfig.eventId` beyond `"regular"` until Phase 2B is
  explicitly approved.
- Do **not** introduce a feature that depends on a system that does not exist yet
  ("depend only on what exists").
- A risky/punishing mechanic must ship with its downside in the same slice as its
  upside ("the reckoning ships before the reward").
- If a request crosses a boundary: name the boundary, cite docs/phase2-scope.md,
  and ask for explicit approval before proceeding.
