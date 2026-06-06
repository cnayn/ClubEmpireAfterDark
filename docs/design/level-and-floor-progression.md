# Level & Floor Progression

> **Status:** design canon. **Documentation only.** Build prompts are
> scoped separately — nothing here is a build ticket on its own. See
> Section 9 for the recommended build slices Main Claude Code can scope
> from this.
>
> **Companion canon:** [`UIUX_Reference_Pack.md`](UIUX_Reference_Pack.md)
> (canonical UI direction + Floor 1 starter room),
> [`gameplay-north-star.md`](gameplay-north-star.md) (pillars, design
> law, "explicitly NOT active" list), [`event-bible.md`](event-bible.md)
> (active events + future event chain), [`character-bible.md`](character-bible.md)
> (named staff voices).
>
> **IP rule:** borrow the *feeling* of Nightclub City and the *clarity*
> of The Sims. Do not copy assets, layouts, icons, characters, names, or
> UI chrome. Club Empire is original IP, Neon Noir, mobile-first.

---

## 1. Design principle

**The visible floor is the player's main reward.**

Money, reputation, and unlocks all matter — but the way the player
*feels* progression is by watching the room change. Every meaningful
upgrade must show up on the floor the next time the player opens it.
Invisible buffs are not progression; they are bookkeeping.

Three rules follow:

1. **Show, don't store.** If a system can't surface on the floor, it
   doesn't belong in Phase 1–3 progression.
2. **Same room, growing identity.** Floor 1 is the same room for many
   nights. The player's history is visible on it.
3. **Multiple lanes, one room.** Different upgrade paths produce
   visibly different rooms (per UIUX Section 12).

---

## 2. Floor 1 Starter Club

**Cheap but real.** Floor 1 is the first playable room — a small
basement-tier venue that reads as a *club*, not a dashboard.

### Visible zones (must be present from night one)

- **Entrance / Door** — rope, simple signage, bouncer slot.
- **Bar** — short rail, one shelf, one bartender slot.
- **Dance Floor** — small central tile, basic lighting fixture.
- **DJ Booth** — corner platform, basic decks silhouette.
- **Bathroom** — small tile with a sign, warning state when active.
- **Staff Area** — back-of-house slot, rarely highlighted.
- **Locked VIP / Future expansion zone** — visible silhouette with a
  locked indicator. Player sees where growth goes from day one.

### Starting state (what "cheap" looks like)

- **Lighting:** single fixture, dim, low color range.
- **Sound:** baseline; DJ booth functional but unstyled.
- **Crowd:** thin. The room is not full on opening night and that's
  fine — the floor must read as a club even when empty.
- **Decor:** none beyond functional pieces.
- **Door:** rope only, no signage upgrades.
- **Bathroom:** functional, no upgrades.

### Why this matters

The player should look at the empty Floor 1 and think "I can see what
this place could become" — not "this is a placeholder until the real
game starts." Floor 1 *is* the game. Progression is making it bloom.

---

## 3. Floor 1 upgrade path

Upgrades organize into nine categories. Each category has a clear
**visual change**, a **mechanical change**, and an **identity** it
supports. Categories are the build/prep catalog (per UIUX Section 4).

### Lighting

- **Visual:** dance floor tint shifts; new fixtures glow on the floor;
  pulse rate matches music.
- **Mechanical:** vibe ceiling raises; draw nudge up.
- **Identity:** **music-first**, **premium**.

### Sound

- **Visual:** DJ booth gains visible speaker stacks; booth glow
  intensifies; bass icons on the dance floor cluster.
- **Mechanical:** vibe pulse stronger; event modifiers amplify.
- **Identity:** **music-first**, **rough underground**.

### Bar

- **Visual:** bar gains shape, shelf depth, visible bottles; bartender
  has more room to work.
- **Mechanical:** service ratio improves; spend per guest up; bar
  pressure threshold relaxes.
- **Identity:** **premium**, **locals**.

### Seating

- **Visual:** booths, stools, banquettes appear in their slots.
- **Mechanical:** dwell time up; VIP-ready capacity up; comfort
  contributes to regulars retention.
- **Identity:** **luxury/VIP**, **locals/regulars**.

### Decor

- **Visual:** wall pieces, mirrors, signage, neon accents. The room
  starts to *look like somewhere*.
- **Mechanical:** door appeal up; spend per guest up; reputation
  amplifier on good nights.
- **Identity:** **premium**, **identity expression**.

### Door

- **Visual:** real rope, real signage, real bouncer presence; queue
  rendering improves.
- **Mechanical:** door risk control; policy posture readable.
- **Identity:** **exclusive**, **rough underground**, **locals**.

### Bathroom

- **Visual:** tiles, mirror, supplies marker.
- **Mechanical:** complaint floor lowers; regulars trust up.
- **Identity:** **premium**, **locals/regulars**.

