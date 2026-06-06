# Character Roster

> Flat catalog of every named character in Club Empire: After Dark with
> **two-axis tagging** (Tier + Status). Deep profiles for **Legendary**,
> **Ultra-Rare**, and **Rare** characters live in `character-bible.md` —
> this file is the index over there, plus the home for **Uncommon**
> (medium depth) and **Common** (light pool flavor) entries.
>
> See `content-intake-rules.md` for the promotion pipeline and
> `gameplay-north-star.md` for tone discipline.
>
> **Status:** content bank. Existing ACTIVE characters (Bartender,
> Bouncer roles only) can already appear as static metadata in the
> candidate pool. Everyone tagged FUTURE is banked in docs only — not
> hireable, not in candidate pools.

---

## Two-axis tagging

Every character carries **both** tags. **Tier ≠ Status.**

### Tier (rarity — depth scales with rarity)

| Tier | Depth | Where it lives | Slot in the cast |
| --- | --- | --- | --- |
| **Legendary** | Full profile + arcs, full dialogue palette, hidden traits, relationship hooks. | `character-bible.md` | A handful. Handcrafted. The cast spine. |
| **Ultra-Rare** | Full profile, distinct voice, sharp tradeoff, hidden trait. | `character-bible.md` | A handful. Each defines a niche. |
| **Rare** | Full profile, one clear angle, may have a hidden trait. | `character-bible.md` | ~Half a dozen. The bench. |
| **Uncommon** | Name, archetype, visible trait, two voice lines, brief tradeoff. | This file. | Several. Personality without an arc. |
| **Common** | Name, archetype, one visible trait, maybe one line. | This file. | Pool flavor. No backstories. |

### Status (role — what exists in code today)

| Status | Meaning |
| --- | --- |
| **ACTIVE** | A **Bartender** or **Bouncer**. Exists today as static metadata in code; profile and visible trait can be referenced now; hidden-trait *logic* is still future. |
| **FUTURE** | Any other role (DJ, Host, Promoter, Recurring patron, Advisor, Fixer, Press, Regular, etc.). Banked in docs only; not in candidate pools, not hireable. |

A character can be Rare-tier **ACTIVE** (a rare bartender) **or**
Rare-tier **FUTURE** (a rare DJ). Two independent axes.

---

## Tier × Status grid (current roster)

| Tier | ACTIVE (Bartender / Bouncer) | FUTURE (other roles / recurring) |
| --- | --- | --- |
| **Legendary** | John "The Pitbull" (Bouncer) · Kareem "Caramel" Souza (Senior Bouncer) | Ayan "The Ayananator" (DJ) · Janer (Host) · Elfen (Recurring patron) · Ultan "The Witness" Doyle (Scene Chronicler) |
| **Ultra-Rare** | Vega "The Lighter" Calderon (Bartender) · Marko "Soft Marko" Ilic (Bouncer) | Kerem (Empire-side advisor) · Sera "The Phonebook" Voss (Fixer) · Cy "Cy-Note" Larrieux (Regular) |
| **Rare** | Rosa "Warm Pour" (Bartender) · Vince "The Showman" (Bartender) · Otis "Slow Otis" Park (Bartender) · Grace "The Rulebook" (Bouncer) · Pavel "Heavy Hitter" (Bouncer) · Yusra "Sundown" Adekunle (Bouncer) | — |
| **Uncommon** | Milo "The Steady Hand" (Bartender) · Jin "The Dependable" (Bartender) · "Pep" Pepa Rios (Bartender) · Dimitri "The Calm Wall" (Bouncer) · Marcus "The Enforcer" (Bouncer) · "Half" Halil Demir (Bouncer) | "Mona" Maja Lindqvist (Recurring face) |
| **Common** | (procedural pool — see Common section below) | — |

> All Legendary / Ultra-Rare / Rare full profiles live in
> `character-bible.md`. The names here are the index.

---

## Uncommon characters (medium depth)

> Format per entry: name + archetype + visible trait + two voice lines +
> brief tradeoff. Personality, not an arc. Cross-ref to relationship-web
> only where the character connects to a Legendary or Ultra-Rare.

### Milo "The Steady Hand" — Bartender · `bar-milo` (starting)
- Tier: **UNCOMMON** · Status: **ACTIVE**
- Archetype: Calm operator, never the showman.
- Visible trait: **Unshakeable** — steady throughput, low variance.
- Tradeoff: never the peak, never the trough — predictable to a fault.
- Lines: "Order's up." · "Same to you. Quiet night."

### Jin "The Dependable" — Bartender · `bar-jin`
- Tier: **UNCOMMON** · Status: **ACTIVE**
- Archetype: Cheap hire, shows up, does the job.
- Visible trait: **Steady** — small consistent throughput.
- Tradeoff: low wage, low ceiling.
- Lines: "Whatever you said. Sure." · "Two beers. Coming up."

