# Event Bible

> **Source of truth** for night events. Active events live in code
> (`src/domain/events.ts`) as **deterministic modifier vectors** — never
> self-contained payoffs. This file is canon for what each event *means* and a
> template for future ones. **Documentation only.** See `content-intake-rules.md`.

## What an event is (design law)

An event re-weights a night through a small vector of modifiers; it adds no new
RNG and is not a standalone reward. Quiet Night is the identity-neutral baseline
(all modifiers neutral) — the determinism anchor.

Three gates govern availability (derived in `src/domain/events.ts`):
- **Unlock** — reputation tier / progress milestone.
- **Requirement** — reserve-aware affordability.
- **Readiness** — advisory ("are you set up to pull this off well?").

## Event template

```
### <Event name>
- Tag: CURRENT BUILD | FUTURE SYSTEM | DO NOT BUILD YET
- id (if active):
- Fantasy (one line):
- Unlock / Cost / Booking fee:
- Modifier vector: draw × | spend × | risk + | repMod + | repAmplify ×
- Readiness advice:
- Risk / reckoning (what can go wrong):
```

## Active events (current build — in code)

| Name | id | Feel | Notes |
| --- | --- | --- | --- |
| **Quiet Night** | `regular` | Identity-neutral baseline | All modifiers neutral; determinism anchor. |
| **Private Party** | `private-party` | Booked, guaranteed money | Booking fee is **conditional on execution** (service/incidents/no-shows/theft can dock it). |
| **Student Night** | `student-night` | Rowdy, high volume | Cheaper crowd, more pressure on door/bar. |
| **Grand Opening / Re-Launch** | `grand-opening` | Spotlight | Amplifies the **whole** reputation swing — wins and losses. |
| **Industry Night** | `industry-night` | Sharp, tastemaker crowd | Reputation-leaning; reputation-tier gated. |

> Exact numeric vectors live in `src/domain/events.ts` (code is canon for the
> numbers; this file is canon for the *intent*). Keep them in sync when tuning.

## Live-night moments (current build)

One intervention per night, by priority (`src/lib/intervention.ts`):
- **Bar Pressure** (priority) — bar backing up; Pull a bouncer / Happy-hour promo
  / Ride it out.
- **DJ Cooling** (else) — room cooling; Push the DJ / Send them to the bar / Ride
  it out.
- Else: no moment. "Ride it out" is always identity (no modifier).

> "Both interventions in one night" is a **future** lever — not active.

## FUTURE event classes (docs only — DO NOT BUILD YET)

### Relationship events — Phase 4 (Relationship & Interaction Layer)
Per the narrative principle, **relationship events are gameplay** (two characters
+ pressure + a forced decision). These belong to the **Phase 4 — Relationship &
Interaction Layer** (full canon, dependency chain, and core rules in
`relationship-web.md`). They are authored there using the relationship-event
format and become real events only after Phase 4's dependency chain is satisfied
(visible staff identity, crew impact on outcomes, more roles, a stronger
event/intervention framework, a hidden-trait/staff-memory substitute, and enough
recurring characters). **Implementation status: FUTURE SYSTEM / DO NOT BUILD YET.**

### Owner-meter-gated events (Party / Empire)
Future events whose availability/outcome leans on the Party/Empire meter
(`gameplay-north-star.md`): bigger/wilder concepts on the Party side, controlled
operational events on the Empire side. **Not implemented** — there is no meter.

### Future-role events
Events that depend on future roles (DJ residencies/guest DJs, promoter guest
lists, host/VIP lounge nights). Park here using the template; do not add events
that depend on unbuilt roles or systems.

_(no future events promoted to code — all of the above are FUTURE / DO NOT BUILD YET)_

## Caramel Progression Event Chain

Implementation Status: Future system / do not build yet.  
Required Systems: Loyalty, staff trust, relationship events, staff warnings, possible security lead upgrade.

> **Single source for Caramel's arc.** His identity lives in
> `character-bible.md` (current role: **Senior Bouncer**); the Owner + Caramel
> relationship event lives in `relationship-web.md`. This chain is the canonical
> home for his **future** progression (Senior Bouncer → Trusted Protector →
> Security Lead / Operations Right Hand). Caramel is **one character**, not two.

### Event Chain Purpose

Caramel’s future progression should turn him from a strong senior bouncer into a trusted protector and eventually a Security Lead / Operations Right Hand.

This should not be automatic.

The player should earn it by treating him with respect, scheduling him intelligently, paying him fairly, trusting his warnings, and not using him as disposable muscle.

### Stage 1 — Senior Bouncer

Current Role: Active bouncer candidate.

Caramel works the door and protects the club during risky nights.

Possible event hooks:

- Door pressure rises.
- John is close to escalating a guest problem.
- Staff feel unsafe.
- A risky crowd enters the club.

Possible Caramel bubble:

> “Boss, this one smells like trouble.”

### Stage 2 — Trusted Protector

Future Unlock Condition: High loyalty / repeated good treatment.

Caramel begins to act beyond basic bouncer duty.

Possible event hooks:

- He warns about a bad staff combination.
- He tells the owner John is too heated tonight.
- He notices staff morale dropping.
- He covers a missing shift.
- He gives advice before a risky event.

Possible Caramel bubble:

> “Bro, I got the door. But you need to fix the inside.”

### Stage 3 — Security Lead / Operations Right Hand

Future Unlock Condition: High loyalty plus possible upgrade/promotion system.

Caramel becomes a deeper operational asset.

Possible effects:

- Trains weaker bouncers.
- Reduces door mistakes.
- Gives pre-night security warnings.
- Helps manage risky events.
- Can prevent one staff drama event from escalating.

Possible Caramel bubble:

> “Big night is good bro, but we need control.”

### Failure Path

If treated badly, Caramel does not explode dramatically.

He becomes distant.

Possible signs:

- Stops giving warnings.
- Does only the job.
- Refuses to help weaker staff.
- No longer covers weak points.
- Eventually leaves quietly.

Possible line:

> “I did my shift, boss.”

### Design Rule

Caramel’s arc should not be a simple stat upgrade.

It should feel like the player earned the trust of someone who started at the door and slowly became part of the empire.

