# Future Bar & Policy Systems (Banked)

> **Status: FUTURE / DO NOT BUILD YET.** Every system on this page is
> design canon only — there is **no implementation** in the build
> today, and none of these are scoped for the next pass.
>
> The current build priority is **night readability and pacing** (per
> [`UIUX_Reference_Pack.md`](UIUX_Reference_Pack.md) §15–17). These
> specs are banked so that when readability is solid, the next layer
> of bar/policy depth has a clear shape to grow into — without
> distracting from the work that's actually in flight.
>
> **None of these specs are build tickets.** Promotion follows the
> pipeline in [`content-intake-rules.md`](content-intake-rules.md):
> scoped request → smallest safe version → confirmed dependencies →
> green gates. Do not implement from this file.

---

## Scope rules (apply to every system below)

- **Determinism preserved.** Same seed + prep + choice ⇒ same result.
  No new uncontrolled RNG.
- **Bounded effects.** Use the existing effect vocabulary (per
  [`random-events.md`](random-events.md) "Effect vocabulary"). No flat
  numbers in canon.
- **Surface on the floor.** Any system that ships must be **visible**
  — per UIUX §16 Rule 2 (zone + visual signal + owner response). If a
  system can only surface as a stat shift, it doesn't belong in
  Phase 1–3.
- **Reckoning before reward** (per `gameplay-north-star.md`). Don't
  ship the upside without the downside.

---

## 1. Mid-night house rules / policy switching — FUTURE

### What it is

The owner can shift a policy (smoking, door strictness, ID check
intensity, music volume) **mid-night** in response to floor pressure,
not only at prep time.

### Why it would matter

Today, policies are set in prep. The night runs them deterministically.
A future *policy switch* layer would let the player react to:

- A compliance rumor surfaces → tighten smoking on the spot.
- Door is bottlenecking → loosen ID checks briefly.
- Vibe is screaming → cap volume to dodge a noise complaint.
- VIP pressure → flip to strict door for two intervals.

### Player surface (future)

- A small **Policy strip** on the night-mode edge UI (per UIUX §11 —
  edge UI, never floor).
- Each policy shows current state + one-tap switch.
- Switching costs nothing in money — but the **floor reacts visibly**
  (per UIUX §16 Rule 5): smoking flips → smoke-haze tint fades;
  strict door → John ring tightens; etc.

### Dependencies (do NOT build until all exist)

- Stable night-mode pacing (current build).
- Per-interval policy resolution (sim layer — current is night-wide).
- Visible floor reactions tied to policy state (UIUX Phase 2 sprites
  help).
- A compliance / noise / fairness signal that can *spike* mid-night.

### Reckoning side

