# Content Intake Rules

> How creative ideas move from brainstorm → canon → code, so Claude Code, Claude,
> and ChatGPT all build from the same source of truth.
>
> **Companion draft:** `content-intake-rules-ultan-draft.md` — Narrative
> Director's raw draft, preserved for reference. Ultan's stronger additions
> were merged into the sections below. Reconciliation notes at the bottom.

## Purpose

This doc defines how Ultan's narrative notes — and any other creative input —
become **safe game content.** Creative writing is canon input. It is **not
automatic implementation.** No raw narrative note should become code unless it
passes the intake rules below.

> **Core rule:** **Writing does not equal build permission.** A character,
> event, system, or storyline can exist in canon **without being active in the
> game.** Canon can be bigger than code. Code must only contain what the game
> can safely support today.

## 1. Where ideas live (the content pipeline)

- **Google Docs = the creative draft space.** Free-form brainstorming, character
  voice, story arcs, wild "what if" ideas. Nothing here is binding.
- **This repo (`docs/design/`) = the source of truth.** An idea is canon only
  once it lands here. When Docs and repo disagree, **the repo wins.**

The full pipeline, by role:

1. **Narrative Director** writes freely in Google Docs.
2. Finished notes are cleaned and moved into `docs/design/` (preserved verbatim
   as `*-ultan-draft.md` companion files when worth retaining for reference).
3. Each entry receives a **status tag** (§2).
4. **Technical Lead** reviews whether the required system exists.
5. Only **build-ready entries** (the system already exists, scope is small, no
   save-schema change) are converted into game data.
6. **Claude Code** implements only the approved data shape — never the whole
   bible at once, never building a system from raw notes.

> **Role-vs-name note:** "Narrative Director" and "Technical Lead" are the team
> roles per `gameplay-north-star.md` team canon (Ultan and Ayan respectively).
> This process doc uses the **roles**, not the names — because the doc collides
> visually with the in-game character names (the in-game DJ Ayan is a different
> thing from the real-world Technical Lead). Where individuals matter for
> shared context, use the role.

## 2. Tag every idea

Every idea — in Docs or here — must carry one of these tags:

| Tag | Meaning | Examples |
| --- | --- | --- |
| `CURRENT BUILD` | Implementable with systems that exist **today** | Bartender card text · bouncer card text · event-proposal copy · debrief lines · tutorial mentor lines · policy explanation text |
| `CANON` | Binding lore/character truth (may or may not be code yet) | Character bibles, relationship pairs, club identity statements |
| `IDEA` | Unconfirmed brainstorm; not yet canon | Anything still in discussion |
| `FUTURE SYSTEM` | Needs a system we have NOT built | DJ role · host role · loyalty arcs · hidden-trait reveals · relationship simulation · named regulars · VIP networks |
| `DO NOT BUILD YET` | Explicitly parked; no implementation | Often paired with `FUTURE SYSTEM` |
| `VISUAL REFERENCE` | Look, idle animation, 3D / art direction | Character idle notes, palette references |
| `STORY / LORE` | Narrative, backstory, world | Story bible, world facts, founding-cast lore |
| `ANCHOR EVENT` *(new)* | Major scripted future event — seasonal or milestone-based. Can be designed early; implemented later when event systems support it. **Indexed in `random-events.md` "Hand-scripted special-event anchors" — not a parallel system.** | St. Patrick's Day "Important Guest" · Caramel Stage 2 Unlock · First Real Compliance Hit · Owner+Elfen profit-vs-culture · Owner+Caramel expand-now-or-wait · Ayan+Elfen big-guest gamble · First Tier Cross · World-Class DJ Night |
| `EXPERIMENT` *(new)* | Interesting idea **not yet accepted as canon.** Do not implement. Needs review. | Any draft mechanic, archetype, or arc still being argued |

When unsure whether something is `CURRENT BUILD` or `FUTURE SYSTEM`, treat it
as **FUTURE** and ask.

> **`ANCHOR EVENT` alignment note.** The `ANCHOR EVENT` tag is the same concept
> as the **"Hand-scripted special-event anchors"** section in
> `random-events.md`. Both describe one-shot, story-anchored set-pieces keyed to
> a specific milestone, calendar moment, or progression threshold. **Do not
> create a parallel anchor system.** When you tag something `ANCHOR EVENT`,
> index it in `random-events.md`'s anchor section (or `event-bible.md` /
> `relationship-web.md` for the long-form copy). The tag is the *bookkeeping*;
> the anchor index in `random-events.md` is the *canon list*.

