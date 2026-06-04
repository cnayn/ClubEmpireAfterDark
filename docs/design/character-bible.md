# Character Bible

> **Source of truth** for who the people of Club Empire are. Identity/flavor only
> — mechanics live in code (`src/domain/staff.ts`); display metadata in
> `src/domain/characters.ts`. See `content-intake-rules.md` for the pipeline.

## Status legend

- **ACTIVE (in code):** role exists today; profile exists as static metadata.
- **CANON (docs only):** written and binding, not yet code (role/system missing).
- **FUTURE / DO NOT BUILD YET:** role/system does not exist; do not implement.

Current active roles: **Bartender, Bouncer**. All other roles are FUTURE.
Stats are a **1–10 narrative reference**, NOT the mechanical 0–100 `StaffMember`
values. Hidden traits are inactive metadata; never revealed in UI (locked only).

## Character template

```
### <Display Name> "<Nickname>"
- Tag: CHARACTER CANON
- Status: ACTIVE (in code) | CANON (docs only) | FUTURE / DO NOT BUILD YET
- Current role: <role>                    # must be an ACTIVE role to be in code
- Future role potential: <role/system>    # docs only; inactive
- Archetype:
- One sentence:
- Visible trait: <name> — <effect>
- Hidden trait: <name> — <effect>         # docs/inactive only; never revealed yet
- Stats (1–10 narrative): Skill / Reliability / Discipline / Temper / Charisma / Ambition / Loyalty Potential / Drama Risk
- Good treatment:
- Bad treatment:
- Dialogue:
- 3D / visual notes:
- Gameplay hook:
- Implementation status:
```

---

## ACTIVE characters (current roles)

### John "The Pitbull" — Bouncer · `bnc-john` — **ACTIVE**
- Current role: Bouncer.
- Archetype: Chip-on-Shoulder Security / Small Dog Syndrome.
- One sentence: A short-tempered bouncer with a massive ego who constantly feels
  the need to prove himself.
- Visible trait: **Fearless** — incident-prevention bonus.
- Hidden trait: **Chip on His Shoulder** — can escalate minor situations into
  major complaints. (Inactive metadata; locked UI; hidden-trait logic is future.)
- Stats (1–10): Skill 6 · Reliability 8 · Discipline 7 · Temper 10 · Charisma 3 ·
  Loyalty Potential 7 · Drama Risk 9.
- Good treatment: defends the club fiercely, takes ownership of security, protects
  staff.
- Bad treatment: starts arguments, overreacts, creates customer complaints.
- Dialogue: "He's looking at me funny, boss." · "I'm just saying I could take
  him." · "Nobody disrespects the door. Nobody."
- 3D notes: arms crossed, constant scowl, walks aggressively despite being short;
  tries to look larger than he is.
- Gameplay hook: useful but risky — prevents incidents now; the escalation/complaint
  edge is a future system, not active.
- Implementation status: **CURRENT ROLE.** Static metadata exists. Hidden-trait
  logic is future only.

### Kareem "Caramel" Souza — Senior Bouncer · `bnc-kareem` — **ACTIVE**
> **Canon decision:** Caramel is **one character, not two.** Arc: Senior Bouncer →
> Trusted Protector → (future) Security Lead / Operations Right Hand. He absorbs the
> practical "trusted right hand" role inside the club.
- Current role: Senior Bouncer.
- Future role potential: **Security Lead / Operations Right Hand** (only if a
  loyalty/progression system exists later). Do not implement now.
- Archetype: Gym Bro Protector / Future Lieutenant.
- One sentence: A motorcycle-riding gym fanatic who talks like a bro, stands like
  a wall, and can become the owner's most loyal right hand if treated with respect.
- Visible trait: **Intimidating Presence** — reduces incidents, improves staff
  confidence, makes risky guests think twice.
- Hidden trait: **Ride or Die** — if respected over time, becomes extremely loyal
  (warns owner about staff problems, protects reputation, covers weak points, can
  eventually train new security). (Inactive metadata; locked UI; future.)
- Stats (1–10): Skill 8 · Reliability 9 · Discipline 8 · Temper 6 · Charisma 8 ·
  Ambition 8 · Loyalty Potential 10 · Drama Risk 3.
- Good treatment: covers short shifts, defends reputation, warns owner about bad
  staff, helps train new bouncers, becomes the trusted security voice, starts
  thinking like management not just muscle.
- Bad treatment: becomes distant, stops giving warnings, does only the job, won't
  train weaker staff, eventually leaves quietly instead of causing drama.
- Dialogue: "Bro." · "Bro listen." · "No bro, trust me." · "Boss, this one smells
  like trouble." · "Big night is good bro, but we need control." · "I got the
  door. You fix the inside." · "Bro, I love the madness too, but we still need to
  survive tomorrow."