### "Pep" Pepa Rios — Bartender
- Tier: **UNCOMMON** · Status: **ACTIVE**
- Archetype: Fast hands, faster mouth.
- Visible trait: **Quick Pour** — small throughput boost.
- Tradeoff: throughput up, accuracy down — occasional comp.
- Lines: "Two beers, two shots, I already started. You're welcome." · "Tab? Sure. You're going to forget. That's fine."

### Dimitri "The Calm Wall" — Bouncer · `bnc-dimitri` (starting)
- Tier: **UNCOMMON** · Status: **ACTIVE**
- Archetype: The unflappable veteran — has seen everything.
- Visible trait: **Steady Door** — small consistent incident reduction.
- Tradeoff: doesn't escalate, doesn't pre-empt — pure middle of the road. Good default, never the marquee.
- Lines: "I've worked rooms louder than this." · "We'll be fine. Slow your breathing."

### Marcus "The Enforcer" — Bouncer · `bnc-marcus`
- Tier: **UNCOMMON** · Status: **ACTIVE**
- Archetype: Intimidating presence, low engagement.
- Visible trait: **Intimidating** — visible presence reduces incidents on visible-pressure nights.
- Tradeoff: works by silence; useless when a situation needs talking down.
- Lines: "Step back." · "I said step back."

### "Half" Halil Demir — Bouncer
- Tier: **UNCOMMON** · Status: **ACTIVE**
- Archetype: Off-duty firefighter, moonlights on weekends.
- Visible trait: **Calm Under Pressure** — slight incident reduction on high-fill nights.
- Tradeoff: reliable when on shift, unavailable on his day-job weekends.
- Lines: "I do this on my days off. Tells you something about my days." · "We're fine. I've seen worse."

### "Mona" Maja Lindqvist — Recurring face (FUTURE, not staff)
- Tier: **UNCOMMON** · Status: **FUTURE / DO NOT BUILD YET**
- Role: ambient recurring patron; not hireable.
- Archetype: The regular nobody can place — knows everyone, owes nobody.
- Visible trait (advisory, future): **Regular's Regular** — slight loyalty bump in the Locals segment when she's in the room.
- Tradeoff: doesn't lift draw, doesn't cost anything; she's the reason the regulars feel like the regulars.
- Lines: "I don't know your name either. We're fine." · "Same as last week."
- Future implementation note: would need a lightweight recurring-face presence system (ambient NPC tied to a calendar/weekend cadence). **NOT BUILT. DO NOT BUILD YET.**

---

## Common characters (light pool flavor)

> The procedural hire pool. **Depth ends here.** Each entry: name +
> archetype + one visible trait + one tradeoff + maybe one line. **No
> backstories.** If a Common starts growing a story, promote them to
> Uncommon — don't let depth creep below the tier.

### Tito Vanga — Bartender
- Tier: **COMMON** · Status: **ACTIVE**
- Archetype: Showed up, does the job.
- Visible trait: **Reliable** — no upside, no downside.
- Tradeoff: cheap and present; never a story.
- Line: "I'm here. What do you need."

### Lana Pesa — Bouncer
- Tier: **COMMON** · Status: **ACTIVE**
- Archetype: Weekend hire, training in.
- Visible trait: **Learning** — small incident chance up while she learns.
- Tradeoff: low wage; the cost is the learning curve.
- Line: "I'm new. Tell me if I miss something."

### Rex Kowalski — Bouncer
- Tier: **COMMON** · Status: **ACTIVE**
- Archetype: Pure muscle, low patience.
- Visible trait: **Strong but Slow** — handles rough crowds; slow on the door queue.
- Tradeoff: rough-night utility, peak-door drag.
- Line: "I do not enjoy talking."

### Suki Ahn — Bartender
- Tier: **COMMON** · Status: **ACTIVE**
- Archetype: Garnish perfectionist.
- Visible trait: **Garnish-First** — looks great, slow service.
- Tradeoff: small VIP-spend lift, throughput dip.
- Line: "Looks better with the mint. Trust me."

### "Banger" — Bouncer
- Tier: **COMMON** · Status: **ACTIVE**
- Archetype: Nickname-only door presence.
- Visible trait: **Intimidating Stance** — presence yes, communication no.
- Tradeoff: silent enforcement; useless on a complaint.
- Line: *(a nod)*

### Ela Toro — Bartender
- Tier: **COMMON** · Status: **ACTIVE**
- Archetype: Chatty.
- Visible trait: **Friendly** — regulars like her.
- Tradeoff: small loyalty lift, slow shift.
- Line: "How's your night going? No really."