## 3. Raw notes are not build tickets

Raw Google Docs notes must **not** be implemented directly. They first get
converted into the structured docs:
- `character-bible.md`
- `character-roster.md`
- `relationship-web.md`
- `event-bible.md`
- `gameplay-north-star.md`
- `story-bible.md`
- `random-events.md`
- (and scope notes, when a feature is actually planned)

Then individual features are built **from those docs in small, scoped passes** —
never "implement the whole bible."

## 4. What Claude Code may and may not do

- **Do NOT implement big systems from raw notes.**
- Respect the design law (`gameplay-north-star.md`): legibility before depth,
  depend only on what exists, the reckoning ships before the reward, determinism.
- A scoped request must name the **smallest safe version** and confirm its
  dependencies already exist.

## 5. Character pipeline

1. New character → Google Docs (free-form).
2. Promote to `character-bible.md` with the standard template + role + tag.
3. Convert to **static metadata only** (`src/domain/characters.ts`) **once the
   character's role exists as an active role.**
   - Current active roles: **Bartender, Bouncer.**
   - Metadata = display/flavor only. No mechanics, no save-schema change.
4. **Future-role characters stay in docs** until their role's system exists —
   never added to active candidate pools or hireable staff.

**Every new character entry must include:**

- display name + nickname
- role (current or future)
- Tier + Status tags (see `character-bible.md`, `character-roster.md`)
- archetype / one-sentence summary
- visible trait
- hidden trait (if future-only)
- short dialogue samples
- visual / 3D direction notes
- implementation status

**Worked example — Ayan as `FUTURE`:**

> Ayan is a DJ.
> The DJ role does not currently exist in code.
> Therefore: **`FUTURE SYSTEM / DO NOT BUILD YET`.**
> He may appear in lore, dialogue, mentor/event writing — *only* if he is not
> treated as an active staff role. Never added to the candidate pool. Never
> hireable.
> (Disclaimer: the in-game character Ayan shares a name with the real-world
> Technical Lead; they are different things — see `gameplay-north-star.md`
> team canon.)

## 6. Hidden traits

