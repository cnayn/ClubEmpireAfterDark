# Night UI Foundation — Inspectable, Readable Club Floor

> **Status:** design canon for the **next near-term UI direction.**
> Documentation only. Build prompts are scoped separately — Section 9
> lists the testable slices Main Claude Code can pull from. Nothing
> here is a build ticket on its own.
>
> **Premise (from playtest):** the night is too long for the current
> interaction model. With only four boss buttons and meters that
> "just move," 240 seconds of night feels empty instead of inhabitable.
> The fix is **not** "shorter night" or even "longer night." The fix
> is a **richer, more readable, inspectable floor.**
>
> **Companion canon (do not duplicate, link instead):**
> - [`UIUX_Reference_Pack.md`](UIUX_Reference_Pack.md) — UI identity,
>   pacing rules (§15), readability rules (§16), comm language (§17),
>   screenshot interpretation (§18), future tap-target command
>   direction (§9 future note).
> - [`level-and-floor-progression.md`](level-and-floor-progression.md)
>   — Floor 1 zones, upgrade categories, build slices for floor visuals.
> - [`bubble-bank.md`](bubble-bank.md) — reusable bubble lines.
> - [`character-bible.md`](character-bible.md) — staff voices.
> - [`gameplay-north-star.md`](gameplay-north-star.md) — design law,
>   "explicitly NOT active" guardrails.

---

## 1. Why 240 seconds is too long right now

Long night pacing **only works if the room is watchable.** A 240-second
night with a sparse floor and four buttons is not "deliberate." It is
**empty.**

The principles underneath:

- **Observation must be gameplay** (per UIUX §15). If there is nothing
  to look at, observation stops being a verb and becomes a wait.
- **The four-button tray is not enough.** Today, after the player has
  pressed the relevant button, there is no second thing to do for the
  rest of the night except wait for another pressure to spike.
- **Meters that "just move" do not earn their screen time.** A bar
  that fills without telling the player *what* it is or *why* it
  shifted is decoration, not information.

### The real fix (priority order)

1. **Better floor UI** — the room itself does more visible work.
2. **Clearer progress indicators** — every meter has an identity.
3. **Tap-to-inspect room activity** — the player can *look closer*.
4. **Visible object/crew/guest state** — staff and guests have read.
5. **Boss actions tied to things happening in the room** — actions
   *reveal* and *respond*, not just toggle.
6. **The player understands what is happening without reading a report.**

### Tuning rule for night duration (until the floor catches up)

Until the inspectable-floor build lands, **night duration should be
tuned around player attention, not "realistic" club timing.** A short
but rich night beats a long empty one.

Once the floor is richer (per Sections 4–7 below), the same 240
seconds will feel correct — because the player will have things to
*do* for the whole duration, not just react when a meter screams.

---

## 2. Better progress and meter language

> **The rule:** a bar must never be "just a moving bar."

Every moving indicator on the night-mode UI must carry **all six** of
the following:

| Field | What it is | Example |
| --- | --- | --- |
| **Icon** | A small recognizable glyph | clock · drink · rope · WC · music note · face · crew |
| **Short label** | One or two words, no jargon | "Bar" · "Door" · "Time" |
| **Status word** | A spoken-sounding state | "calm" · "hot" · "alive" |
| **Color state** | Maps to the pressure language (UIUX §8) | amber service · red risk · cyan/violet energy · gold positive |
| **Direction of change** | Up / down / steady arrow or motion cue | tiny up-tick when worsening |
| **Direct room connection** | The zone on the floor reacts when the meter changes | bar tile glows when bar status shifts |

### Canonical meter set (the ones that ship)

| Meter | Icon | Label | Status words |
| --- | --- | --- | --- |
| **Time** | clock | "11:40 PM" + phase | (clock + Opening · Peak · Last Call) |
| **Bar service** | drink | "Bar" | clear · busy · backed up · slammed |
| **Door** | rope / security | "Door" | calm · line · tense · hot |
| **Bathroom** | WC | "Bath" | clear · line · messy |
| **Floor energy** | music note / light | "Floor" | cold · warming · alive |
| **Guests** | face / crowd | "Guests" | bored · okay · happy · angry |
| **Crew** | crew / staff | "Crew" | fresh · working · pressured · tired |

