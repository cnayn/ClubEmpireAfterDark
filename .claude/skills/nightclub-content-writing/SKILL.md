---
name: nightclub-content-writing
description: Use when writing player-facing flavor text for Club Empire After Dark — manager debrief notes, staff bios, hidden-trait reveals, social-review snippets, inspection warnings, door-line flavor, and result tags. Keeps copy stylish, dark, satirical, concise, and tied to real sim causes.
---

# Nightclub Content Writing

Voice: **neon-noir, knowing, a little satirical** — a club manager's morning
debrief, not marketing copy. Short. Every line earns its place.

## The golden rule

**Every line is caused by something the simulation actually computed.** Tie copy
to a real cause; never invent outcomes the sim didn't produce. Causes you can lean
on (from `src/sim/night.ts` / staff): guests vs capacity, `serviceRatio`,
incidents, `theft`, `noShows`, compliance fines, `crowdPressure`, reputation tier,
VIP satisfaction, regular loyalty, net result, a revealed `hiddenTrait`.

## Content types

- **Manager debrief / result notes** (`ResultNote`): 1 line, says *why*
  ("Bar couldn't keep up past midnight — drinks went unpoured").
- **Result tags / WMT lines:** terse headline reads of the night (e.g. "PACKED",
  "RAN AT A LOSS", "SKIMMED").
- **Staff bios** (`description`): one wry line hinting at the visible trait,
  never spelling out hidden stats.
- **Hidden-trait reveals:** the moment a hidden trait first bites ("Cash went
  missing behind the bar — turns out Vince has sticky fingers").
- **Social-review snippets / door-line flavor / inspection warnings:** short,
  in-world, reactive to the night.

## Style rules

- Concise: one sentence, ideally under ~90 chars for notes.
- Specific over generic; name the cause, not a vague mood.
- Match `ResultNote.tone` (good/bad/warn/info) — color carries meaning.
- Fictional only. No real people, brands, or venues.

## When to use

- Writing or revising any player-facing string, note, tag, or bio.

## When NOT to use

- Designing the mechanic itself (use the staff/scope skills), or balance numbers
  (use nightclub-economy-balancing).

## Hard boundaries

- Stay within nightclub-safety-framing: dark/satirical, never instructional, no
  glamorized violence, risky behavior framed as exposure/consequence.
- Do not reveal hidden stats or hidden traits except through the designed reveal
  moment.
- Do not promise mechanics that don't exist (no events/DJ/VIP copy in Phase 2A).