### Staff

- **Visual:** more named tokens at stations; better stance / posture as
  named staff hire up.
- **Mechanical:** capability up across bar / door; future hidden traits
  surface (gated).
- **Identity:** **staff-drama lane** — Caramel arc, John flair, future
  Janer/Ayan/Elfen.

### DJ / Music

- **Visual:** decks visible, booth lighting, music identity (theme
  glow) on the floor.
- **Mechanical:** vibe + event modifier amplification; music identity
  attracts segments.
- **Identity:** **music-first**, **trance/house/etc. niche identity**.

---

## 4. Unlock philosophy

Goals **unlock** options. Goals do **not** force order.

The player should be able to grow the club as any of:

- **Music-first club** — Sound + Lighting + DJ upgrades early.
- **Luxury / VIP club** — Seating + Decor + Door upgrades early.
- **Cheap student party spot** — basic Sound + Door volume + crowd
  draw upgrades; minimal Decor.
- **Rough underground venue** — Sound + Door + crowd handling; light
  on Decor and Bathroom.
- **Locals / regulars neighborhood club** — Bar + Bathroom + Decor +
  Staff continuity.
- **Premium nightlife empire** — balanced upgrades across all
  categories; the late-game ideal.

The Goal Board suggests an order. The economy gates speed. The player
picks the identity. Two players hitting the same reputation tier
should produce visibly different Floor 1s.

---

## 5. Floor 2 / Expansion concept

**FUTURE / DO NOT BUILD YET.** Designed here so Floor 1 progression
points toward something real. Implementation only after Floor 1
reaches Phase 2 polish (per UIUX Section 13).

### Possible unlocks (future, do not build)

- **Bigger dance floor** — expanded central tile, more crowd capacity.
- **Second bar** — service ratio relief at scale; named bartender
  rotation.
- **VIP room** — unlocks the locked VIP silhouette from Floor 1;
  premium spend track; future Janer host role.
- **Better bathrooms** — capacity + complaint floor improvements at a
  higher tier.
- **Storage / back office** — owner office surface; future ops
  systems; supplier deliveries surface here.
- **Bigger DJ booth** — full residency setup; future Ayan DJ slot.
- **Private event room** — Phase 3 private-party / booking flow
  surface (per `event-bible.md`).
- **Balcony / second floor (later)** — vertical expansion; future
  multi-floor venue. Long-term only.

### Why expansion is "Floor 2" and not "new club"

The empire is built on the same venue first. A second floor or
expansion wing extends Floor 1's identity. A *second venue* is the
[[owner-caramel]] "expand now or wait" anchor — much later.

---

## 6. Quest / goal progression

Goals are the player's surfaced direction. Categories:

- **Tutorial Goals** — teach core verbs: prep, open, watch, debrief.
- **Business Goals** — cash, margin, sustainability.
- **Venue Goals** — upgrades that show on the floor.
- **Crew Goals** — hire, schedule, trust, named-staff arcs.
- **Crowd Goals** — fill, segments, regulars base.
- **Reputation Goals** — tier crossings, identity nudges.
- **Story / Character Goals** — future relationship and arc anchors
  (mostly **FUTURE / DO NOT BUILD YET** — tag accordingly).

### Required goal fields

Every goal must answer:

- **What the player does** — concrete verb.
- **Why it matters** — emotional or system stake.
- **What it unlocks** — option, category, character, tier.
- **What becomes visible on the floor** — the visible reward, or
  "none (off-floor goal)" honestly.

---

## 7. Example first 20 goals

> Authoring rules: each goal carries a short mentor / phone-style line
> in the voice of a current-active character (Caramel, Rosa, John) or
> the neutral mentor voice. Future characters appear only as
> `(future)` and the goal is tagged accordingly. Floor-visible effects
> map to Section 3 categories.

### 1. Welcome Tonight

- **Requirement:** complete the first prep flow (set crew, stock, open).
- **Reward / unlock:** Night Phase enabled.
- **Floor-visible:** zone tiles light up as the doors open.
- **Mentor line:** Caramel — "Door's open, bro. Easy first one."
- **Category:** Tutorial.

### 2. Survive The First Night

- **Requirement:** reach close-of-night without going negative on cash.
- **Reward / unlock:** Debrief screen unlocked.
- **Floor-visible:** end-of-night dim, then prep mode opens.
- **Mentor line:** Caramel — "First one's done. Tomorrow's the test."
- **Category:** Tutorial.

### 3. Read The Morning

- **Requirement:** open and view the Debrief.
- **Reward / unlock:** Goal Board unlocked.
- **Floor-visible:** none (off-floor goal — Debrief surface).
- **Mentor line:** Caramel — "Numbers don't lie. People remember
  longer."
- **Category:** Tutorial.

