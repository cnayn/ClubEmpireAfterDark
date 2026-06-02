# Phase 2 Scope — Named Staff (2A) + Events (2B)

> **Status:** **Phase 2A + 2B implemented** (2026-06-02) — tests + typecheck +
> bundle green; Quiet-Night-only play preserves the Phase 2A baseline exactly;
> events pass no-dominance / survivability / requirement-bites (decision-log
> #0009, #0010). DJs remain deferred behind the baseline-neutral gate.

This document is the **authoritative boundary** for Phase 2. If a feature is not
listed in the "In scope" sections below, it is **not** in Phase 2A.

---

## Why staff and events can be split (architecture note)

Events were considered for the same slice as staff but are **deliberately
deferred to 2B**. The only shared seam is the `eventId` field on `DayConfig`.
We keep that field present from 2A as a **frozen placeholder** (`eventId:
"regular"`, identity-neutral) so that:

- the **save schema (v2) is stable** — Phase 2B adds events without another
  migration, only widening the `eventId` union and reading modifiers;
- the night resolver already threads an `eventId` it can ignore (Regular Night
  contributes nothing) until 2B wires up modifiers.

A **DJ role is also deferred to 2B**, not shipped in 2A. A DJ's only mechanical
hooks are vibe and music-match; without the event preferred-music system those
hooks are either inert (role clutter) or they add vibe and **disturb the locked
early-game curve**. DJ therefore ships with events in 2B, where it has real
meaning. Phase 2A ships **only the two roles that map 1:1 onto existing levers**:
bartender (service capacity) and bouncer (security mod).

---

# PHASE 2A — Named Staff

> **Principle: Named staff is a swap, not an addition.** Staff replace the
> abstract bartender-count / security-level levers and must keep mapping onto the
> same internal sim quantities — never a parallel system bolted on top.

## A. Scope

**In scope (2A):**
- Named staff **replace** the abstract `bartenders` count and `securityLevel`
  lever entirely.
- Roles, Phase 2A only: **bartender**, **bouncer**.
- A new **`/staff` screen**: view roster, hire/fire from a **fixed static
  candidate pool** (no refresh timers, no generation).
- **Day Prep** schedules `staffOnDuty` (who works tonight) — this replaces the
  bartender stepper + security segmented control.
- **Save migration v1 → v2** (see §E).
- **Regular Night baseline preserved** as identity-neutral (see §D). No event
  catalog, picker, or modifiers in 2A beyond the frozen `eventId: "regular"`
  placeholder.

**Explicitly NOT in Phase 2A (future design notes only):**
waiters, bathroom attendants, technicians, promoters, cleaners, managers,
**DJ** (→ 2B), morale, XP, leveling, staff referrals, staff cliques,
relationship networks, hiring-market refresh timers, city progression, rivals,
online visits, equipment breakdowns, interior redesign, **full events** (→ 2B).

## B. DayConfig target

Phase 2A changes `DayConfig` to:

```
music
coverLevel
drinkLevel
staffOnDuty: string[]      // ids of roster members working tonight
eventId: "regular"         // frozen placeholder; literal 'regular' in 2A
vipFocus
smoking
```

- Removed vs MVP: `bartenders: number`, `securityLevel: SecurityLevel`.
- `eventId` is typed as the literal `'regular'` in 2A (widened to a union in 2B).
  **Regular Night must be identity-neutral** — it applies no draw/spend/risk/
  reputation/music modifiers. The resolver may read `eventId` but Regular Night
  is a no-op.

## C. StaffMember model (Phase 2A)

```
id           string     stable unique id
name         string     display name (fictional; no real people)
role         'bartender' | 'bouncer'
salary       number     $ per night when ON DUTY
skill        0–100      magnitude of the role's positive effect
honesty      0–100      low honesty → theft (bartender) / cut corners (bouncer)
reliability  0–100      low → seeded chance of a no-show / off-night
visibleTrait StaffTrait small enum, shown at hire (truth in advertising)
hiddenTrait  StaffTrait small enum, NOT shown at hire — discovered through play
description  string     one short flavor line
```

- `visibleTrait` / `hiddenTrait`: each is a small enum value = flavor + at most
  **one** mechanical nudge (e.g. *Fast Pour* +service, *Sticky Fingers* +theft,
  *By-the-Book* +compliance protection, *Intimidating* +incident reduction /
  −vibe-later, *Flaky* −reliability, *Steady* +reliability, `none`). The
  hidden trait is the satirical "you don't fully know who you hired" gamble.
- Keep the enum small in 2A; traits with no 2A hook (vibe-related) are reserved
  for 2B.

**Future attributes (NOT implemented in 2A — notes only):**
speed, charisma, loyalty, stress tolerance, VIP service, regular service,
upsell ability, theft risk (as a standalone stat), drama risk, referral quality,
reputation, experience, relationship with owner, relationship with other staff,
network quality.

### Role effects (mapping onto existing sim levers)

| Role | Affects | Mechanic (identity-preserving) |
|---|---|---|
| **Bartender** | bar revenue, wait complaints, **theft** | service = Σ `SERVICE_PER_BARTENDER × (skill / BASELINE_SKILL)`, scaled by availability (no-show). Low `honesty` → seeded chance to skim a slice of bar revenue (shrinkage), surfaced as a result line. |
| **Bouncer** | incident risk, compliance risk, guest filtering | on-duty bouncers → **effective units** = Σ `(skill / BASELINE_SKILL)`; mapped to `securityMod` reproducing today's tiers (≈1 unit → 1.0, 2 → 0.6, 3 → 0.35; 0 → worse). Low `honesty` → +incident/compliance risk (cut corners at the door). Skill = stronger guest filtering. |

`BASELINE_SKILL = 50`. A skill-50 bartender = exactly one of today's bartenders
(90 served); a skill-50 bouncer = one security "unit". Wages = **Σ on-duty
salaries** (replaces `bartenders × WAGE` + `SECURITY_COST[level]`).

## D. Identity point (NON-NEGOTIABLE)

**Regular Night + the default starting roster must reproduce the current
balanced MVP curve as closely as possible.** Calibration:

- `STARTING_ROSTER` mirrors the old default `DayConfig` (`bartenders: 2`,
  `securityLevel: 1`): **2 bartenders (skill 50) + 1 bouncer (skill 50)**, honest
  and reliable, all on duty by default.
- skill-50 bartender → 90 service (2 → 180 == old `bartenders:2`).
- 1 skill-50 bouncer → `securityMod` 1.0 == old `securityLevel:1`.
- Salaries: bartender ≈ `WAGE_PER_BARTENDER` ($120); bouncer calibrated so
  fielding 1/2/3 bouncers approximates the old security tier costs
  ($100 / $220 / $380). Exact salary values are set during the balance
  re-verification step (§F) — see open risk R1.
- Higher security (2–3 bouncers) and stronger crew are reached by **hiring** —
  the new progression layer — not by a stepper.

The following first-10-night invariants from the balance pass (decision-log
#0007) **must still hold**, re-verified with a throwaway simulation harness
before sign-off:

- opening night profitable;
- balanced play stays cash-positive;
- balanced play reaches **"Rising Name" (rep ≥ 40) around night 8–10** (via
  sensible hiring/scheduling);
- the cheapest viable night remains affordable **and** profitable;
- no soft-lock / economic dead-end;
- aggressive play can earn cash but does **not** dominate reputation;
- risky play (relaxed smoking, thin security) remains a real gamble.

## E. Save migration (v1 → v2)

`SCHEMA_VERSION` bumps `1 → 2`. `migrate()` branches on
`envelope.schemaVersion < 2` and must **never break an existing save**:

1. If `club.staff` is missing, build a **safe default hired roster**: enough
   bartenders to cover the old `lastConfig.bartenders` and enough bouncers to
   cover the old `lastConfig.securityLevel` (level *N* → *N* bouncers), at least
   the `STARTING_ROSTER`. A migrated player is never *downgraded* from what they
   could field before.
2. Rewrite `club.lastConfig`: set `staffOnDuty` to those roster ids, set
   `eventId: "regular"`, and delete the obsolete `bartenders` / `securityLevel`
   fields.
3. The migrated roster's salaries sum to a sane fixed cost, so the **bankruptcy
   guard** (`runNight` blocks unaffordable nights) and **shop reserve**
   (`MIN_NIGHT_COST`) continue to work; `MIN_NIGHT_COST` is redefined as the
   cheapest viable roster's wage (one bartender), still affordable + profitable.

A `persistence.test.ts` asserts a hand-crafted v1 blob migrates to a valid,
playable v2 club with a non-empty roster and a valid `lastConfig`.

## F. Phase 2A tests required before sign-off

1. **Staff aggregation** — service & security derive correctly from on-duty
   skill; availability (no-show) reduces contribution deterministically per seed.
2. **Baseline identity point** — Regular Night + starting roster reproduces the
   pre-Phase-2 resolver outputs for equivalent inputs.
3. **Starting roster equals current balance** — opening night profitable with
   the default roster; numbers match the MVP baseline.
4. **Save migration v1 → v2** — old blob migrates to a playable club.
5. **Bankruptcy guard uses staff salaries** — can't open a night whose on-duty
   wages exceed cash.
6. **Shop reserve uses staff salaries** — `MIN_NIGHT_COST` reflects the cheapest
   viable roster; purchases can't breach it.
7. **Cannot schedule unemployed staff** — `staffOnDuty` must be a subset of the
   roster.
8. **Cannot schedule duplicate staff** — `staffOnDuty` ids are unique.
9. **Cannot fire on-duty staff without safe handling** — firing strips the id
   from any saved `staffOnDuty`; firing is blocked if it would leave the roster
   unable to field the cheapest viable (≥1 bartender) night.
10. **First-10-night balance invariants still pass** — the rewritten
    `early-game balance` suite (now expressed via rosters) holds.
11. **Regular Night remains identity-neutral** — `eventId: "regular"` applies no
    modifiers.

## G. Phase 2A implementation sequence (completed)

1. Types + `balance.ts` constants (`BASELINE_SKILL`, staff scaling, bouncer→mod
   map, theft/reliability params); change `DayConfig`, add `staff` to
   `ClubState`, redefine `nightFixedCosts` / `MIN_NIGHT_COST`.
2. `domain/staff.ts` — `StaffMember` helpers, `aggregateOnDuty`, `STARTING_ROSTER`,
   `CANDIDATE_POOL`, trait effects. **Tests first** (`staff.test.ts`).
3. `sim/night.ts` — swap abstract levers for staff aggregates; theft + no-shows;
   new `NightResult` fields. Keep `eventId` a no-op.
4. `save/persistence.ts` — `SCHEMA_VERSION → 2`, `createNewClub` seeds roster,
   `migrate` v1→v2. **Migration tests.**
5. `state/store.ts` — wages from on-duty salaries; `hireStaff` / `fireStaff` /
   scheduling validation; guards. **Store/guard tests.**
6. UI: `day-prep.tsx` (roster toggles replace stepper/security), `results.tsx`
   (theft/no-show lines), new `app/staff.tsx` + `/staff` route in `_layout.tsx`,
   Staff button on `dashboard.tsx`.
7. Rewrite `early-game balance` tests to the new config; re-run the throwaway
   sim harness; confirm §D invariants. Update docs.

---

# PHASE 2B — Events (IMPLEMENTED)

Shipped the static event catalog (`src/domain/events.ts`), the Day Prep event
picker, the resolver modifier vector, event result lines, and tests. The **DJ
role was NOT shipped** — it stays deferred behind the baseline-neutral gate
(roadmap). Implemented with the three-gate model:
- **Unlock** — reputation tier OR tutorial milestone only (`unlockedEvents`).
- **Requirement** — reserve-aware affordability; the only hard block.
- **Readiness** — advisory only, never blocks (`eventReadiness`).

Events: Quiet Night (`regular`, identity), Private Party, Student Night, Grand
Opening / Re-Launch, Industry Night. Happy Hour deferred. No save migration was
needed (gates derive from `ClubState`; `eventId` default stays `regular`). See
docs/economy.md (Phase 2B) and decision-log #0010.

Original plan (kept for reference):

Event catalog (2B):
- Regular Night (identity baseline — already present as the 2A placeholder)
- Student Night
- Hip-Hop Night
- Techno Night
- VIP Birthday
- Local Influencer Night

Each event (2B only) may carry: guest draw modifier, drink spend modifier, risk
modifier, reputation modifier, preferred music style, staff pressure notes.
"Staff pressure" is emergent (a high draw raises crowd pressure) plus advisory
text — not a separate mechanic. Phase 2B widens `eventId` from the literal
`'regular'` to the full union; no save migration is required because the field
already exists from 2A.

---

## H. Safety & tone

- No real-world illegal instructions, ever.
- No real celebrity names (use fictional archetypes).
- Risky nightlife mechanics are represented strictly as **fictional business
  risk, compliance risk, reputation risk, or satirical management pressure**
  (e.g. theft as shrinkage, a dishonest bouncer as "cut corners", relaxed
  smoking as a compliance gamble). Never instructional.

## I. Open risks & design questions

- **R1 — Bouncer salary calibration.** Uniform bouncer salaries can't exactly
  match the old non-uniform security tier costs ($100 / +$120 / +$160). The
  *default* identity (1 bouncer = level 1 = $100, mod 1.0) is preserved; higher
  tiers via hiring may be slightly cheaper/dearer and must be re-tuned so the
  "balanced" path doesn't trivially dominate. Resolved during §F re-verification.
- **R2 — New degree of freedom: zero bouncers.** Players can now deschedule all
  bouncers to save cash (old game forced `securityLevel ≥ 1`). This is allowed
  but riskier (`securityMod` worse than 1.0). Confirms as intended risk/reward;
  verify it isn't a dominant cheese on quiet nights.
- **R3 — Theft/no-show variance vs determinism.** Both use the existing seeded
  RNG (seed = day + cash), so play stays deterministic. Confirm the added RNG
  draws don't destabilize the locked early-game seeds (may require ordering the
  new draws after existing ones to minimize churn).
- **R4 — Roster size & Day-Prep UI.** Scheduling is per-member toggles; a large
  roster could clutter Day Prep. 2A keeps the starting roster + pool small;
  revisit a compact/grouped control if rosters grow.
- **Q1 — Hidden trait reveal.** When/how is `hiddenTrait` revealed to the player
  (after N nights? via a result note?)? Proposed: surfaced through result notes
  when it first matters; final UX decided at implementation.
