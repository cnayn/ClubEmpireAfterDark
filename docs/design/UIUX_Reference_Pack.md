# Club Empire: After Dark — UI Identity Reference

> **Source of truth** for the visual and interaction identity of the night
> floor. **Documentation only.** Build prompts are scoped separately —
> nothing in this file is a build ticket.
>
> **Borrowing rule:** we borrow the *emotional* identity of Nightclub City
> and the *mechanical* lesson of The Sims. We do **not** copy assets, UI
> chrome, icons, characters, names, or exact layout from either. Club
> Empire is original IP. Inspirations are a feeling and a principle, not a
> reference sheet.

---

## Canonical UI Direction (the north star for every UI build)

> **This block is the canon.** Sections 1–13 below are how we realize it.
> Every UI build pass must serve these six points or stop and re-align.

### The fusion

We want the **emotional floor-view pull of Nightclub City**, combined
with the **organization and accessibility logic of The Sims** — shipped
in original Club Empire IP, Neon Noir, mobile-first.

### Source lessons (the borrow)

**Nightclub City lesson — the *feeling*:**
The player should *see* the club. The floor is alive. Guests are
visible. The club changes visually when the player improves it. The
player wants to come back and watch their own place.

**The Sims lesson — the *clarity*:**
The player should understand everything clearly. Build/Prep mode and
Live/Night mode feel distinct. Objects are organized by category.
Tapping an object explains what it does. The player improves the club
**however they want**, not along one forced path.

**Club Empire rule — the *line*:**
We do **not** copy Nightclub City assets, UI, characters, icons, names,
exact layout, or any protected IP. We **steal the feeling, not the
product.**

### The six canon points

1. **Floor view is the main game surface.** The screen the app returns
   to. The home of every primary interaction.
2. **Club improvement must be visible on the floor.** Every upgrade the
   player buys shows up the next time they open the room. No invisible
   stats.
3. **Guests and staff are readable** through sprites, clusters,
   bubbles, posture, and mood — not numbers. (Detail: Sections 6, 7, 8.)
4. **Build/Prep mode** is organized like a clean phone game, with
   categorized catalogs: **Lighting, Sound, Bar, Seating, Decor, Door,
   Bathroom, Staff, DJ/Music.** Tap → explain. Preview on the floor.
   Reversible before confirm. (Detail: Sections 3, 12; full per-category
   visual/mechanical/identity in
   [`level-and-floor-progression.md`](level-and-floor-progression.md)
   Section 3.)
5. **Live/Night mode** feels like **watching and commanding** the
   club — observation as gameplay, boss actions as commands aimed at a
   place. (Detail: Sections 1, 9.)
6. **The player should feel: "This is my club. I built this place."**
   Identity expression through customization paths; two players reach
   the same tier with visibly different rooms. (Detail: Section 12.)

### IP guardrail (non-negotiable)

If a build prompt drifts toward an NCC asset, layout, icon, or
character, **stop and re-translate** the prompt into Club Empire IP:

- Allowed: "as magnetic as NCC," "as readable as a Sims build menu."
- Not allowed: "make it look like NCC," "use the NCC bar icon," "copy
  the NCC zone arrangement," "name a character like X."

If unsure whether something is a borrow or a copy, **treat it as a
copy** and ask. The fusion is the feeling, not the product.

---

## 1. Core UI Principle

**The club floor is the game.**

Every primary interaction should happen on or in service of the floor.
Menus exist; the floor is the home. If a system makes the player leave
the floor more than it makes them stay, the system needs a floor
surface — not the other way around.

> Companion principle (already canon — `gameplay-north-star.md`):
> *legibility before depth.* The floor must read at a glance before it
> earns more state.

---

## 2. What to borrow emotionally from Nightclub City

### Allowed (the *feeling*)

- A **visible club** the player sees, not a menu they imagine.
- **A magnetic top-down view** the player wants to come back to and watch
  — the floor is the place the screen returns to by default.
- **Active guests inside the room** — bodies on the floor, not numbers
  in a panel.
- **Party energy** as a visual surface (lights, motion, pulse synced to
  the room).
- **Decoration shows up immediately.** Every upgrade the player buys is
  visible on the floor the next time they open it. No invisible buffs.
- **Music identity** — the room reads differently on different nights /
  events.
- **Social nightlife feel** — the room has chaos, not just throughput.
- **"One more night" loop visible on the floor itself** — closing time
  ends, prep opens, the same floor is waiting.

### Forbidden (the IP)

- Copied art, sprites, textures, icons, UI chrome.
- Copied character designs, faces, or names.
- Copied screen layouts or zone arrangements.
- A clone of any specific NCC interaction or animation.
- Any branded reference to NCC inside the product.

If a screen could be mistaken for NCC at a glance, redesign it. The
borrow is the *promise* — "you can see your club" — not the realization.

---

## 3. What to borrow mechanically from The Sims

The Sims taught a small set of design lessons we apply, **not** an art
style and not a simulation depth target:

- **Objects affect behavior.** Upgrades aren't just stat lines — they
  change what guests do in the room.
- **Zones matter.** The bar is a place, not a tab. The dance floor is a
  place, not a tab.
- **Characters show mood visibly.** Staff and guests project state via
  posture / emote / bubble, not a stat block.
- **The player commands the space.** Boss actions feel like *pointing at
  a place*, not selecting from a menu.
