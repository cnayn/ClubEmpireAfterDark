# Gameplay North Star

> **Source of truth** for the *feel* and the *guardrails*. Google Docs is the
> draft space; this repo is canon. See `content-intake-rules.md`.
>
> **This file is documentation only.** Nothing here is a build ticket.

## What the game is

**Club Empire: After Dark** — a **Neon Noir nightclub life-management tycoon**,
inspired by the *emotional feel* of Nightclub City but deeper, darker, original,
and **offline-first** (React Native + Expo, local save, no backend).

It is **not only** a nightclub management game. It is a game about **a group of
people trying to build a nightlife empire together.** The difference maker is not
money, upgrades, or events alone — it is the **friend group, staff chemistry,
relationship pressure, and the owner caught between chaos and discipline.**

## Core feeling (the north star)

> "I own this place. These are my people. The room reacts to my choices.
> One more night gets me closer to the empire."

Pillars every feature should serve at least one of:
- **Ownership** — this is *my* club, *my* crew.
- **People** — staff/crowd feel like characters, not stat rows.
- **Reactivity** — the room visibly responds to my decisions.
- **Momentum** — one more night, one step closer to the empire.

## It should feel like a living nightclub, not an Excel sheet

Players should remember **people and moments**, e.g.:
- "I should have listened to Elfen."
- "Ayan talked me into it again."
- "John nearly got us fined."
- "Caramel saved the night."

## Core emotional spine — Party Side / Empire Side

The owner is caught between two internal forces:

- **Party Side / Ayan** — chaos, hype, ambition, music, legendary nights, event
  madness, risk, afterparty culture, crowd attraction.
- **Empire Side / Kerem** — discipline, structure, survival, financial control,
  staff development, reputation stability, long-term planning.

A club with **only Ayan** becomes exciting but unstable.
A club with **only Kerem** becomes stable but boring.
**The best club needs both.**

### The strongest theme

> Can you build a nightclub empire without letting your hunger for legendary
> nights destroy the system holding it together?

### Not moralistic

Party is not bad. Discipline is not boring. Chaos can create magic; structure can
protect magic. The best club uses both.

## Current build (active today)

- Day prep → night sim → results → upgrades → grow reputation loop.
- Named staff: **Bartender**, **Bouncer** only.
- Events as deterministic modifier vectors (see `event-bible.md`).
- One live-night intervention per night (Bar Pressure priority, else DJ Cooling).
- Goal Board (multi-goal) + bottom-tab navigation.
- Static **character profiles** for current-role staff (flavor metadata only).

## Owner Internal Meter — **FUTURE SYSTEM / DO NOT BUILD YET**

Working name: **Party / Empire** (alternatives considered: Chaos/Structure,
Hype/Control, Night/Empire, Ayan/Kerem). Sketch of intended unlocks (future only):
- **Party side:** bigger event concepts, higher crowd hype, social buzz, more
  creative staff, wild guest moments, higher risk/reward events.
- **Empire side:** better scheduling, staff training, financial control, cleaner
  debriefs, risk prevention, reputation stability, operational upgrades.
- **Balanced:** legendary *and* sustainable identity, high loyalty, strong energy
  without collapse — the best long-term empire ending.

Not implemented. No meter, no party/empire scoring, no unlock gating from it.

## Explicitly NOT active (future systems — do not implement from notes)

Party/Empire meter · loyalty · hidden-trait reveal · friendship/affinity ·
relationship simulation · storyline/quests · tutorial dialogue · policies · future
staff roles (DJ, Waiter, Cleaner, Maintenance, Host, Promoter, Security Lead,
Floor Manager, Operations Manager) · stock/bottle ordering · dancers · furniture
placement · animated guests · live free-interaction architecture.

## Design law (legibility before depth)

1. **Legibility before depth** — the player understands *why* before we add more.
2. **Depend only on what exists** — no feature relies on an unbuilt system.
3. **The reckoning ships before the reward.**
4. **Determinism** — same seed + prep + choice ⇒ same result; no hidden RNG.

## Team / context canon (real-world contributors — NOT gameplay)

> Documented for shared context. This is about the people building the game, not
> in-game characters. (Note: the in-game **Ayan** DJ character shares a name with
> the contributor below — they are different things.)

- **Ayan — Creative Director / Technical Lead.** Core game vision, Claude Code
  integration, systems design, economy, progression, architecture, GitHub/repo.
  *Building the machine.*
- **Ultan — Narrative Director / World Builder.** Staff personalities, club
  culture, storyline, dialogue, event writing, lore, character relationships —
  *the soul of the club.* *Building the people inside the machine.*

### Narrative principle (from Ultan)

> Don't only write character bios. **Write character relationships.** Bios are
> useful, but **relationship events are gameplay.** Take two characters, add
> pressure, force a decision — that creates emergent nightclub stories without a
> giant scripted campaign. (See `relationship-web.md`.)

## Template — adding a feeling/pillar idea

```
### <Idea>
- Tag: CURRENT BUILD | FUTURE SYSTEM | DO NOT BUILD YET
- North-star pillar: ownership | people | reactivity | momentum
- Party vs Empire lean:
- Smallest legible version:
- Depends on (must already exist):
```