(Status words are pool examples — the engine picks one per state,
per UIUX §10 copy tone and `bubble-bank.md` rules.)

### Hard rules for meters

- **If a meter moves, the floor must also show what changed.** A door
  pressure tick must be paired with a visible change on the door tile
  (queue grows, ring tightens, John's stance shifts). See UIUX §16
  Rule 5.
- **If a meter is bad, the related zone must look bad.** No invisible
  problems.
- **If a meter improves, the related zone must visibly improve.** No
  invisible wins.
- **Text supports the visual; text does not replace it.** Per UIUX
  §16 Rule 4. The status word lives over the visual, not instead of
  it.
- **No raw numbers in the night UI.** Per UIUX §10. Status words, not
  service ratios.

### Time meter, specifically

The time meter is the only one that's a timeline, not a pressure
status — but it should still carry a **phase word** the player can
read at a glance.

- Render as a **clock icon + current in-game time string** ("11:40 PM")
  or a **progress edge** (a thin progress sliver along the top of the
  floor frame, not a center HUD bar).
- Pair the clock with a **phase word** drawn from the canonical
  pool:
  - **Opening** — early night, room filling.
  - **Peak** — mid-night, room is full.
  - **Last Call** — late night, last orders, energy winds down.
  - (Pre-open or post-close states sit outside this list.)
- Example displays: "Time · 11:40 PM · Peak" · "Time · 1:50 AM · Last Call".
- The player should know how much of the night has elapsed *and*
  what phase the room is in, at a glance. The time meter must never
  dominate the screen.

---

## 3. Nightclub City emotional UI lessons to borrow

> Canonical interpretation: [`UIUX_Reference_Pack.md`](UIUX_Reference_Pack.md)
> §18 (Screenshot Interpretation). The reference screenshots are
> **emotional reference, not copy targets.** This section is a
> shorter mirror for night-UI context.

### Emotional borrows (keep)

- **The floor is the main screen** (Canon point 1; §14).
- **UI stays on the edges** — top edge for identity/stats, bottom
  edge for tools, sides for inspect cards.
- **The bottom toolbar feels like a game interface, not a report.**
  Action affordances, not text rows.
- **Guests are visible.** Objects are visible.
- **Tapping things gives information** (Sims-style clarity).
- **The player wants to watch the room** (the NCC magnetic pull).
- **The club looks like "my place."**

### Concrete things we do not copy

Per UIUX §18:

- Exact assets / sprites / icons / chrome.
- Exact layout or zone arrangement.
- Specific furniture designs (cages, Buddha lounge, koi pond, etc.).
- Characters / names / celebrity-parody store.
- Bright / chibi / friendly / social-game tone.
- Real brands, real DJs, real venues.

### Translate to Club Empire

- **Neon Noir** — synthwave-adjacent palette, midnight black anchor.
- **Darker, grittier, adult-feeling.**
- **Management-driven** — pressure meters that mean something,
  service ratios that matter, real reckoning.
- **Crew drama and guest incidents** — per
  [`night-encounters.md`](night-encounters.md) and
  [`bubble-bank.md`](bubble-bank.md).
- **Offline-first single-player** — no social CTAs, no friend
  invites, no online features.

---

## 4. Tap-to-inspect — the missing bridge

> This is a **near-future major UI direction**, not minor polish.
> Banked here so Main Claude can scope it before the inspectable
> floor lands.

The player should be able to **tap** any of these and get a small
read-only info card:

- bartender (at the bar)
- bouncer (at the door)
- DJ booth
- bar queue
- dance floor crowd
- bathroom queue
- regulars cluster (gold-marker cluster)
- staff area

The card is **derived from existing sim state** — not new simulation
data, not a new save shape. **No per-NPC AI. No relationship layer.
No hidden-trait reveal.** It is a *presentation* of what the night
already knows.

### Card anatomy (read-only)

Each inspect card carries:

- **Subject** — the name of the thing (Rosa, John, Bar Queue,
  Students cluster, etc.).
- **Role / type** — what the thing is.
- **State** — a small status word from the §2 vocabulary.
- **Read** — one short line in Club Empire voice explaining what's
  happening (per UIUX §10 and `bubble-bank.md`).
- **Suggested action** — the boss action (or "Ride it out") that
  matches the read. Tapping the suggestion equals tapping the boss
  action button.

### Examples

#### Tap bartender

- **Rosa** — Bartender
- **State:** slammed / steady / sloppy / suspicious
- **Read:** "Pours are slow."
- **Suggested action:** Check Bar

#### Tap bouncer

- **John** — Bouncer
- **State:** hot / calm / too aggressive
- **Read:** "Door is tense."
- **Suggested action:** Send Bouncer / Ride it out

#### Tap bar queue

- **Bar queue**
- **Stat:** 7 guests waiting
- **Mood:** angry
- **Read:** "Drinks are backing up."

#### Tap guest cluster

- **Students** (segment, per `crowd.ts`)
- **Mood:** bored
- **Spend:** low
- **Want:** cheaper drinks / better music / faster service

#### Tap DJ booth

- **DJ Booth**
- **State:** cold / warming / alive
- **Read:** "Floor needs a push."
- **Suggested action:** Push DJ / Ride it out

(When the DJ role is hired in future, the booth card carries the
DJ's name and state per UIUX §7 staff visual language.)

### What tap-to-inspect is NOT

- Not full NPC AI.
- Not per-guest simulation.
- Not a relationship layer.
- Not a hidden-trait reveal surface (locks stay locked).
- Not a new save shape.

It is **read-only derived UI** sitting on top of the state the night
already computes. Same data, surfaced more legibly.

### Tap Target Hierarchy (taxonomy of what tap returns what)

> **Playtest issue:** today, tap-to-act is too coarse — tapping the
> bar surfaces Rosa's actions whether the player meant Rosa, the
> station, or the queue. This section is the **canon distinction**
> between target types so each tap opens the **right** card.

The night-mode floor has **five distinct tap-target types.** Each
opens a different card.

#### 1. Crew token tap

The player tapped a **specific named staff member's token.** The
card is *about that person.*

- Subject is the named staff (Rosa, John, Caramel, Grace, etc.).
- Read frames *their* state — slammed, hot, sloppy, calm.
- Suggested action is whatever fits them right now (Check Bar on a
  slammed Rosa; Send Bouncer on a hot John).
- Voice line is in *their* voice (per
  [`character-bible.md`](character-bible.md) +
  [`bubble-bank.md`](bubble-bank.md)).

> Examples: Tap Rosa → Rosa card. Tap John → John card. Tap
> Caramel → Caramel card. (If two bartenders are on duty, tapping
> the rail vs tapping a specific token resolves to different
> cards — see Disambiguation below.)

#### 2. Station / background tap

The player tapped the **zone tile itself**, not a person standing on
it. The card is *about the place.*

- Subject is the station (Bar, Door, Dance Floor, DJ Booth,
  Bathroom, Staff Area).
- Read frames the *zone's* state — backed up, hot, cold, alive,
  messy, clear.
- Suggested action is the boss action aimed at that zone (Check
  Bar, Send Bouncer, Push DJ, Work the Room).
- Voice line is room-voiced, not character-voiced (per UIUX §10).

> Examples: Tap Bar station tile → Bar station card. Tap Door
> station tile → Door card. Tap DJ Booth tile → DJ booth card.

#### 3. Guest cluster / queue tap

The player tapped a **cluster of guests** (a queue, a dance-floor
cluster, a regulars cluster). The card is *about the crowd, not the
place or the staff.*

- Subject is the cluster (Bar queue · Dance floor crowd · Bathroom
  queue · Regulars cluster · a segment like "Students").
- Read frames the *cluster's* mood and want — bored, angry, happy,
  waiting; cheaper drinks, better music, faster service.
- Suggested action is whatever addresses the crowd's want (could
  be a boss action; could be "ride it out").
- Voice line is observational, often a single guest line ("How
  long?!", "Best place.")

> Examples: Tap Bar queue → Queue card (7 waiting, angry).
> Tap Dance floor crowd → Floor cluster card (mood, density).
> Tap Regulars cluster → Regulars card (per UIUX §17 regulars
> bubble pool).

#### 4. Object / furniture tap

The player tapped a **piece of decor or furniture** on the floor.
The card is *about the object.*

- Subject is the object (a lighting rig, a banquette, a sound
  stack, a neon sign).
- Read frames what the object *does* — its visible/mechanical effect,
  per [`level-and-floor-progression.md`](level-and-floor-progression.md)
  §3 upgrade categories.
- Suggested action is contextual (upgrade tier, swap, future:
  remove). In Phase 1 this is often "view only — adjust in Prep
  mode."
- No voice line; this is a Sims-style object card (per UIUX §3).

> Examples: Tap lighting rig → Lighting card. Tap banquette →
> Seating card.

#### 5. Owner / avatar tap (FUTURE / DO NOT BUILD YET)

The player taps an on-floor representation of *themselves* (the
owner). The card is about owner presence — which zones the owner is
currently affecting, recent Work-the-Room targets, future
Party/Empire stance (FUTURE).

> **Status: FUTURE / DO NOT BUILD YET.** Today the owner has no
> on-floor avatar token. Banked so the hierarchy is complete; build
> after the Party/Empire meter or its substitute exists.

### Disambiguation rules (when targets overlap)

When a tap could resolve to more than one target type, the
hierarchy is:

1. **A named crew token's hit area wins over the station tile it
   stands on.** Tapping Rosa specifically opens Rosa's card, not
   the Bar station card.
2. **A guest cluster wins over the station tile underneath it.**
   Tapping a dense queue at the rail opens the Queue card, not the
   Bar station card.
3. **An object wins over the station tile it lives on.** Tapping a
   lighting rig opens the Lighting card, not the Dance Floor card.
4. **The station tile is the fallback.** Tapping the empty area of
   a zone — no crew, no cluster, no object — opens the Station
   card.

### Crew assignment / movement direction (FUTURE / DO NOT BUILD YET)

> Long-term, crew should *feel movable* — the NCC magnetic pull
> includes "I can put my staff where I want them." Today we ship a
> **safe near-term version** so the floor stays coherent without
> opening pathfinding or NPC AI.

#### Near-term model (allowed now)

- Crew are **assigned to fixed station slots** (Bar → bartender slot;
  Door → bouncer slot; DJ Booth → DJ slot when DJ role exists).
- No pathfinding.
- No drag-and-drop.
- No free placement.
- No individual NPC AI.

The visible movement when crew is reassigned is a **fade-out at the
old slot, fade-in at the new slot** — no traversal animation
required.

#### Future direction (banked, do not build yet)

- **Tap crew → choose assignment.** A small menu appears on the crew
  card: "Send to Bar / Send to Door / Send to Back / Send to Help X."
- **Crew visibly relocates between fixed station slots.** A short
  slide animation between slots replaces the fade-out/fade-in once
  the floor can render it cleanly.
- **Drag-and-drop (later, maybe).** Only if the game's input model
  supports it without losing precision on mobile, and only after the
  tap-target hierarchy is mature.
- **Auto-routing for emergencies (later).** Caramel could
  auto-relocate to back-bar during a critical bar pressure event
  (only if his loyalty / Stage 2 system exists — per
  [`event-bible.md`](event-bible.md) Caramel chain).

Every step on the future direction preserves the **no pathfinding /
no NPC AI / no free placement** guardrails. Movement is between
known slots, not across the floor.

> **Status: FUTURE / DO NOT BUILD YET.** Banked so build session
> knows the architecture should support "crew at slot X moves to
> slot Y" without a refactor — not so it ships now.

### Why this is the missing bridge

The player today sees pressure but cannot *interrogate* it. Boss
actions are the only verbs. With tap-to-inspect, **the floor itself
becomes an interface** — the player reaches into the room to ask
"what's going on here?" and the room answers in its own voice.

This is the Sims-style "tap an object → understand it" lesson (UIUX
§3) applied to the live night. It is also the natural foundation for
the **future tap-target boss actions** banked in UIUX §9 — once
tap-to-inspect lands, tap-to-act follows naturally.

---

## 5. Boss actions become discoveries, not just buttons

> **Current issue (from playtest):** pressing Check Bar or Send
> Bouncer only nudges colors and pressure values. The player has no
> sense of *what was discovered* — only that something improved.

### Direction

A boss action aimed at a zone should **reveal what's actually
happening there**, then resolve into a modifier.

The reveal is the texture. The modifier is the consequence. Both
ship together.

### Read-pool examples (per action)

#### Check Bar — can reveal

- bar is already fine — Rosa's holding (calm read, always valid)
- bartender is working well
- bartender is overwhelmed
- bartender is sloppy
- stock looks messy / bartender is wasting stock
- queue is caused by slow service
- queue is caused by too many guests
- bartender might be skimming (FUTURE / Sticky Fingers gated)
- fake / wrong stock arrived (FUTURE / supplier system gated)
- drinks are priced wrong (FUTURE / pricing system gated)

#### Send Bouncer — can reveal

- door is calm
- bouncer is too aggressive
- guests are pushing in
- wrong crowd is forming
- regulars are being annoyed
- bouncer handled it well
- bouncer made it worse

#### Push DJ — can reveal

- DJ is warming the room
- crowd likes the genre
- music heads noticed
- floor is still cold
- DJ overdid it

#### Work the Room — can reveal

- guests like seeing the owner
- regulars noticed
- staff morale improved
- owner presence did nothing — room is too empty

### Authoring rules for reveal pools

1. **Pool, not script.** Per `bubble-bank.md` rules. The engine picks
   one read from the pool based on current sim state — same seed +
   state ⇒ same read.
2. **Reads must be derivable from existing state.** No new RNG, no
   new hidden variables. If a read needs a system that doesn't exist
   (theft economy, pricing system, sticky-fingers reveal), tag the
   read **FUTURE** and gate it.
3. **Every read pairs with a visible floor change** (UIUX §16 Rule 5).
   "Bartender is overwhelmed" → Rosa's token leans forward, drink
   bubble fires, bar tile glows.
4. **Reads stay in Club Empire voice.** Short, spoken-sounding, no
   numbers (UIUX §10).
5. **No moralism.** Reads describe what the room is doing, not what
   the player should feel about it.

### What this is NOT (yet)

- Not a full staff-crime / theft economy.
- Not a hidden-trait discovery layer (per `gameplay-north-star.md`
  "explicitly NOT active").
- Not a deep pricing simulator.

It is **derived presentation** — the player feels they *discovered*
something by checking, but the night already knew. Deep systems
behind reveals (theft, traits, pricing) are FUTURE / DO NOT BUILD
YET; their absence today shows up as reads tagged FUTURE in the pool.

---

## 6. Bar must feel active all night

The bar should not only animate when the player taps Check Bar.

### Always-on bar visuals

- **Bartender token works visibly** — small idle animation: pour
  motion, swipe, restock reach. Cluster-friendly cost.
- **Bar queue grows and shrinks** — visible cluster of waiting guests
  at the rail; density tied to service ratio.
- **Drink / service meter** is paired with the queue: when the meter
  is "backed up," the queue is *visible* and *long*. When the meter
  is "fast," the queue clears between ticks.
- **Drink icons / bottle icons** can move or pulse — a small drink
  glyph rises from the rail when a guest is served, a soft amber
  pulse on the shelf when stock is restocked.
- **Bartender state changes visibly:**
  - **steady** — relaxed posture, steady rhythm.
  - **slammed** — leaning forward, faster motion, amber ring.
  - **sloppy** — slower motion, dropped-bottle glint (FUTURE), softer
    pulse.
  - **suspicious** — subtle yellow ring on the bartender token
    (FUTURE / Sticky Fingers gated; today, this state never fires).

### Check Bar's role changes

In the new model, Check Bar:

- Surfaces a **read** from the §5 pool ("Pours are slow." · "Rosa's
  holding." · etc.).
- Applies the modifier (per current intervention logic).
- Triggers a **named visible response** on the floor: Rosa's token
  pulses warm, queue clears one tick, status word updates.

The player feels they **looked at the bar** and the bar **looked
back.**

---

## 7. Door must feel active all night

The door should not just be a pressure meter.

### Always-on door visuals

- **Bouncer stands at the door visibly.** Different bouncers, when
  hired, present different stances (per UIUX §7 staff visual
  language): Caramel calm protector, John tight aggressive, Grace
  by-the-book upright.
- **Line forms as pressure rises.** A visible queue cluster outside
  the door tile, growing with pressure.
- **Tense guests appear at the entrance** — angry bubble icons on the
  line cluster when door state is "hot."
- **Door glow / rope indicator changes.** Calm → soft warm tint. Tense
  → amber ring. Hot → pulsing red ring (per UIUX §8 pressure colors).
- **Send Bouncer reveals** a §5 read, paired with a posture shift on
  the bouncer token and a queue change.

### Bouncer differentiation (current cast)

When the named bouncer changes, the door visibly changes:

- **Caramel** at the door — steady calm ring, even line cadence.
- **John** at the door — tight stance, occasional red flash when an
  incident is brewing.
- **Grace** at the door — visible clipboard glyph, line moves
  slower but cleaner.

(These match `character-bible.md` voice notes — visuals follow
character, not the other way around.)

---

## 8. Better UI layout direction (target shape)

> **Target shape**, not next-build spec. Phase-gated per UIUX §13.

```
+----------------------------------------------------+
| Club name · Cash · Rep tier · Time                 |   <- top edge
+----------------------------------------------------+
|                                                    |
|                                                    |
|                  THE FLOOR                         |   <- main center
|                  (the game)                        |       (untouched
|                                                    |        by UI chrome)
|                                                    |
|                                                    |
+----------------------------------------------------+
| Compact toolbar / boss actions                     |   <- bottom edge
+----------------------------------------------------+
```

Plus **side / floating inspect cards** that appear when the player
taps a zone or character (Section 4). Cards live over the floor edge,
dismissible.

### Rules

- **No giant report card covering the room** (per UIUX §16 Rule 4
  and Canon point 1).
- **No dominant four-button tray forever.** The current tray is a
  Phase 1 affordance, not the destination. Per UIUX §9 future
  direction (tap-target → contextual action).
- **No HUD in the center.** The center is the floor.
- **Top edge owns identity + stats** (club name, cash, rep tier,
  time). No "POPULARITY" or "LUXURY" pills (per UIUX §18 — those are
  reference copy hazards).
- **Bottom edge owns tools.** Compact and game-shaped, not
  text-heavy.
- **Inspect cards are floating, dismissible, never blocking the
  floor underneath.** The room keeps running (per UIUX §15 pacing).

### Migration discipline

The four-button tray may stay temporarily. **Architecture must not
hard-code "four buttons forever."** When tap-target lands (UIUX §9
Phase 2/3), the same four verbs become contextual options under the
right tap-target — the tray shrinks or hides.

---

## 9. Near-term build slices for Main Claude Code

Each slice is **small, buildable, testable.** Slices are ordered by
dependency, not priority — Main Claude can pick the next one to land.

### Slice A — Meter identity pass

- Add **icon, label, status word, color state, direction arrow** to
  each existing night meter (per §2 canonical meter set).
- No new sim. Wrap existing values in the new language.
- **Acceptance:** the player can name what each bar means in 2
  seconds. A new tester, with no instruction, points at each meter
  and says "Bar," "Door," "Floor," "Time."

### Slice B — Zone inspect cards (read-only)

- Tap on Bar / Door / Dance Floor / Bathroom tile → small
  floating card with subject, state, read, and suggested action.
- No new sim. Derive read from current state.
- **Acceptance:** tapping Bar explains what is happening at the bar
  in one short line. Tapping the suggested action equals tapping the
  boss action button.

### Slice C — Bar activity visuals

- Bartender working animation (simple loop).
- Visible bar queue cluster tied to service ratio.
- Drink icons / pulse cues when a guest is served.
- Bartender state words update live (steady / slammed / sloppy).
- **Acceptance:** the bar feels active *without* pressing Check Bar.
  The player can tell the bar is busy by looking at the bar.

### Slice D — Crew inspect cards

- Tap bartender or bouncer token → card with name, role, state,
  read, suggested action (per §4 examples).
- **Acceptance:** crew feel like workers, not initials. A tester
  points at the bartender and says "Rosa is slammed."

### Slice E — Reduce four-button dominance

- Keep the boss action tray as a fallback.
- Make zone and crew taps the **primary** input — tapping a zone
  surfaces the inspect card with the suggested action ready to
  press.
- **Acceptance:** in a fresh playtest, players naturally tap the
  room first. The tray becomes the second-resort affordance.

### Slice F — Guest sprite improvement

- Guests are no longer dots. Simple silhouette with head, body,
  posture variation, mood tint.
- Cluster-friendly cost — still rendered as clusters / sprites, not
  pathfinding NPCs.
- **Acceptance:** guests read as **people**, not pencils. A
  screenshot of the floor reads as a nightclub (per UIUX §14
  acceptance).

### Slice G — Boss action reveal text

- When the player presses Check Bar / Send Bouncer / Push DJ / Work
  the Room, surface a short **read** from the §5 pool above the
  paired floor change.
- **Acceptance:** every boss action press tells the player *something
  they didn't already know* — even if it's "Door is calm, John's
  good."

### Notes on ordering

- Slices A, B, C, D each unlock the next layer of inspectability.
  They are roughly the order in which the night becomes legible.
- Slice E depends on B and D landing first.
- Slice F is independent and can land in parallel.
- Slice G can land alongside or after B; it pairs reveals with the
  existing action surface, doesn't require tap-target.

Each slice respects the design law in
[`gameplay-north-star.md`](gameplay-north-star.md): legibility before
depth, depend only on what exists, the reckoning ships before the
reward, determinism preserved.

---

## 10. Hard boundaries (FUTURE / DO NOT BUILD YET)

Do not build any of the following as part of this UI foundation pass.
They are **future systems**, banked elsewhere, and would *bury* the
readability work this doc is scoped around:

- **Bottle ordering** — see
  [`future-bar-and-policy-systems.md`](future-bar-and-policy-systems.md)
  System 5.
- **Sketchy vs reliable supplier axis** — same doc, System 5.
- **Mid-night policy switching** (smoking, drink strategy, door
  posture) — same doc, System 1.
- **Slow-night drink deals** — same doc, System 3.
- **Premium drink / cocktail switching** — same doc, System 4.
- **VIP system implementation** — per
  [`gameplay-north-star.md`](gameplay-north-star.md) "explicitly NOT
  active."
- **Dancers, waiters** — same list.
- **Free furniture placement** — same list.
- **Pathfinding (individual NPCs)** — same list.
- **3D** — per UIUX §11.
- **Full NPC AI** — same list.
- **Relationship simulation** — per
  [`relationship-web.md`](relationship-web.md), Phase 4 dependency
  chain.
- **Hidden-trait reveal mechanics** — per `gameplay-north-star.md`.
- **Theft / staff-crime economy (stealing alcohol system)** —
  referenced in §5 reveal pools as FUTURE tags; do not build the
  economy underneath.
- **Venue-finding onboarding arc** — the "find the place, scout
  locations, choose where to open" pre-game flow. Floor 1 starts
  *already-yours* today; the venue-finding arc is a future
  onboarding layer, not part of this UI foundation pass.
- **Crew free movement / pathfinding / drag-and-drop placement** —
  see §4 "Crew assignment / movement direction." Near-term is
  fixed-slot assignment only; future is slot-to-slot relocation;
  free placement and pathfinding remain off-table.

The **missing foundation today** is:

- Better night UI.
- Better inspectability.
- Better floor readability.

Everything above is downstream of that foundation. Build the
foundation first.

---

## Cross-references

- UI identity, pacing, readability, comm language, screenshot
  interpretation: [`UIUX_Reference_Pack.md`](UIUX_Reference_Pack.md).
- Floor zones, upgrade categories, progression slices:
  [`level-and-floor-progression.md`](level-and-floor-progression.md).
- Reusable bubble lines: [`bubble-bank.md`](bubble-bank.md).
- Character voices: [`character-bible.md`](character-bible.md).
- Encounter beats (on-floor content):
  [`night-encounters.md`](night-encounters.md).
- Phone surface (off-floor content):
  [`phone-messages.md`](phone-messages.md).
- Banked future bar/policy systems:
  [`future-bar-and-policy-systems.md`](future-bar-and-policy-systems.md).
- Design law + "explicitly NOT active":
  [`gameplay-north-star.md`](gameplay-north-star.md).
- Intake pipeline: [`content-intake-rules.md`](content-intake-rules.md).