- **Reactions are visible.** The room confirms the decision.

### Organization (Sims-style)

- **Catalogs are categorized**, never flat lists. Upgrades group by
  *function*: **Lighting / Sound / Bar / Seating / Decor / Door /
  Bathroom / Staff / DJ/Music** (nine categories — canonical list).
- **Build/Live separation.** A distinct *Prep* mode for arranging and
  improving the room, distinct from *Night* mode when it runs. The
  player should never be unsure which mode they're in.
- **Object cards over stat sheets.** Tap an object → see what it does
  in plain language, what it costs, what it changes on the floor.

### Accessibility (Sims-style)

- **Every option explains itself in one short line.** No hidden
  prerequisites, no math reveal in a tooltip.
- **No reading walls.** A glance teaches the screen; a tap teaches the
  object.
- **One canonical action per object.** Don't bury the verb behind a
  context menu.
- **Iconography first, text second.** Per Section 10 copy tone.

We do **not** borrow: free-placement furniture, individual pathfinding,
relationship sim depth, needs decay, autonomous Sim agency. Those are
out of scope (per `gameplay-north-star.md` "explicitly NOT active").

---

## 4. Club Empire original identity

Tone: **Neon Noir**, synthwave-adjacent, darker than NCC, stylish but
gritty. The club is glamorous on the surface and consequential
underneath.

Palette (existing canon):

- Neon Pink, Electric Cyan, Deep Violet, Midnight Black.
- Avoid: corporate dashboards, generic tycoon UI, bright daytime
  palettes.

Original mechanics that distinguish Club Empire from NCC and The Sims:

- Deeper management logic — pressure meters, service ratios, real
  reckoning.
- **Staff drama** — named crew with traits, hidden flaws, Caramel arc.
- **Policies** — door, smoking, future compliance posture.
- **Drink prep** — pre-night stock decisions affect the floor.
- **Crew trust** — staff warnings, future loyalty, Stage 2 unlocks.
- **Random encounters** — pressure beats per `random-events.md` /
  `night-encounters.md` / `phone-messages.md`.

---

## 5. Floor visual hierarchy

The floor is a **2.5D board** — readable top-down zones, not full
isometric, not flat list. Each zone is a *place* with a state.

Zones (current build target):

- **Entrance / Door** — top of the board; rope line spillover visible.
- **Bar** — rail, queue, bartender position.
- **Dance Floor** — central mass; density and pulse.
- **DJ Booth** — corner marker; the room's heartbeat.
- **Bathroom** — small tile; warnings only when active.
- **Staff area** — back-of-house slot; rarely highlighted, important
  when it is.
- **Future VIP** — locked tile; visible silhouette so progression is
  legible without being interactive yet.

Reading order on first glance: Door → Bar → Dance Floor → DJ. The eye
should sweep clockwise (or culturally appropriate equivalent) and pick
up pressure inside two seconds.

---

## 6. Guest visual language

Guests are **clusters and silhouettes**, not individual NPCs (per
"explicitly NOT active" canon). Each cluster reads a state:

- **Dancing** — motion pulse, warm tint, dance-floor cluster.
- **Waiting** — static cluster, queue line, neutral tint.
- **Angry** — red bubble or red ring on the cluster.
- **Impressed** — gold sparkle or warm glow.
- **Bored** — desaturated cluster, slower pulse.
- **Regulars** — small persistent marker (gold dot) on cluster.
- **Rough crowd** — yellow alert ring around the cluster.
- **Music heads** — cyan glow synced to the room pulse.

Bubbles are **typed icons**, not freeform speech, to keep render cost
low and localization sane.

---

## 7. Staff visual language

Staff are **named tokens** at their station. Each token reads:

- **Bartender at bar** — token behind the rail; pulses when working.
- **Bouncer at door** — token at the rope; posture varies by who.
- **DJ booth marker** — booth tile glows when active.
- **Future waiter** — path / zone on the floor (future, do not build).
- **Caramel** — calm protector; steady stance, warm ring at high trust.
- **John** — aggressive door energy; tight stance, red flash on
  incident.

Staff state never shows numbers. State shows as **posture / ring color /
bubble icon**, per character-bible voice notes.

---

## 8. Pressure visual language

Pressure is the floor's primary information surface. Each zone carries a
meter that's read as **glow + bubble + queue density**, not as a number.

- **Bar pressure** — amber glow on bar tile · drink-icon bubbles on
  waiting guests · queue density at the rail.
- **Door pressure** — pulsing red ring on door tile · line cluster
  outside · bouncer-warning bubble.
- **Floor energy (vibe)** — dance-floor pulse rate · cyan / violet glow
  intensity · music-note bubbles.
- **Bathroom pressure** — warning badge on bathroom tile · small queue
  cluster · hygiene signal icon.

Pressure colors map consistently across zones: **amber = service strain**,
**red = risk**, **cyan/violet = energy**, **gold = positive moment**.

---

## 9. Boss action visual language

Boss actions are **commands aimed at a place**, not menu items. Each
action should produce a visible floor change within one beat.

- **Push DJ** — DJ booth pulses cyan; dance-floor pulse rate ticks up
  briefly.
- **Check Bar** — bar tile highlight; bartender token leans forward;
  queue clears one tick.
- **Send Bouncer** — door tile highlight; bouncer token moves into
  position; door risk ring softens.
