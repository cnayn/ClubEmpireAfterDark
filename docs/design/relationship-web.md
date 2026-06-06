# Relationship Web

> **Source of truth** for how characters relate — and the home of the **Phase 4
> Relationship & Interaction Layer** design canon. **Documentation only.** There
> is **no relationship / friendship / affinity / loyalty system** in the build,
> and none is to be implemented from this file.
>
> **Companion draft:** `relationship-web-ultan-draft.md` — Narrative Director's
> raw draft, preserved for reference. Where canon and the draft disagreed, the
> repo wins; Ultan's sharper dialogue was merged in. Reconciliation notes at the
> bottom of this doc.

---

## Phase 4 — Relationship & Interaction Layer

**Implementation Status: FUTURE SYSTEM / DO NOT BUILD YET.**

### Purpose
This layer creates **emergent story events** from character chemistry, pressure,
and player decisions — turning a generic nightclub management sim into a living
friend-group / staff-drama nightlife game. Players should eventually remember
moments like:
- "I should have listened to Elfen."
- "Ayan talked me into it again."
- "John nearly got us fined."
- "Caramel saved the night."
- "Janer could not decide fast enough."
- "Kerem said this would happen."

### Core insight
> Don't only write character **bios**. Write character **relationships**.
> Bios define who people are. **Relationships create gameplay.**

### How it works (the loop)
> **Take two characters. Add pressure. Force a decision. Create a memorable
> nightclub story.**

### Design principle — pressure, not biography
The strongest relationship content is not biography; it is **pressure**.
- **Bad:** "John is aggressive."
- **Better:** "John is aggressive, and when Janer delays a door decision, John
  gets impatient and may create a complaint unless the owner steps in."

### Dependency chain (do NOT build until ALL exist)
1. Staff identity is visible in the UI.
2. Staff decisions affect night outcomes.
3. More character roles exist beyond bartender/bouncer.
4. A stronger night-event / intervention framework exists.
5. Hidden-trait or staff-memory systems exist (or a lightweight substitute).
6. The club has enough recurring characters for relationships to matter.

**Current status:** Staff identity and crew impact have *started* (1 and 2 in
progress). Full relationship logic is **not ready yet** — roles, recurring cast,
and memory/affinity foundations are missing.

### Core rules (for the future system)
1. Relationship events are **not** random lore dumps.
2. Every relationship event must create a **player decision**.
3. Every decision should connect to **club management**.
4. Relationships should affect tone, consequences, risk, morale, reputation, or
   future opportunities.
5. Characters are never purely good or bad.
6. The system is **not moralistic**.
7. **No romance system.**
8. Friendship / Affinity is **not romance** and **not simple loyalty**.
9. Relationship pressure should create stories **without a giant scripted
   campaign**.
10. Everything should eventually surface through **staff cards, bubbles, floor
    moments, debriefs, and event choices** — not menus of numbers.

> **Crossover event canon:** the St. Patrick's Day "Important Guest" event (a
> Phase 3 + Phase 4 special-guest / fairness-pressure moment with Ayan / Caramel /
> Elfen / John / Janer reactions) lives in `event-bible.md` under "Future
> Relationship / Special Guest Events." FUTURE SYSTEM / DO NOT BUILD YET.

---

## ⚠️ Load-bearing canon — Caramel is the bridge, NOT the Empire principle

> **This framing has drifted three times in drafts. Repo canon, source of truth.
> Future contributors: read this before writing any Caramel beat.**

- **Kerem is the Empire principle** — discipline, systems, financial control,
  long-term survival. "Think first." The structure voice.
- **Caramel is the bridge** — the human translator between Ayan-chaos and
  Kerem-discipline. He articulates the Empire principle on the floor, in human
  terms, when the principle itself isn't in the room. His signature line
  *"we still need to survive tomorrow"* is **Caramel articulating Kerem**, not
  Caramel being Kerem.

**If you find yourself writing Caramel as the long-term-thinking / structure /
"what about rent" voice — stop.** That role is Kerem's. Caramel's pressure on
the Owner sounds like Kerem because Caramel *learned it from Kerem* and
translates it into bro-bridge language at 1:47 AM when the Owner won't listen
to a memo. Caramel is the human face of survival; Kerem is the principle of it.

See `gameplay-north-star.md` (Party / Empire spine), `story-bible.md`
("Caramel — the bridge"), `character-bible.md` (Caramel arc).

---

## Future hidden system — Friendship / Affinity

**Implementation Status: FUTURE SYSTEM / DO NOT BUILD YET.**