### Ricky "Tickets" Garcia — Bouncer
- Tier: **COMMON** · Status: **ACTIVE**
- Archetype: Door specialist.
- Visible trait: **Line Reader** — solid at the door, weak inside.
- Tradeoff: small door incident reduction; no help on the floor.
- Line: "He's fine. He's not. He's fine."

### Bo Larsson — Bartender
- Tier: **COMMON** · Status: **ACTIVE**
- Archetype: Low-key.
- Visible trait: **Quiet Hands** — low variance.
- Tradeoff: predictable, charmless.
- Line: "Yeah."

### Mim Karaca — Bouncer
- Tier: **COMMON** · Status: **ACTIVE**
- Archetype: Cheerful door.
- Visible trait: **Sunny** — lifts door vibe, soft on enforcement.
- Tradeoff: vibe up, incident risk slightly up on rough nights.
- Line: "Welcome! Carry your ID, please!"

### Pete "Sundayer" Cohen — Bartender
- Tier: **COMMON** · Status: **ACTIVE**
- Archetype: Best on slow nights.
- Visible trait: **Patient** — strong on quiet shifts, drowns on peaks.
- Tradeoff: golden Sunday hire, wrong Friday choice.
- Line: "Slow nights are the good nights."

---

## Procedural-pool note

Common characters are the procedural hire pool — the bartenders and
bouncers a player rotates through early before learning the named bench.
They give the candidate pool **flavor**, not arcs. Three rules:

1. **No backstories.** A Common is one trait, one line, and the archetype.
   If a Common grows a story, promote them to Uncommon and write more —
   don't let depth creep in below the tier.
2. **One real tradeoff each.** Even at this depth, every Common is a
   small decision (fast-but-sloppy, cheap-but-flaky, friendly-but-slow).
3. **No hidden traits at Common.** Hidden traits live at Rare and up.

Commons can rotate in and out of the procedural pool freely. Uncommons
are stickier — players may remember a couple of voice lines, so an
Uncommon should stay consistent once added.

---

## Authoring rules (when adding characters to this file or the bible)

1. **Two-axis tag on every entry.** Tier (one of five) + Status (ACTIVE
   if Bartender/Bouncer, FUTURE otherwise). Mark both, always.
2. **Depth scales with rarity.** Don't write a Legendary at Uncommon
   depth (under-deliver) or a Common at Rare depth (clutter the bench).
3. **Tradeoff, not stat row.** Every character — even Commons — must
   carry a small useful-AND-liability shape, ideally with the same root.
4. **Original IP only.** Per `gameplay-north-star.md` — no real brands,
   no real DJs, no real celebrities, no recognizable copies of named
   characters from any film. Tonal *archetypes* yes; specifics no. If a
   draft starts resembling a famous role, change the specifics.
5. **Voice discipline.** A Legendary should be blind-identifiable by
   sentence shape; a Common just needs one consistent tone line.
6. **Hidden traits are inactive metadata.** Even when written, they are
   **never revealed in UI as the trait name** — locked / rumor indicator
   only. See `content-intake-rules.md` §6.
7. **No system promises.** If a character implies a system that doesn't
   exist (Sera's tab system, Cy's vibe friction, Ultan's press
   narration, Mona's recurring-face presence), drop a **Future
   implementation note** in their entry. **Do not build the system.**
8. **Promotion path.** Common → Uncommon by writing one more voice line
   and a sharper trait. Uncommon → Rare by writing the full profile in
   `character-bible.md`. Above Rare is editorial.
9. **Tone discipline.** Neon Noir, satirical, original IP. No graphic
   violence; no player-on-staff harm; bad behavior is **management
   drama** (warnings, complaints, fines, walked staff) — never
   instruction. See `nightclub-safety-framing` skill.
10. **Respect role status.** Only Bartender and Bouncer are ACTIVE roles
    today. A character with any other role (DJ, Host, Fixer, Patron,
    Press, Advisor) is FUTURE regardless of how memorable the writeup is.

---

## Cross-references

- `character-bible.md` — deep profiles for Legendary / Ultra-Rare / Rare.
- `relationship-web.md` — affinity matrix and Phase 4 relationship
  events; the [[pair]] hooks referenced in bible entries live there.
- `event-bible.md` — events the cast reacts to (Caramel arc, the
  St. Patrick's "Important Guest" anchor).
- `random-events.md` — banked night-encounter beats using this cast.
- `content-intake-rules.md` — promotion pipeline (docs → code), tagging
  rules, character pipeline §5, hidden-trait rules §6.
- `gameplay-north-star.md` — Party / Empire spine; team canon (Ayan and
  Ultan name-disclaimers point here).
- `story-bible.md` — Neon Noir tone, world facts, three-voices framing.
