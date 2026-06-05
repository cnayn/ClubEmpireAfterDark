# Random Events & Character Interactions (Bank)

> **Status: FUTURE / DO NOT BUILD YET.**
>
> This file is a **content bank** — situations, character reactions, and
> player-decision pieces designed to fuel a future **night-encounter system**
> that does not exist today. The bank is structured as an **engine** —
> *situation × reacting characters × forced decision* — not as a fixed list
> of scripts. A fixed list of five events gets stale; an engine of
> situations crossed with character voices stays fresh.
>
> Nothing here is wired into the sim. Nothing here is a build ticket. The
> framework lands first; this content fills it.

---

## Why this file exists

The current night-loop is **too quiet.** A player preps the club, runs the
night, sees the result — usually with at most one mid-night intervention
(Bar Pressure → DJ Cooling, via `src/lib/intervention.ts`). The room
doesn't feel alive *during* the night. It feels like a calculation that
finishes.

The fix is a **mid-night encounter layer** — situations that interrupt the
night, present characters reacting in their own voices, and force the
owner to choose. This file banks the raw material.

**Design principle (from `relationship-web.md`):** *pressure, not biography.*
> Bad: "John is aggressive."
> Better: "John is aggressive, and when the door bottlenecks, John gets
> impatient and may create a complaint unless the owner steps in."

Every beat below is a pressure moment, not a lore dump.

---

## Companion canon (read these first)

- `gameplay-north-star.md` — feel, pillars, Party/Empire spine.
- `story-bible.md` — tone, world facts, Neon Noir mood.
- `character-bible.md` — who each character is; **role status** (ACTIVE in
  code vs FUTURE / DO NOT BUILD YET).
- `relationship-web.md` — Phase 4 Relationship & Interaction Layer; the
  affinity matrix and relationship-event format. **The engine that drives
  reactions in this file.**
- `event-bible.md` — active night-level events (modifier vectors) + future
  Phase 3 event upgrade + St. Patrick's Day "Important Guest" canon.
- `content-intake-rules.md` — promotion pipeline (docs → code).
- `docs/roadmap.md` — Phase 3 / Phase 4 ordering; this file lives behind
  both gates.

### Companion content banks (split by surface)

This file is the **engine** (Layer A × B × C, sim signals, effect
vocabulary, authoring rules). The raw content pool is split by surface so
authors can pick a surface and write without context-switching:

- [`night-encounters.md`](night-encounters.md) — **on-floor** pressure
  moments: door tension, bar backlog, bathroom complaints, DJ/music dip,
  guest special-treatment asks, staff warnings, regular complaints,
  smoking-policy situations, ID issues, furniture complaints, rough-crowd
  moments.
- [`phone-messages.md`](phone-messages.md) — **off-floor** beats delivered
  by phone: crew texts, venue booking inquiries, supplier offers,
  inspection / sweep rumors.

Both banks use a player-facing format (`Status / Trigger / Location /
Characters / Situation / Dialogue / Player Choices / Outcome Direction /
Visual Cue / Implementation Note`). The compact engine-format examples
below in **Banked situations** are the build-time format that the
encounter framework would consume; the split files are the author-time
format that creative writers reach for. Both feed the same future system.

---

## Hard scope rules

This bank is gated by **all of the following** dependencies, none of which
exist today:

1. The full **Phase 4 Relationship & Interaction Layer** dependency chain
   from `relationship-web.md` (visible staff identity, crew impact, more
   roles, stronger event framework, hidden-trait or memory substitute,
   recurring cast).
2. A **night-encounter system** that can: (a) detect a triggering state
   mid-night, (b) overlay UI to present a choice without breaking the
   night flow, (c) apply a **bounded modifier** to the rest of the night,
   (d) surface the outcome in the morning debrief.
3. For beats with future characters: those characters' **roles** must
   exist as active roles in code (DJ for Ayan, Host for Janer, recurring
   patron for Elfen, advisor for Kerem).

Today's closest kin in code: `src/lib/intervention.ts` (one intervention
per night, priority-ordered, three choices). The encounter system here is
the **superset** that grows from it — not a replacement.

Until those gates exist, **this is canon-only.** Do not promote
individual beats one at a time. Framework first; beats fill it.

> **Future implementation note (for whoever builds the system later):** a
> minimal v1 encounter framework would (a) reuse the existing `NightMoment`
> shape from `intervention.ts`, (b) raise the cap to 1–3 encounters per
> night with cooldown spacing, (c) let beats carry a *cast list* whose
> members must be on-duty / present-tonight for the beat to fire, (d)
> apply bounded modifiers (no flat numbers — multipliers and clamps like
> the existing event-vector system), (e) write a single morning-debrief
> line per encounter resolved. No new RNG sources; same seed in,
> same encounter out. Do not build until scoped.

