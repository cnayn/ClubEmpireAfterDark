# Character Bible

> **Source of truth** for who the people of Club Empire are. Identity/flavor only
> — mechanics live in code (`src/domain/staff.ts`); display metadata in
> `src/domain/characters.ts`. See `content-intake-rules.md` for the pipeline.
>
> **Two-axis tagging:** every character carries a **Tier** (Legendary /
> Ultra-Rare / Rare / Uncommon / Common — depth and rarity) **and** a
> **Status** (ACTIVE / FUTURE — role exists today vs not). The two axes
> are independent: a Rare bartender is Rare ACTIVE; a Rare DJ would be
> Rare FUTURE.
>
> **Source of truth split:** Legendary / Ultra-Rare / Rare full profiles
> live in this file. Uncommon (medium depth) and Common (light pool
> flavor) live in `character-roster.md` so the bible stays deep and the
> roster stays catalog. Cross-reference both.

## Status legend

- **ACTIVE (in code):** role exists today (**Bartender** or **Bouncer**);
  profile exists as static metadata. Hidden-trait *logic* is still future.
- **CANON (docs only):** written and binding, not yet code (role/system missing).
- **FUTURE / DO NOT BUILD YET:** role/system does not exist; do not implement.

Current active roles: **Bartender, Bouncer**. All other roles are FUTURE.
Stats are a **1–10 narrative reference**, NOT the mechanical 0–100 `StaffMember`
values. Hidden traits are inactive metadata; never revealed in UI (locked only).

## Tier legend (rarity — depth scales with rarity)

| Tier | Depth | Slot in the cast |
| --- | --- | --- |
| **Legendary** | Story characters with arcs, full dialogue palette, hidden traits, relationship hooks. | A handful. Handcrafted. The cast spine. |
| **Ultra-Rare** | Full profile, distinct voice, sharp tradeoff, hidden trait. | A handful. Each defines a niche. |
| **Rare** | Full profile, one clear angle, may have a hidden trait. | Around half a dozen. The bench. |
| **Uncommon** | Name, archetype, visible trait, a couple of voice lines. *(In `character-roster.md`.)* | Several. Personality, less depth. |
| **Common** | Name, archetype, one visible trait, maybe one line. *(In `character-roster.md`.)* | Pool flavor. No backstories. |

## Character template

```
### <Display Name> "<Nickname>"
- Tier: LEGENDARY | ULTRA-RARE | RARE | UNCOMMON | COMMON
- Status: ACTIVE (in code) | FUTURE / DO NOT BUILD YET
- Current role: <role>                    # must be Bartender/Bouncer to be ACTIVE
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
- Relationship hooks:
- Implementation status:
```

## Tone discipline (non-negotiable)

Per `gameplay-north-star.md`, `story-bible.md`, `nightclub-safety-framing`:
**Neon Noir, satirical, original IP.** No real brands, no real DJs, no
real celebrities. **No graphic violence; no player-on-staff harm.** Bad
behavior surfaces as **management drama** — warnings, complaints, fines,
trust loss, characters who walk. Tonal *archetypes* (fast-talking fixer,
deadpan disaster, code-first old-school heavy, gonzo burnout) yes;
recognizable copies of named characters from any film no.

---

## LEGENDARY characters

> The cast spine. Six characters, each pulling the Party / Empire tension
> in their own direction (or wavering between them). Each is a real
> decision, not a stat row — useful **and** a liability, with the same
> root.

### John "The Pitbull" — Bouncer · `bnc-john`
- Tier: **LEGENDARY**
- Status: **ACTIVE** (in code)
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
- Relationship hooks: [[caramel-john]] (Caramel mentors / restrains him);
  [[john-janer]] (the bottleneck pair); [[ayan-john]] (high hype + aggressive
  door = reputation risk).
- Party / Empire lean: **Party (by chaos, not intent)** — wants to help; how he
  helps creates the problem.
- Implementation status: **CURRENT ROLE.** Static metadata exists. Hidden-trait
  logic is future only.