- **Work the Room** — owner-presence wave across all zones for a
  moment; small warm pulse on the regulars cluster.

Sound (future): each action gets a sub-second audio cue. Visuals carry
the moment until audio lands.

---

## 10. Copy tone

Use **short nightclub language**, not management-report language. Lines
are spoken-sounding, terse, room-voiced. Per `nightclub-content-writing`.

Good (use this):

- "Bar is cracking."
- "Door is hot."
- "Floor woke up."
- "Caramel cooled it."
- "Boss is in the room."

Bad (avoid):

- "Service ratio modified."
- "Customer satisfaction updated."
- "Reputation modifier applied: +0.04."

Numbers belong in code. Floor copy is voice.

---

## 11. Implementation notes for Claude A

The build session owns realization; this section is the guardrail.

- **Stack:** Expo + React Native + TypeScript (existing). No web-only
  prototypes. No web-first refactor.
- **No Tailwind** — keep StyleSheet / theme tokens consistent with the
  rest of the codebase.
- **No Framer / Framer Motion** — use Reanimated / Animated already in
  the project.
- **No copied IP** — original assets only. If a placeholder is needed,
  use a flat shape, not a fetched image.
- **No full 3D** — no Three.js, no react-three-fiber, no GLB pipelines.
  The board is **2D today, headed to 2.5D later** — stylized top-down
  zones with depth via tint, shadow, and z-order. See **Section 13 —
  UI Roadmap** for the phase order.
- **Push the current floor toward a readable 2D club room first.**
  Zones as tiles. Guests as cluster sprites today, readable sprites
  next. Staff as named tokens. Pressure as glow + bubble + density.
  2.5D depth comes after the 2D room reads cleanly.
