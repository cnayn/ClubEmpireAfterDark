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
- **Active guests inside the room** — not numbers in a panel.
- **Party energy** as a visual surface (lights, motion, pulse).
- **Decoration pride** — the player feels the upgrade they bought.
- **Music identity** — the room reads differently on different nights.
- **Social nightlife feel** — the room has chaos, not just throughput.

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
  The board is 2.5D: stylized top-down zones with depth via tint, shadow,
  and z-order.
- **Push the current floor toward a readable 2.5D board.** Zones as
  tiles. Guests as cluster sprites. Staff as named tokens. Pressure as
  glow + bubble + density.
- **Determinism preserved** (per `gameplay-north-star.md` design law
  #4). UI surfaces sim state — UI never generates new RNG.
- **Performance budget.** The floor renders every tick; keep it
  cheap. Cluster sprites > individual NPCs. Tint shifts > particle
  systems.
- **Accessibility.** Pressure must be readable without color alone —
  pair color with icon and density.

---

## Cross-references

- Tone, mood, world: [`story-bible.md`](story-bible.md).
- Pillars and design law: [`gameplay-north-star.md`](gameplay-north-star.md).
- Characters and voice: [`character-bible.md`](character-bible.md).
- Floor encounters (on-floor content): [`night-encounters.md`](night-encounters.md).
- Phone surface content: [`phone-messages.md`](phone-messages.md).
- Encounter engine: [`random-events.md`](random-events.md).
- Intake pipeline: [`content-intake-rules.md`](content-intake-rules.md).
