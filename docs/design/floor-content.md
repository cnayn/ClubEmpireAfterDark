# Floor View Content (Bank)

> Player-facing display copy for the **tap-a-guest** and **tap-a-staff**
> surfaces of the Floor View — the Nightclub-City-style 2D club view the
> build session is wiring up. Three content blocks: **guest speech
> bubbles**, **guest info cards**, **staff station lines.**
>
> **Pass 1 scope:** one complete usable set per cell, two lines per
> bubble cell. We expand once we see this rendered on the actual floor —
> don't over-invest in content whose format may shift once the build
> session ships the surface. (Per the multi-session lane-lock rule in
> `CLAUDE.md`.)
>
> Companion canon: `character-bible.md` (cast voices), `random-events.md`
> (sim-signal table + encounter beats), `story-bible.md` (Neon Noir
> tone, recurring motifs), `content-intake-rules.md` §11 (current safe
> content types — display text is the prototype example).

---

## What the floor view is

A 2D / isometric club view. Players **tap a guest** to see a speech
bubble + info card; **tap a staff** to see a station line + boss-action
options. **Crowd is rendered density off the guest-count number** — not
simulated individuals (cf. `roadmap.md` "Visual presentation & 3D"
guardrails). Variety-across-nights is the load-bearing requirement: a
busy night looks fuller than a dead one; the room changes night to
night.

---

## Sim signals → night-state map (the table that drives which bubble fires)

Bubbles and station lines key off these states, all of which the sim
either already computes or can approximate without new code. See
`random-events.md` § "Detectable sim states" for the full signal table.

| Night-state | Approximation today | Source | Notes |
| --- | --- | --- | --- |
| **Bar slow** | `serviceRatio < 0.8` AND fill `≥ 0.5` | `src/sim/night.ts`, `src/lib/intervention.ts` (`isBarPressureNight`) | Exact match. |
| **Floor hot** | vibe high AND `serviceHeadroom > 0.2` AND fill `≥ 0.6` | composite | **NEEDS SIGNAL (banked, not required).** A true "people are dancing" signal would be cleaner — see Build-session note below. The approximation is fine for v1. |
| **Door tense** | `crowdPressure ≥ 0.9` (near capacity) | `src/sim/night.ts` | Near-exact. |
| **Peak** | `crowdPressure ≥ 0.85` AND `serviceRatio ≥ 0.85` AND vibe high | composite | Everything hitting. |
| **Cooling** | loyalty `< 52` AND fill `< 0.4` | `src/lib/intervention.ts` (`isCoolingNight`) | Exact match. |

> **Build-session note (optional, NOT required):** If a true
> "dance-floor engagement" signal is cheap to surface from the sim (a
> rolling vibe × headroom × crowd-mix score), it would tighten the
> "Floor hot" bubbles. **Not blocking** — the approximation above is
> sufficient for v1. Content adapts to existing signals.

---

## Tone discipline (short)

- **Neon Noir, original IP.** No real brands, no real DJs, no real
  celebrities, no real venues. Archetypes only.
- **One line max per bubble.** Short, declarative. The floor is a
  glance, not a paragraph.
- **No threats, no crime instructions, no violence detail** — even in
  Rough Crowd bubbles. Bad behavior is **management drama** (impatience,
  friction, attitude, leaving), never how-to. Per
  `content-intake-rules.md` §13 / §14 and `nightclub-safety-framing`.
- **Voice differentiation matters.** A Local doesn't talk like a
  Student; a Music Head doesn't talk like a VIP-Curious. The room
  shouldn't sound homogenous.

---

## Block 1 — Guest speech bubbles (segment × night-state)

**Format:** two lines per cell. The floor view picks one of the two per
guest per tap, deterministically (so the same guest in the same state
says the same thing). Both lines should fit in a small bubble (≤ ~50
chars when possible).

**Tag: CURRENT-BUILD-eligible** — display text for crowd segments
(`src/domain/crowd.ts`) and night-state signals (`src/sim/night.ts`,
`src/lib/intervention.ts`) that exist today.

### Locals
*Neighborhood-possessive, casual, "our place" register. Short,
declarative, no exclamation marks.*

- **Bar slow:**
  - "Rosa's swamped again."
  - "Could pour my own if you let me."