---

## Tone discipline (non-negotiable)

Per `gameplay-north-star.md`, `story-bible.md`, and
`nightclub-safety-framing`:

- **Neon Noir** — glamorous on the surface, consequence underneath.
  Stylish, satirical, dark, never edgelord.
- **Original IP** — no real brands, no real DJs, no real celebrities, no
  real venues. Reference *archetypes* (a luxury-brand guy, a marquee DJ),
  not names.
- **No graphic violence.** Door incidents are *managerial drama* — a
  warning, a complaint, a fine, a reputation hit, a staff member who
  walks. **No player-on-staff harm. Ever.** No fights described in
  combat detail.
- **No sexual content.** Flirtation is texture; mechanics are not.
- **Bad behavior** (theft, escalation, bias) is handled as **management
  consequence** — fire them, lose trust, lose regulars — not
  instruction.
- **Risky systems** stay abstract (compliance check, smoking policy,
  guest behavior) — mechanics, not methods.

If a beat can be rewritten to be safer without losing its sting, rewrite
it. The sting comes from **pressure and consequence**, not from shock.

---

## Detectable sim states (today's signals)

Every banked beat below maps to a **real signal the sim already computes**
where possible. This keeps content authorable now and buildable later
without new RNG sources.

| Signal | Source | Rough threshold (for authoring) |
| --- | --- | --- |
| `serviceRatio` (bar can't keep up) | `src/sim/night.ts` | `< 0.8` AND fill `≥ 0.5` (current `isBarPressureNight`, `BAR_SERVICE` / `BAR_MIN_FILL` in `intervention.ts`) |
| `serviceHeadroom` (bar overstaffed) | `src/sim/night.ts` | `> 0.3` — crew has slack |
| `crowdPressure` / fill | `src/sim/night.ts` | `≥ 0.9` door strain · `≥ 1.0` capacity hit |
| Cooling night | `intervention.ts` | loyalty `< 52` AND fill `< 0.4` |
| Incident spike | `src/sim/night.ts` | `incidents ≥ 2` |
| Compliance fine | `src/sim/night.ts` | smoking `relaxed` AND fine triggered |
| Theft revealed | `resolveTheft` | any `theft > 0` |
| Crowd-mix skew | `src/domain/crowd.ts` | dominant segment > 50% — segments: **Locals, Students, Music Heads, VIP-Curious, Rough Crowd, Regulars** |
| Reputation tier crossed | `clubState.reputation` | crossing a tier boundary that gates content |
| VIP focus under pressure | `night.ts` | `vipFocus` AND `crowdPressure ≥ 0.85` |
| Event modifier active | `getEvent(config.eventId)` | non-`regular` event tonight |
| Staff no-show | `aggregateOnDuty` | `crew.noShows ≥ 1` |
| Boss action just taken | `src/lib/bossActions.ts` | `push-dj` · `check-bar` · `send-bouncer` · `work-room` — encounters can hook off these |
| Hidden-trait misfire (future) | not built | e.g. John "Chip on Shoulder" trips on incident; Vince "Sticky Fingers" trips on theft |

Authors: **prefer a signal that already exists.** If a beat needs a signal
that doesn't, tag it `NEEDS SIGNAL: <description>` honestly. That way the
encounter system roadmap knows what would have to be added before the
beat is buildable.

---

## Engine pieces

The bank is built from three composable layers. Authors write **each layer
separately**, and beats are *compositions* of one layer-A situation × N
layer-B character reactions × one layer-C choice set.

### Layer A — Situations (the pressure)

A short, sim-detectable pressure moment. No characters baked in yet.
Examples below; add more freely.

### Layer B — Character reactions (the voice)

Per character: **stance** + **one-line voice in their voice**. A character
reaction is *attached* to a situation, not authored inline. The same
character can have different reactions to different situations. The
affinity matrix in `relationship-web.md` shapes who reacts how to whom.

### Layer C — Player choices (the decision)

2–3 real options per beat, each a **genuine tradeoff** — no obvious right
answer. Effects are **bounded and abstract** (vocabulary below). The
player decides, the rest of the night absorbs the modifier.

### Effect vocabulary (bounded, abstract — no flat numbers)

- **Stance shift** — Party-side vs Empire-side nudge (per
  `gameplay-north-star` meter, when meter exists).
- **Reputation nudge** — small ± in the direction that fits the choice.
- **Vibe shift** — room energy this night only.
- **Morale shift** — a named staff member or the room.
- **Risk shift** — incident chance ± for the rest of the night.
- **Money cost / gain** — comp, fine, tip — small unless the beat is anchored.
- **Service-headroom buy** — spend reserve/time to relieve bar pressure.
- **Crowd-memory mark** — a fairness moment future regulars / future
  rep system "remembers" (cf. St. Patrick's Day Important Guest).
- **Hidden-trait surface** — a locked trait briefly leaks (never a number).
- **Relationship-pair tension or earn** — push a [[pair]] toward clash
  or trust without revealing a number.

If a beat needs an effect that isn't in this vocabulary, write it but
flag it — the encounter framework would have to grow to support it.

---

## Banked random-event format

```
### <Beat name>
- Tag: FUTURE / DO NOT BUILD YET
- Trigger (sim state): <signal + threshold>  |  NEEDS SIGNAL: <description>
- Cast present:
    Current-role: <Owner + active characters>
    Future: <future characters who would also speak>
- Beat in one line: <what the player sees / who interrupts>
- Player choices (2–3): <A> / <B> / <C>
- Bounded effects:
    <choice A>: <effect from vocabulary>
    <choice B>: ...
    <choice C>: ...
- Character reactions:
    <Character> [stance: pushes/resists/cautions/wavers/observes/offers]
      "<voice line>"
- Relationship hooks: <[[pair]] from relationship-web.md matrix>
- Cross-refs: <event-bible.md / character-bible.md entries>
```

---

## Banked situations (Layer A × B × C compositions)

### Bar Backs Up Hard
- Tag: FUTURE / DO NOT BUILD YET
- Trigger (sim state): `serviceRatio < 0.8` AND fill `≥ 0.5` (current
  `isBarPressureNight`).
- Cast present:
    Current-role: Owner, Rosa (or Milo / Jin if she's not on), Caramel.
    Future: Ayan, Elfen.
- Beat in one line: A bartender flags down the owner — three deep at the
  rail, tickets piling, two regulars already looking elsewhere.
- Player choices: **Pull a bouncer to back-bar** / **Cut a happy-hour
  line on the fly** / **Ride it out**.
- Bounded effects:
    Pull bouncer: bar recovers · door risk shifts up · Caramel notes.
    Happy hour: bar eases over time · margin nudge down · Ayan likes it.
    Ride out: nothing bought · vibe shifts down · reputation small ding
      if it stays bad.
- Character reactions:
    Rosa [cautions] "Boss. Six tickets in, two of them annoyed."
    Milo [observes] "I can hold. I can't catch up."
    Caramel [resists] "Pull me and the door eats it. Your call, bro."
    Ayan (future) [pushes promo] "Throw a happy hour, the room'll
      forgive anything."
    Elfen (future) [observes] "People remember waiting longer than they
      remember a cheap drink."
- Relationship hooks: [[ayan-caramel]] (push vs hold);
  [[owner-rosa]] (regulars trust).
- Cross-refs: `event-bible.md` → Bar Pressure intervention (today's beat
  this sits on top of); `character-bible.md` → Caramel, Rosa.

### Dance Floor Goes Cold
- Tag: FUTURE / DO NOT BUILD YET
- Trigger (sim state): cooling-night condition — loyalty `< 52` AND fill
  `< 0.4` (current `isCoolingNight`).
- Cast present:
    Current-role: Owner.
    Future: Ayan (DJ), Janer (host), Elfen.
- Beat in one line: Room's flat. A booth empties. Nobody's dancing.
- Player choices: **Push the DJ (boss action: `push-dj`)** / **Pull the
  DJ to the bar runner role** / **Ride it out**.
- Bounded effects:
    Push DJ: vibe lifts · risk shifts up if Ayan overcommits ·
      hidden trait may surface.
    Pull DJ: small bar relief · Ayan stance hardens against you.
    Ride out: cooling continues · Elfen flags it.
- Character reactions:
    Ayan (future) [pushes] "Give me ten minutes, bro. This room is
      sleeping."
    Janer (future) [wavers] "Either's fine. Actually — wait. Both?"
    Elfen (future) [observes] "It's not the music. Nobody believes
      they're at the right place tonight."
- Relationship hooks: [[ayan-janer]] (energy + indecision);
  [[ayan-elfen]] (sensible vs hype).
- Cross-refs: `event-bible.md` → DJ Cooling intervention; boss action
  `push-dj` in `bossActions.ts`.

### Door Boils Over
- Tag: FUTURE / DO NOT BUILD YET
- Trigger (sim state): `crowdPressure ≥ 0.9` AND a queued bouncer
  escalation. NEEDS SIGNAL: today's incidents resolve post-night;
  surfacing one mid-night is a future hook.
- Cast present:
    Current-role: Owner, John, Caramel.
    Future: Janer.
- Beat in one line: John has a guest by the collar near the door.
  Witnesses, phones out, a complaint already forming.
- Player choices: **Back John publicly** / **Correct John publicly** /
  **Back him now, review later**.
- Bounded effects:
    Back publicly: John morale holds · Caramel disapproves ·
      crowd-memory mark *negative* on fairness · risk lifts.
    Correct publicly: John morale dips · Chip-on-Shoulder may surface
      next night · crowd-memory mark *positive* on fairness.
    Back-then-review: small reputation ding · staff trust intact ·
      Caramel earns toward Stage 2.
- Character reactions:
    John [pushes] "He deserved it. End of."
    Caramel [cautions] "That's not the point, bro. We don't need
      another complaint."
    Janer (future) [wavers] "Technically both are—"
    Owner internal: *not now Janer.*
- Relationship hooks: [[caramel-john]];
  [[ayan-john]] (only if Ayan is on-floor).
- Cross-refs: `relationship-web.md` → "Caramel + John — the aggressive
  ejection"; `character-bible.md` → John (Chip on Shoulder), Caramel
  (Stage 2 hooks in `event-bible.md`).

### Compliance Knock
- Tag: FUTURE / DO NOT BUILD YET
- Trigger (sim state): smoking `relaxed` AND a compliance check fires
  (today: a fine; future: an inspector at the door mid-night).
- Cast present:
    Current-role: Owner, Caramel.
    Future: Elfen.
- Beat in one line: Someone polite is at the door with a clipboard and
  good lighting. Not smiling.
- Player choices: **Tighten on the spot** / **Talk our way through** /
  **Pay and move on**.
- Bounded effects:
    Tighten: smoking flips to standard mid-night · draw nudge down ·
      risk drops sharply · Caramel approves.
    Talk through: reserve cost · reputation hold · risk holds ·
      relationship earn with Caramel if he's involved.
    Pay: cash hit · Caramel stance hardens · reputation nudge down ·
      next compliance check more likely.
- Character reactions:
    Caramel [cautions] "Boss, this is the kind of thing that follows us."
    Elfen (future) [observes] "You can fix tonight or fix the year.
      Not both."
- Relationship hooks: [[owner-caramel]]; [[owner-elfen]] (future).
- Cross-refs: `event-bible.md` → smoking + fines path; safety framing
  per `nightclub-safety-framing` — kept abstract.

### Theft, Caught Quietly
- Tag: FUTURE / DO NOT BUILD YET
- Trigger (sim state): `theft > 0` AND the responsible bartender has
  hidden Sticky Fingers (Vince today). NEEDS SIGNAL: today, theft
  resolves post-night and is anonymous to the player; surfacing the
  *who* mid-night is a future hook (delayed theft discovery per
  `phase3-realism-and-conduct.md`).
- Cast present:
    Current-role: Owner, the suspected bartender (Vince), Caramel, Rosa.
    Future: Elfen.
- Beat in one line: Caramel pulls the owner aside. Quiet. Phone in hand.
- Player choices: **Confront tonight** / **Pull him quietly** /
  **Pretend you didn't see**.
- Bounded effects:
    Confront: drama on the floor · bar service dips · clean trust ·
      Vince exits the rotation.
    Pull quietly: minor service dip · Caramel earns toward Stage 2 ·
      staff trust holds.
    Pretend: theft continues · Rosa quietly stops trusting you ·
      reputation rots slowly.
- Character reactions:
    Caramel [cautions] "Bro, I'm not making it up. Watch."
    Rosa [observes] "I had a feeling. I hate that I had a feeling."
    Vince [resists, if confronted] "Boss, c'mon. Slow night, that's all."
- Relationship hooks: [[owner-caramel]];
  [[rosa-bartender-line]] (regulars' trust in the bar).
- Cross-refs: `character-bible.md` → Vince (Sticky Fingers, inactive),
  Caramel arc; `event-bible.md` → Caramel Stage 2.

### The Crowd Isn't Ours Tonight
- Tag: FUTURE / DO NOT BUILD YET
- Trigger (sim state): crowd-mix skewed — one segment > 50% AND
  mismatched to the night's music / event (e.g. Industry-leaning music,
  Students dominant).
- Cast present:
    Current-role: Owner.
    Future: Ayan, Elfen, Janer.
- Beat in one line: Half the floor is here for something we're not
  playing tonight.
- Player choices: **Lean into the music we promised** / **Bend the set
  to the room** / **Open a side zone (future venue mod)**.
- Bounded effects:
    Lean in: identity holds · short-term draw nudge down · loyal
      segment vibe up.
    Bend: short-term vibe up · Ayan stance hardens against you ·
      culture-drift mark (future).
    Side zone: reserve cost · NEEDS venue feature.
- Character reactions:
    Ayan (future) [resists bending] "If we're trance, we're trance.
      Otherwise why are we open?"
    Elfen (future) [observes] "Whoever you play for tonight is who
      shows up next week."
    Janer (future) [wavers] "Two rooms? Maybe? I don't know."
- Relationship hooks: [[ayan-elfen]]; [[ayan-kerem]] (identity drift,
  future).
- Cross-refs: `gameplay-north-star.md` (Party vs Empire);
  `relationship-web.md` → Ayan + Kerem.

### VIP Pressure on a Packed Night (the repeatable version)
- Tag: FUTURE / DO NOT BUILD YET
- Trigger (sim state): `vipFocus` ON AND `crowdPressure ≥ 0.85`.
- Cast present:
    Current-role: Owner, John, Caramel.
    Future: Ayan, Elfen, Janer.
- Beat in one line: A loud party of six wants the corner banquette.
  Floor is already full. The regulars in that booth aren't moving.
- Player choices: **Clear a table for them** / **Hold the line** /
  **Offer them something off-floor**.
- Bounded effects:
    Clear table: VIP spend lifts · regulars stance hardens ·
      crowd-memory mark *negative* on fairness.
    Hold line: VIP may walk · reputation hold · Caramel approves.
    Off-floor: reserve cost · best path if executed well · earns the
      future Elfen "people noticed that" line.
- Character reactions:
    Ayan (future) [pushes] "Bro look at the spend."
    Caramel [cautions] "And let's not teach the line that money skips it."
    Elfen (future) [observes] "People notice. Not tonight. But they notice."
    Janer (future) [wavers] "Technically importance is subj—"
    Owner internal: *not now Janer.*
- Relationship hooks: [[ayan-caramel]]; [[ayan-elfen]];
  [[owner-elfen]].
- Cross-refs: `event-bible.md` → St. Patrick's "Important Guest" (this
  is the **abstracted, repeatable** sibling of that anchor).

### Staff No-Show, Pre-Open
- Tag: FUTURE / DO NOT BUILD YET
- Trigger (sim state): `crew.noShows ≥ 1` at night start.
- Cast present:
    Current-role: Owner, the showing crew, Caramel.
    Future: Janer.
- Beat in one line: One short. Door in twenty minutes.
- Player choices: **Call in a favor (future reserve / hidden-trait
  surface)** / **Run short and lean** / **Open late**.
- Bounded effects:
    Favor: cost · Caramel Stage-2 unlock progress if Caramel covers ·
      Ride-or-Die surfaces.
    Run short: serviceRatio risk up · staff morale dips ·
      Rosa stance hardens if she has to cover.
    Open late: draw nudge down · reputation small ding · clean execution.
- Character reactions:
    Caramel [cautions, then offers] "Bro. I'll cover the first hour
      if you need me. But this can't keep happening."
    Rosa [observes] "I can hold the rail. I can't be in two places."
    Janer (future) [wavers] "We could wait. Or open. Or — sorry,
      you decide."
- Relationship hooks: [[owner-caramel]] (Caramel arc, Stage 2).
- Cross-refs: `event-bible.md` → Caramel Stage 2;
  `character-bible.md` → Caramel.

### Booked Event Wobbles (Private Party)
- Tag: FUTURE / DO NOT BUILD YET
- Trigger (sim state): `eventId == 'private-party'` AND mid-night
  `serviceRatio < 0.85` (booking-fee at risk per current event vector).
- Cast present:
    Current-role: Owner, the booking client (one-off NPC), Rosa, Caramel.
    Future: Janer.
- Beat in one line: The host of the party wants to talk to the manager.
  Smiling. Not happily.
- Player choices: **Comp the worst tables** / **Speed the bar (pull a
  bouncer)** / **Apologize and hold**.
- Bounded effects:
    Comp: cost · saves booking fee · Rosa stance softens.
    Pull bouncer: booking fee held · door risk up · Caramel notes.
    Hold: booking fee at risk · fallout depends on reputation tier.
- Character reactions:
    Rosa [pushes service fix] "I just need a runner. One runner."
    Caramel [cautions] "Don't strip the door, bro. They booked the
      club, not the curb."
- Relationship hooks: [[caramel-bouncer-line]];
  [[owner-rosa]] (regulars feel the service hit too).
- Cross-refs: `event-bible.md` → Private Party (booking fee is
  conditional on execution); `bossActions.ts` → `check-bar` /
  `send-bouncer`.

### Quiet Night, Loud Conscience
- Tag: FUTURE / DO NOT BUILD YET
- Trigger (sim state): `eventId == 'regular'` AND fill `< 0.5` AND
  reputation trending down across last 3 nights. NEEDS SIGNAL: a 3-night
  trend isn't tracked yet.
- Cast present:
    Current-role: Owner.
    Future: Elfen.
- Beat in one line: A regular sits at the bar with a soda water and
  doesn't open her phone.
- Player choices: **Ask her what she thinks** / **Change the subject** /
  **Tell her about the plan**.
- Bounded effects:
    Ask: a Trusted-Perspective line surfaces (advisory, no number) ·
      morale nudge up.
    Change subject: nothing now · she's quieter next time.
    Tell plan: Elfen stance shifts depending on Party/Empire lean.
- Character reactions:
    Elfen (future) [observes] "You don't have to carry everything
      yourself."
    Elfen (future) (alt) [observes] "The atmosphere feels different
      lately."
- Relationship hooks: [[owner-elfen]] (culture).
- Cross-refs: `character-bible.md` → Elfen (Trusted Perspective);
  `relationship-web.md` → Owner + Elfen.

### Rough Crowd Walks In
- Tag: FUTURE / DO NOT BUILD YET
- Trigger (sim state): `Rough Crowd` segment weight rises sharply (cf.
  `crowd.ts` "spicy" segments).
- Cast present:
    Current-role: Owner, John, Caramel.
    Future: Janer.
- Beat in one line: Six guests at the door, mood already on edge.
- Player choices: **Caramel reads the group, decides at the door** /
  **John takes the call** / **Owner takes the call**.
- Bounded effects:
    Caramel: door risk drops · slight draw drop · Caramel earns trust.
    John: door risk neutral · Chip-on-Shoulder may surface ·
      incident chance lifts.
    Owner: small reputation nudge if handled clean · risk neutral.
- Character reactions:
    Caramel [observes, then decides] "Boss, this one smells like trouble.
      Let me read it."
    John [pushes] "Just point and I'll handle it."
    Caramel [cautions, to John] "Bro. Read first, then handle."
- Relationship hooks: [[caramel-john]];
  [[owner-caramel]] (trusting his read is the Stage-2 path).
- Cross-refs: `character-bible.md` → Caramel (Intimidating Presence),
  John (Fearless / Chip on Shoulder).

### The Boss Was Just on the Floor
- Tag: FUTURE / DO NOT BUILD YET
- Trigger (sim state): boss action `work-room` resolved AND a regular
  recognised the owner. NEEDS SIGNAL: per-guest recognition isn't
  tracked; regular-base flags exist but not per-night.
- Cast present:
    Current-role: Owner, the regular, Rosa.
    Future: Elfen.
- Beat in one line: A regular grabs the owner's sleeve. Wants to know
  what happened to the music last week.
- Player choices: **Hear her out fully** / **Acknowledge and move on** /
  **Make a small promise about next week**.
- Bounded effects:
    Hear out: morale nudge up across regulars segment · Owner-side
      relationship earn · small time cost (boss-action effect dilutes).
    Acknowledge: neutral · Elfen notices if she's there.
    Promise: future reputation lift if kept · risk if not kept
      (NEEDS SIGNAL: promise-tracking).
- Character reactions:
    The regular [observes] "Last week was different. Good different.
      Don't lose that."
    Rosa [observes] "She's been asking. She wasn't going to ask twice."
- Relationship hooks: [[owner-regulars]] (the persistent regular base);
  [[owner-rosa]].
- Cross-refs: `bossActions.ts` → `work-room`;
  `regularBase` in `clubState`.

### A DJ Drops the Set Hard (future)
- Tag: FUTURE / DO NOT BUILD YET — requires DJ role.
- Trigger (sim state): `dj` booked AND vibe peaks above threshold (per
  `dj.ts` effects). NEEDS DJ ROLE.
- Cast present:
    Current-role: Owner.
    Future: Ayan, Elfen, Janer, Caramel (always present).
- Beat in one line: The room lifts. Phones up. The night could be
  remembered — or it could tip.
- Player choices: **Push it further (more capacity, more drinks)** /
  **Hold the peak clean** / **Slow it intentionally**.
- Bounded effects:
    Push: vibe surge · incident risk up · Ayan loves you ·
      Caramel cautions.
    Hold: vibe lifts steady · reputation earn.
    Slow: vibe drop · Ayan stance hardens · safer reckoning.
- Character reactions:
    Ayan (future) [pushes] "Tonight can be normal, or tonight can be
      history."
    Caramel [cautions] "History still needs people to open tomorrow."
    Elfen (future) [observes] "I haven't seen this room like this in
      months."
- Relationship hooks: [[ayan-caramel]] (the central tension);
  [[ayan-elfen]].
- Cross-refs: `relationship-web.md` → "Ayan + Caramel — one more peak
  moment"; future DJ system.

### Janer Can't Decide (future)
- Tag: FUTURE / DO NOT BUILD YET — requires Host role.
- Trigger (sim state): any beat where Janer is on duty AND must choose
  among 3+ options (e.g. seating a walk-in group).
- Cast present:
    Current-role: Owner, John, Caramel.
    Future: Janer, Elfen.
- Beat in one line: Janer freezes at the VIP rope. John's losing
  patience. Floor's looking.
- Player choices: **Let John decide** / **Let Janer decide (eventually)**
  / **Step in yourself**.
- Bounded effects:
    John: fast resolution · risk up · crowd-memory mark on bluntness.
    Janer: slow resolution · small draw drop · Janer relationship earn
      if outcome lands.
    Owner: small reputation lift · staff defer to you more next time.
- Character reactions:
    John [pushes] "Pick. Now."
    Janer (future) [wavers] "I'm thinking."
    John [resists] "You've been thinking ten minutes."
    Janer (future) [wavers] "Exactly."
- Relationship hooks: [[john-janer]] (the bottleneck pair).
- Cross-refs: `relationship-web.md` → "John + Janer — the bottleneck
  decision".

### Ayan Wants One More Hour (future)
- Tag: FUTURE / DO NOT BUILD YET — requires DJ role + closing-time
  decision moment.
- Trigger (sim state): peak vibe near closing.
- Cast present:
    Current-role: Owner, Caramel.
    Future: Ayan, Elfen.
- Beat in one line: Last hour scheduled. Ayan won't take the headphones
  off.
- Player choices: **Let him keep going** / **Cut clean at scheduled
  close** / **Hand him one more song**.
- Bounded effects:
    Keep going: vibe surge · staff overtime cost · Caramel's
      morning-after warning fires.
    Cut clean: small vibe drop · clean reckoning · regulars trust.
    One song: compromise · small vibe lift · low overtime cost.
- Character reactions:
    Ayan (future) [pushes] "One more, bro. The room's not done."
    Caramel [cautions] "Bro, history still needs people to open
      tomorrow."
    Elfen (future) [observes] "He's not lying. Doesn't mean he's right."
- Relationship hooks: [[ayan-caramel]]; [[ayan-elfen]].
- Cross-refs: `relationship-web.md` → "Ayan + Caramel"; future closing
  system.

---

## Hand-scripted special-event anchors (separate)

> **Distinct from the engine bank above.** These are **one-shot,
> story-anchored set-pieces** keyed to a specific milestone, calendar
> moment, or progression threshold. They use the same content shape but
> are **not random** — they fire once when the anchor is hit, and the
> long-form copy lives in the existing canon docs (this section is the
> **index**, not a duplicate).

### Anchor: St. Patrick's Day — The Important Guest
- Where it lives (canonical): `event-bible.md` → "Future Relationship /
  Special Guest Events" (full dialogue) + duplicate Sunday beat in the
  St. Patrick's Week section.
- Trigger: future seasonal calendar — Week 11 Sunday peak.
- Why it's an anchor, not random: the moment is the **whole point** of
  the week's escalation (Monday recovery → Saturday packed → Sunday
  VIP pressure).
- Engine sibling: the repeatable random "VIP Pressure on a Packed Night"
  above is the **abstracted** version of this — the anchor carries the
  named dialogue, the engine carries the recurring pressure.
- Cross-refs: `relationship-web.md` (Phase 4); `event-bible.md`
  (Phase 3 / 4 seasonal).

### Anchor: Caramel — Stage 2 Unlock ("Trusted Protector")
- Where it lives: `event-bible.md` → "Caramel Progression Event Chain".
- Trigger: future loyalty / trust threshold — earned by repeated good
  treatment, paying fairly, trusting his warnings.
- Why it's an anchor: it's a **progression moment** for a single
  character, not a repeatable encounter. Several engine beats above
  (Theft Caught Quietly, Staff No-Show, Door Boils Over, Rough Crowd)
  **feed** the Stage 2 earn-rate.
- Cross-refs: `character-bible.md` → Caramel; `relationship-web.md` →
  Owner + Caramel.

### Anchor: First Real Compliance Hit
- Where it lives: this file (banked stub).
- Trigger: NEEDS SIGNAL — first time a compliance fine exceeds a
  threshold OR first inspection-style event in the calendar.
- Why it's an anchor: the *first* one carries the dialogue weight; the
  recurring version is the engine beat "Compliance Knock" above.
- Bounded effects: introduces the future compliance/policy layer; Elfen
  and Caramel both speak; sets the owner's stance baseline on rules
  going forward.
- Cross-refs: `nightclub-safety-framing` (skill);
  `event-bible.md` → future Club Policies system.

### Anchor: Owner + Elfen — Profit vs Club Culture
- Where it lives (canonical): `relationship-web.md` → "Owner + Elfen —
  profit vs club culture".
- Trigger: future — first profitable but culture-eroding event format
  works *too* well.
- Why it's an anchor: identity-defining choice (double down · protect
  culture · run occasionally).