**Definition:** tracks **chemistry** between characters. It is **not romance** and
**not simple loyalty.** It measures who works well together, who clashes, who
calms whom, who makes whom worse, and who creates pressure during nights.

**Possible future fields:**
- Likes
- Distrusts
- Makes Better
- Makes Worse
- Calms
- Escalates
- Protects
- Blames
- Covers For
- Triggers Event With

Emergent moments it would enable (illustrative only): Kerem covers for Ayan;
Elfen calms Janer; John annoys everybody; Ayan convinces the owner to throw a
crazy event. **Not implemented** — no affinity tracking, relationship logic,
loyalty, or staff memory.

> **Out of scope for this file (and Ultan's draft):** no affinity numbers, no
> relationship-system design. **Dialogue and stance only.** Mechanical logic is
> banked future work, not authored here.

---

## Relationship-event format (use for every future relationship event)

```
Characters:
Relationship:                    # one or two lines
Conflict:                        # the pressure axis
Trigger:                         # sim state OR scenario
Dialogue:                        # two-line-pressure preferred (Ultan format)
Player choices:                  # 2-3 real options
Outcome direction:               # bounded, no numbers
Relationship hooks:              # [[pair]] cross-refs
Implementation status:           # default FUTURE SYSTEM / DO NOT BUILD YET
```

---

## Future relationship matrix (draft — FUTURE / inactive)

| Character | Likes | Distrusts | Makes Better | Makes Worse |
| --- | --- | --- | --- | --- |
| **Ayan** | Owner, Janer | excessive rules | Owner, creative event culture | himself when unchecked; John during chaotic crowds |
| **Kerem** | Owner, Elfen | recklessness | Ayan when balanced; operations | John if overcontrolled |
| **John** | Owner, Caramel | authority | risky nights when controlled | himself; stylish/VIP nights if unchecked |
| **Janer** | everybody | conflict | social tension; staff comfort | urgent decisions |
| **Elfen** | everybody | ego | Owner, Janer, club culture | nobody directly; creates uncomfortable truth |
| **Caramel** | Owner, Elfen, practical people | reckless chaos | John, Ayan when controlled; security culture | nobody unless ignored |

---

## Relationship canon (CANON drafts — FUTURE / DO NOT BUILD YET)

> **Format:** Ultan's two-line pressure format is the house style. Every beat
> below ends with a player-choice and a relationship-hook line. Where existing
> canon and Ultan's draft both had a beat for the same pair, Ultan's sharper
> dialogue was merged in; canon framing was preserved where it was load-bearing.
> See reconciliation notes at the bottom.

### Owner relationships (the founding cast and the player)

#### Owner + Ayan — destiny vs debt
- Relationship: best friends. Ayan was there before the club was successful and
  genuinely believes the Owner can build something legendary. The Owner trusts
  Ayan's instincts more than he probably should.
- Conflict: Ayan chases opportunities. The Owner worries about consequences.
  Ayan sees potential. The Owner sees risk.
- Trigger: a marquee guest DJ offers a last-minute appearance. The fee is steep.
- Dialogue:
  Ayan: "Bro this is destiny."
  Owner: "Bro this is debt."
  Ayan: "Same thing at the beginning."
- Player choices: Book the DJ · Reject · Negotiate.
- Outcome direction: book = high reputation upside / high reserve risk · reject
  = clean reckoning / Ayan stance hardens · negotiate = reserve cost / best path
  if executed.
- Relationship hooks: [[ayan-kerem]] (whichever side wins this strengthens that
  pole); [[ayan-elfen]] (Elfen will note it whichever way).
- Implementation status: **FUTURE / DO NOT BUILD YET.**

#### Owner + Kerem — the Empire-side conversation
- Relationship: not friends in the Ayan sense. Mutual respect through the work.
  Kerem speaks when the Owner needs to hear it, not when the Owner wants to
  hear it.
- Conflict: hope versus arithmetic. The Owner wants the deal to work. Kerem has
  already done the math.
- Trigger: any decision where the Owner is about to commit reserve the club
  doesn't have yet.
- Dialogue:
  Owner: "Talk me out of it."
  Kerem: "I won't."
  Owner: "Why?"
  Kerem: "Because you already know."
- Player choices: Listen · Do it anyway · Take the middle path.
- Outcome direction: listen = Empire-stance lock-in / Ayan stance hardens ·
  do it anyway = Kerem doesn't repeat himself next time · middle = reserve cost,
  Kerem stance softens.
- Relationship hooks: [[ayan-kerem]] (the central spine you're weighting);
  [[owner-elfen]] (Elfen often agrees with Kerem and never says so).
- Implementation status: **FUTURE / DO NOT BUILD YET.** Requires future
  advisor-voice system (see `character-bible.md` → Kerem).

#### Owner + Caramel — expand now or wait (the bridge)
> **Bridge note:** this beat is the **canonical Caramel-as-bridge moment.**
> Caramel uses Kerem's argument in human terms because Kerem isn't on the
> floor. The decision is Empire-side; the voice making it land is *Caramel
> being Caramel*. Do not rewrite this as Caramel-as-Empire-principle.
- Relationship: closest friendship in the club. Caramel is the one person who
  can tell the Owner he's being stupid. The Owner usually listens. Eventually.
- Conflict: growth versus stability. The Owner wants the empire. Caramel wants
  the empire to survive.
- Trigger: expansion opportunity appears before the club is ready (second
  venue, investor interest, big-room booking).
- Dialogue:
  Owner: "Bro imagine two locations."
  Caramel: "Bro imagine paying rent on two locations."
  Owner: "You kill dreams."
  Caramel: "I keep them alive."
- Player choices: Expand · Wait · Prepare quietly.
- Outcome direction: expand = high reputation upside / sustained reserve drain ·
  wait = clean / Ayan stance hardens · prepare quietly = best path if patient.
- Relationship hooks: [[ayan-kerem]] (Caramel is articulating Kerem's principle
  in human terms — this is the bridge in action); [[owner-elfen]] (Elfen will
  notice which way you went).
- Implementation status: **FUTURE / DO NOT BUILD YET.** The emotional core of
  the long arc.

#### Owner + Elfen — profit vs club culture
- Relationship: mutual respect. Elfen believes the Owner started the club for
  the right reasons. She watches him to see if he still does.
- Conflict: profit versus culture. The Owner can become obsessed with growth.
  Elfen notices when the atmosphere starts changing.
- Trigger: a profitable event format works *too* well. Guests love it, revenue
  is high, but some regulars complain the atmosphere feels different.
- Dialogue:
  Owner: "Look at these numbers."
  Elfen: "I am. I'm also looking at the people."
  Owner: "They'll adapt."
  Elfen: "Maybe. Will the club?"
- Player choices: Chase profit · Protect culture · Find balance (run it
  occasionally).
- Outcome direction: chase = strong short-term margin / crowd-memory drift
  negative · protect = clean reputation / margin pressure · balance = best
  path if you actually hold the line.
- Relationship hooks: [[owner-caramel]] (Caramel agrees with Elfen but says
  it differently); [[ayan-elfen]] (Ayan was the one who pitched the format).
- Implementation status: **FUTURE / DO NOT BUILD YET.**

#### Owner + John — the action question
- Relationship: John respects the Owner because he gave him a chance. The Owner
  likes John despite his constant nonsense.
- Conflict: patience versus action. John believes every problem should be
  solved immediately. The Owner believes most problems shouldn't be solved by
  John.
- Trigger: a difficult customer is causing disruption near the door.
- Dialogue:
  John: "Say the word."
  Owner: "No."
  John: "You haven't heard my solution."
  Owner: "That's why I said no."
- Player choices: Let John handle it · Use diplomacy · Escalate security
  (Caramel takes over).
- Outcome direction: John = fast resolve / incident risk up · diplomacy = clean
  / John stance hardens · Caramel = clean and earned.
- Relationship hooks: [[caramel-john]]; [[ayan-john]] (Ayan would say "let him
  cook").
- Implementation status: **FUTURE / DO NOT BUILD YET.**

#### Owner + Janer — the indecision spiral
- Relationship: friends. The Owner often asks Janer for opinions. Regrets it
  shortly afterward.
- Conflict: decisiveness versus overthinking.
- Trigger: two event proposals arrive in the same week; both have merit.
- Dialogue:
  Owner: "Which one?"
  Janer: "Well both have strengths."
  Owner: "Janer."
  Janer: "I'm getting there."
  Owner: "Please don't."
- Player choices: Event A · Event B · Delay decision (Janer pleased, calendar
  blocked).
- Outcome direction: A / B = your call, Janer stance neutral · delay = clean
  but costs a booking-window.
- Relationship hooks: [[elfen-janer]] (Elfen would have decided in three
  seconds); [[john-janer]] (the bottleneck pair).
- Implementation status: **FUTURE / DO NOT BUILD YET.** Requires future Host
  role (see `character-bible.md` → Janer).

---

### Central spine — Ayan + Kerem

#### Ayan + Kerem — Party vs Empire
> **The central tension of the entire game.** The owner is caught between
> these two; every other relationship beat eventually points back here.
- Relationship: opposite internal owner forces — Ayan wants legendary nights;
  Kerem wants sustainable empire building. They have the same goal and
  fundamentally different theories of how to get there.
- Conflict: chase versus survive. Ayan believes the next night could be
  history. Kerem believes history is a sequence of tomorrows you got through.
- Trigger: the central club-identity decision — risk and hype vs survival
  and structure. Any moment the Owner has to commit reserve that hasn't been
  earned yet.
- Dialogue:
  Ayan: "If we don't take this, we'll always wonder."
  Kerem: "If we take this and lose, we won't wonder. We'll know."
  Ayan: "That's not the same."
  Kerem: "I know."
- Player choices: Listen to Ayan · Listen to Kerem · Compromise.
- Outcome direction: Ayan = Party-stance lock-in / high variance · Kerem =
  Empire-stance lock-in / clean reckoning · compromise = reserve cost / best
  long-term identity if executed.
- Relationship hooks: every other beat in this file ultimately weights this
  pair.
- Implementation status: **FUTURE OWNER / ADVISOR / EVENT SYSTEM. DO NOT BUILD
  YET.** Requires future advisor-voice system.

---

### Founder cross-pairs

#### Ayan + Caramel — one more peak moment
- Relationship: Caramel likes Ayan's energy but warns when Ayan pushes too far.
- Conflict: party versus responsibility.
- Trigger: huge night already running. Staff are exhausted. Ayan wants to keep
  going. Caramel has read the room.
- Dialogue:
  Ayan: "Tonight can be history."
  Caramel: "Bro, history still needs people to open tomorrow."
- Player choices: Push the night · Stabilize · Controlled extension (one more
  peak, then close clean).
- Outcome direction: push = vibe surge / overtime cost + risk up · stabilize =
  clean / Ayan stance hardens · controlled = best path if executed.
- Relationship hooks: [[ayan-kerem]] (Caramel is voicing the Empire view);
  [[ayan-elfen]] (Elfen agrees with Caramel and says less).
- Implementation status: **FUTURE DJ / LOYALTY / RELATIONSHIP SYSTEM. DO NOT
  BUILD YET.**

#### Ayan + Elfen — the big-guest gamble (canon)
- Relationship: Ayan respects Elfen; she understands him better than most and
  knows he has no brakes.
- Conflict: opportunity versus consequence at scale.
- Trigger: Ayan wants to book a marquee guest DJ the club can barely afford.
- Dialogue:
  Ayan: "Bro this could change everything."
  Elfen: "Or it could be the reason you're fixing a financial disaster next
    month."
  Ayan: "Why do you always say the sensible thing?"
  Elfen: "Because somebody has to."
- Player choices: Book immediately · Reject it · Negotiate a safer deal.
- Outcome direction: book = high upside / reserve at risk · reject = clean ·
  negotiate = best path if Sera-equivalent fixer is available (future).
- Relationship hooks: [[ayan-kerem]]; [[owner-elfen]].
- Implementation status: **FUTURE RECURRING CHARACTER / EVENT SYSTEM. DO NOT
  BUILD YET.**

#### Ayan + Elfen — the smaller exchange (sibling beat)
> **Sibling beat.** The big-guest gamble (above) is the marquee version of this
> pair. This one is the recurring smaller register — a quicker exchange the
> Owner overhears more often. Both are canon.
- Trigger: any meaningful Ayan upside-pitch (a promoter offer, a sponsor
  inquiry, a one-off booking).
- Dialogue:
  Ayan: "Bro this could be huge."
  Elfen: "So could the consequences."
  Ayan: "You always do that."
  Elfen: "Somebody has to."
- Player choices: Accept · Reject · Negotiate.
- Implementation status: **FUTURE / DO NOT BUILD YET.**

#### Ayan + John — chaos recognizes chaos
- Relationship: dangerous combination — Ayan creates high energy; John is happy
  to meet it.
- Conflict: neither believes in slowing down. Everyone else has to.
- Trigger: door pressure building during a hot night.
- Dialogue:
  Ayan: "Bro let's send it."
  John: "Finally somebody gets me."
  Caramel: *"Oh no."*
- Player choices: Follow them · Ignore them · Moderate them (Caramel takes
  point).
- Outcome direction: follow = vibe surge / incident risk way up · ignore =
  clean / both their stances harden · moderate = best path / Caramel earns
  toward Stage 2.
- Relationship hooks: [[caramel-john]]; [[ayan-caramel]] (Caramel is
  the only voice both of them respect).
- Implementation status: **FUTURE RELATIONSHIP / EVENT SYSTEM. DO NOT BUILD YET.**

#### Ayan + Janer — energy + smoothing, no discipline
- Relationship: good social combination — Ayan creates energy, Janer smooths
  tension — but both may avoid hard discipline.
- Conflict: speed versus indecision.
- Trigger: a booking decision needs an immediate answer.
- Dialogue:
  Ayan: "Pick one."
  Janer: "I need more information."
  Ayan: "We are out of information."
- Player choices: Force decision · Give time · Decide yourself.
- Outcome direction: force = fast / Janer stance dips · give time = clean /
  draw window closes · decide yourself = reputation lift / staff defer
  to you more.
- Relationship hooks: [[john-janer]] (different version of the same problem);
  [[ayan-caramel]].
- Implementation status: **FUTURE HOST / RELATIONSHIP SYSTEM. DO NOT BUILD YET.**

#### Caramel + Elfen — operations vs mood
- Relationship: strong mutual respect. Usually on the same side. Different
  routes to the same observation.
- Conflict: method. Caramel focuses on operations. Elfen focuses on people.
  Same problem, different language.
- Trigger: staff morale is declining and the schedule is tight.
- Dialogue:
  Caramel: "Schedules are the issue."
  Elfen: "The mood is the issue."
  Caramel: "Those are connected."
  Elfen: "Exactly."
- Player choices: Operational fix · Morale fix · Both (cost both ways).
- Outcome direction: operational = fast / morale lags · morale = slow /
  schedule under pressure · both = best path if reserve allows.
- Relationship hooks: [[owner-caramel]]; [[owner-elfen]].
- Implementation status: **FUTURE RELATIONSHIP / RECURRING CHARACTER SYSTEM.
  DO NOT BUILD YET.**

#### Caramel + John — the aggressive ejection
- Relationship: Caramel finds John funny; John respects Caramel more than most.
  (Future) Caramel can mentor John if loyalty is high; if low, John resents
  Caramel's authority.
- Conflict: discipline versus aggression.
- Trigger: John ejects a customer too aggressively; the customer was trouble,
  but witnesses are unhappy and one of them has a phone.
- Dialogue:
  John: "He deserved it."
  Caramel: "That's not the point bro."
  John: "It kinda is."
  Caramel: "No bro. The point is we don't need another complaint."
- Player choices: Back John publicly · Correct John publicly · Back him now,
  review later.
- Outcome direction: back publicly = John morale holds / crowd-memory mark
  negative on fairness · correct publicly = John morale dips / Chip-on-Shoulder
  may surface next night · back-then-review = clean / Caramel earns Stage 2.
- Relationship hooks: [[ayan-john]]; [[owner-caramel]].
- Implementation status: **FUTURE RELATIONSHIP / LOYALTY / EVENT SYSTEM. DO NOT
  BUILD YET.**

#### Caramel + Janer — action vs hesitation
- Relationship: friendly but distant. Janer met Caramel later than the others.
- Conflict: action versus hesitation.
- Trigger: emergency staffing problem mid-shift (no-show, walked-out staff).
- Dialogue:
  Caramel: "What's the decision?"
  Janer: "I'm thinking."
  Caramel: "Think faster bro."
- Player choices: Follow Caramel · Follow Janer · Decide yourself.
- Outcome direction: Caramel = fast / Janer stance dips · Janer = slow /
  Caramel's patience earns small dent · decide yourself = staff defer to you.
- Relationship hooks: [[john-janer]]; [[owner-janer]].
- Implementation status: **FUTURE HOST / RELATIONSHIP SYSTEM. DO NOT BUILD YET.**

#### Caramel + Kerem — two kinds of discipline
- Relationship: aligned on discipline — Caramel is street-level practical
  discipline; Kerem is system-level discipline. They are doing the same job
  in different rooms.
- Conflict: not real conflict, but different methods. Caramel works through
  presence. Kerem works through structure. Either alone is incomplete.
- Trigger: a recurring staffing problem the schedule can't fix and presence
  can't either.
- Dialogue:
  Caramel: "Bro. The room respects me because I show up."
  Kerem: "The room respects me because the schedule shows up."
  Caramel: "We're doing the same job."
  Kerem: "Different rooms. Same job."
- Player choices: Lean on Caramel · Lean on Kerem · Use both.
- Outcome direction: leaning either way alone leaves the other gap open;
  using both is the long-arc-correct answer at a higher cost.
- Relationship hooks: [[ayan-kerem]]; [[owner-caramel]];
  [[owner-kerem]].
- Implementation status: **FUTURE OWNER / ADVISOR / RELATIONSHIP SYSTEM. DO NOT
  BUILD YET.**

#### Elfen + John — calm down
- Relationship: Elfen sees the good in John. John finds Elfen annoyingly
  reasonable. Elfen often tells John to calm down; John rarely listens.
- Conflict: reflection versus impulse.
- Trigger: a minor issue is about to become a major argument.
- Dialogue:
  Elfen: "You could have handled that differently."
  John: "Why would I?"
  Elfen: "That's exactly my point."
  Elfen *(later, separately)*: "Try solving one problem without threatening it."
- Player choices: Support Elfen · Support John · Mediate.
- Outcome direction: Elfen = John's morale dips short term / reflection earned
  long term · John = Elfen quietly stops offering · mediate = clean.
- Relationship hooks: [[caramel-john]]; [[elfen-janer]].
- Implementation status: **FUTURE RECURRING CHARACTER / RELATIONSHIP SYSTEM. DO
  NOT BUILD YET.**

#### Elfen + Janer — easy company
- Relationship: easiest friendship in the club. Both are patient. Both
  genuinely like everyone.
- Conflict: neither likes conflict — which is itself a conflict when conflict
  needs handling.
- Trigger: a staff disagreement needs mediation and Janer is hoping someone
  else will do it.
- Dialogue:
  Janer: "I don't want anyone upset."
  Elfen: "Then someone has to make a decision."
  Janer: "...I was afraid you'd say that."
- Player choices: Let them mediate · Step in yourself · Ignore.
- Outcome direction: them = slow / clean if it lands · you = reputation lift ·
  ignore = silent rot.
- Relationship hooks: [[owner-janer]]; [[elfen-john]].
- Implementation status: **FUTURE RELATIONSHIP SYSTEM. DO NOT BUILD YET.**

#### Elfen + Kerem — aligned, not rigid
- Relationship: usually aligned. Elfen reminds Kerem not to become too rigid;
  Kerem reminds Elfen that observations need structure to land.
- Conflict: rarely between them — they hold each other honest.
- Trigger: a hard call where being right and being kind point in different
  directions.
- Dialogue:
  Elfen: "You're going to be right about this."
  Kerem: "I know."
  Elfen: "You don't have to enjoy it."
  Kerem: "I don't."
- Player choices: usually no choice here — this is a side beat the Owner
  overhears. Surfaces as ambient texture rather than a forced decision.
- Outcome direction: ambient; lifts Owner's faith in both.
- Relationship hooks: [[ayan-kerem]]; [[owner-elfen]].
- Implementation status: **FUTURE OWNER / ADVISOR / RECURRING CHARACTER SYSTEM.
  DO NOT BUILD YET.**

#### John + Janer — the bottleneck decision
- Relationship: John genuinely likes Janer; Janer drives him absolutely insane.
- Conflict: speed versus deliberation.
- Trigger: a crowd bottleneck forms near VIP / entrance; John needs a decision
  now; Janer sees three options and can't decide.
- Dialogue:
  John: "Pick one."
  Janer: "I'm thinking."
  John: "You've been thinking for ten minutes."
  Janer: "Exactly."
  John: "That's not helping."
- Player choices: Let John decide · Let Janer decide · Step in yourself.
- Outcome direction: John = fast / risk up · Janer = slow / draw dips · you =
  reputation lift / staff defer.
- Relationship hooks: [[ayan-janer]]; [[caramel-janer]].
- Implementation status: **FUTURE HOST / RELATIONSHIP / EVENT SYSTEM. DO NOT
  BUILD YET.**

---

## New cast-to-founder pairs (the bench meets the founders)

> The new Rare / Ultra-Rare cast (see `character-bible.md`,
> `character-roster.md`) relating to the founders through pressure. Six pairs
> — capped here. Beats requiring future-role cast (DJ Ayan, etc.) are tagged
> **FUTURE** so they don't read as buildable-now.

### Vega + Ayan — code vs hype  *(FUTURE — requires DJ Ayan)*
- Relationship: she serves him because he's family; she doesn't bend for him
  because nobody bends for him.
- Conflict: code versus hype. Ayan asks. Vega answers. Repeat forever.
- Trigger: Ayan asks Vega to extend a comp to a "friend of the room" who's
  already been cut off.
- Dialogue:
  Ayan: "He's a friend of the room. One on the house."
  Vega: "Mr. Aksoy. He's had five."
  Ayan: "Vega. C'mon."
  Vega: "Hire someone who bends. Then come watch your inventory."
- Player choices: Back Vega · Override Vega · Pull Ayan aside.
- Outcome direction: back = reputation steady / Ayan stance hardens slightly ·
  override = booking-fee saved / Vega quietly logs it · pull aside = clean,
  best path.
- Relationship hooks: [[ayan-caramel]] (Caramel is watching);
  [[caramel-vega]] (kin discipline).
- Implementation status: **FUTURE — requires DJ Ayan role + future advisor /
  forced-decision encounter framework. DO NOT BUILD YET.**

### Vega + Caramel — aligned discipline
- Relationship: kin. They don't talk much. They don't need to.
- Conflict: not real conflict, but on a hard night they have to choose: the
  bar holds or the door holds — they can't both have the surplus.
- Trigger: bar pressure rising AND a rough crowd is in the queue (cf.
  `random-events.md` "Bar Backs Up Hard" + "Rough Crowd Walks In").
- Dialogue:
  Caramel: "The bar can hold or the door can hold. Not both tonight."
  Vega: "The bar holds."
  Caramel: "Bro."
  Vega: "The bar holds. Tell John."
- Player choices: Bar holds (door eats it) · Door holds (bar eats it) · Pull
  reserve (cost reserve, both hold).
- Outcome direction: bar = serviceRatio stays / door risk up · door = clean
  door / serviceRatio tanks · reserve = best path.
- Relationship hooks: [[caramel-john]]; [[caramel-rosa]] (Rosa would have
  chosen the same).
- Implementation status: **FUTURE / DO NOT BUILD YET.** Active cast (both
  ACTIVE roles), but the forced-decision framework is future.

### Marko + John — soft vs sharp
- Relationship: John thinks Marko is soft. Marko knows John thinks that. They
  work the same door anyway.
- Conflict: hesitation versus reflex.
- Trigger: a real escalation moment, Marko froze a beat (Two-Beat Pause), John
  saw it.
- Dialogue:
  John: "You hesitated."
  Marko: "I was hoping they'd calm down."
  John: "They never calm down."
  Marko: "Sometimes they do."
  John: "Marko."
  Marko: "...Sometimes."
- Player choices: Side with John (pull Marko off door) · Side with Marko (trust
  him next time) · Pair them (Marko reads, John responds).
- Outcome direction: side John = Marko's morale dips / next-night door risk
  steady · side Marko = clean if you're lucky / John stance hardens · pair =
  best path if it holds.
- Relationship hooks: [[caramel-john]] (Caramel mediates);
  [[caramel-marko]] (Caramel is teaching Marko *not* to be soft).
- Implementation status: **FUTURE / DO NOT BUILD YET.** Both ACTIVE cast;
  forced-decision framework is future.

### Marko + Caramel — mentor / protégé
- Relationship: Caramel is teaching Marko a specific lesson — you can be
  friendly OR soft, not both, and the room teaches you which one you are.
- Conflict: not between them; between Marko and himself. Caramel is patient
  about it. He's seen it before.
- Trigger: any night where Marko visibly hesitated.
- Dialogue:
  Caramel: "You can be friendly. You can be soft. Not both, bro."
  Marko: "Which one am I being?"
  Caramel: "Tonight? Soft."
  Marko: "Sorry."
  Caramel: "Don't apologize. Just notice."
- Player choices: usually no choice — this is a back-of-the-bar exchange the
  Owner overhears. Ambient texture.
- Outcome direction: ambient; lifts Marko's slow earn toward Friendly-but-not-
  soft.
- Relationship hooks: [[marko-john]]; [[owner-caramel]].
- Implementation status: **FUTURE / DO NOT BUILD YET.**

### Otis + Ayan — craft vs speed  *(FUTURE — requires DJ Ayan)*
- Relationship: mutual respect across a real disagreement. Ayan loves Otis's
  Sazerac. Ayan still wants Otis to make twelve of them.
- Conflict: craft versus speed. The room is moving. Otis isn't.
- Trigger: peak fill on a night where Ayan has the booth and is pressing the
  energy higher.
- Dialogue:
  Ayan: "Otis. Bro. The room is moving."
  Otis: "The room can wait two minutes."
  Ayan: "The room can't wait two minutes."
  Otis: "Then the room can have a different drink."
- Player choices: Tell Otis to compromise · Tell Ayan to lower the pressure ·
  Pull a second bartender to back-bar.
- Outcome direction: Otis = throughput lifts / craft-pour quality drops · Ayan =
  vibe stays high / Otis stance hardens · second bartender = reserve cost, best
  path.
- Relationship hooks: [[ayan-caramel]]; [[otis-ultan]] (Ultan was at the bar
  earlier; he'd remember which version Otis served).
- Implementation status: **FUTURE — requires DJ Ayan role. DO NOT BUILD YET.**

### Yusra + Caramel — kindred door reads  *(no dialogue — beat is wordless)*
- Relationship: two people who read the door the same way without ever
  discussing it. They share a glance at 11 PM; one of them nods; the line
  shifts.
- Conflict: none between them — this is one of the easy beats. The friction
  is between Yusra's read and the Owner's instinct to override it.
- Trigger: a small group at the door who don't quite fit tonight's crowd-mix.
- Beat (wordless): Yusra catches Caramel's eye. Caramel reads the group, then
  the line, then back to Yusra. He nods once. Yusra turns the group around with
  one sentence the Owner doesn't hear.
- Player choices: Trust the read · Ask why · Override (let them in).
- Outcome direction: trust = clean / draw dips a touch / Yusra earns ·
  ask = small delay / Yusra explains, draws her in · override = draw lifts /
  incident risk up.
- Relationship hooks: [[caramel-john]] (John would not have read it the same);
  [[owner-caramel]].
- Implementation status: **FUTURE / DO NOT BUILD YET.** Both ACTIVE cast.

---

## Reconciliation notes (where canon differs from `relationship-web-ultan-draft.md`)

The Narrative Director's raw draft is preserved verbatim in
`relationship-web-ultan-draft.md`. This file is canon. Where the two disagreed,
canon won; where Ultan's dialogue was sharper, his lines were merged in.

**The five reconciliations:**

1. **Kerem is absent from Ultan's draft.** Repo canon places Kerem as the
   Empire principle (`character-bible.md`, `story-bible.md`,
   `gameplay-north-star.md`). Resolution: Kerem stays. Three existing
   function-only Kerem entries (Ayan+Kerem, Elfen+Kerem, Caramel+Kerem) were
   expanded with dialogue. A new **Owner + Kerem** beat was added — the
   Empire-side advisor conversation Ultan's draft would have needed.

2. **Caramel-as-Empire-voice (the load-bearing conflict).** Ultan's draft
   framed Caramel as "loyalty / responsibility / long-term thinking / what
   happens tomorrow." Repo canon: **Kerem is the Empire principle. Caramel
   is the bridge** — he articulates Empire ideas on the floor in human terms.
   Resolution: Ultan's sharper Owner+Caramel dialogue ("imagine two locations
   / imagine paying rent on two locations") was merged in, **but the canon
   bridge framing is now load-bearing** (see the ⚠️ callout near the top of
   this file). Caramel's "we still need to survive tomorrow" is
   *Caramel articulating Kerem*, not Caramel being Kerem.

3. **Dialogue upgrades.** Ultan's two-line pressure format is the sharpest
   register in either draft. Where canon had only function notes (no
   dialogue), Ultan's exchanges were imported wholesale: **Ayan + John**,
   **Ayan + Janer**, **Elfen + Janer**. Where canon had a one-liner (Elfen +
   John), Ultan's full exchange was added alongside the canon line.

4. **Ayan + Elfen sibling beat.** Canon and Ultan both had a strong
   Ayan + Elfen exchange in different registers. Resolution: **both kept** —
   the "big-guest gamble" stays as the marquee beat; Ultan's shorter version
   was added as a sibling for the recurring quick exchange the Owner overhears
   more often.

5. **New beats Ultan brought that canon didn't have.** Imported verbatim with
   minor format normalization: **Owner + Ayan**, **Owner + John**, **Owner +
   Janer**, **Caramel + Elfen**, **Caramel + Janer**, and the brilliant
   **Caramel "Oh no"** reaction added to Ayan + John.

Everything else in Ultan's draft was already aligned with canon.

## Cross-references

- `gameplay-north-star.md` — Party / Empire spine; the *feel* and guardrails.
- `story-bible.md` — *"Caramel — the bridge (not a fourth voice)"* section
  carving Caramel's role explicitly.
- `character-bible.md` — full character profiles (Tier × Status); see Kerem
  for the Empire-principle entry and Caramel for the bridge arc.
- `character-roster.md` — flat catalog with Tier × Status grid.
- `event-bible.md` — events the cast reacts to (St. Patrick's "Important
  Guest" anchor, Caramel Stage 2 progression).
- `random-events.md` — banked night-encounter beats using these pairs as
  reaction sources.
- `content-intake-rules.md` — promotion pipeline (docs → code); relationship
  content intake §8.
- `relationship-web-ultan-draft.md` — Narrative Director's raw draft,
  preserved for reference.