- **Floor hot:**
  - "Loud tonight. Good loud."
  - "Better than the place down the road."
- **Door tense:**
  - "Wait — the line's down the block?"
  - "Tell Caramel it's me."
- **Peak:**
  - "Hasn't felt like this in years."
  - "First time I waited for a table here."
- **Cooling:**
  - "Empty for a Saturday."
  - "Used to know everyone in this room."

### Students
*Enthusiastic, loud, "we" register, broke. Exclamation marks land here.*

- **Bar slow:**
  - "Did you order yet? I'll Venmo you!"
  - "Eight people in front of us."
- **Floor hot:**
  - "BEST NIGHT EVER!"
  - "Whose phone is the playlist?"
- **Door tense:**
  - "We've been out here forty minutes!"
  - "Is it cap inside? Like fire-code cap?"
- **Peak:**
  - "Photo. Photo. Photo."
  - "Everyone's tagging this."
- **Cooling:**
  - "Are we leaving?"
  - "Sketchy."

### Music Heads
*Knowledgeable, intense, focused on the sound. Tolerant of
inconvenience for the music. References DJ choices, not the venue.*

- **Bar slow:**
  - "I'll go later. Set's about to turn."
  - "Bring me a water when you can."
- **Floor hot:**
  - "Third edit I haven't recognised."
  - "Whoever's on the decks knows what they're doing."
- **Door tense:**
  - "Worth the wait if the booth holds."
  - "Anyone clocked the set time?"
- **Peak:**
  - "He just dropped that?"
  - "I'm not leaving for anything."
- **Cooling:**
  - "Off the beat. Lost the room."
  - "Walking. Basement up the road."

### VIP-Curious
*Aspirational, status-aware. Wants to be seen. Complains about service
first.*

- **Bar slow:**
  - "Is there a bottle list?"
  - "Tell me you have a back room."
- **Floor hot:**
  - "Is anyone famous here?"
  - "Better lighting in the booth?"
- **Door tense:**
  - "Are we on the list? We should be on the list."
  - "My friend knows the owner."
- **Peak:**
  - "Whose table is that? Can we move there?"
  - "Snap this. Vertical."
- **Cooling:**
  - "We're being seen at a nine-PM place."
  - "Uber. Now."

### Rough Crowd
*Edge-leaning, sharp, suspicious of staff. **Attitude and friction
only** — no threats, no crime, no violence. Per safety framing.*

- **Bar slow:**
  - "Long way to the bar."
  - "Don't see anyone serving us."
- **Floor hot:**
  - "Loud enough you can't hear yourself."
  - "Crowd's pushing."
- **Door tense:**
  - "Tell him I'm not leaving."
  - "What's the holdup."
- **Peak:**
  - "Whole town's in here."
  - "Eyes everywhere."
- **Cooling:**
  - "Dead. We're going."
  - "Knew it was this kind of place."

### Regulars
*Invested, names known, sees the change. Quieter than Students, sharper
than Locals.*

- **Bar slow:**
  - "Vince again. Six tickets deep."
  - "Rosa would've cleared this in ten."
- **Floor hot:**
  - "First time it's felt like this since the relaunch."
  - "Going to remember tonight."
- **Door tense:**
  - "Caramel knows me. Ask him."
  - "There used to be a side door."
- **Peak:**
  - "Every Saturday for two years. This is the one."
  - "Tell Otis I want what he's drinking."
- **Cooling:**
  - "Where's everyone."
  - "Worries me, this."

---

## Block 2 — Guest info cards (per segment)

**Format per card:** Type · Mood (varies by night-state) · Want · Tell.
The Mood field rotates with the night-state; the others are stable per
segment. **Tag: CURRENT-BUILD-eligible** — segments exist in code today.

### Locals
- **Type:** Neighborhood crew. Walked here. Two streets over.
- **Mood:**
  - Bar slow: "Patient — until the third bartender misses them."
  - Floor hot: "Quietly proud of the room."
  - Door tense: "Indignant. They live here."
  - Peak: "Hasn't felt like this in years."
  - Cooling: "Already weighing the next place over."
- **Want:** "A reason this is still our place."
- **Tell:** "Greets a bartender by name without checking the name tag."