### Kareem "Caramel" Souza — Senior Bouncer · `bnc-kareem`
- Tier: **LEGENDARY**
- Status: **ACTIVE** (in code)
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
- Relationship hooks: [[caramel-john]] (mentor); [[owner-caramel]] (the trust
  arc); [[ayan-caramel]] (one more peak moment); [[caramel-kerem]] (two kinds of
  discipline).
- Party / Empire lean: **Bridge** — understands the madness, defends the
  structure.
- Implementation status: **CURRENT ROLE as Senior Bouncer.** Future progression is
  banked only. Do not implement Security Lead or loyalty yet.

### Ayan "The Ayananator" — Resident DJ
- Tier: **LEGENDARY**
- Status: **FUTURE / DO NOT BUILD YET** (no DJ system)
> In-game character (Party Side). Shares a name with the real-world contributor
> Ayan; they are different — see `gameplay-north-star.md` team canon.
- Role: Resident DJ.
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
- Gameplay hook: pure Party-side draw; legendary nights at the cost of
  reliability.
- Relationship hooks: [[ayan-caramel]] (one more peak moment); [[ayan-elfen]]
  (the big-guest gamble); [[ayan-kerem]] (Party vs Empire spine);
  [[ayan-john]] · [[ayan-janer]].
- Party / Empire lean: **Pure Party**.
- Implementation status: **FUTURE ROLE / DO NOT BUILD YET.** Do not activate until
  a DJ system exists.

### Janer — VIP Host / Lounge Coordinator
- Tier: **LEGENDARY**
- Status: **FUTURE / DO NOT BUILD YET** (no Host/VIP/Lounge system)
- Role: VIP Host / Lounge Coordinator.
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
- Gameplay hook: morale up, decision speed down — every forced-decision beat with
  Janer present takes a beat longer.
- Relationship hooks: [[john-janer]] (the bottleneck); [[ayan-janer]] (energy
  without discipline); [[elfen-janer]] (Elfen can calm or decide for him).
- Party / Empire lean: **Wavers** — drifts toward whoever pushes loudest.
- Implementation status: **FUTURE ROLE / DO NOT BUILD YET.** Not active until
  VIP/Host/Lounge systems exist.

### Elfen — Friend of the Club / Regular Patron
- Tier: **LEGENDARY**
- Status: **FUTURE / DO NOT BUILD YET** (recurring character; not staff, not hireable)
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
- Gameplay hook: never a number — a sincere observation that points at a real
  drift; the cost of ignoring her is felt, not stated.
- Relationship hooks: [[ayan-elfen]]; [[owner-elfen]] (profit vs culture);
  [[elfen-john]] (calm down); [[elfen-janer]] (easy company);
  [[elfen-kerem]] (aligned, not rigid).
- Party / Empire lean: **Empire (conscience)** with a former Party heart.
- Implementation status: **FUTURE RECURRING CHARACTER / DO NOT BUILD YET.** Not
  staff, not hireable.

### Ultan "The Witness" Doyle — Scene Chronicler
- Tier: **LEGENDARY**
- Status: **FUTURE / DO NOT BUILD YET** (no press / scene-narration system)
> In-game character. Shares a first name with the real-world contributor
> **Ultan** (Narrative Director / World Builder per `gameplay-north-star.md`);
> they are different people — same disclaimer pattern as Ayan. The in-game
> persona is wholly fictional; the archetype intentionally mirrors the
> real-world role (storyteller / world-builder) as a quiet thank-you.
- Role: Scene Chronicler / music journalist / club historian.
- Archetype: The Witness — older, observational, decides reputations by what he
  writes and says.
- One sentence: A career music journalist who's been writing about this city's
  nightlife for twenty years and can turn a great night into legend, or a slow
  decline into the city's open secret.
- Visible trait (future, advisory): **Scene Memory** — when he's in the room and
  the night lands clean, a small reputation gain on top of the night's swing.
  He tells the story afterward.
- Hidden trait: **Last Word** — if mistreated or ignored, his account becomes the
  city's account; slow negative reputation amplification, never with a number.
  (Inactive metadata; locked UI; future.)