- Whip-sawing policies should *cost*: regulars notice inconsistency,
  staff trust dips, future "the rules mean nothing here" reputation
  drift (per the St. Patrick's "Important Guest" canon).
- Per `nightclub-safety-framing`: all of this stays managerial.
  Abstract. Never how-to.

### Cross-refs

- Smoking & door logic today: `src/sim/night.ts`.
- St. Patrick's fairness canon: [`event-bible.md`](event-bible.md).
- Compliance Knock encounter: [`night-encounters.md`](night-encounters.md).

---

## 2. Bar stock delivery problems — FUTURE

### What it is

Suppliers are not always reliable. Sometimes deliveries arrive **late**,
**short**, or **wrong** — and the owner has to decide how to cover.

### Why it would matter

Today, "Drink Prep" is a clean pre-night decision. A future delivery
layer adds *pre-open friction* the player has to manage — bringing the
Sims-style "Build/Prep" mode alive with real stakes.

### Player surface (future)

- A **pre-open notification card** in Prep mode: "Spirits delivery
  short by one pallet."
- Two or three forced choices: substitute, run reduced, push a
  late-night happy hour to clear inventory.
- The bar tile reflects the choice: thin shelves → visible empty
  brackets; substituted spirits → different bottle silhouettes.

### Variants (banked, do not build)

- **Late delivery** — open without full stock; choose to delay
  opening or open lean.
- **Short delivery** — partial; pick what to drop.
- **Wrong delivery** — different brand; spend per guest might shift.
- **Spoiled lot** — discard; reserve cost.

### Dependencies (do NOT build until all exist)

- Inventory / consumable signal (per Bubble Bank "We're out of lime"
  — currently NEEDS SIGNAL).
- Supplier roster (per [`phone-messages.md`](phone-messages.md) §8
  Supplier Offer beats).
- Visible bar-tile state changes (UIUX Phase 2).

### Cross-refs

- "We're Out Of Lime" phone beat: [`phone-messages.md`](phone-messages.md).
- Supplier offers: [`phone-messages.md`](phone-messages.md) §8.
- Stock prep today: `src/domain/drinks*.ts` (canon for current scope).

---

## 3. Slow-night drink deals — FUTURE

### What it is

When the night is reading slow — low fill, low vibe, regulars trickling
— the owner can **trigger a drink deal** mid-night to pull energy.

### Why it would matter

Today, the only mid-night intervention against a cooling night is
Push DJ. A drink-deal lever gives the *bar* a counterpart move,
matching the dance-floor lever.

### Player surface (future)

- An **encounter prompt** when `isCoolingNight` fires: "Bar's reading
  quiet. Run a deal?"
- Choices: half-price highballs / drink-and-shot bundle / hold the line.
- Floor reacts: bar tile glows amber-warm; guest clusters drift back
  toward the rail; Rosa's ring warms.

### Tradeoffs (banked)

- **Margin down** for the next interval(s).
- **Vibe up** if the deal lands.
- **Reputation small ding** if it lands too aggressively (regulars
  notice price churn).
- **Identity drift** toward "cheap student spot" if used repeatedly
  (per [`level-and-floor-progression.md`](level-and-floor-progression.md)
  §4 unlock paths).

### Dependencies (do NOT build until all exist)

- The cooling-night signal (today, used by DJ Cooling intervention).
- A mid-night encounter framework (per `random-events.md` "Future
  implementation note").
- Margin / spend-per-guest mid-night modifier surface (today, these
  resolve post-night).

### Cross-refs

- Cooling-night intervention: `src/lib/intervention.ts`.
- Bar Backs Up Hard (sibling pressure): [`random-events.md`](random-events.md).

---

## 4. Premium drink / cocktail switching — FUTURE

### What it is

The bar can run a **premium menu** alongside the standard menu — the
owner chooses what's on offer per night, or mid-night, to match the
crowd identity.

### Why it would matter

Today, the bar is one menu. A future premium-switch layer rewards
**identity commitment** (per Progression §4): a VIP-leaning club
runs a premium menu most nights; a student-leaning club runs the
standard.

### Player surface (future)

- A **Menu toggle** in Prep mode: Standard / Premium / Themed.
- Mid-night, an encounter offers: "Industry crowd showed up — switch
  to premium for two intervals?"
- Bar tile changes shelf silhouette: standard shelf vs premium shelf
  (taller bottles, different glow).

### Tradeoffs (banked)

- Premium menu: spend-per-guest up, draw down for non-target segments.
- Themed menu: aligned with event identity (e.g. Industry Night,
  Private Party); modifier amplifies.
- Standard menu: baseline, no surprises.

### Dependencies (do NOT build until all exist)

- Cocktail/menu data structure (today, drinks are a flat list).
- Per-segment spend behavior (today, spend is a single per-guest
  number).
- Visible bar-shelf variant rendering (UIUX Phase 2 sprites).
- Identity-commitment goal payoff (per Progression Goal 18 "Choose
  Your Lane").

### Cross-refs

- Drink prep today: `src/domain/drinks*.ts`.
- Identity paths: [`level-and-floor-progression.md`](level-and-floor-progression.md) §4.

---

## 5. Supplier / bottle ordering problems — FUTURE

### What it is

The owner builds a **supplier roster** over time: each supplier has
strengths (price / reliability / quality / specialty) and a
relationship that grows or sours based on how they're treated.

### Why it would matter

Today, suppliers don't exist as named entities. A future supplier
layer:

- Gives the owner *decisions* between nights, not only during them.
- Creates the substrate for the banked phone offers (close-dated
  stock, quarterly contracts, promoter pitches — per
  [`phone-messages.md`](phone-messages.md) §8) to compound over time.
- Mirrors the staff-drama logic: relationships, not just stats.

### Player surface (future)

- A **Suppliers screen** (off-floor; tab in management UI).
- Each supplier has a card: name, specialty, price tier, reliability
  rating, history.
- **Order screen** between nights: pick what's coming for the next
  delivery, accept counter-offers, reject bad ones.
- Friction surfaces in Prep mode (per System 2 above).

### Roster archetypes (banked, do NOT name in-product)

- **The Reliable** — slightly expensive, never late, dependable. (The
  Kerem-coded pick.)
- **The Hustler** — cheap, occasional issues (late, wrong, short).
- **The Specialist** — premium-only, slow turnaround, prestige.
- **The Closeout King** — close-dated stock at deep discount, waste
  risk if not moved.
- **The Promoter** — "guest list partnership" framing; not really a
  supplier, but enters via the same surface.

### Relationship drift (banked, FUTURE)

- Cancel last-minute → reliability rating with that supplier dips.
- Pay on time, repeated orders → reliability improves; bonus offers
  surface.
- Switching mid-contract → small reputation ding in the supplier
  network (future).

### Dependencies (do NOT build until all exist)

- Stable inventory model (System 2 needs to land first).
- Off-night surface for the Suppliers screen.
- Determinism-safe supplier behavior model.
- Phase 4 Relationship Layer substrate would help — though suppliers
  could lean on a lighter "trust score" model that doesn't pull in
  the full character relationship engine.

### Safety framing

Per `nightclub-safety-framing`: even the "shady" supplier archetypes
(close-dated stock, promoters, the anonymous-cash booking pattern)
are framed as **normal nightlife business decisions** — risk lives
in execution, not framing. No glamorized-illegal-trade tone. Ever.

### Cross-refs

- Phone supplier offers: [`phone-messages.md`](phone-messages.md) §8.
- Staff-drama parallel: [`relationship-web.md`](relationship-web.md).
- Caramel "promoter" pitch beat: [`phone-messages.md`](phone-messages.md).

---

## Why these are banked, not built

The current build priority — per Main Claude Code's lane — is **night
readability and pacing**. Until the player can:

- See pressure visually before it becomes text.
- Watch the room react.
- Make deliberate owner decisions, not panic-clicks.

…adding bar depth, policy switching, inventory friction, or supplier
rosters would *bury* the readability work the build session is doing
right now.

The order is: **readability lands → bar/policy depth follows.** Not the
other way around.

These specs exist so that when readability is solid and the next layer
is scoped, the shape is ready. They are not scoped, not promised, not
in flight.

---

## Cross-references

- Current build priority: [`UIUX_Reference_Pack.md`](UIUX_Reference_Pack.md) §15–17.
- Progression context: [`level-and-floor-progression.md`](level-and-floor-progression.md).
- Engine & effects vocabulary: [`random-events.md`](random-events.md).
- Phone & supplier seeds: [`phone-messages.md`](phone-messages.md).
- Promotion pipeline: [`content-intake-rules.md`](content-intake-rules.md).
- Safety framing: skill `nightclub-safety-framing`.
- Design law: [`gameplay-north-star.md`](gameplay-north-star.md).