- Cross-refs: `relationship-web.md`; `gameplay-north-star.md`
  (Party / Empire).

### Anchor: Owner + Caramel — Expand Now Or Wait
- Where it lives (canonical): `relationship-web.md` → "Owner + Caramel
  — expand now or wait".
- Trigger: future expansion / second-venue threshold.
- Why it's an anchor: the **emotional core** of the long arc; fires
  once.
- Cross-refs: `relationship-web.md`; future city-progression layer.

### Anchor: Ayan + Elfen — The Big-Guest Gamble
- Where it lives (canonical): `relationship-web.md` → "Ayan + Elfen —
  the big-guest gamble".
- Trigger: future DJ booking system — first time a marquee booking
  exceeds reserve safety.
- Why it's an anchor: defines the relationship for the rest of the game.
- Cross-refs: `relationship-web.md`; `event-bible.md` → future DJ /
  Theme Party.

### Anchor: First Tier Cross — Local Spot → Rising Name
- Where it lives: this file (banked stub).
- Trigger: reputation crosses the Local Spot → Rising Name boundary for
  the first time.
- Why it's an anchor: it's the **first time the room feels different**
  to the owner — Caramel notices, Rosa notices, regulars notice. Sets
  the tone for the mid-game.
- Cross-refs: `story-bible.md` (reputation tiers);
  `character-bible.md` (Caramel and Rosa voices).