### Students
- **Type:** Group of six. Three universities. One credit card between them.
- **Mood:**
  - Bar slow: "Negotiating who Venmo'd whom."
  - Floor hot: "Peak Friday energy. Maximum noise."
  - Door tense: "Convinced the bouncer is wrong about cap."
  - Peak: "Filming everything."
  - Cooling: "Already typing the next location into the chat."
- **Want:** "A story they can post about."
- **Tell:** "Phones up the second something happens. Or doesn't."

### Music Heads
- **Type:** Sound first. Vibe second. Drink third, if at all.
- **Mood:**
  - Bar slow: "Doesn't notice. Hasn't ordered yet."
  - Floor hot: "Locked in. Eyes shut, head down."
  - Door tense: "Checking set times. Will wait if the booth holds."
  - Peak: "Won't speak until the bridge ends."
  - Cooling: "Polling the basement up the road."
- **Want:** "A booth that reads the room."
- **Tell:** "Stands closer to the speakers than to the bar."

### VIP-Curious
- **Type:** Aspirational. Watches the room more than the dance floor.
- **Mood:**
  - Bar slow: "Looking for someone to flag down."
  - Floor hot: "Posing for a photo nobody is taking."
  - Door tense: "Convinced the velvet rope is a misunderstanding."
  - Peak: "Already wants the better table."
  - Cooling: "Recalibrating which 'in' place they should be at."
- **Want:** "To be seen at the right place at the right time."
- **Tell:** "Asks about the back room before ordering."

### Rough Crowd
- **Type:** Edge-leaning crew. Knows other rooms in the city. Came for a reason.
- **Mood:**
  - Bar slow: "Patience thinning."
  - Floor hot: "Energy mixed with watching."
  - Door tense: "Reading the bouncer."
  - Peak: "Comfortable in the noise."
  - Cooling: "Reading the room for somewhere else."
- **Want:** "To be left alone unless they want a conversation."
- **Tell:** "Eye-tracks the door more than the floor."

### Regulars
- **Type:** Here long enough to notice when the bartender is new.
- **Mood:**
  - Bar slow: "Disappointed. Won't complain."
  - Floor hot: "Proud, like they helped build it."
  - Door tense: "Walks past the line and waits to be recognised."
  - Peak: "Says 'tonight is the one' more than once."
  - Cooling: "Worried for the room, not for themselves."
- **Want:** "The club to still be the club next month."
- **Tell:** "Knows where Caramel stands when he's worried."

---

## Block 3 — Staff station lines (per cast)

**Format per character:** Tap line (when the player taps their station)
+ Send / boss-action line (when the player triggers a boss action that
involves them). Cap: 3 lines per named character (Legendary / Ultra-Rare
/ Rare), 1–2 per Uncommon, 1 per Common.

**Boss actions** (per `src/lib/bossActions.ts`): `push-dj` · `check-bar`
· `send-bouncer` · `work-room`.

**Tag:**
- **CURRENT-BUILD-eligible** for ACTIVE Bartenders / Bouncers tapped at
  any station, AND for the generic DJ-booth voice on `push-dj`.
- **FUTURE / DO NOT BUILD YET** for any line attributed to a
  future-role character (Ayan-as-DJ, Janer/host, Elfen/patron,
  Kerem/advisor, Sera/fixer, Cy/regular, Ultan/press).

### Bouncers (ACTIVE)

#### John "The Pitbull" — Legendary
- **Tap:** "Door's mine, boss. Always."
- **Send (`send-bouncer`):** "Say the word. I'll handle it."
- **Send (rough crowd present):** "Finally."

#### Kareem "Caramel" Souza — Legendary
- **Tap:** "Door's holding, bro. Bar's not."
- **Send (`send-bouncer`):** "On it, bro."
- **Send (rough crowd / risky guest):** "Bro, this one smells like trouble. I got it."

#### Grace "The Rulebook" — Rare
- **Tap:** "Door process is clean tonight."
- **Send (`send-bouncer`):** "ID. The real one. I'll wait."
- **Send (smoking relaxed / compliance risk):** "If you want a special case, find another bouncer."

#### Pavel "Heavy Hitter" — Rare
- **Tap (present):** "I'm here. What needs handling."
- **Send (`send-bouncer`):** "I said I'd come. I came."