### 4. Stock The Bar

- **Requirement:** complete a prep where Drink Prep is fully stocked.
- **Reward / unlock:** stock indicator on the bar tile.
- **Floor-visible:** **bar shelf reads as full** (vs empty).
- **Mentor line:** Rosa — "I can pour if there's something to pour."
- **Category:** Business.

### 5. Schedule A Crew

- **Requirement:** open with one Bartender + one Bouncer scheduled.
- **Reward / unlock:** crew slot reuse next night; named-staff display.
- **Floor-visible:** **named tokens visible** at bar and door.
- **Mentor line:** Caramel — "Names on the door. Means the door knows
  who shows up."
- **Category:** Crew.

### 6. First Real Earnings

- **Requirement:** clear a net-positive night above a small threshold.
- **Reward / unlock:** Lighting category unlocked in prep catalog.
- **Floor-visible:** small cash readout in edge UI gets a "good night"
  glow.
- **Mentor line:** Caramel — "Now we can actually fix this place."
- **Category:** Business.

### 7. Light The Floor

- **Requirement:** purchase first Lighting upgrade.
- **Reward / unlock:** Dance Floor tint changes.
- **Floor-visible:** **dance floor lights up** — visible color shift,
  fixture sprite appears.
- **Mentor line:** Caramel — "Bro. That's a floor now."
- **Category:** Venue.

### 8. Pump The Sound

- **Requirement:** purchase first Sound upgrade.
- **Reward / unlock:** DJ Booth glow on the floor.
- **Floor-visible:** **booth glow + speaker stacks** appear.
- **Mentor line:** Rosa — "I can finally hear myself not hear
  myself."
- **Category:** Venue.

### 9. The Bar Gets A Face

- **Requirement:** purchase first Bar upgrade.
- **Reward / unlock:** bar shape upgrade.
- **Floor-visible:** **bar gains shelf depth, visible bottles**.
- **Mentor line:** Rosa — "Looks like a bar now. Feels like one too."
- **Category:** Venue.

### 10. The Door Holds

- **Requirement:** schedule Caramel as Senior Bouncer for three nights.
- **Reward / unlock:** Door category prep options expand.
- **Floor-visible:** **Caramel token at the rope** with calm-protector
  stance.
- **Mentor line:** Caramel — "I got the door. You fix the inside."
- **Category:** Crew.

### 11. Regulars Notice

- **Requirement:** grow the regulars base above a small threshold.
- **Reward / unlock:** regulars marker visible on the floor.
- **Floor-visible:** **small gold dots** on a few guest clusters.
- **Mentor line:** Rosa — "Same faces twice. That's the start of
  something."
- **Category:** Crowd.

### 12. Throw The First Real Event

- **Requirement:** run a non-Quiet event (Student Night or Private
  Party).
- **Reward / unlock:** event catalog awareness; event card in prep.
- **Floor-visible:** **event theme tint** on the floor for the night.
- **Mentor line:** John — "Big night. Don't tell me to be polite."
- **Category:** Business.

### 13. Stay In The Black

- **Requirement:** clear three consecutive net-positive nights.
- **Reward / unlock:** Decor category unlocked.
- **Floor-visible:** none (off-floor goal — pacing milestone).
- **Mentor line:** Caramel — "Boring is good, bro. Boring pays rent."
- **Category:** Business.

### 14. Tier Up: Local Spot

- **Requirement:** cross the reputation tier from Nobody's Club to
  Local Spot.
- **Reward / unlock:** Industry Night event unlocks at higher tier
  later; Decor catalog expands.
- **Floor-visible:** **edge UI tier badge changes**; small floor
  ambient warm-up.
- **Mentor line:** Caramel — "Bro. The line outside actually waited
  tonight."
- **Category:** Reputation.

### 15. Read The Room

- **Requirement:** resolve one mid-night intervention well (Bar
  Pressure or DJ Cooling — choice lands cleanly).
- **Reward / unlock:** Caramel's voice in debrief gains a named line.
- **Floor-visible:** **Caramel ring warms** briefly during the
  intervention.
- **Mentor line:** Caramel — "Good call. That one was about to slip."
- **Category:** Crew.

### 16. Polish The Floor

- **Requirement:** purchase first Decor upgrade.
- **Reward / unlock:** decor identity slot active on the floor.
- **Floor-visible:** **wall piece / mirror / signage** appears.
- **Mentor line:** Rosa — "Place finally looks like somebody owns it."
- **Category:** Venue.

### 17. Bathroom Pride

- **Requirement:** purchase first Bathroom upgrade.
- **Reward / unlock:** complaint floor lowers; regulars trust nudge up.
- **Floor-visible:** **bathroom tile reads as upgraded** (sign, tile
  tint).
- **Mentor line:** Rosa — "Two regulars said thank you. I'm not
  joking."