- Owner relationship: the bridge between Ayan-chaos and Kerem-discipline; not the
  angel on your shoulder — the guy who says "we still need to survive tomorrow."
- 3D notes: broad shoulders, gym physique, relaxed lean; motorcycle jacket off
  duty, arms loose. Idle: neck crack, door scan, nod to staff, checks the line.
  Future: stands nearer the owner's office when loyalty is high.
- Gameplay hook: long-term investment — early Senior Bouncer → mid staff protector
  → late potential Security Lead / Ops Right Hand; real value if respected.
- Implementation status: **CURRENT ROLE as Senior Bouncer.** Future progression is
  banked only. Do not implement Security Lead or loyalty yet.

### Other active crew (current roles, in code)
- **Dimitri** · `bnc-dimitri` (starting) — The Calm Wall; visible Steady Door.
- **Marcus** · `bnc-marcus` — The Enforcer; visible Intimidating.
- **Pavel** · `bnc-pavel` — The Heavy Hitter; hidden **Flaky** (inactive).
- **Grace** · `bnc-grace` — The Rulebook; visible By the Book.
- **Rosa** · `bar-rosa` (starting) — The Regulars' Favorite; visible Warm Pour.
- **Milo** · `bar-milo` (starting) — The Steady Hand; visible Unshakeable.
- **Vince** · `bar-vince` — The Showman; visible Fast Pour, hidden **Sticky
  Fingers** (inactive).
- **Jin** · `bar-jin` — The Dependable Cheap Hire; visible Steady.

---

## FUTURE characters (docs only — NOT active, NOT hireable)

### Ayan "The Ayananator" — Resident DJ — **FUTURE ROLE**
> In-game character (Party Side). Shares a name with the real-world contributor
> Ayan; they are different — see `gameplay-north-star.md` team canon.
- Role: Resident DJ. Status: **FUTURE / DO NOT BUILD YET** (no DJ system).
- Archetype: Dreamer / Party Animal / Crowd Prophet.
- One sentence: An up-and-coming trance DJ who lives for the crowd and can either
  become the soul of the club or drag everyone into chaos.
- Visible trait: **Crowd Energy** — boosts attendance and atmosphere.
- Hidden trait: **One More Afterparty** — can lift morale/culture after big
  events, but can also create next-day penalties if culture gets too wild.
- Stats (1–10): Skill 8 · Reliability 6 · Charisma 10 · Discipline 4 · Ambition 9 ·
  Loyalty Potential 8 · Drama Risk 7.
- Good treatment: recommends DJs, promotes the club online, creates legendary
  nights, brings new crowds.
- Bad treatment: shows up late, chases other venues, creates staff distractions,
  turns events into ego showcases.
- Dialogue: "When we're famous remember I was here first." · "Bro trust me this
  track is gonna blow up." · "This room is sleeping. Give me ten minutes." ·
  "Tonight can be normal, or tonight can be history."
- 3D notes: always moving, head bobbing, hands in the air, never fully still —
  hears music nobody else hears.
- Implementation status: **FUTURE ROLE / DO NOT BUILD YET.** Do not activate until
  a DJ system exists.

### Janer — VIP Host / Lounge Coordinator — **FUTURE ROLE**
- Role: VIP Host / Lounge Coordinator. Status: **FUTURE / DO NOT BUILD YET**.
- Archetype: Everybody's Friend.
- One sentence: A friendly, well-liked social butterfly whose greatest weakness is
  making decisions.
- Visible trait: **Liked By Everyone** — small staff morale boost.
- Hidden trait: **Analysis Paralysis** — sometimes delays decisions.
- Stats (1–10): Skill 5 · Reliability 7 · Charisma 8 · Discipline 5 · Temper 1 ·
  Loyalty Potential 8 · Drama Risk 2.
- Good treatment: keeps peace, connects staff, smooths tensions.
- Bad treatment: becomes withdrawn, avoids responsibility.
- Dialogue: "Either one is good." · "No wait maybe the other one." · "Actually…"
- Running joke: staff lose patience waiting for Janer to decide.
- Implementation status: **FUTURE ROLE / DO NOT BUILD YET.** Not active until
  VIP/Host/Lounge systems exist.

### Elfen — Friend of the Club / Regular Patron — **FUTURE (not staff)**
- Role: recurring character / conscience. **Not staff. Not hireable.**
- Core fantasy: someone who has seen both worlds and chooses balance — understands
  nightlife, temptation, and consequences; the quiet voice reminding everyone
  where the line is.
- One sentence: A former rave enthusiast who still loves music and people but
  often becomes the quiet voice reminding everyone where the line is.
- Place in cast: if Ayan says "let's do it" and Kerem says "think first," Elfen
  says "what happens after?" — she sees consequences before others do.
- "Mechanic" (future, advisory only): **Trusted Perspective** — occasionally gives
  observations, not stat lectures; sincere, not always correct; never reveals
  hidden numbers. E.g. "Your staff look exhausted." · "People seem uncomfortable
  tonight." · "The atmosphere feels different lately."