- Stats (1–10): Skill 7 · Reliability 8 · Discipline 9 · Temper 2 · Charisma 7 ·
  Ambition 5 · Loyalty Potential 8 · Drama Risk 4.
- Good treatment: writes you into city legend; brings other journalists,
  curators, and serious DJs; lifts long-term reputation through *being seen* to
  be in your club.
- Bad treatment: doesn't argue; just notes; eventually stops coming; his silence
  shows up in the city's conversation.
- Dialogue: "I've been writing about rooms like this for twenty years. This one's
  interesting tonight." · "Three regulars just left at the same time. Not the same
  group. Not coincidence." · "I'll remember tonight. You don't get to choose how."
  · "The story you want me to write isn't the one I saw." · "A good room writes
  itself. You don't have to perform for me." · (decline / drift) "I don't think
  I'm the one to write what this place is becoming."
- 3D notes: late-50s, slightly worn jacket, small notebook he opens once a night,
  drinks coffee at the bar more often than alcohol; doesn't dance; sits where the
  light is worst.
- Owner relationship: not an advisor; not an ally; the city's witness, on the
  bar's side as long as the bar is on its own side.
- Place in cast: if Ayan asks "will tonight be remembered," Ultan says "yes — by
  me, in the way I saw it." Elfen sees consequences in the room; Ultan tells the
  rest of the city about them.
- Gameplay hook: the difference between a great night being remembered as great
  vs forgotten; his honesty cuts both ways.
- Relationship hooks: [[elfen-ultan]] (same eyes, different megaphone);
  [[ayan-ultan]] (Ayan wants to impress him); [[caramel-ultan]] (doesn't trust
  the press, trusts him); [[kerem-ultan]] (mutual respect); [[vega-ultan]]
  (she serves him coffee).
- Party / Empire lean: **Empire (cultural memory)** with Party appreciation —
  loves a great night and writes about it.
- Future implementation note: would require a **press / scene narration**
  system — a reputation-amplifier triggered by his presence × the night's
  outcome, plus a "city's opinion" track that decays over time. **NOT BUILT.
  DO NOT BUILD YET.**
- Implementation status: **FUTURE RECURRING CHARACTER / DO NOT BUILD YET.**

---

## ULTRA-RARE characters

> Niche-definers. Each holds a corner of the cast nobody else does, with a
> sharper tradeoff than the bench and a hidden trait that earns the
> ultra-rare slot.

### Kerem — Empire-Side Advisor (internal force)
- Tier: **ULTRA-RARE**
- Status: **FUTURE / DO NOT BUILD YET** (no advisor / owner-meter system)
> **Canon decision:** Kerem represents the Empire Side / discipline / structure.
> He does **not** need to be active hireable staff now — Caramel absorbs the
> practical "trusted right hand" arc inside the club.
- Role: future internal owner voice / advisor / tutorial voice / operations
  philosophy / owner-meter counterweight to Ayan.
- Archetype: The Architect — discipline and survival, never the spectacle.
- One sentence: The Empire-side voice in the owner's head and the calm advisor at
  the table who reminds the room that surviving tomorrow is the actual job.
- Visible trait (future, advisory): **Architect's Eye** — observations about
  scheduling, financial control, staff development; never numbers.
- Hidden trait: none surfaced — Kerem's "hidden" is that he is right *more often
  than is fun.*
- Stats (1–10): Skill 9 · Reliability 10 · Discipline 10 · Temper 4 · Charisma 6 ·
  Ambition 7 · Loyalty Potential 10 · Drama Risk 2.
- Represents: discipline, systems, planning, financial control, staff development,
  reputation stability, operational logic, long-term survival.
- Good treatment: club becomes legible and sustainable; staff grow; reputation
  holds across seasons.
- Bad treatment: doesn't leave dramatically; the room stops asking for his
  opinion, and the books slowly stop balancing.
- Dialogue: "Or we could do this the smart way." · "Big night is good. Surviving
  tomorrow is better." · "You do not need more chaos. You need a system." ·
  "Hire the boring one. Pay them well. Watch what happens in six months."
