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

## Cross-references

- Tone, mood, world: [`story-bible.md`](story-bible.md).
- Pillars and design law: [`gameplay-north-star.md`](gameplay-north-star.md).
- Characters and voice: [`character-bible.md`](character-bible.md).
- Floor encounters (on-floor content): [`night-encounters.md`](night-encounters.md).
- Phone surface content: [`phone-messages.md`](phone-messages.md).
- Encounter engine: [`random-events.md`](random-events.md).
- Intake pipeline: [`content-intake-rules.md`](content-intake-rules.md).
