# Content Intake Rules

> How creative ideas move from brainstorm → canon → code, so Claude Code, Claude,
> and ChatGPT all build from the same source of truth.

## 1. Where ideas live

- **Google Docs = the creative draft space.** Free-form brainstorming, character
  voice, story arcs, wild "what if" ideas. Nothing here is binding.
- **This repo (`docs/design/`) = the source of truth.** An idea is canon only once
  it lands here. When Docs and repo disagree, **the repo wins.**

## 2. Tag every idea

Every idea — in Docs or here — must carry one of these tags:

| Tag | Meaning |
| --- | --- |
| `CURRENT BUILD` | Implementable with systems that exist **today** |
| `CANON` | Binding lore/character truth (may or may not be code yet) |
| `IDEA` | Unconfirmed brainstorm; not yet canon |
| `FUTURE SYSTEM` | Needs a system we have NOT built |
| `DO NOT BUILD YET` | Explicitly parked; no implementation |
| `VISUAL REFERENCE` | Look, idle animation, 3D / art direction |
| `STORY / LORE` | Narrative, backstory, world |

When unsure whether something is `CURRENT BUILD` or `FUTURE SYSTEM`, treat it as
**FUTURE** and ask.

## 3. Raw notes are not build tickets

Raw Google Docs notes must **not** be implemented directly. They first get
converted into the structured docs:
- `character-bible.md`
- `relationship-web.md`
- `event-bible.md`
- `gameplay-north-star.md`
- `story-bible.md`
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

## 6. Hidden traits

- May be **written in docs** (and stored as inactive flavor metadata once the
  character's role is active).
- **Not activated** until the hidden-trait discovery system exists. Until then:
  mechanical `hiddenTrait` stays `'none'`; UI shows only a **locked / rumor**
  indicator — never the trait name.

## 7. Future systems — banked, do not build

Party/Empire owner meter · loyalty · hidden-trait reveal · friendship/affinity
(chemistry & relationship pressure — **not romance, not simple loyalty**) ·
relationship simulation · staff memory · storyline/quests · tutorial dialogue ·
policies · future staff roles · stock/bottle ordering · dancers · furniture
placement · animated guests · live free-interaction architecture.

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

## 9. Promotion checklist (docs → code)

- [ ] The role/system it needs already exists and is active.
- [ ] No save-schema change (or explicitly approved).
- [ ] No new gameplay system as a side effect.
- [ ] Scoped request (not "build the whole bible").
- [ ] Gates stay green (tests / tsc / export).

## 10. Quick intake template

```
### <Title>
- Tag: CURRENT BUILD | CANON | IDEA | FUTURE SYSTEM | DO NOT BUILD YET | VISUAL REFERENCE | STORY / LORE
- Summary:
- Depends on (must already exist):
- Smallest safe version (if buildable now):
- Status: draft (Docs) | canon (repo) | implemented (code)
```