- May be **written in docs** (and stored as inactive flavor metadata once the
  character's role is active).
- **Not activated** until the hidden-trait discovery system exists. Until then:
  mechanical `hiddenTrait` stays `'none'`; UI shows only a **locked / rumor**
  indicator — never the trait name.

## 7. Future systems — banked, do not build

These exist as canon (lore, character writing, future event design) but are
**not implemented** and must not be built from raw notes:

- Party/Empire owner meter
- Loyalty / staff trust
- Hidden-trait reveal system
- Friendship / Affinity (chemistry & relationship pressure — **not romance**,
  **not simple loyalty**)
- Relationship simulation / two-character event engine
- Staff memory
- Storyline / quests / scripted arcs
- Tutorial dialogue beyond current mentor lines
- Policies (beyond the existing four)
- Future staff roles: DJ, Waiter, Cleaner, Maintenance, Host, Promoter,
  Security Lead, Floor Manager, Operations Manager, Fixer, Press / Chronicler
- Stock / bottle ordering
- Dancers
- Bottle service
- Furniture placement / free-form interior
- Animated guests / live free-interaction architecture
- Named guest NPCs
- Mafia / underground story chains
- Police / inspection story chains
- Fame arc / press narration system
- Online player club browsing / city rankings / multiplayer comparison
  (offline-first is a load-bearing guardrail — see `story-bible.md`
  "The single-player principle" and `roadmap.md` guardrails)
- Full 3D club walking / first-person navigation

## 8. Relationship content intake (Phase 4)

When new Google Docs **relationship** content arrives:
1. Put it in `docs/design/relationship-web.md` first.
2. Tag it `FUTURE SYSTEM` unless it uses **current systems only**.
3. **Do not implement relationship logic from raw notes.**
4. **Do not make future characters active** just because they appear in
   relationship docs.
5. Relationship events become build prompts **only after their required systems
   exist** (see the Phase 4 dependency chain in `relationship-web.md`).
6. Voice lines may be extracted earlier **only for current active staff**.

**Allowed now (write freely):**
- Relationship descriptions
- Future dialogue
- Event ideas (banked in `random-events.md` or `event-bible.md`)
- Character chemistry notes
- Two-line pressure beats

**Not allowed now (do not implement):**
- Affinity meters
- Friendship stats
- Hidden relationship triggers
- Loyalty effects
- Automatic two-character event engine

All relationship-web entries stay tagged **`FUTURE SYSTEM / DO NOT BUILD YET`**
until the relationship system exists.

## 9. Promotion checklist (docs → code)

Before any note becomes code, every answer must be **yes**:

- [ ] Does the required system already exist and is it active?
- [ ] Is the content tagged correctly (§2)?
- [ ] Is the scope small (single scoped request, not "the whole bible")?
- [ ] Can it be added as **data**, not new mechanics?
- [ ] Does it support the **day → night → after** loop?
- [ ] Does it make the club feel **more alive** (people, moments, reactivity)?
- [ ] Does it avoid illegal-instruction or how-to gameplay (§13, §14)?
- [ ] Can it be tested in **one build** with gates green (tests / tsc / export)?

**If any answer is no, bank it. Do not build it yet.**

## 10. Quick intake template

```
### <Title>
- Tag: CURRENT BUILD | CANON | IDEA | FUTURE SYSTEM | DO NOT BUILD YET | VISUAL REFERENCE | STORY / LORE | ANCHOR EVENT | EXPERIMENT
- Summary:
- Depends on (must already exist):
- Smallest safe version (if buildable now):
- Status: draft (Docs) | canon (repo) | implemented (code)
```

---

> **Sections 11–15 below are appended additions from the merge with the
> Narrative Director's draft. Existing section numbers (1–10) are preserved
> so other canon docs' cross-references (e.g. `§5`, `§6`, `§8`) stay valid.**

## 11. Current safe content types (what can be written *and used* today)

The highest-priority writing categories — the game can use them now without
new systems. Writers who want their work in players' hands fast should start
here.

### Staff card identity
**Supported roles:** Bartender, Bouncer (active in code today).
**Fields:**
- display name
- nickname
- role
- Tier + Status tag (per `character-roster.md`)
- visible trait
- short description
- voice line(s)
- visual flavor

### Event proposal text
**Supported event types** (active in code today; see `event-bible.md`):
- Quiet Night (`regular`)
- Private Party
- Student Night
- Grand Opening / Re-Launch
- Industry Night
- Theme-style events **only if they reuse existing event-vector structure**

### Mentor / tutorial lines
**Supported use:** explaining crew, policies, drink prep, events, boss
actions, crowd identity, regulars, goals.

### Debrief flavor
**Supported use:** after-night summary lines, staff-pressure comments,
crowd-identity comments, policy-result comments, boss-action result
comments.

### Policy flavor text
**Supported policies** (active in code today):
- Smoking Policy
- ID Strictness
- Security Posture
- Bar Service Style

> Any writing in these categories using only the supported sub-list is
> tag `CURRENT BUILD`-eligible. Everything else is `FUTURE`.

## 12. Event intake rules

When new event content arrives, every event entry must include:

- event name
- event class (current vs future)
- current/future status tag
- premise (one line)
- pressure (what's at stake)
- player choices (2–3, real tradeoffs)
- likely outcomes (bounded, no numbers)
- character reactions (stance + voice line per relevant cast member)
- system dependencies (what must exist before this can be built)

If the dependencies do not exist, tag **`FUTURE SYSTEM / DO NOT BUILD YET`**.
For seasonal / milestone events, use **`ANCHOR EVENT`** (§2) and index in
`random-events.md`'s anchor section.

## 13. Police / policy / pressure content rules

The game may include pressure from inspectors, officials, policy rules,
difficult guests, and reputation risk. These must be framed as:

- **business pressure**
- **compliance risk**
- **reputation risk**
- **crowd-safety risk**
- **staff-morale risk**

**Do not write content that teaches real-world illegal behavior.**
**Do not write procedural instructions for avoiding law enforcement.**
**Do not make the club a crime simulator.**

The club may face shady pressure. **The player should manage consequences,
not learn tactics.** The mechanic is *managerial,* not *instructional.*

See the working guardrail in the `nightclub-safety-framing` skill.

## 14. Mafia / important-guest content rules

Dangerous or powerful guests may appear as **narrative pressure**. They
should be written as:

- intimidation
- social pressure
- business pressure
- difficult VIP expectations
- reputation dilemmas

**Do not write:**
- explicit criminal instructions
- operational crime planning
- how to launder money
- how to bribe officials
- how to hide evidence
- how to evade police

The focus is always: **how does the Owner protect the club, staff, and
culture under pressure?** Bad behavior is always handled as **management
drama** — warnings, complaints, fines, walked staff, lost trust — never
instruction.

This is why the St. Patrick's "Important Guest" anchor (see `event-bible.md`)
is a fairness-pressure / Party-vs-Empire moment, not a crime moment. Same
rule applies to any future fixer (Sera), patron (Cy), or VIP archetype.

## 15. The golden rule

> **Canon can be bigger than code.**
> **Code must only contain what the game can safely support today.**
>
> The Narrative Director writes the future.
> The Technical Lead protects the build.

These two roles are complementary, not adversarial. Canon expanding ahead
of code is *correct* — the bible should always have more in it than the
build does. The intake rules above exist so that the *gap* between canon
and build is never accidentally closed by raw notes turning into shipped
mechanics. **Canon grows freely; code grows carefully.**

---

## Reconciliation notes (where canon differs from `content-intake-rules-ultan-draft.md`)

The Narrative Director's raw draft is preserved verbatim in
`content-intake-rules-ultan-draft.md`. This file is canon. Ultan's stronger
additions were merged in — the repo file structure (existing section numbers
§1–§10) was preserved so other canon docs' cross-refs stay valid.

**What was merged:**

1. **Purpose + Core Rule** — Ultan's *"Writing does not equal build permission"*
   framing promoted to the top of the doc as load-bearing principle.
2. **§1 expanded** — Ultan's 6-step pipeline added with **role names**
   (Narrative Director / Technical Lead) rather than personal names, to avoid
   collision with the in-game character names.
3. **§2 expanded** — added per-tag examples; **added two new tags:** `ANCHOR
   EVENT` (with an explicit cross-ref to `random-events.md`'s hand-scripted
   anchor section, so this is not a parallel system) and `EXPERIMENT`.
4. **§5 expanded** — added the required-fields list and the worked Ayan-as-
   `FUTURE` example.
5. **§7 expanded** — merged Ultan's "not currently buildable" list into the
   existing banked-systems list; added the offline-first guardrail explicitly.
6. **§8 expanded** — added Ultan's explicit ALLOWED NOW vs NOT ALLOWED NOW
   sub-lists for relationship content.
7. **§9 replaced** — Ultan's 8-question promotion checklist replaced the
   repo's 5-item version (strictly better; covers everything the old one did).
8. **§10 updated** — added `ANCHOR EVENT` and `EXPERIMENT` to the quick
   intake template's tag list.
9. **§11–§15 appended** — Current Safe Content Types, Event Intake Rules,
   Police/Policy/Pressure Rules, Mafia/Important-Guest Rules, Golden Rule.

**What was preserved unchanged from the repo file:**

- All existing section numbers (1–10) and their existing content (with §1, §2,
  §5, §7, §8, §9, §10 augmented as noted).
- **§4 What Claude Code may and may not do** — Ultan's draft didn't touch this;
  repo design-law guardrails preserved verbatim.
- **§6 Hidden traits** — Ultan's draft didn't have this; repo wording stays.

**What was deliberately *not* imported:**

- Ultan's draft references "Ayan reviews / Ayan protects the build" using the
  personal name. In this process doc, the **role names** (Technical Lead /
  Narrative Director) are used to avoid collision with in-game character names.
  The disclaimer paragraph in §1 makes the role-name policy explicit.

**Cross-references kept valid:**

- `character-bible.md` and `character-roster.md` reference `§5` (character
  pipeline) and `§6` (hidden traits) — both preserved by number.
- `story-bible.md` references `§2` (tagging), `§4` (no big systems from raw
  notes), `§7` (banked future systems) — all preserved by number.
- `random-events.md` references the doc as a whole — still valid, plus the new
  cross-link from `ANCHOR EVENT` tag to its anchor section.

## Cross-references

- `gameplay-north-star.md` — design law, Party/Empire spine, team canon
  (Narrative Director / Technical Lead roles).
- `story-bible.md` — STORY / LORE source of truth; offline-first principle.
- `character-bible.md` — full character profiles; references §5, §6.
- `character-roster.md` — flat catalog; references §6.
- `relationship-web.md` — Phase 4 Relationship & Interaction Layer; tagged
  per §8.
- `event-bible.md` — active and future event canon; `ANCHOR EVENT` entries
  index here.
- `random-events.md` — banked night-encounter beats + hand-scripted anchor
  index (the canon list `ANCHOR EVENT` tags point to).
- `roadmap.md` — phase ordering; offline-first guardrails.
- `content-intake-rules-ultan-draft.md` — Narrative Director's raw draft,
  preserved for reference.
- `nightclub-safety-framing` (skill) — working guardrail for risky-system
  content; sources §13 and §14.
