# Progression Milestones (Bank)

> Player-facing progression content for the 5 rise-phases canonized in
> `story-bible.md`. Per-phase: what triggers entering the phase, what
> it feels like to live in it, the notification copy at the moment of
> transition, what triggers leaving it, what the club is becoming.
>
> **Companion canon:** `story-bible.md` (5 rise-phases + texture +
> motifs), `character-bible.md` (cast voices), `random-events.md`
> (sim-signal table for triggers), `content-intake-rules.md` §11
> (current safe content types).

---

## The single-player principle (load-bearing)

Every milestone in this file is about **your club.** Never comparison.
Never ranking against other players. Never "first to do X in your
city." Per `story-bible.md` "The single-player principle" — avoiding
the comparison economy is the bet, the absence is the point.

**Hard rules for this file:**
- No "top X% of clubs" milestones.
- No "more than N other clubs" milestones.
- No "first in your city" framing (comparative).
- No grind-bait counters — every milestone is tied to a *moment*, not a
  reps target.
- The closing question is *"what kind of empire did you build,"* never
  *"did you beat the other clubs."*

---

## Tag policy

Each milestone carries one of:

- **CURRENT-BUILD-eligible** — the trigger uses sim signals that exist
  today (reputation tier crossings, regular-base count, incident
  count, serviceRatio thresholds, etc. — see `random-events.md`
  detectable-states table).
- **FUTURE** — the trigger needs a system that doesn't exist yet
  (Caramel loyalty arc, Ultan press, advisor voice, rival clubs, etc.).

**Display copy is `CURRENT-BUILD-eligible`** the moment its trigger
exists — even if the rendering UI doesn't yet. Content adapts to
existing signals.

---

## Phase 1 — The Start (survival)

**Reputation-tier sync:** maps to *Nobody's Club.*

### Entering
- New club created (CURRENT-BUILD-eligible).
- First night run to completion (CURRENT-BUILD-eligible).
- First guest served at the bar (CURRENT-BUILD-eligible).

### Living in it
- The room is too quiet for the music to land.
- Half the staff doesn't know each other's names yet.
- You clean the bar at 3 AM because nobody else will.
- The regulars table has one person at it. He came because he had
  nowhere else to go.
- The phrase: *"can we make rent."*

### Phase-transition notification (entering Phase 2)
**Title:** "Something's starting."
**Flavor:** "Three regulars came back this week. Different nights.
Same room."

### Leaving (triggers to Phase 2)
- First regular returned twice in the same week (CURRENT-BUILD —
  regular-base counter exists).
- First three consecutive profitable nights (CURRENT-BUILD).
- First clean night — no incidents, no compliance fines, bar held
  (CURRENT-BUILD).
- First staff member volunteered to cover a short shift (FUTURE —
  needs cover/loyalty hook).

### What the club is becoming
> A place. Not yet a destination. But a place — which is more than
> nothing.

---

## Phase 2 — The Regulars (consistency)

**Reputation-tier sync:** maps to *Local Spot.*

### Entering
- Phase 1 leaving triggers satisfied (CURRENT-BUILD).
- Reputation crosses into the Local Spot tier (CURRENT-BUILD).

### Living in it
- The same five faces sit at the same five places.
- Rosa pours one drink without being asked.
- The booth has a signature sound — somebody outside heard it last
  week and remembered.
- Saturday closes with regulars helping stack chairs because they
  want to.
- The phrase: *"see you next week."*

### Phase-transition notification (entering Phase 3)
**Title:** "There's a line at 10 PM."
**Flavor:** "For your club. The one that was empty at 11 a year ago."

### Leaving (triggers to Phase 3)
- First night the door turned someone away (CURRENT-BUILD —
  capacity hit).
- First out-of-town crowd-mix entry — Music Heads dominant
  (CURRENT-BUILD — crowd-segment signal).
- First booked private party that filled the room (CURRENT-BUILD).
- First night Caramel had to actually decide who gets in (FUTURE —
  needs door-decision encounter).

### What the club is becoming
> A regular Friday. Five regulars become twenty. The room remembers
> them, and they remember the room.

---

## Phase 3 — The Destination (growth)

**Reputation-tier sync:** maps to *Rising Name.*

### Entering
- Phase 2 leaving triggers satisfied (CURRENT-BUILD).
- Reputation crosses into the Rising Name tier (CURRENT-BUILD).

### Living in it
- There's a line at 10 PM for a club that used to be empty at 11.
- An out-of-town DJ brings their own people.
- Caramel has to actually decide who gets in — there isn't room for
  everyone.
- Two regulars look at the line and feel something they didn't
  expect to feel.
- The phrase: *"is it always like this now?"*

### Phase-transition notification (entering Phase 4)
**Title:** "Your calendar's full a month out."
**Flavor:** "A rival opened three blocks away with a name that looks
a little too much like yours."

### Leaving (triggers to Phase 4)
- First month-long full booking calendar (FUTURE — needs calendar
  surface).
- First reputation amplification ≥ 1.5× (CURRENT-BUILD — event amp
  signal exists for Grand Opening / Industry Night).
- First time a regular didn't come back after a culture-drift event
  (FUTURE — needs regular-attrition tracking).
- First inquiry from a luxury-brand archetype guest (FUTURE — needs
  VIP-inquiry system).

### What the club is becoming
> A destination. People travel for you. The room remembers who got in
> tonight and who didn't.

---

## Phase 4 — The Empire (leadership)

