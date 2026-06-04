# Relationship Web

> **Source of truth** for how characters relate — and the home of the **Phase 4
> Relationship & Interaction Layer** design canon. **Documentation only.** There
> is **no relationship / friendship / affinity / loyalty system** in the build,
> and none is to be implemented from this file.

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

---

## Relationship-event format (use for every future relationship event)

```
Characters:
Relationship:
Why they work or clash:
Trigger:
Night event:
Player choices:
Outcome if handled well:
Outcome if ignored:
Dialogue:
Implementation status:    # default FUTURE SYSTEM / DO NOT BUILD YET
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

### Ayan + Kerem — the main Party vs Empire tension
- Relationship: opposite internal owner forces — Ayan wants legendary nights;
  Kerem wants sustainable empire building.
- Function: the central club-identity decision (risk & hype vs survival & structure).
- Example event: Ayan wants to spend heavily on a laser show / guest DJ / risky
  push; Kerem warns the system can't support it yet.
- Choices: Listen to Ayan · Listen to Kerem · Compromise.
- Implementation status: FUTURE OWNER / ADVISOR / EVENT SYSTEM. DO NOT BUILD YET.

### Ayan + Caramel — one more peak moment
- Relationship: Caramel likes Ayan's energy but warns when Ayan pushes too far.
- Night event: Ayan wants one more peak moment; staff and door are already stretched.
- Choices: Let Ayan push the room · Listen to Caramel and stabilize · Compromise:
  one more peak, then close clean.
- Dialogue: Ayan: "Tonight can be history." / Caramel: "Bro, history still needs
  people to open tomorrow."
- Implementation status: FUTURE DJ / LOYALTY / RELATIONSHIP SYSTEM. DO NOT BUILD YET.

### Ayan + John — high hype, aggressive door
- Relationship: dangerous combination — Ayan creates high energy; John may
  overreact if the crowd gets messy.
- Function: high hype + aggressive door control can create reputation risk.
- Implementation status: FUTURE RELATIONSHIP / EVENT SYSTEM. DO NOT BUILD YET.

### Ayan + Janer — energy + smoothing, no discipline
- Relationship: good social combination — Ayan creates energy, Janer smooths
  tension — but both may avoid hard discipline.
- Implementation status: FUTURE HOST / RELATIONSHIP SYSTEM. DO NOT BUILD YET.

### Ayan + Elfen — the big-guest gamble
- Relationship: Ayan respects Elfen; she understands him better than most and
  knows he has no brakes.
- Night event: Ayan wants to book a massive guest DJ the club can barely afford.
- Choices: Book immediately · Reject it · Negotiate a safer deal.
- Dialogue: Ayan: "Bro this could change everything." / Elfen: "Or it could be the
  reason you're fixing a financial disaster next month." / Ayan: "Why do you
  always say the sensible thing?" / Elfen: "Because somebody has to."
- Implementation status: FUTURE RECURRING CHARACTER / EVENT SYSTEM. DO NOT BUILD YET.

### Caramel + John — the aggressive ejection
- Relationship: Caramel finds John funny; John respects Caramel more than most.
  (Future) Caramel can mentor John if loyalty is high; if low, John resents
  Caramel's authority.
- Night event: John ejects a customer too aggressively; the customer was trouble,
  but witnesses are unhappy.
- Choices: Back John publicly · Correct John publicly · Back him now, review later.
- Dialogue: John: "He deserved it." / Caramel: "That's not the point, bro." /
  John: "It kinda is." / Caramel: "No bro. The point is we don't need another
  complaint."
- Implementation status: FUTURE RELATIONSHIP / LOYALTY / EVENT SYSTEM. DO NOT BUILD YET.

### John + Janer — the bottleneck decision
- Relationship: John genuinely likes Janer; Janer drives him absolutely insane.
- Night event: a crowd bottleneck forms near VIP/entrance; John needs a decision
  now; Janer sees three options and can't decide.
- Choices: Let John decide · Let Janer decide · Step in yourself.
- Dialogue: John: "Pick one." / Janer: "I'm thinking." / John: "You've been
  thinking for ten minutes." / Janer: "Exactly." / John: "That's not helping."
- Implementation status: FUTURE HOST / RELATIONSHIP / EVENT SYSTEM. DO NOT BUILD YET.

### Owner + Elfen — profit vs club culture
- Relationship: she believes the owner wants to build something meaningful; worries
  success makes him forget why he started.
- Night event: a very profitable event format works; guests love it, revenue is
  high, but some regulars complain the atmosphere feels different.
- Choices: Double down on the profitable format · Listen to Elfen and protect club
  culture · Run it occasionally.
- Dialogue: Owner: "Look at these numbers." / Elfen: "I am. I'm also looking at
  the people."
- Implementation status: FUTURE RECURRING CHARACTER / CULTURE SYSTEM. DO NOT BUILD YET.

### Owner + Caramel — expand now or wait (emotional core)
- Relationship: Caramel starts as muscle but slowly becomes someone the owner
  trusts; he knows success and survival are different.
- Night event: the club is successful; investors interested; the owner wants a
  second venue immediately; Caramel thinks it's too soon.
- Choices: Expand now · Wait · Prepare expansion but delay launch.
- Dialogue: Owner: "Bro we've made it." / Caramel: "We've survived. That's
  different." / Owner: "You're always cautious." / Caramel: "And you're always one
  good night away from doing something stupid." / Owner: "Fair."
- Implementation status: FUTURE LOYALTY / EXPANSION / RELATIONSHIP SYSTEM. DO NOT BUILD YET.

### Elfen + John — calm down
- Relationship: Elfen often tells John to calm down; John rarely listens.
- Dialogue: Elfen: "Try solving one problem without threatening it."
- Implementation status: FUTURE RECURRING CHARACTER / RELATIONSHIP SYSTEM. DO NOT BUILD YET.

### Elfen + Janer — easy company
- Relationship: they get along easily; Elfen can calm Janer or help him choose.
- Implementation status: FUTURE RELATIONSHIP SYSTEM. DO NOT BUILD YET.

### Elfen + Kerem — aligned, not rigid
- Relationship: usually aligned; Elfen reminds Kerem not to become too rigid.
- Implementation status: FUTURE OWNER / ADVISOR / RECURRING CHARACTER SYSTEM. DO NOT BUILD YET.

### Caramel + Kerem — two kinds of discipline
- Relationship: aligned on discipline — Caramel is street-level practical
  discipline; Kerem is system-level discipline.
- Implementation status: FUTURE OWNER / ADVISOR / RELATIONSHIP SYSTEM. DO NOT BUILD YET.


## Owner + Caramel

Implementation Status: Future loyalty / relationship system. Do not build yet.

### Relationship

Caramel starts as muscle at the door, but can slowly become someone the owner trusts inside the empire.

He is not simply “the loyal big bouncer.” His value is that he understands both sides of the club:

- He enjoys the madness.
- He respects structure.
- He knows the difference between a big night and a sustainable business.

Caramel can become the bridge between Ayan chaos and Kerem discipline.

He is not the angel on the owner’s shoulder. He is the guy who says:

> “Bro, I love the madness too, but we still need to survive tomorrow.”

### Future Relationship Arc

#### Phase 1 — Senior Bouncer

Caramel works the door.

He reduces incidents, protects staff, improves guest safety, and brings funny bro energy to security moments.

#### Phase 2 — Trusted Protector

After enough good treatment and loyalty, Caramel may:

- Warn about bad staff combinations.
- Tell the owner when John is about to escalate something.
- Notice when staff morale is dropping.
- Cover emergency shifts.
- Protect the club’s reputation.

#### Phase 3 — Security Lead / Operations Right Hand

Later, if loyalty and progression systems exist, Caramel may unlock deeper responsibilities:

- Train new bouncers.
- Reduce door mistakes.
- Help manage risky events.
- Give pre-night warnings.
- Prevent one staff drama event from escalating.

### Why This Is Better Than Two Characters

Caramel should not be split into:

- “Big loyal bouncer”
- “Operations right hand”

Those should be the same person at different stages of trust.

That gives him an arc.

He becomes:

> The guy who starts at the door and slowly earns a place inside the empire.

That is stronger for Club Empire than two separate similar characters.

### Example Future Event

Event: Expansion Pressure

The club has finally become successful. Investors are interested. Expansion is possible. The owner wants to open a second venue immediately. Caramel thinks it is too soon.

### Choices

1. Expand now.
2. Wait.
3. Prepare expansion but delay launch.

### Dialogue

Owner: “Bro we’ve made it.”  
Caramel: “We’ve survived. That’s different.”  
Owner: “You’re always cautious.”  
Caramel: “And you’re always one good night away from doing something stupid.”  
Owner: “Fair.”

### Design Note

Caramel should not block ambition. He should protect ambition from collapsing under itself.
