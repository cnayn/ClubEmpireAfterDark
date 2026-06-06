# Achievements (Bank)

> Your-club moments worth remembering. Each achievement is a moment tied
> to the **memorable-moments belief** in `story-bible.md` — people and
> moments, not numbers. Threaded through the 5 rise-phases from
> `progression-milestones.md`.
>
> **Companion canon:** `story-bible.md` (memorable-moments belief +
> recurring motifs), `progression-milestones.md` (the 5 phases these
> achievements thread through), `character-bible.md` (cast voices),
> `random-events.md` (sim signals + encounter beats some triggers
> reference), `content-intake-rules.md` §11 (display text).

---

## The single-player principle (load-bearing)

Every achievement in this file is about **your club.** No comparison,
no ranking, no "first in your city." Per `story-bible.md` "The
single-player principle" — avoiding the comparison economy is the
bet, the absence is the point.

**Hard rules for this file:**

- No "top X%" achievements.
- No "more than N other clubs" achievements.
- No "first in your city" framing (comparative).
- No grind-bait — every achievement is tied to a *moment worth
  remembering*, not a counter milestone. (Some achievements reference
  thresholds — *Twenty Regulars*, *Three Years of Saturdays* — but
  the moment is the identity shift, not the number.)
- The closing question is *"what kind of empire did you build,"*
  never *"did you beat the other clubs."*

---

## Format

```
### <Achievement title>
- Tag: CURRENT-BUILD-eligible | FUTURE
- Trigger: <sim state or scenario>
- Title (player-facing): "<one short line>"
- Flavor (player-facing): "<one or two lines, your-club voice>"
- Phase: 1-5
- Motif: One More Night | The room remembers | Who's at the door? | (none)
- Visibility: Visible | Hidden
```

**Visibility note:** *Visible* achievements show the player what's
possible. *Hidden* ones surface as surprise moments — *"you didn't
know that was achievable until it happened."* Tilt hidden for the
later phases (where the moments are sharper) and visible for the
earlier phases (where the player needs the scaffolding).

---

## Phase 1 — The Start (5 achievements)

### You Opened the Doors
- Tag: **CURRENT-BUILD-eligible**
- Trigger: First night completed.
- Title: "You Opened the Doors."
- Flavor: "Music played. Lights up. Someone walked in."
- Phase: 1
- Motif: One More Night
- Visibility: Visible

### Made Rent
- Tag: **CURRENT-BUILD-eligible**
- Trigger: First month-net positive (reserve grew across a 7-night window).
- Title: "Made Rent."
- Flavor: "The club survives another month. So do you."
- Phase: 1
- Motif: (none)
- Visibility: Visible

### First Regular
- Tag: **CURRENT-BUILD-eligible**
- Trigger: First time a guest returned twice in the same week
  (regular-base counter increment).
- Title: "First Regular."
- Flavor: "Same face, twice. Different drinks. Same seat."
- Phase: 1
- Motif: The room remembers
- Visibility: Visible

### Rosa Knew Their Name
- Tag: **CURRENT-BUILD-eligible** (approximation: Rosa on shift AND
  regular-base ≥ 3).
- Trigger: First night Rosa was on the bar and a regular ordered
  without asking.
- Title: "Rosa Knew Their Name."
- Flavor: "She didn't check the tag. She just poured the right thing."
- Phase: 1
- Motif: The room remembers
- Visibility: Visible

### The Door Closed Quiet
- Tag: **CURRENT-BUILD-eligible**
- Trigger: First clean night — `incidents = 0`, `fines = 0`,
  `serviceRatio ≥ 0.85`.
- Title: "The Door Closed Quiet."
- Flavor: "Zero incidents. Zero complaints. Just a night that worked."
- Phase: 1
- Motif: (none)
- Visibility: Visible

---

## Phase 2 — The Regulars (5 achievements)

### See You Next Week
- Tag: **CURRENT-BUILD-eligible**
- Trigger: First Saturday with at least 5 returning regulars on the
  same shift.
- Title: "See You Next Week."
- Flavor: "Five faces. Five places. They didn't even ask."
- Phase: 2
- Motif: The room remembers
- Visibility: Visible

### The Bar Held
- Tag: **CURRENT-BUILD-eligible**
- Trigger: First peak-fill night where `serviceRatio ≥ 0.9` AND
  `incidents = 0`.
- Title: "The Bar Held."
- Flavor: "Slammed. Stayed clean. Tips were good."
- Phase: 2
- Motif: (none)
- Visibility: Visible

### Caramel Saved the Night
- Tag: **FUTURE** — requires `send-bouncer` boss action with
  per-action incident attribution.
- Trigger: First `send-bouncer` with Caramel on a rough-crowd night
  that prevented an incident.