- **Category:** Venue.

### 18. Choose Your Lane

- **Requirement:** purchase three upgrades in a single category (a
  visible identity commitment).
- **Reward / unlock:** identity badge appears on the floor; category
  catalog expands faster going forward.
- **Floor-visible:** **floor tint shifts toward identity color** —
  music-first cyan, premium violet, locals warm gold, etc.
- **Mentor line:** Caramel — "Now I know what kind of club this is."
- **Category:** Reputation / identity.

### 19. The Door's Got A Voice

- **Requirement:** John or Caramel produces a named line in the debrief
  (any night with their voice surfaced).
- **Reward / unlock:** future Caramel Stage 2 progress hook
  (`FUTURE / DO NOT BUILD YET` — anchor only).
- **Floor-visible:** **named bouncer token state changes** subtly
  (ring warmth).
- **Mentor line:** John — "I told you he was trouble. He was trouble."
- **Category:** Crew / Story (future tag).

### 20. Tier Up: Rising Name

- **Requirement:** cross the reputation tier from Local Spot to Rising
  Name.
- **Reward / unlock:** Industry Night event surfaces; Floor 2
  expansion silhouette gains a "soon" indicator (locked, visible).
- **Floor-visible:** **VIP silhouette glows faintly**; edge UI tier
  badge upgrades.
- **Mentor line:** Caramel — "Bro. People know our name now. Don't
  blow it."
- **Category:** Reputation.

> Goals 21+ are deliberately out of scope for this doc. The next batch
> belongs to Phase 2 polish + identity divergence and should be banked
> after Floor 1's Phase 1 build lands.

---

## 8. Design guardrails

**Do not include any of the following in Floor 1 / Phase 1
implementation.** They are FUTURE / DO NOT BUILD YET unless explicitly
scoped:

- Full 3D.
- Pathfinding (individual NPC).
- Free furniture placement.
- Individual NPC simulation.
- Relationship system.
- Hidden trait reveal.
- Dancers.
- Waiters.
- VIP system implementation.
- Backend / online.

**Mentionable here as future targets, not as build work:** Phase 4
relationship layer, Phase 3 event upgrade, Janer/Ayan/Elfen/Kerem
characters, owner Party/Empire meter, loyalty, staff memory,
storyline/quests, policies layer, stock/bottle ordering, multi-venue
expansion.

The line stays: **the reckoning ships before the reward** (per
`gameplay-north-star.md`). Don't surface a system the player can't
yet see consequences from.

---

## 9. Recommended next build slices for Main Claude Code

Each slice is small, buildable, and testable on its own. Slices are
ordered by dependency, not priority — Main Claude can pick the next
one to land.

### Slice A — Floor 1 zones as visible tiles

- The seven Floor 1 zones (Door, Bar, Dance Floor, DJ Booth, Bathroom,
  Staff Area, Locked VIP) render as visible tiles on the floor screen.
- Each zone has a recognizable silhouette / shape — not a labeled
  rectangle.
- **Acceptance:** a screenshot of the floor reads as a nightclub at a
  glance; zones are obvious without text labels.

### Slice B — Categorized prep catalog (read-only first pass)

- Prep mode renders nine category tabs: **Lighting, Sound, Bar,
  Seating, Decor, Door, Bath, Staff, DJ**.
- Each category lists the available upgrades with name + short line +
  cost. No purchasing yet — read-only.
- **Acceptance:** the player can browse the catalog and understand each
  upgrade in one short line.

### Slice C — One visible upgrade per category

- Wire one upgrade per category to actually purchase and **show on the
  floor** (per Section 3 visual changes).
- Slice scope: nine upgrades total, one per category.
- **Acceptance:** before/after screenshots of Floor 1 show each
  upgrade visibly. Player understands what they bought.

### Slice D — Goal Board: first 5 goals from this doc

- Bring goals 1–5 (Welcome Tonight → Schedule A Crew) into the live
  Goal Board with the floor-visible reward fields.
- **Acceptance:** a new save walks the tutorial through the same five
  beats this doc canonizes.

### Slice E — Progressive crowd density on the floor

- Crowd density on the Dance Floor tile reads as **thin / active /
  packed** based on existing sim signals (fill / vibe).
- **Acceptance:** the player can tell the difference between a quiet
  night and a packed night by looking at the floor for one second.

### Slice F — Identity tint on the floor (Choose Your Lane payoff)

- Goal 18 ("Choose Your Lane") fires after three upgrades in one
  category and shifts the floor's ambient tint toward an identity
  color.
- **Acceptance:** two test saves with different upgrade focuses
  produce visibly different floor tints.

> Each slice respects the design law in `gameplay-north-star.md`:
> legibility before depth, depend only on what exists, the reckoning
> ships before the reward, determinism preserved.