- Relationship hooks: [[ayan-kerem]] (the central spine); [[elfen-kerem]]
  (aligned, not rigid); [[caramel-kerem]] (two kinds of discipline);
  [[vega-kerem]] (the bar's discipline meets the owner's).
- Party / Empire lean: **Pure Empire**.
- Future implementation note: an advisor-voice system (lines tied to sim state,
  owner-meter counterweight) would be needed before Kerem can speak in-game. **NOT
  BUILT. DO NOT BUILD YET.**
- Implementation status: **FUTURE / DO NOT BUILD YET.** Not active staff.

### Vega "The Lighter" Calderon — Bartender
- Tier: **ULTRA-RARE**
- Status: **ACTIVE** (in code)
- Current role: Bartender.
- Archetype: Code-First Old-School — bartends like it's a craft and a duty.
- One sentence: A long-career bartender who pours fairly, cuts off problems early,
  and won't be talked out of either — even when bending the rule would save the
  booking fee.
- Visible trait: **Even Pour** — small reputation lift on her shifts (regulars
  trust the bar she runs); cuts off problem guests early (reduces incidents).
- Hidden trait: **The Code** — refuses to bend even when bending would help. Will
  deny a marquee VIP a fifth round and won't be talked out of it. (Inactive
  metadata; locked UI; future.)
- Stats (1–10): Skill 9 · Reliability 10 · Discipline 10 · Temper 5 · Charisma 6 ·
  Ambition 4 · Loyalty Potential 8 · Drama Risk 2.
- Good treatment: trains other bartenders in the craft; becomes lead bartender;
  protects the long arc of the bar's reputation; never quits dramatically.
- Bad treatment: never argues; just delivers her shift while the room rots
  quietly; eventually leaves with two weeks' notice and no scene.
- Dialogue: "Mr. Aksoy. Five is the last one. You can be angry about that or you
  can drink water now." · "I don't care who he is. He's done." · "The bar serves
  the room. Not the loudest person in it." · "If you want me to bend, hire someone
  who bends. Then watch your inventory."
- 3D notes: late-50s, lean, hair pulled back, sleeves rolled to elbow, watch on
  the inside of her wrist; doesn't smile for the camera, smiles for regulars.
- Gameplay hook: opposite tradeoff to Vince — she protects the long arc at the
  cost of tonight's flex; the bartender you want for inspections and against you
  on a Private Party VIP request.
- Relationship hooks: clashes with [[ayan-vega]] (the music guy wants more from
  Friday); aligned with [[caramel-vega]] and [[kerem-vega]];
  [[elfen-vega]] (mutual respect); [[vega-ultan]] (she serves him coffee).
- Party / Empire lean: **Empire (craft and code)**.
- Implementation status: ACTIVE static metadata; The Code hidden-trait logic
  (firing on a flex decision) is future.

### Marko "Soft Marko" Ilic — Bouncer
- Tier: **ULTRA-RARE**
- Status: **ACTIVE** (in code)
- Current role: Bouncer.
- Archetype: The Gentle Giant — looks like a wall, has a soft heart, hesitates at
  the wrong second.
- One sentence: A massive bouncer everybody loves at the door, who freezes one
  critical second when a rough crowd actually turns.
- Visible trait: **Friendly Face** — door vibe lifts; Locals segment likes him;
  people happy to be carded.
- Hidden trait: **Two-Beat Pause** — hesitates a critical second on real
  escalation, raising incident chance on rough-crowd nights. (Inactive metadata;
  locked UI; future.)
- Stats (1–10): Skill 6 · Reliability 8 · Discipline 5 · Temper 1 · Charisma 9 ·
  Ambition 3 · Loyalty Potential 9 · Drama Risk 6.
- Good treatment: becomes everyone's favorite door; lifts staff morale; sends
  birthday cards to regulars; trains new bouncers in being friendly without being
  soft.
- Bad treatment: still smiles, still misses the moment; eventually quits citing
  "the energy."