#### Yusra "Sundown" Adekunle — Rare
- **Tap:** "Two by the smoking area. Watching them."
- **Send (`send-bouncer`):** "Who told you about the club tonight?"
- **Send (after a turn):** "Have a good night somewhere else."

#### Marko "Soft Marko" Ilic — Ultra-Rare
- **Tap:** "ID, please. Sorry. House rules. Sorry."
- **Send (`send-bouncer`):** "I'll try, boss. I keep hoping they'll calm down."
- **Send (rough crowd):** "Boss. I think we should call Caramel."

#### Dimitri "The Calm Wall" — Uncommon
- **Tap:** "I've worked rooms louder than this."
- **Send:** "We'll be fine. Slow your breathing."

#### Marcus "The Enforcer" — Uncommon
- **Tap:** "Standing where I need to stand."
- **Send:** "Step back."

#### "Half" Halil Demir — Uncommon
- **Tap:** "I do this on my days off, boss."
- **Send:** "I've seen worse. Way worse."

#### Common bouncer pool (one line each)
- Lana Pesa: "I'm new. Tell me if I miss something."
- Rex Kowalski: "I do not enjoy talking."
- "Banger": *(a single firm nod)*
- Mim Karaca: "Welcome! Carry your ID, please!"
- Ricky "Tickets" Garcia: "He's fine. He's not. He's fine."

### Bartenders (ACTIVE)