> Add new anchors here as one-line index entries — long-form copy lives
> in the appropriate canon doc (`event-bible.md` or
> `relationship-web.md`) so we don't fork the source of truth.

---

## Authoring rules (when banking new content here)

1. **No new RNG for triggers.** Map to an existing signal in the
   detectable-states table, or tag `NEEDS SIGNAL` honestly.
2. **No flat numbers** in player-choice effects — use the bounded
   vocabulary above. Numbers belong in code; canon stays directional.
3. **Pressure, not biography** (`relationship-web.md`). Every beat is a
   forced decision under pressure. Lore dumps go in `story-bible.md`.
4. **No romance.** Friendship / Affinity ≠ romance ≠ loyalty.
5. **No moralism.** Choices are pressure, not lessons.
6. **Stay in character voice.** Use `character-bible.md` voice notes.
   John barks. Caramel is "bro." Elfen is gentle and direct. Janer
   spirals. Ayan is hype-prophet. Rosa is the regulars' friend.
7. **Respect role status.** Current-role characters can be cast in
   beats meant to fire in the current build (when the framework
   exists). Future characters are clearly marked `(future)` and the
   beat is gated on their role.
8. **Relationship hooks must reference a real pair** from the
   `relationship-web.md` matrix — even if the pair is itself future.