- **Determinism preserved** (per `gameplay-north-star.md` design law
  #4). UI surfaces sim state — UI never generates new RNG.
- **Performance budget.** The floor renders every tick; keep it
  cheap. Cluster sprites > individual NPCs. Tint shifts > particle
  systems.
- **Accessibility.** Pressure must be readable without color alone —
  pair color with icon and density.

---

## 12. Decorate & Improve (Player-Driven Customization)

The player should be able to improve the club **however they want** — no
single forced upgrade path, no hidden prerequisites, no "you must build
X first" gating beyond what the economy already forces.

### Principles

- **Multiple valid paths.** A player who chases sound-first should
  succeed differently from a player who chases comfort-first or
  door-first. The economy gates speed; the player picks identity.
- **The floor reflects every choice.** Buy a banquette → the banquette
  shows on the floor. Buy a lighting rig → the dance floor lights
  change. No invisible upgrades.
- **No "right" build order.** The progression tree is a tree, not a
  line. The Goal Board suggests; it does not dictate.
- **Identity expression.** How the player builds the club IS who they
  are as an owner. The same reputation tier can be hit through wildly
  different floor configurations.

### Prep mode (the "build/decorate" surface)

- A distinct mode the player enters between nights.
- **Categorized catalog** (per Section 3 organization rules):
  **Lighting / Sound / Bar / Seating / Decor / Door / Bathroom / Staff
  / DJ/Music** (canonical nine).
- **Preview on the floor.** Selecting an upgrade shows where it lands
  and what it changes — before the player commits cash.
- **Reversible while previewing.** Once confirmed, the upgrade is real;
  before confirmation, the player can wander.
- **No micromanagement of placement.** The room knows where the bar is.
  The player chooses *what* to install, not *which pixel*. (Per
  `gameplay-north-star.md` — no free-placement furniture.)

### What the player customizes

- **Look** — palette accents, lighting style, decor pieces.
- **Function** — bar setup, sound rig, seating capacity, bath capacity.
- **Vibe** — music identity (event/theme), door policy posture.
- **Crew shape** — who's hired, who's scheduled, who's specialized.

### What the player does NOT customize (current build)

- Individual tile-by-tile placement.
- Free-form room shape.
- NPC outfits, individual guest stats.
- Anything that requires a system listed under "explicitly NOT
  active" in `gameplay-north-star.md`.

### Why this matters

NCC's magnetic loop wasn't just "look at your club" — it was "look at
*my* club, the one I built, the one nobody else built the same way."
That's the loop we want. The Sims taught us how to make it readable.
Club Empire ships it Neon Noir.

---

## 13. UI Roadmap (the main direction, not someday fantasy)

> **Status change:** 2D / 2.5D is **no longer a "someday" target.** It is
> the **main UI direction** for Club Empire. The phases below are the
> through-line for every UI build pass from here forward. The earlier
> stylized-zones-with-clusters version was the **starting point** of
> Phase 1 — not the destination.

### Phase 1 — Current floor (today)

**What it is:** stylized 2D board. Zones as tiles. Guests as cluster
sprites / density blobs. Staff as named tokens at their stations.
Pressure as glow + bubble + queue density. Boss actions point at
zones.

**Goal:** the floor reads at a glance — door, bar, dance floor, DJ —
in under two seconds. Pressure is visible without numbers.

**Acceptance:** the player stays on the floor screen and watches the
night happen. They do not feel they're clicking through cards.

### Phase 2 — Next floor (stronger 2D club room)

**What it is:** the same 2D board, **leveled up**. Guests become
**readable sprites** (still simple, still cluster-friendly, but with
silhouette and posture). Staff tokens gain idle animation and clearer
identity. Zones get layered backgrounds (bar tile reads as *a bar*,
dance-floor tile reads as *a floor*).

**What it isn't:** still no individual NPC pathfinding. Still no free
placement. Still no 3D.

**Goal:** the room is the club, not a board. Closer to NCC's
*"that's my place"* feeling, in original IP.

**Acceptance:** a screenshot of the floor reads as a nightclub on its
own — not a UI mockup.

### Phase 3 — Later (2.5D depth + richer room customization)

**What it is:** angled perspective on the 2D base. Depth via tint,
shadow, z-order, light bleed. **Decorate mode** matures (per Section
12): the player previews upgrades on the floor and the floor shows
each install — banquettes change, lighting rigs change, decor pieces
change.

**What it isn't:** still no Three.js, no GLB, no free placement of
individual furniture pieces. The room knows its slots; the player
fills them.

**Goal:** the floor has weight. The player sees their *own* club, not
a template.

**Acceptance:** two players with two different upgrade paths produce
two visibly distinct rooms.

### Phase 4 — Long-term (the NCC emotional finish line, on Club Empire IP)

**What it is:** the full magnetic loop. The player opens the app, the
floor is alive, decisions ripple visibly, decoration is identity,
characters carry weight. Pulled forward by everything we banked in
`random-events.md`, `night-encounters.md`, `phone-messages.md`,
`relationship-web.md`, `event-bible.md`.

**What it isn't:** an NCC clone. **No copied assets, no copied UI, no
copied characters, no copied names, no exact layout.** The borrow
remains *emotional*, per Section 2.

**Goal:** the "one more night" feeling, lived inside an original
Neon Noir nightclub.

**Acceptance:** a player who has never played NCC plays Club Empire
and feels the magnetic loop on its own terms.

### IP guardrail (applies to every phase)

The roadmap is about how readable and alive the floor gets. It is
**not** a license to copy. Per Section 2:

- Borrow: feeling, magnetism, decorate-and-see-it, guests-in-the-room,
  music-as-room-state.
- Do not borrow: assets, sprites, icons, screen layouts, characters,
  names, exact compositions.

If a build prompt asks for "make it look like NCC," translate it to:
"make it as *magnetic* as NCC, in our IP." Same target, original
realization.

---

## 14. Floor 1 Starter Club Room Direction

> **Build target for Claude A's next UI pass.** Floor 1 is the **first
> real club room** — the visible small nightclub players see on day one.
> Not a dashboard, not an abstract board. A *room*.

### What Floor 1 must visually include

The room must contain — visibly, in a single screen — all of:

- **Entrance / Door**
- **Bar**
- **Dance Floor**
- **DJ Booth**
- **Bathroom**
- **Staff Area**
- **Locked VIP / Future expansion area** (silhouette visible, locked
  indicator on)

Each zone is a *place* the player can see, not a label on a tab.

### Emotional reference (what we're chasing)

The reference screenshots succeed because:

- The club is **visible**.
- The floor is the **center** of the screen.
- **Guests are visible** inside the room.
- **Furniture changes the identity** of the room.
- **UI sits around the edge** — it frames the floor, it does not cover
  it.
- **Color / light / music** create the pull.
- The player **wants to watch their own club**.

Floor 1 should hit those same emotional notes — in original IP.

### Original Club Empire version

Darker than the references. Neon Noir, synthwave / cyber nightlife,
gritty stylish. More management-driven, more staff-drama-driven. The
room feels like *a Club Empire club*, not a clone of anything else.

Palette and tone per Section 4. Voice per Section 10.

### Visual progression (same Floor 1, growing identity)

- **Early Floor 1** looks cheap / simple. Basic sprites, bare zones,
  thin crowd. This is the start of the story, not the failure state.
- **As the player advances**, the *same* floor becomes brighter, more
  crowded, more decorated, more premium. Upgrades land on the floor.
- **Future floors** unlock later. A second floor, a bigger venue, an
  expansion wing — supported by the long-term roadmap, not Phase 1.

Same room, lived-in. The player's history is visible on the floor.

### Build guidance for Claude A (phase-tagged)

**Phase 1 — Make the current floor read as a real 2D club room.**
- Simple sprites for guests and staff.
- Simple object furniture (bar block, booth, decks, rope, bath sign).
- Readable zones with clear edges.
- UI lives at top/bottom edges, never on the floor.

**Phase 2 — Improve sprite and object visuals.**
- Guests and staff become readable people-shapes with posture and
  mood. Still cluster-friendly.
- Furniture gets identity (a *bar* reads as a bar, not a rectangle).
- More idle movement, more "watchable club" feel.

**Phase 3 — 2.5D depth / iso-leaning perspective using original assets
only.**
- Angle / depth via tint, shadow, z-order, light bleed.
- **No 3D engine** unless later approved. No GLB, no
  react-three-fiber, no Three.js.

(Phases align with Section 13. Floor 1 is the room those phases polish.)

### Acceptance criteria (strong)

The build is done when:

- A screenshot of the floor **reads as a nightclub immediately** — not
  a UI mockup.
- **Door / Bar / Dance Floor / DJ / Bathroom** are visually obvious
  without labels.
- Guests look like **people or simple sprites**, not dots.
- **Upgrades appear visually** on the floor when purchased.
- **UI does not cover the floor.** Edges only.
- **Text supports the floor; text does not replace it.**

### Forbidden (non-negotiable)

- Copied Nightclub City assets, sprites, or icons.
- Copied NCC layout or zone arrangement.
- Copied characters or names.
- Exact isometric clone of any reference.
- Full pathfinding.
- Free furniture placement (slot-based only, unless later approved).
- Full NPC simulation.

### Build-prompt translation rule

When the owner says **"make it like Nightclub City,"** Claude A
translates that to:

> **"Make it magnetic like Nightclub City: visible club, visible
> guests, visible decor, edge UI, colorful floor — in original Club
> Empire IP."**

Same emotional target, original realization. Always.

---

## 15. Night Pacing Philosophy

> The night must feel like a **living club**, not a fast timer where the
> player panic-clicks every boss action.

### Principles

- **Observation is gameplay.** The room must reward *looking* at it.
  Boss actions are a layer *on top of* watching, not a replacement for
  it.
- **Boss actions are deliberate owner decisions**, not reflexes. Each
  one should feel like the player *chose* to step in.
- **Mid-night encounters present, they don't interrupt.** The room
  keeps running underneath any encounter modal. The clock does not
  pause to wait for the player.
- **Pressure builds; it does not spike without warning.** Glow first,
  bubble next, encounter only after the player has had time to see it
  coming.
- **"Ride it out" is a valid choice.** Doing nothing is sometimes
  correct. The night must not punish the player for thinking.

### Target experience

The player can:

1. Put the phone down. Watch the room breathe for a beat.
2. Pick it up. Notice a glow building somewhere. Make a deliberate
   choice.
3. Watch the room respond.
4. Put it down again.

If the night demands constant input, pacing is broken. If the night
goes silent between events, pacing is also broken. The floor is always
*doing something* — even when nothing is wrong.

### Anti-patterns (do not build)

- A timer that punishes the player for taking a beat.
- An action tray that demands input every few seconds.
- A floor that goes quiet between encounters.
- A floor that screams red constantly.
- Boss actions with no cooldown or no visible consequence — both turn
  them into compulsive clicks instead of decisions.

### Why this matters for the NCC borrow

NCC's magnetic loop is **watching your own club**, not playing a
reflex game. Club Empire's pacing must preserve that — in original IP,
Neon Noir, with deeper management underneath.

---

## 16. UI Rules for Night Readability

Four rules every night-mode build must respect. Non-negotiable.

### Rule 1 — Pressure must be visible before it becomes text

A bar backing up reads, in order:

1. **Amber glow** on the bar tile (visual signal).
2. **Queue density** at the rail (state of the room).
3. **Drink bubble** above waiting guests (cluster comm).
4. **Bartender token leans forward** (named-staff comm).
5. *Then* a short voice line — "Bar is cracking" — over the visual.

Text is the *last* layer. If the player only learns the bar is in
trouble from a string, the screen has failed.

### Rule 2 — Every major problem needs three things

The triangle: **zone + visual signal + possible owner response.**

- **Zone:** the problem lives in a place on the floor.
- **Visual signal:** the player can see it without reading.
- **Owner response:** there is at least one thing the player can do
  (boss action, encounter choice, or deliberate inaction).

No invisible problems. No problems without a response. No floating
warnings that don't point at a tile.

### Rule 3 — The player should know what's happening before the debrief

Debrief explains the **why** and the **people**. The night itself
shows the **what**. If a problem only surfaces in the debrief, the
night failed the player.

The debrief is the room *remembering*. The night is the room *doing*.

### Rule 4 — Text supports the floor; text does not replace the floor

- A line of voice copy belongs **over** a visual cue, never instead of
  one.
- Reading order on any night-mode screen: **floor first, characters
  second, text third.**
- If a screen could be played with the text hidden and still make
  sense, the visuals are right. If it can't, the visuals are
  underbuilt — add more visual signal, do not add more text.

### Rule 5 — Every major pressure state must have a paired guest or staff reaction

A glowing tile alone is not enough. The room must *react*:

- **Bar pressure** without Rosa leaning forward / a drink bubble / a
  guest cluster looking elsewhere = the player feels nothing.
- **Door pressure** without John's posture tightening / the line
  cluster moving / a warning ring = the door is invisible.
- **Dance floor cooling** without thinned cluster / dimmed booth /
  bored cluster = the room is just darker, not *sadder*.

Pressure is a state of the **room**, not a state of a meter. If a
pressure state can fire without a paired character reaction, the rule
is broken — add the reaction, do not add a number.

### Rule 6 — Boss actions are owner decisions, not score buttons

The action tray is **deliberate choice**, not a meter the player has
to fill. Per Section 15:

- Each boss action has a visible **consequence on the floor** within
  one beat.
- Each boss action has a **cooldown** so the player can't spam it.
- "**Ride it out**" — the choice to not press anything — is always
  valid and sometimes correct.
- The night must not punish thinking. The screen should never make
  the player feel they are "behind" on a click.

If a boss action ever feels like a *score button* (press it because
it's available, not because the room needs it), the design has
failed.

---

## 17. Live Communication Language (staff, guests, story inside the night)

Per Section 16 Rule 1: visuals first, voice second. Characters speak by
*doing*, not by talking.

### Staff communication (named tokens at stations)

- **Bartender warns about backlog** → token leans forward · drink bubble
  over the rail · amber glow on bar tile.
- **Bouncer notices door tension** → tightening stance · red ring on
  door tile · short bark bubble.
- **DJ reacts to a dead floor** → booth dims · low-energy bubble
  hovers · dance-floor pulse slows.
- **Caramel** (current) → calm protector ring · "bro" bubble icon when
  stepping in or warning.
- **John** (current) → tight stance · red flash on incident · short
  bark bubble.
- **Rosa** (current) → warm ring at the rail when regulars are happy ·
  steady-hand bubble icon during a save.

Staff state **never shows numbers.** State shows as posture, ring
color, and bubble icon (per Section 7).

### Guest communication (clusters)

- **Waiting** → static cluster · clock bubble.
- **Angry** → red bubble · cluster recoil away from the source.
- **Happy / impressed** → gold sparkle · warm tint on the cluster.
- **Bored** → desaturated cluster · slow pulse.
- **Regulars commenting on culture change** → gold-marker cluster ·
  thought bubble icon. (Hidden-trait substrate is FUTURE; the visible
  bubble can land in Phase 2.)
- **Rough crowd notice** → yellow alert ring around the cluster.

Bubbles are **typed icons**, not free-form speech (per Section 6).

### Story integration inside the night

Story does not only live in debriefs and docs. Characters surface
**during the night** through:

- **Short bubbles** — a typed line over a token, sub-second hold.
- **Phone texts** — per [`phone-messages.md`](phone-messages.md),
  rendered as a phone-bubble overlay that doesn't pause the room.
- **Staff warnings** — Caramel pulls the owner aside; a future
  hidden-trait surfaces as a Stage-2 hook (canon, not build).
- **Quick interaction moments** — encounter modals from
  [`night-encounters.md`](night-encounters.md) that *present* without
  freezing the floor underneath (Section 15 Pacing Principle 3).
- **Visible reactions on the floor** — guests recoil, regulars
  cluster, bartender leans forward. *The floor itself is the
  storyteller.*

> **The story is what the floor does. The debrief is what the room
> remembers.** If a story beat happens only in the morning summary,
> the night was reading like a report, not a club.

### Pacing of communication

- A single bubble holds ~1–2 seconds, then fades. Never sticky.
- No more than 2–3 active bubbles on screen at once. The room can
  speak, but it does not shout over itself.
- Phone overlays do not stack — one at a time, dismissible.
- Encounters cooldown so the night isn't a parade (Section 15).

### NCC emotional target — reinforced

What we're chasing: **visible club, visible guests, visible decor,
visible reactions, edge UI, one-more-night pull.** What we never copy:
assets, layouts, icons, characters, names, or UI chrome. Per Sections
2, 13, 14 — the borrow is feeling, not product.

---

## 18. Screenshot Interpretation (how to read the reference, not copy it)

> The uploaded Nightclub City screenshots are **emotional reference**,
> not copy targets. They show *why* a visible club floor pulls the
> player back. They are **not** asset packs, layout templates, or
> icon libraries.

### 1. Why these references work emotionally

The screenshots succeed because every one of them puts the **club
floor at the center of the screen** and lets the player **see what
they built**. Specifically:

- The club is *visible* — not hidden behind menus.
- **UI sits around the edge** — it frames the floor, it does not cover
  it.
- **Guests are visible inside the room** — bodies, not numbers.
- **Furniture changes the identity** of the room — buy something, see
  something.
- **Colorful nightlife energy** — light, motion, density read at a
  glance.
- The player **wants to come back and watch their own place** —
  observation is part of the loop, not a pause.
- **Object/menu accessibility like a clean phone game** — tap a thing,
  understand a thing.

That bundle of feelings is the **borrow target.** Original assets
realize it.

### 2. What Club Empire borrows (the *feeling*)

- **Visible club floor as the main screen** (per Canon point 1; §14).
- **Edge UI around the room** (per §14 acceptance: "UI does not cover
  the floor").
- **Guests visible inside the club** (per §6 cluster language).
- **Furniture visibly changing the room identity** (per §12 + Progression §3).
- **Player wants to watch their own club** (per §15 pacing).
- **Colorful nightlife energy** (per §4 palette, §8 pressure language).
- **Object/menu accessibility like a phone game** (per §3 Sims
  organization + accessibility).

### 3. What Club Empire must NOT copy

Non-negotiable. Per Canon block IP guardrail + §2 Forbidden + §14
Forbidden:

- **Assets, sprites, textures** — original art only.
- **Icons & UI chrome** — original icon set, original chrome.
- **Exact UI layout** — our screen is composed for Club Empire's zones
  and pressure language, not copied from a reference.
- **Exact furniture designs** — a banquette can be a banquette; it
  cannot be *that* banquette.
- **Characters, names, faces** — Club Empire cast only.
- **Branded references** of any kind inside the product.

If a screen could be mistaken for the reference at a glance, redesign
it. Same emotional target, original realization.

### 4. The Club Empire version (so this isn't a clone)

The reference is bright and casual. Club Empire is **darker, grittier,
more adult-feeling.** Specifically:

- **Neon Noir** — synthwave-adjacent palette per §4 (neon pink,
  electric cyan, deep violet, midnight black).
- **Starter cheap club first** (per Progression §2): Floor 1 opens
  basement-tier, bare, thin crowd — and *that reads as a club*, not a
  placeholder.
- **Grows visually through upgrades** (per Progression §3): same
  Floor 1 becomes brighter, more crowded, more decorated, more premium
  as the player invests.
- **Stronger management logic than the reference** — pressure meters,
  service ratios, real reckoning (per §4 original mechanics).
- **Staff drama** and **guest incidents** (per
  [`character-bible.md`](character-bible.md) +
  [`night-encounters.md`](night-encounters.md)).
- **Original IP, top to bottom.** Steal the feeling, not the product.

### 5. How Floor 1 Starter Club interprets this

Floor 1 must hit the emotional bundle above using **only original
assets** and Club Empire's own composition. The visible-at-a-glance
checklist (per §14 + Progression §2):

- **Entrance / Door** — visible at the top edge of the room.
- **Bar** — visible rail with bartender slot.
- **Dance Floor** — *central tile* (per the emotional reference: the
  floor sits at the center).
- **DJ Booth** — visible corner platform.
- **Bathroom** — visible small tile with sign.
- **Staff Area** — visible back-of-house slot.
- **Locked VIP / Future expansion area** — visible silhouette with a
  locked indicator (the player can see where growth goes from day
  one).
- **Guests and staff** rendered as **simple sprites / silhouettes** —
  not dots, not numbers. Cluster-friendly per §6.
- **UI lives on top, bottom, and edges** — never on the floor.
- **Upgrades appear visibly on the floor** when purchased — banquette
  bought → banquette visible; lighting rig bought → dance floor tint
  changes.

If a Floor 1 mockup could be confused with a reference screenshot,
the composition is wrong even if every asset is original. Re-arrange
zones into a Club Empire composition.

### 6. How this supports future level/floor progression

The same emotional principles ladder up through every phase (per §13
roadmap and Progression §5):

- **Phase 1 → 2:** the same Floor 1 grows readable sprites, more
  movement, more identity furniture. The room becomes *watchable*.
- **Phase 3:** 2.5D depth on the same Floor 1. Decorate mode matures.
  Upgrades show with weight (shadow, light bleed). Different upgrade
  paths produce visibly different rooms.
- **Future floors (Phase 4):** Floor 2 / expansion unlocks (bigger
  dance floor, second bar, VIP room, private event room) honor the
  same emotional checklist — visible, edge UI, identity-through-
  furniture, magnetic to return to.
- **Long-term:** the player feels the **"one more night" pull** every
  time they open the app. Original IP, Neon Noir, magnetic in our own
  voice.

The reference is a **floor**, in every sense: the bottom of the
ambition for emotional pull, never the ceiling for how we ship it.

### Build Prompt Translation (when the owner says "make it like NCC")

The translation is canon in §14 and **re-stated here for emphasis**:

When the owner says **"make it like Nightclub City,"** Claude A
translates that to:

> **"Make it magnetic like Nightclub City: visible club, visible
> guests, visible decor, edge UI, colorful nightlife energy — but in
> original Club Empire IP."**

Same emotional target. Original realization. Always.

If a build prompt drifts — "use the NCC icon," "match that exact
layout," "name a character like X" — **stop and re-translate.** The
fusion is the feeling, not the product.

### Specifics from the uploaded reference frames (what's visible, what to avoid)

> The latest reference frames clarified concretely which patterns are
> emotional borrows vs which are direct copy hazards. The frames show
> an isometric club floor, edge UI on top and bottom, chibi-style
> guests, dance cages, a Buddha-statue lounge piece with a koi pond,
> a top stats strip (popularity / luxury / money), a "Throw A Party"
> button, a character-info popup, a bottom tool palette, a friend-
> invite strip, and a character store with named purchasable
> celebrities.

#### Emotional borrows we keep (already canon, reinforced here)

- **Isometric / 2.5D framing of the floor** — sells "this is a room"
  at a glance. Phase 3 target (per §13). Composition is original.
- **Floor at the center of the screen** — not buried under menus.
- **Top edge: club identity + key stats. Bottom edge: tools / actions.
  Floor: untouched by UI chrome.** That arrangement is the magnetic
  pattern.
- **Guests rendered as visible characters**, not dots. Cluster-friendly
  in Phase 1; readable silhouettes in Phase 2.
- **Identity-defining decor pieces** visible on the floor (a centerpiece
  feature changes what the room *is*).
- **Tap-a-thing-to-see-it** — a popup card with name + role + small
  context, dismissible. Per §3 object cards.
- **Top stats strip** as a Club Empire-voiced equivalent (we already
  have reputation tier + cash + pressure language — those replace
  popularity/luxury, in our voice).

#### Concrete copy hazards (do NOT copy any of these)

- **Chibi / oversized-head art style.** Recognizable as the reference
  and tonally wrong for Neon Noir. Club Empire silhouettes are
  proportioned closer to stylized adults — leaner, darker, more
  shadow. Cluster sprites today; silhouette-readable in Phase 2.
- **Celebrity parody / lookalike character names.** The reference's
  character store uses parody names of real public figures. **Club
  Empire never does this.** It's an IP and defamation risk *and* a
  voice mismatch — our cast is original, named per
  [`character-bible.md`](character-bible.md) (Caramel, John, Rosa,
  Milo, Jin, Vince, Grace, Pavel, Dimitri, Marcus). New cast
  additions follow the character pipeline in
  [`content-intake-rules.md`](content-intake-rules.md).
- **A character / celebrity store as a meta-pattern.** Club Empire
  does not buy characters. Staff are *hired* (per
  [`character-bible.md`](character-bible.md) +
  `nightclub-staff-system` skill). VIPs are future relationship-layer
  content, not store SKUs.
- **Dance cages with pole performers, Buddha-statue koi-pond lounge
  centerpieces, the specific zig-zag-tiled dance floor pattern, the
  cyan/gold cubic floor tessellation.** These are *specific decor
  designs* in the reference. Our decor pieces solve the same
  *function* (a centerpiece that changes the room's identity) with
  **original silhouettes** — a synth-rig podium, a neon arch, a sunken
  velvet pit, etc. Decor names and designs live in future
  [`level-and-floor-progression.md`](level-and-floor-progression.md)
  category expansions, not here.
- **Dancers as an active gameplay role.** Per
  [`gameplay-north-star.md`](gameplay-north-star.md)'s "explicitly
  NOT active" list, dancers are not a current role. Floor-decor
  *animation* may evoke movement (a vibrating speaker rig, a
  spinning light) — but no animated performer characters.
- **The exact bottom tool-palette icons** (mailbox, gift box, head,
  paint bucket, monitor, star). Original icon set required. Our edge
  UI surfaces are our own: prep catalog, boss action tray, debrief,
  goals.
- **"Throw A Party" button copy and the disco-ball glyph.** Our
  equivalent is the prep-mode event selector and the night-mode boss
  action tray, in Club Empire voice (per §10 copy tone).
- **Top stats labels "POPULARITY" / "LUXURY" with cyan numeric
  pills.** Our equivalent is the reputation tier badge + cash +
  on-floor pressure language. We do not use those words or that
  visual treatment.
- **"Click to Invite a Friend" social CTAs and friend-strip across the
  bottom.** Club Empire is **offline-first** (per project canon and
  the "no backend" guardrail in
  [`level-and-floor-progression.md`](level-and-floor-progression.md)
  §8). No social invite mechanics, no friend list, no friend-derived
  income or staff.
- **Character info popup as a portrait card with name + spend stat in
  a glassy chrome.** Our equivalent: a Club Empire-styled card with
  name + role + voice line, sitting *over* the floor edge, dismissed
  on tap-elsewhere. No glassy chrome borrowed.
- **Hugely-inflated currency display ($1.9B with comma-separated
  pills).** Club Empire's economy is meaningful at much smaller
  numbers (per
  [`gameplay-north-star.md`](gameplay-north-star.md) balance canon).
  The big-number aesthetic is part of the reference's casual-social
  feel and conflicts with our management-driven tone.

#### Composition translation (how the same surfaces become Club Empire)

| Reference surface | Club Empire equivalent |
| --- | --- |
| Isometric floor center | 2D today → 2.5D Phase 3 (§13), original composition |
| Top-left identity card | Club name + reputation tier badge + cash |
| Top-right popularity/luxury pills | Pressure language across floor zones (§8) |
| "Throw A Party" CTA | Event selector in Prep mode |
| Bottom tool palette (NCC icon set) | Boss action tray (Push DJ / Check Bar / Send Bouncer / Work the Room) + goals + prep |
| Character store (Buy/Wish parody celebs) | Hire/Schedule from named cast (`character-bible.md`) |
| Friend invite strip | **Removed.** Offline-first, no social CTAs. |
| Tapped character popup with $spent | Tap-staff card with name + role + voice line + (future) trust |
| Buddha-statue lounge centerpiece | Future original Club Empire centerpiece (synth-rig podium, neon arch, sunken velvet pit) — banked, not specified |
| Dance cages with performers | **Removed.** Decor only, no animated performer characters |

#### Tone correction (so we don't drift toward the reference)

The reference reads **bright, casual, friendly, social-game energy.**
Club Empire reads **dark, gritty, magnetic, management-driven,
adult-feeling**:

- Palette stays Neon Noir (§4): neon pink, electric cyan, deep
  violet, midnight black. No bright cyan/baby-blue dominants.
- Lighting is *moody*. Highlights are *neon*. The room is not lit
  like a daytime cartoon.
- Copy is short and spoken-sounding (§10), not exclamation-heavy
  marketing voice.

If a Floor 1 mockup leans bright, friendly, and chibi, it has drifted
toward the reference. Pull it back to Neon Noir.

---

## Cross-references

- Tone, mood, world: [`story-bible.md`](story-bible.md).
- Pillars and design law: [`gameplay-north-star.md`](gameplay-north-star.md).
- Characters and voice: [`character-bible.md`](character-bible.md).
- Floor encounters (on-floor content): [`night-encounters.md`](night-encounters.md).
- Phone surface content: [`phone-messages.md`](phone-messages.md).
- Encounter engine: [`random-events.md`](random-events.md).
- Floor/level/goal progression: [`level-and-floor-progression.md`](level-and-floor-progression.md).
- Live-night bubble lines: [`bubble-bank.md`](bubble-bank.md).
- Future bar/policy specs (banked): [`future-bar-and-policy-systems.md`](future-bar-and-policy-systems.md).
- Intake pipeline: [`content-intake-rules.md`](content-intake-rules.md).