**Reputation-tier sync:** maps to *City Favorite.*

### Entering
- Phase 3 leaving triggers satisfied (CURRENT-BUILD where buildable;
  FUTURE for the others).
- Reputation crosses into the City Favorite tier (CURRENT-BUILD).

### Living in it
- The booking calendar is full a month out.
- A rival club opens with a deliberately similar name three blocks
  away.
- A luxury-brand pop-up wants the back room and is paying for the
  privilege.
- Elfen sits at the bar nursing one drink and watches the door for
  an hour without saying anything.
- The phrase: *"what are we becoming."*

### Phase-transition notification (entering Phase 5)
**Title:** "A 21-year-old at the rail said 'is this where it started?'"
**Flavor:** "Tell them yes. They'll remember tonight either way."

### Leaving (triggers to Phase 5)
- First time you said no to a profitable booking that didn't fit
  (FUTURE — needs identity-cost system).
- First time Caramel earned Stage 2 — Trusted Protector (FUTURE —
  needs loyalty arc).
- First time Elfen sat in for an hour without saying anything
  (FUTURE — needs Elfen presence).
- First time you walked the floor and someone said the room felt
  different (FUTURE — needs work-room reaction with regular-
  attribution).

### What the club is becoming
> An empire. The city has an opinion about you. The room remembers
> the people who built it — and watches whether you still recognize
> them.

---

## Phase 5 — The Legend (legacy)

**Reputation-tier sync:** maps to *Best in the City.*

### Entering
- Phase 4 leaving triggers satisfied (mostly FUTURE).
- Reputation crosses into the Best in the City tier (CURRENT-BUILD).

### Living in it
- Cameras at the door, deliberately ignored by the people inside.
- Ultan sits at the bar with his small notebook, ordering coffee.
- A 21-year-old at the rail says *"this is where it started, right?"*
  to nobody in particular.
- The booth is run by someone who isn't the original DJ, and the
  original DJ is in the crowd at 2 AM with their eyes closed.
- The phrase: *"one more night."*

### Phase-transition notification
**None.** Per `story-bible.md` "The Important Rule — no ending,"
**Phase 5 has no exit.** No final cutscene, no victory screen. The
club opens tomorrow. Again. And again.

### Living-in-it milestones (recurring legacy moments, not exits)
- A staff member who started in Phase 1 trains a new hire who wasn't
  born when you opened (FUTURE — needs long-running game).
- Ultan publishes the piece (FUTURE — needs press).
- The original founder steps back from the daily and the room still
  feels like the room (FUTURE — needs founder-arc closure).
- You stay open another year (CURRENT-BUILD — calendar / time signal).

### What the club is becoming
> Itself. It is itself. The empire is never finished. It simply
> grows. *One more night.*

---

## Phase-transition flow (the player-facing moment)

When a phase boundary is crossed for the first time:

1. The **notification title + flavor** above fires once. Single line,
   your-club voice. No fanfare, no leaderboard, no comparative
   framing.
2. A small **recurring lore motif** (per `story-bible.md`) anchors
   the moment — One More Night / The room remembers / Who's at the
   door? — chosen by the phase's flavor.
3. The **per-phase "living in it" lines** become available as ambient
   debrief / floor-content surface texture (cross-ref to
   `floor-content.md` if the floor view wires phase-state into the
   bubble selection).

**First-time-only:** transition notifications fire exactly once per
phase boundary. Going from Phase 3 down to Phase 2 (reputation
collapse) does **not** retrigger Phase 3's "There's a line at 10 PM"
notification when you climb back. Drops have their own copy (banked
below).

### Drop-back copy (rep collapse — single-player, no shame framing)

The single-player principle holds here too — drops are *yours*, not
*ranking losses.* Copy is honest, never punitive.

- Phase 2 → 1 (drop): "Quiet weeks. Hold the line."
- Phase 3 → 2: "The line's gone. The regulars stayed."
- Phase 4 → 3: "Less calendar. More room to breathe."
- Phase 5 → 4: "Still legend. Just a quieter chapter."

---

## Single-player boundary checks (for future contributors)

If you add a milestone to this file, every answer must be **yes**:

- [ ] Is the trigger about **your club**, not about ranking against
      other players?
- [ ] Is it tied to a **moment**, not a counter / grind threshold?
- [ ] Does the copy work in **isolation** — no "more than N other
      clubs," no "top X%," no comparison?
- [ ] Is the tag honest (`CURRENT-BUILD-eligible` only if every
      signal it needs exists today)?
- [ ] Does it strengthen the **memorable-moments belief** in
      `story-bible.md` (people and moments, not numbers)?

**If any answer is no, rewrite or remove.**

---

## Cross-references

- `story-bible.md` — 5 rise-phases canon, per-phase texture this file
  expands, "The single-player principle," recurring motifs.
- `character-bible.md` — cast voices the per-phase texture draws on
  (Rosa, Caramel, Elfen, Ultan, Ayan-as-DJ).
- `random-events.md` — sim-signal table the triggers map to;
  encounter beats that surface during each phase.
- `floor-content.md` — guest bubbles + info cards that key off the
  night-state signals related to this file's "living in it" texture.
- `content-intake-rules.md` §11 (current safe content types — display
  text), §2 (tagging policy).
- `roadmap.md` — offline-first guardrails (no backend / multiplayer).
- `achievements.md` — the moment-based achievements this file's phases
  thread through (next file in this content pack).
- `CLAUDE.md` — multi-session lane-lock rule.
