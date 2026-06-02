---
name: nightclub-save-migration
description: Use whenever a change alters the shape of ClubState, DayConfig, or any persisted data in Club Empire After Dark. Ensures old local saves migrate safely and current players are never broken.
---

# Nightclub Save Migration

Offline, local-only saves (AsyncStorage). There is no backend and no way to reset
a real player's device — **a bad migration silently corrupts someone's club.**
All save logic lives in `src/save/persistence.ts`.

## The rules

1. **Bump `SCHEMA_VERSION`** by one for any persisted-shape change (currently 2).
2. **Add a forward branch in `migrate()`** keyed on `envelope.schemaVersion`.
   Migrations are forward-only and cumulative.
3. **Never downgrade or discard progress** — cash, reputation, day, upgrades, and
   staff must survive. When in doubt, top up (add defaults) rather than drop.
4. **Default every new field** for old saves (the v1→v2 staff roster is the model:
   build a safe roster from the old levers, never leaving the player worse off).
5. **Keep the guards working after migration.** A migrated club must still pass the
   bankruptcy guard (`wagesForOnDuty`) and shop reserve (`minViableNightCost`) — a
   migrated save must always be able to open a profitable minimum night.
6. **Add a migration test** in `src/save/persistence.test.ts`: hand-craft an old
   envelope, load it, assert progress preserved + a valid, playable result
   (e.g. `isValidSchedule`, non-empty roster).

## When to use

- Changing fields on `ClubState` or `DayConfig`, or anything inside the saved blob.
- Phase 2B widening `eventId` (verify whether a migration is even needed — the
  field already exists from 2A, so often it is not).

## When NOT to use

- Changes that touch only transient state, sim math, or UI with no persisted shape
  change.

## Hard boundaries

- Do **not** change a persisted shape without bumping `SCHEMA_VERSION` and adding
  a migration + test.
- Do **not** write a migration that can throw on a malformed old blob — guard and
  fall back to safe defaults (loadClub already swallows parse errors to `null`).
- Do **not** remove an old migration branch; players may still be on any version.
- Do **not** add backend/cloud save — local AsyncStorage only.