- Hidden trait: **People Reader** — notices social shifts before statistics do.
- Visual: warm expression, kind eyes, natural hair, modest-modern nightlife
  clothing; palette dark green / cream / gold / warm earth tones; signature
  necklace she touches while thinking.
- Dialogue style: gentle, direct, never preachy, never dramatic. Lines: "Good to
  see everyone survived another weekend." · "You know sleep is free, right?" ·
  "You don't have to carry everything yourself." · "Try solving one problem
  without threatening it." · "Please pick something before next year." · "You
  built this place. Don't let it become something you'd be embarrassed to walk
  into." · (decline) "I know this isn't what you wanted this place to be."
- Implementation status: **FUTURE RECURRING CHARACTER / DO NOT BUILD YET.** Not
  staff, not hireable.

### Kerem — Empire Side (internal force / advisor) — **FUTURE (not staff)**
> **Canon decision:** Kerem represents the Empire Side / discipline / structure.
> He does **not** need to be active hireable staff now — Caramel absorbs the
> practical "trusted right hand" arc inside the club.
- Status: **FUTURE SYSTEM / DO NOT BUILD YET.** May later be: internal owner voice,
  advisor, tutorial voice, operations philosophy, or the owner-meter counterweight
  to Ayan.
- Represents: discipline, systems, planning, financial control, staff development,
  reputation stability, operational logic, long-term survival.
- Dialogue: "Or we could do this the smart way." · "Big night is good. Surviving
  tomorrow is better." · "You do not need more chaos. You need a system."
- Implementation status: **FUTURE / DO NOT BUILD YET.** Not active staff.

## Kareem “Caramel” Souza

Role: Senior Bouncer  
Role Status: Current Role  
Future Role Potential: Security Lead / Operations Right Hand  
Archetype: Gym Bro Protector / Future Lieutenant

### One Sentence

A motorcycle-riding gym fanatic who talks like a bro, stands like a wall, and can become the owner’s most loyal right hand if treated with respect.

### Design Purpose

Caramel should start as the senior bouncer, not as a separate right-hand character. His deeper role as Security Lead / Operations Right Hand should unlock later only if loyalty systems exist and his loyalty gets high enough.

This gives him progression instead of creating two similar characters.

His arc is:

Senior Bouncer → Trusted Protector → Security Lead / Operations Right Hand

### Visible Trait

Intimidating Presence

Reduces incidents, improves staff confidence, and makes risky guests think twice.

### Hidden Trait

Ride Or Die

If respected over time, Caramel becomes extremely loyal. He warns the owner about staff problems, protects the club reputation, covers weak points, and can eventually train new security staff.

Implementation Status: Future system only. Hidden trait reveal, loyalty progression, staff warnings, and security training are not active yet.

### Reference Stats

These are narrative reference stats, not necessarily current mechanical stats.

- Skill: 8
- Reliability: 9
- Discipline: 8
- Temper: 6
- Charisma: 8
- Ambition: 8
- Loyalty Potential: 10
- Drama Risk: 3

### Good Treatment Behavior

If treated well, Caramel may eventually:

- Cover shifts when the club is short.
- Defend the club’s reputation.
- Warn the owner about bad staff behavior.
- Help train new bouncers.
- Become the owner’s trusted security voice.
- Start thinking like management, not just muscle.

### Bad Treatment Behavior

If treated badly, Caramel may eventually:

- Become distant.
- Stop giving warnings.
- Do only the job and nothing extra.
- Refuse to help train weaker staff.
- Leave quietly instead of causing drama.

### Dialogue

- “Bro.”
- “Bro listen.”
- “No bro, trust me.”
- “Boss, this one smells like trouble.”
- “Big night is good bro, but we need control.”
- “I got the door. You fix the inside.”
- “Bro, I love the madness too, but we still need to survive tomorrow.”

### 3D / Visual Notes

- Broad shoulders.
- Gym physique.
- Confident relaxed lean.
- Motorcycle jacket when off duty.
- Arms loose, not stiff.
- Idle animation: neck crack, door scan, nod to staff, checks the line.
- When loyalty is high in the future, he should visually stand closer to the owner’s office or staff area, not just the door.

### Gameplay Hook

Caramel is a long-term investment character.

Early game: strong senior bouncer.  
Mid game: staff protector.  
Late game: potential Security Lead / Operations Right Hand.

He is useful immediately, but his real value appears if the player treats him with respect over time.

### Implementation Notes

Current implementation should keep Caramel as a current-role bouncer.

Do not split him into a second “right hand” character.

Do not implement Security Lead, Operations Right Hand, loyalty progression, training, staff warnings, or relationship logic until those systems exist.

For now, Caramel’s deeper arc should remain stored as character canon and future design foundation.