- Dialogue: "ID, please. Sorry. House rules. Sorry." · "I let them in. I'm sorry.
  They looked normal." · "It's not that I can't, boss. It's that I keep hoping
  they'll calm down." · "Boss. I think I made a mistake. The big one or the small
  one — I haven't decided."
- 3D notes: 6'5", round-shouldered, slight slouch when he stands at ease;
  eyebrows up by default; visible relief when he's allowed to just card people.
- Gameplay hook: marquee for slow/regular nights; risky for rough-crowd or
  VIP-pressure nights; the inverse of John.
- Relationship hooks: [[john-marko]] (John thinks he's soft);
  [[caramel-marko]] (mentor); [[janer-marko]] (Janer adores him);
  [[vega-marko]] (she serves him water at shift end without asking).
- Party / Empire lean: **Party (by liability)** — wants to be everyone's
  friend; the cost is the moment he should have moved.
- Implementation status: ACTIVE static metadata; Two-Beat Pause hidden-trait
  logic is future.

### Sera "The Phonebook" Voss — Fixer (recurring, NOT STAFF)
- Tier: **ULTRA-RARE**
- Status: **FUTURE / DO NOT BUILD YET** (no favors/debts system)
- Role: recurring character / fixer. **Not staff. Not hireable.**
- Archetype: The Fixer — knows everyone in the city, solves problems, keeps a
  tab.
- One sentence: A well-connected friend of the club who can solve almost any
  operational problem in a single phone call, and remembers every favor she
  calls in for you.
- Visible trait (future, advisory): **Favor Network** — when present mid-night
  and asked, can solve a specific operational problem (cover a no-show, find a
  runner, smooth a complaint).
- Hidden trait: **Tab Open** — every favor incurs an invisible tab; the tab is
  settled later via a future forced-decision event. (Inactive; locked UI; future.)
- Stats (1–10): Skill 9 · Reliability 9 · Discipline 7 · Temper 3 · Charisma 9 ·
  Ambition 7 · Loyalty Potential 6 (loyal to the city, not the club) ·
  Drama Risk 6.
- Good treatment: solves the unsolvable; her tab calls are reasonable; introduces
  you to the right people.
- Bad treatment: still polite, still helpful — but her tabs get steeper and
  stranger.
- Dialogue: "I'll send someone. He's ten minutes out. He owes me — and now you do
  too. Don't worry, it's a small one." · "If you need a yes, ask. If you need a
  clean yes, don't." · "The complaint goes away if a specific person eats dinner
  at a specific place tomorrow. Don't ask which person." · "I keep a list.
  Everyone keeps a list. Mine's longer."
- 3D notes: mid-40s, sharp jacket, single phone always in hand, leans on the bar
  like she owns it without owning it; never holds a drink.
- Gameplay hook: a future emergency reserve — solves any one operational problem
  at the cost of a future forced choice you didn't get to negotiate.
- Relationship hooks: [[ayan-sera]] (he'd call her without asking);
  [[caramel-sera]] (respect, wariness); [[elfen-sera]] (Elfen sees the cost
  first); [[kerem-sera]] (Kerem doesn't trust her on principle);
  [[sera-vega]] (Vega thinks the tab system is the problem).
- Party / Empire lean: **Empire leverage, Party cost** — she fixes the operation,
  the tab is the chaos.
- Future implementation note: would require a **favors / debts system** —
  per-tab tracking + a settlement-event resolver. **NOT BUILT. DO NOT BUILD
  YET.** Do not activate Sera in any candidate pool.
- Implementation status: **FUTURE RECURRING CHARACTER / DO NOT BUILD YET.**

### Cy "Cy-Note" Larrieux — Regular (recurring, NOT STAFF)
- Tier: **ULTRA-RARE**
- Status: **FUTURE / DO NOT BUILD YET** (no patron / vibe-friction system)
- Role: recurring patron / vibe figure. **Not staff. Not hireable.**
- Archetype: The Burnout Regular — always at the club, sometimes the soul of the
  night, sometimes the reason the night ends bad.
- One sentence: A regular who knew the club before it was the club, who can lift
  a hot night into legend and sink a cold night into wreckage.
- Visible trait (future, advisory): **Vibe Catalyst** — when in the room on a hot
  night, lifts vibe a notch; on a cold night, drags it down.
- Hidden trait: **Always Has A Bottle** — can pressure staff toward bad decisions
  mid-shift (offer a bartender a drink; press the DJ for a request; convince the
  bouncer it's fine). (Inactive; locked UI; future.)
- Stats (1–10): Skill 5 · Reliability 3 · Discipline 2 · Temper 4 · Charisma 9 ·
  Ambition 1 · Loyalty Potential 8 · Drama Risk 9.
- Good treatment: lifts hot nights into legendary; brings stories and people;
  remembers your name when no one else does.
- Bad treatment: same person, but the chaos starts costing.
- Dialogue: "Brother. Listen. Brother. *Listen.* Tonight is going to be — yeah.
  Yeah. Trust me." · "I've been here since the curtains were curtains. The room
  is happy, brother." · "Tell the DJ I love him. Just go tell him. He needs to
  hear it." · "I'll close the bar with you. I always close the bar. That's my
  job. Unofficially."
- 3D notes: 50s, lived-in face, expensive shirt that's seen four nights since
  the last wash, sunglasses indoors during the worst hours.
- Gameplay hook: a vibe multiplier in both directions; banning him costs Friday
  loyalty; not banning him risks a wreckage event.
- Relationship hooks: [[ayan-cy]] (Ayan loves him); [[caramel-cy]] (Caramel
  watches him); [[elfen-cy]] (Elfen sees through him); [[vega-cy]] (Vega cuts
  him off cheerfully every Saturday); [[ultan-cy]] (Ultan has written about him
  once — Cy framed the article).
- Party / Empire lean: **Pure Party (wreckage)**.
- Future implementation note: would require a **recurring-patron / vibe friction**
  system — per-night ambient NPC presence, vibe modifier, and staff-pressure
  encounter hooks. **NOT BUILT. DO NOT BUILD YET.**
- Implementation status: **FUTURE RECURRING CHARACTER / DO NOT BUILD YET.**

---

## RARE characters

> The bench. Full profiles, one clear angle each. Most are ACTIVE
> bartenders/bouncers; promoted from the original one-liner crew list
> because the player will *notice* them across many nights.

### Rosa "Warm Pour" — Bartender · `bar-rosa` (starting)
- Tier: **RARE**
- Status: **ACTIVE** (in code)
- Current role: Bartender.
- Archetype: The Regulars' Favorite — every regular comes for her shift.
- One sentence: A career bartender who knows every regular by name, drink, and
  bad week, and quietly holds the loyalty of the bar together.
- Visible trait: **Warm Pour** — modest reputation lift; regulars are happier on
  her shifts.
- Hidden trait: none active.
- Stats (1–10): Skill 7 · Reliability 9 · Discipline 7 · Temper 3 · Charisma 9 ·
  Ambition 4 · Loyalty Potential 9 · Drama Risk 2.
- Good treatment: holds the regular base; covers for younger staff; refuses to
  leave the rail when the night gets thick.
- Bad treatment: doesn't argue; the warmth quietly drains; regulars feel the
  difference before stats do.
- Dialogue: "Same as last week? Sit. I'll bring it." · "She's not here. Don't ask
  twice." · "You're good. I cut you off ten minutes ago. You just didn't notice."
- Gameplay hook: she is the reason the regulars segment doesn't quietly leave.
- Relationship hooks: [[owner-rosa]] (the regulars' trust runs through her);
  [[caramel-rosa]] (mutual respect); [[vince-rosa]] (she knows what he does).
- Party / Empire lean: **Empire (loyalty)**.
- Implementation status: ACTIVE static metadata.

### Grace "The Rulebook" — Bouncer · `bnc-grace`
- Tier: **RARE**
- Status: **ACTIVE** (in code)
- Current role: Bouncer.
- Archetype: By the Book — pays the price for the paperwork mattering.
- One sentence: A bouncer who treats the door like a courtroom and never lets a
  missing ID slide.
- Visible trait: **By the Book** — reduces compliance risk on smoking-relaxed or
  loose-ID nights.
- Hidden trait: none active.
- Stats (1–10): Skill 7 · Reliability 10 · Discipline 10 · Temper 4 · Charisma 4 ·
  Ambition 5 · Loyalty Potential 8 · Drama Risk 2.
- Good treatment: protects the club from compliance fines; trains new staff in
  the door process; defers respectfully to Caramel.
- Bad treatment: gets quietly resentful when she sees the rules bent; doesn't
  quit, just stops doing the favors.
- Dialogue: "ID. The real one. I'll wait." · "He said his name was Mark. His ID
  says Marko. Which one is the lie?" · "If you want a special case, hire a
  special-case bouncer."
- Gameplay hook: she's the bouncer who saves you from inspections; she's also the
  bouncer who turns away the VIP's friend.
- Relationship hooks: [[caramel-grace]] (Caramel respects her process);
  [[grace-marko]] (his Friendly Face is exactly the thing she doesn't trust);
  [[grace-vega]] (kin: both run on a code).
- Party / Empire lean: **Empire (rules)**.
- Implementation status: ACTIVE static metadata.

### Pavel "Heavy Hitter" — Bouncer · `bnc-pavel`
- Tier: **RARE**
- Status: **ACTIVE** (in code)
- Current role: Bouncer.
- Archetype: The Heavy Hitter — pure physical security, unreliable schedule.
- One sentence: A massive bouncer who can shut a problem down without saying a
  word, on the nights he actually shows up.
- Visible trait: **Heavy Hitter** — strong incident prevention on rough-crowd
  nights.
- Hidden trait: **Flaky** — chance of last-minute no-show. (Inactive metadata;
  locked UI; future.)
- Stats (1–10): Skill 9 · Reliability 4 · Discipline 5 · Temper 6 · Charisma 4 ·
  Ambition 3 · Loyalty Potential 5 · Drama Risk 5.
- Good treatment: shows up more; fewer last-minute cancellations; trains other
  bouncers in his quiet way.
- Bad treatment: more no-shows; eventually answers nobody's calls.
- Dialogue: "I'm here. What needs handling." · "I said I'd come. I came." ·
  "Sometimes I just can't. Don't ask."
- Gameplay hook: a high-ceiling bouncer with reliability risk — on his nights,
  golden; on his off-nights, the no-show beat fires.
- Relationship hooks: [[caramel-pavel]] (Caramel covers for him exactly once);
  [[pavel-john]] (John doesn't get it).
- Party / Empire lean: **Neutral leaning Party** by chaos of schedule.
- Implementation status: ACTIVE static metadata; Flaky hidden-trait logic is
  future.

### Vince "The Showman" — Bartender · `bar-vince`
- Tier: **RARE**
- Status: **ACTIVE** (in code)
- Current role: Bartender.
- Archetype: The Showman — flair, speed, charm, fingers in the till.
- One sentence: A fast-pouring crowd-pleasing bartender who skims when he thinks
  nobody is looking, and he's right more often than he's wrong.
- Visible trait: **Fast Pour** — strong bar throughput; lifts tips and vibe.
- Hidden trait: **Sticky Fingers** — small theft risk per shift; rises with low
  oversight. (Inactive metadata; locked UI; future.)
- Stats (1–10): Skill 8 · Reliability 7 · Discipline 4 · Temper 5 · Charisma 9 ·
  Ambition 7 · Loyalty Potential 4 · Drama Risk 7.
- Good treatment: dials it back; turns into the bar's main draw without the side
  cost.
- Bad treatment: the skim grows; eventually walks before being caught, with a
  story for everyone.
- Dialogue: "Two of these and one for the lady — she pays cash." · "Boss, the
  night's on me. Watch this." · "Tips? What tips. Slow night."
- Gameplay hook: throughput and charm with a hidden cost — Caramel will find out
  before the books do.
- Relationship hooks: [[caramel-vince]] (Caramel watches him);
  [[rosa-vince]] (Rosa knows); [[vega-vince]] (Vega is the inverse).
- Party / Empire lean: **Party (charm with side cost)**.
- Implementation status: ACTIVE static metadata; Sticky Fingers hidden-trait
  logic is future.

### Yusra "Sundown" Adekunle — Bouncer
- Tier: **RARE**
- Status: **ACTIVE** (in code)
- Current role: Bouncer.
- Archetype: The Door Reader — quiet, watches, pre-empts.
- One sentence: A bouncer who sees the night's trouble at the door and turns it
  around before it costs you anything.
- Visible trait: **Sundown** — small incident reduction by pre-empting problem
  entries.
- Hidden trait: none active.
- Stats (1–10): Skill 8 · Reliability 9 · Discipline 8 · Temper 3 · Charisma 5 ·
  Ambition 5 · Loyalty Potential 7 · Drama Risk 2.
- Good treatment: trains other bouncers in reading; takes the hard call without
  drama.
- Bad treatment: doesn't complain; just stops volunteering her reads.
- Dialogue: "Who told you about the club tonight?" · "Have a good night somewhere
  else." · "Boss. The two by the smoking area. They're not staying."
- Gameplay hook: prevents incidents at the cost of a small amount of door draw —
  she turns away ambiguous walk-ins.
- Relationship hooks: [[caramel-yusra]] (kin); [[yusra-john]] (she finishes the
  sentence John would have escalated).
- Party / Empire lean: **Empire (pre-emption)**.
- Implementation status: ACTIVE static metadata.

### Otis "Slow Otis" Park — Bartender
- Tier: **RARE**
- Status: **ACTIVE** (in code)
- Current role: Bartender.
- Archetype: The Craftsman — slow hands, perfect drinks, hates rushing.
- One sentence: A bartender who makes the best drink in the city and refuses to
  make it any faster, even on a peak Friday.
- Visible trait: **Craft Pour** — lifts VIP / Industry spend-per-guest; reduces
  serviceRatio under bar pressure.
- Hidden trait: none active.
- Stats (1–10): Skill 10 · Reliability 8 · Discipline 8 · Temper 4 · Charisma 6 ·
  Ambition 6 · Loyalty Potential 7 · Drama Risk 3.
- Good treatment: stays late on industry nights; trains junior bartenders;
  doesn't push back when the room is calm.
- Bad treatment: gets slower, not faster; talks more, pours less.
- Dialogue: "I'm not going to rush a Sazerac. You can be upset about that." ·
  "Three for the gentleman. Out in two minutes." · "I do one thing at a time. The
  thing I do, I do well."
- Gameplay hook: perfect for VIP / Industry / Private Party nights; wrong choice
  for Student nights — opposite of Vince.
- Relationship hooks: [[vega-otis]] (mutual respect; both serve the room);
  [[otis-ultan]] (Ultan writes about his Sazerac).
- Party / Empire lean: **Empire (craft)**.
- Implementation status: ACTIVE static metadata.

---

## UNCOMMON and COMMON characters

> See `character-roster.md` for **Uncommon** (medium depth) and **Common**
> (light pool flavor) entries, the full tier × status grid, and the
> procedural-pool note. Depth scales with rarity; the bench in this file
> stops at Rare, and the catalog continues over there.

---

## Cross-references

- `character-roster.md` — flat catalog of every named character with
  tier × status grid, plus Uncommon and Common entries.
- `relationship-web.md` — affinity matrix, [[pair]] hooks referenced
  above, Phase 4 Relationship & Interaction Layer canon.
- `event-bible.md` — events the cast reacts to (Caramel arc, the
  St. Patrick's "Important Guest" anchor).
- `random-events.md` — banked night-encounter beats using this cast.
- `content-intake-rules.md` — promotion pipeline (docs → code).
- `gameplay-north-star.md` — Party / Empire spine; team canon (the
  Ayan and Ultan name-disclaimers point here).
- `story-bible.md` — Neon Noir tone, world facts, three-voices framing.