9. **Tone discipline applies to every line.** Neon Noir, satirical,
   original IP, no real brands, no violence detail, no sexual content,
   no player-on-staff harm. Bad behavior is management drama —
   warnings, complaints, firings, fines, walked staff.
10. **Promotion is gated.** Adding a beat here does **not** schedule
    build work. The encounter framework lands first. Beats fill it
    later, in scoped passes, per `content-intake-rules.md`.

---

## Future implementation note (for the encounter framework, when scoped)

When the framework is eventually scoped — **NOT NOW** — here is what
this bank assumes of it. Keep this section as guidance for that future
scoped request; do not build from it.

- **Determinism preserved.** Same seed + same prep + same choice ⇒
  same encounter sequence + same outcome. No new uncontrolled RNG;
  encounter selection is a deterministic function of sim state and
  seed (cf. `gameplay-north-star.md` design law #4).
- **Cap per night.** v1: 1–3 encounters max, with cooldown spacing so a
  night isn't a parade of pop-ups. Beats carry a priority similar to
  today's `intervention.ts`.
- **Cast-presence gate.** A beat only fires if its named cast is
  on-duty / present tonight. This is how future-character beats stay
  dormant until their role exists.
- **Bounded modifiers only.** Each choice resolves to a modifier vector
  in the same shape today's events use (`drawMod × spendMod × riskAdd
  × repMod × ...`). No new vector dimensions without a scoped change.
- **Debrief integration.** Each resolved encounter emits one named
  morning-debrief line (cf. `nightclub-content-writing` skill style).
  Banked encounters get debrief variants — written as needed, not
  pre-written here.
- **No save-schema explosion.** Encounter state lives within the night
  result. Long-term consequences (Stage 2 progress, crowd-memory marks,
  promises) need their own scoped systems — banked beats reference
  them, but the encounter framework alone doesn't ship them.

Until that framework exists in a scoped request: **DO NOT BUILD.**