- Title: "Caramel Saved the Night."
- Flavor: "He read the room. He decided. The night kept going."
- Phase: 2
- Motif: The room remembers
- Visibility: Visible

### Twenty Regulars
- Tag: **CURRENT-BUILD-eligible**
- Trigger: Regular-base counter reaches 20.
- Title: "Twenty Regulars."
- Flavor: "It's a Friday now. It used to be a hope."
- Phase: 2
- Motif: (none)
- Visibility: Visible

### The Booth Has a Signature Sound
- Tag: **CURRENT-BUILD-eligible**
- Trigger: First Industry Night or Grand Opening with reputation
  amplification ≥ 1.3×.
- Title: "The Booth Has a Signature Sound."
- Flavor: "Someone outside heard it last week and remembered."
- Phase: 2
- Motif: Who's at the door?
- Visibility: Visible

---

## Phase 3 — The Destination (5 achievements)

### A Line at 10 PM
- Tag: **CURRENT-BUILD-eligible** (approximation: first night with
  `crowdPressure ≥ 1.0`).
- Trigger: First night the club hit capacity before peak hours.
- Title: "A Line at 10 PM."
- Flavor: "For your club. The one that was empty at 11 a year ago."
- Phase: 3
- Motif: Who's at the door?
- Visibility: Visible

### The Room Remembered a Fair Call
- Tag: **FUTURE** — requires encounter system + crowd-memory mark
  signal.
- Trigger: First "Correct John publicly" or "Back him now, review
  later" choice in the Door Boils Over encounter that earns a
  positive crowd-memory mark.
- Title: "The Room Remembered a Fair Call."
- Flavor: "You held the line. Someone in the crowd noticed. They
  came back."
- Phase: 3
- Motif: The room remembers
- Visibility: Hidden

### Ayan Talked You Into It
- Tag: **FUTURE** — requires Party-Empire stance tracking + DJ Ayan
  role.
- Trigger: First Party-side choice (Push the night / Book the DJ /
  Send it) that succeeded — reputation lift, no incident.
- Title: "Ayan Talked You Into It."
- Flavor: "It worked. This time. Don't tell him."
- Phase: 3
- Motif: One More Night
- Visibility: Visible

### A Music Head Came From Out of Town
- Tag: **CURRENT-BUILD-eligible**
- Trigger: First Industry Night completed with Music-Heads as the
  dominant crowd segment.
- Title: "A Music Head Came From Out of Town."
- Flavor: "Drove an hour. For your booth. Worth it."
- Phase: 3
- Motif: (none)
- Visibility: Visible

### Janer Almost Couldn't Decide
- Tag: **FUTURE** — requires Host role + Janer's host-station
  encounters.
- Trigger: First "Let Janer decide" choice that landed positive
  outcome.
- Title: "Janer Almost Couldn't Decide."
- Flavor: "He did, eventually. It worked. He was as surprised as
  anyone."
- Phase: 3
- Motif: (none)
- Visibility: Hidden

---

## Phase 4 — The Empire (5 achievements)

### Listened to Elfen
- Tag: **FUTURE** — requires Elfen recurring-presence system +
  Owner+Elfen encounter.
- Trigger: First "Protect culture" choice in the Owner+Elfen
  profit-vs-culture encounter.
- Title: "Listened to Elfen."
- Flavor: "She didn't say I told you so. She didn't need to."
- Phase: 4
- Motif: Who's at the door?
- Visibility: Visible

### Said No to Money
- Tag: **CURRENT-BUILD-eligible**
- Trigger: First reject of a Private Party booking with a high
  booking fee (≥ 80th percentile of available fees).
- Title: "Said No to Money."
- Flavor: "It was a good night. Just not yours."
- Phase: 4
- Motif: Who's at the door?
- Visibility: Visible

### Held the Line on Culture
- Tag: **FUTURE** — requires encounter system + culture-drift
  signal.
- Trigger: First "Lean into the music we promised" in "The Crowd
  Isn't Ours" encounter on a culture-mismatched night.
- Title: "Held the Line on Culture."
- Flavor: "Half the room left. The half that stayed told their
  friends."
- Phase: 4
- Motif: Who's at the door?
- Visibility: Visible

### One More Night (Won Big)
- Tag: **FUTURE** — requires push-the-night encounter + reputation-
  delta attribution to a single choice.
- Trigger: First Push-the-night choice that ended the night with
  reputation lift ≥ 5 points.
- Title: "One More Night (Won Big)."
- Flavor: "You pushed it. It worked. Once. Don't trust the feeling."
- Phase: 4
- Motif: One More Night
- Visibility: Visible