#### Rosa "Warm Pour" — Rare
- **Tap:** "Same as last week? Sit. I'll bring it."
- **Send (`check-bar`):** "Six tickets in. Two of them annoyed."
- **Send (a regular's at the rail):** "She's not here. Don't ask twice."

#### Vince "The Showman" — Rare
- **Tap:** "Boss. Night's mine. Watch this."
- **Send (`check-bar`):** "Two of these and one for the lady — she pays cash."
- **Send (cooling / low oversight):** "Tips? What tips. Slow night."

#### Otis "Slow Otis" Park — Rare
- **Tap:** "Three for the gentleman. Out in two minutes."
- **Send (`check-bar`, peak):** "I'm not going to rush a Sazerac. You can be upset about that."
- **Send (`check-bar`, slow):** "I do one thing at a time. The thing I do, I do well."

#### Vega "The Lighter" Calderon — Ultra-Rare
- **Tap:** "Bar holds, boss. Don't ask twice."
- **Send (`check-bar`):** "Mr. Aksoy. Five is the last one."
- **Send (private-party flex pressure):** "If you want me to bend, hire someone who bends. Then watch your inventory."

#### Milo "The Steady Hand" — Uncommon
- **Tap:** "Order's up."
- **Send (`check-bar`):** "I can hold. I can't catch up."

#### Jin "The Dependable" — Uncommon
- **Tap:** "Whatever you said. Sure."
- **Send:** "Two beers. Coming up."

#### "Pep" Pepa Rios — Uncommon
- **Tap:** "Two beers, two shots, I already started."
- **Send:** "Tab? Sure. You're going to forget. That's fine."

#### Common bartender pool (one line each)
- Tito Vanga: "I'm here. What do you need."
- Suki Ahn: "Looks better with the mint. Trust me."
- Ela Toro: "How's your night going? No really."
- Bo Larsson: "Yeah."
- Pete "Sundayer" Cohen: "Slow nights are the good nights."

### DJ booth (CURRENT-BUILD generic voice)

> The DJ position exists in code (the `push-dj` boss action targets it),
> but no named DJ has been promoted to active (Ayan is FUTURE). These
> lines are the **unnamed-DJ voice** — generic, function-only.

- **Tap:** "Set's reading."
- **Send (`push-dj`):** "Lifting now."
- **Send (`push-dj`, peak vibe):** "Room's already there, boss."
- **Send (`push-dj`, cooling):** "Trying. Room's checked out."

### Owner — `work-room` boss action (CURRENT-BUILD)

The Owner walking the floor surfaces small acknowledgements from the
regulars segment (cf. `random-events.md` "The Boss Was Just on the
Floor"). Lines fire from nearby cast / guests, not from the Owner.

- Regular: "Owner on the floor. Good."
- Rosa (if on bar): "Tell the bar I said hi."
- Caramel (if on door): "Good. Room sees you."

### Future-only station bank (FUTURE — DO NOT BUILD YET)

> The stations and characters below **do not exist in code today.**
> Banked here so the build session has copy on the shelf the moment any
> of these roles are promoted. **Each one is gated by its specific
> role's system not existing yet** — see `character-bible.md` for the
> full status of each.

#### Ayan-as-DJ (FUTURE — requires DJ role)
- **Tap:** "When we're famous remember I was here first."
- **Send (`push-dj`):** "Give me ten minutes, bro. This room is sleeping."
- **Send (`push-dj`, peak):** "Tonight can be normal, or tonight can be history."

#### Janer (FUTURE — requires Host / VIP / Lounge role)
- **Tap (host stand):** "Either booth is good. Actually—"
- **Send (any decision):** "I'm getting to it."
- **Send (under pressure):** "Sorry. Both seemed fine."

#### Elfen (FUTURE — requires recurring-patron presence system)
- **Tap (sitting at the bar with one drink):** "You don't have to carry everything yourself."
- **Tap (alt):** "The atmosphere feels different lately."
- **Tap (decline / drift):** "I know this isn't what you wanted this place to be."

#### Kerem (FUTURE — requires advisor-voice system)
- **Tap (in the office, always):** "You already know."
- **Tap (alt):** "Hire the boring one. Pay them well."
- **Tap (after the Owner ignored him):** "Or we could do this the smart way."

#### Sera "The Phonebook" Voss (FUTURE — requires fixer / favors-and-debts system)
- **Tap (at the bar with one phone, not drinking):** "I'll send someone. He's ten minutes out."
- **Tap (alt):** "If you need a yes, ask. If you need a clean yes, don't."

#### Cy "Cy-Note" Larrieux (FUTURE — requires recurring-patron / vibe-friction system)
- **Tap (booth corner):** "Brother. Listen. Brother. *Listen.*"
- **Tap (alt):** "I've been here since the curtains were curtains."

#### Ultan "The Witness" Doyle (FUTURE — requires press / scene-narration system)
- **Tap (small notebook open):** "I've been writing about rooms like this for twenty years."
- **Tap (alt):** "I'll remember tonight. You don't get to choose how."

---

## Authoring rules (short)

1. **One line per bubble.** Two lines per cell is the *catalog* — the
   floor view picks one. Don't write paragraphs.
2. **Voice differentiation per segment.** A Local doesn't sound like a
   Student. Lean on the per-segment voice notes at the top of each
   sub-section.
3. **Voice fidelity per cast member.** Pull from
   `character-bible.md`. If you can't blind-identify the speaker from
   the sentence shape, rewrite.
4. **No real names, no real brands, no real venues.** "The basement up
   the road" is fine; specific names aren't. Per
   `gameplay-north-star.md` + `content-intake-rules.md`.
5. **Rough Crowd stays attitude, not action.** No threats, no crime
   detail, no violence — friction and attitude only. Per
   `content-intake-rules.md` §13 / §14 and `nightclub-safety-framing`.
6. **Tag honestly.** CURRENT-BUILD only when every system the line
   needs exists today. FUTURE the moment a role or system doesn't.
7. **No flat numbers in bubbles.** Lines describe perception
   ("forty minutes", "six tickets"), not stats.
8. **No system promises.** If a line implies a system that doesn't
   exist, flag it as `FUTURE` or note the gap — don't trigger a build.

---

## Cross-references

- `character-bible.md` — full cast profiles (Tier × Status); voice
  palettes the station lines pull from.
- `character-roster.md` — flat catalog with Tier × Status grid;
  Uncommon and Common pool entries used in §3.
- `random-events.md` — sim-signal table the night-states map onto;
  encounter beats that the floor's tap surface might escalate into.
- `story-bible.md` — Neon Noir tone, recurring motifs ("One More Night,"
  "The room remembers," "Who's at the door?").
- `content-intake-rules.md` §11 (current safe content types — display
  text is the prototype example), §13/§14 (safety framing).
- `gameplay-north-star.md` — pillars (Ownership / People / Reactivity /
  Momentum); the tap-a-guest moment serves People + Reactivity.
- `roadmap.md` — Floor-View pass; "rendered density, not simulated
  individuals" guardrail.
- `CLAUDE.md` — multi-session lane-lock rule (this file lives in the
  content session's lane).