### The Compliance Knock You Survived
- Tag: **FUTURE** — requires Compliance Knock encounter.
- Trigger: First Compliance Knock encounter resolved without a fine.
- Title: "The Compliance Knock You Survived."
- Flavor: "Polite. Clipboard. Good lighting. You knew what to do
  this time."
- Phase: 4
- Motif: (none)
- Visibility: Visible

---

## Phase 5 — The Legend (5 achievements)

### The Story Started Writing Itself
- Tag: **FUTURE** — requires Ultan press-narration system.
- Trigger: First time Ultan was present and the night earned a
  positive amplification.
- Title: "The Story Started Writing Itself."
- Flavor: "Ultan published the piece. He didn't ask for a quote.
  He didn't need one."
- Phase: 5
- Motif: The room remembers
- Visibility: Hidden

### Built Something That Outlasts the Founders
- Tag: **FUTURE** — requires `work-room` with positive regular-
  reaction tracking on a Phase 5 night.
- Trigger: First `work-room` boss action on a Phase 5 night that
  surfaced a positive regular reaction.
- Title: "Built Something That Outlasts the Founders."
- Flavor: "You walked the floor. The room still felt like the room."
- Phase: 5
- Motif: One More Night
- Visibility: Visible

### Three Years of Saturdays
- Tag: **FUTURE** — requires long-running game time tracking
  (3-year in-game span).
- Trigger: Three in-game years of consecutive operation with a
  regular-base ≥ 50.
- Title: "Three Years of Saturdays."
- Flavor: "Three years. Same room. Different people. Same room."
- Phase: 5
- Motif: The room remembers
- Visibility: Visible

### "Is This Where It Started?"
- Tag: **FUTURE** — requires new-guest attribution at Phase 5 tier.
- Trigger: First Phase 5 night with at least one new-customer guest
  who returns the following week.
- Title: "\"Is This Where It Started?\""
- Flavor: "A 21-year-old at the rail asked. You said yes. They'll
  remember tonight either way."
- Phase: 5
- Motif: The room remembers
- Visibility: Hidden

### One More Night (Year Five)
- Tag: **FUTURE** — requires 5-year in-game time tracking.
- Trigger: Five-year in-game operation anniversary.
- Title: "One More Night (Year Five)."
- Flavor: "You opened the doors. Again. Still. The empire is never
  finished."
- Phase: 5
- Motif: One More Night
- Visibility: Visible

---

## Single-player boundary checks (for future contributors)

If you add an achievement to this file, every answer must be **yes**:

- [ ] Is the trigger about **your club**, not comparison?
- [ ] Is the achievement tied to a **moment**, not a grind counter?
      (Counter thresholds OK *if* the moment is the identity shift,
      not the number itself.)
- [ ] Does the copy work in **isolation** — no "more than N other
      clubs," no "top X%," no leaderboard framing?
- [ ] Is the tag honest (`CURRENT-BUILD-eligible` only if every
      signal it needs exists today)?
- [ ] Does it strengthen the **memorable-moments belief** in
      `story-bible.md`?
- [ ] Does it tie cleanly to one of the 5 phases in
      `progression-milestones.md`?

**If any answer is no, rewrite or remove.**

---

## Phase / tag coverage summary

| Phase | Achievements | CURRENT-BUILD-eligible | FUTURE | Hidden |
| --- | --- | --- | --- | --- |
| 1 — The Start | 5 | 5 | 0 | 0 |
| 2 — The Regulars | 5 | 4 | 1 | 0 |
| 3 — The Destination | 5 | 2 | 3 | 2 |
| 4 — The Empire | 5 | 1 | 4 | 0 |
| 5 — The Legend | 5 | 0 | 5 | 2 |
| **Total** | **25** | **12** | **13** | **4** |

CURRENT-BUILD-eligible achievements skew early; FUTURE skew late.
This is correct: later phases depend on systems (encounters, press,
loyalty, long-running time) that don't exist yet, and shipping
earlier achievements now gives players moments they can earn
immediately while the later phases are still being built.

---

## Cross-references

- `story-bible.md` — memorable-moments belief, recurring motifs,
  single-player principle, the 5 phases.
- `progression-milestones.md` — phase definitions and triggers
  these achievements thread through.
- `character-bible.md` — cast voices the achievement flavor draws on
  (Rosa, Caramel, Ayan, Elfen, Janer, Ultan).
- `random-events.md` — sim-signal table; encounter beats some
  achievement triggers reference.
- `floor-content.md` — guest bubbles + info cards that may surface
  on the same nights these achievements fire.
- `content-intake-rules.md` §11 (current safe content types).
- `roadmap.md` — offline-first guardrails.
- `CLAUDE.md` — multi-session lane-lock rule.
