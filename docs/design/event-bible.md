# Event Bible

> **Source of truth** for night events. Active events live in code
> (`src/domain/events.ts`) as **deterministic modifier vectors** — never
> self-contained payoffs. This file is canon for what each event *means* and a
> template for future ones. **Documentation only.** See `content-intake-rules.md`.

## What an event is (design law)

An event re-weights a night through a small vector of modifiers; it adds no new
RNG and is not a standalone reward. Quiet Night is the identity-neutral baseline
(all modifiers neutral) — the determinism anchor.

Three gates govern availability (derived in `src/domain/events.ts`):
- **Unlock** — reputation tier / progress milestone.
- **Requirement** — reserve-aware affordability.
- **Readiness** — advisory ("are you set up to pull this off well?").

## Event template

```
### <Event name>
- Tag: CURRENT BUILD | FUTURE SYSTEM | DO NOT BUILD YET
- id (if active):
- Fantasy (one line):
- Unlock / Cost / Booking fee:
- Modifier vector: draw × | spend × | risk + | repMod + | repAmplify ×
- Readiness advice:
- Risk / reckoning (what can go wrong):
```

## Active events (current build — in code)

| Name | id | Feel | Notes |
| --- | --- | --- | --- |
| **Quiet Night** | `regular` | Identity-neutral baseline | All modifiers neutral; determinism anchor. |
| **Private Party** | `private-party` | Booked, guaranteed money | Booking fee is **conditional on execution** (service/incidents/no-shows/theft can dock it). |
| **Student Night** | `student-night` | Rowdy, high volume | Cheaper crowd, more pressure on door/bar. |
| **Grand Opening / Re-Launch** | `grand-opening` | Spotlight | Amplifies the **whole** reputation swing — wins and losses. |
| **Industry Night** | `industry-night` | Sharp, tastemaker crowd | Reputation-leaning; reputation-tier gated. |

> Exact numeric vectors live in `src/domain/events.ts` (code is canon for the
> numbers; this file is canon for the *intent*). Keep them in sync when tuning.

## Live-night moments (current build)

One intervention per night, by priority (`src/lib/intervention.ts`):
- **Bar Pressure** (priority) — bar backing up; Pull a bouncer / Happy-hour promo
  / Ride it out.
- **DJ Cooling** (else) — room cooling; Push the DJ / Send them to the bar / Ride
  it out.
- Else: no moment. "Ride it out" is always identity (no modifier).

> "Both interventions in one night" is a **future** lever — not active.

## FUTURE event classes (docs only — DO NOT BUILD YET)

### Relationship events — Phase 4 (Relationship & Interaction Layer)
Per the narrative principle, **relationship events are gameplay** (two characters
+ pressure + a forced decision). These belong to the **Phase 4 — Relationship &
Interaction Layer** (full canon, dependency chain, and core rules in
`relationship-web.md`). They are authored there using the relationship-event
format and become real events only after Phase 4's dependency chain is satisfied
(visible staff identity, crew impact on outcomes, more roles, a stronger
event/intervention framework, a hidden-trait/staff-memory substitute, and enough
recurring characters). **Implementation status: FUTURE SYSTEM / DO NOT BUILD YET.**

### Owner-meter-gated events (Party / Empire)
Future events whose availability/outcome leans on the Party/Empire meter
(`gameplay-north-star.md`): bigger/wilder concepts on the Party side, controlled
operational events on the Empire side. **Not implemented** — there is no meter.

### Future-role events
Events that depend on future roles (DJ residencies/guest DJs, promoter guest
lists, host/VIP lounge nights). Park here using the template; do not add events
that depend on unbuilt roles or systems.

_(no future events promoted to code — all of the above are FUTURE / DO NOT BUILD YET)_

## Caramel Progression Event Chain

Implementation Status: Future system / do not build yet.  
Required Systems: Loyalty, staff trust, relationship events, staff warnings, possible security lead upgrade.

> **Single source for Caramel's arc.** His identity lives in
> `character-bible.md` (current role: **Senior Bouncer**); the Owner + Caramel
> relationship event lives in `relationship-web.md`. This chain is the canonical
> home for his **future** progression (Senior Bouncer → Trusted Protector →
> Security Lead / Operations Right Hand). Caramel is **one character**, not two.

### Event Chain Purpose

Caramel’s future progression should turn him from a strong senior bouncer into a trusted protector and eventually a Security Lead / Operations Right Hand.

This should not be automatic.

The player should earn it by treating him with respect, scheduling him intelligently, paying him fairly, trusting his warnings, and not using him as disposable muscle.

### Stage 1 — Senior Bouncer

Current Role: Active bouncer candidate.

Caramel works the door and protects the club during risky nights.

Possible event hooks:

- Door pressure rises.
- John is close to escalating a guest problem.
- Staff feel unsafe.
- A risky crowd enters the club.

Possible Caramel bubble:

> “Boss, this one smells like trouble.”

### Stage 2 — Trusted Protector

Future Unlock Condition: High loyalty / repeated good treatment.

Caramel begins to act beyond basic bouncer duty.

Possible event hooks:

- He warns about a bad staff combination.
- He tells the owner John is too heated tonight.
- He notices staff morale dropping.
- He covers a missing shift.
- He gives advice before a risky event.

Possible Caramel bubble:

> “Bro, I got the door. But you need to fix the inside.”

### Stage 3 — Security Lead / Operations Right Hand

Future Unlock Condition: High loyalty plus possible upgrade/promotion system.

Caramel becomes a deeper operational asset.

Possible effects:

- Trains weaker bouncers.
- Reduces door mistakes.
- Gives pre-night security warnings.
- Helps manage risky events.
- Can prevent one staff drama event from escalating.

Possible Caramel bubble:

> “Big night is good bro, but we need control.”

### Failure Path

If treated badly, Caramel does not explode dramatically.

He becomes distant.

Possible signs:

- Stops giving warnings.
- Does only the job.
- Refuses to help weaker staff.
- No longer covers weak points.
- Eventually leaves quietly.

Possible line:

> “I did my shift, boss.”

### Design Rule

Caramel’s arc should not be a simple stat upgrade.

It should feel like the player earned the trust of someone who started at the door and slowly became part of the empire.

---

## Phase 3 — Event System Upgrade

**Implementation Status: FUTURE SYSTEM / DO NOT BUILD YET.**

A deeper event layer — the Private Party booking flow (Accept / Negotiate /
Reject), owner-hosted **Theme Parties** (theme / budget / staff / DJ / marketing),
event categories, budgets, and the long-term "what kind of club this becomes"
identity paths. Everything from here down is **design canon only** — none of it is
built. Build nothing here without a scoped request and its dependencies in place.

### Dependencies (do NOT build until these exist)
- **Character reaction parts** — staff morale shifts, per-event voice lines, and
  the friend-group event stories (Ayan / Caramel / Elfen reactions) require the
  future **Phase 4 — Relationship & Interaction Layer** (see `relationship-web.md`).
- **Policy / event reactions** — how staff and events respond to club rules
  require the future **Club Policies system** (not built).
- **Live venue control** — in-the-moment decisions *during* an event require
  future **night interaction systems** (beyond today's single live moment).
- Theme Parties additionally lean on future roles (active **DJ**, marketing) that
  do not exist yet.

> Scope note: every subsection below — **Layers 1–3**, **Theme Parties**, **Event
> Categories** (Public/Seasonal/Community/VIP/Private Rentals/Underground), and the
> **Long-Term Dream / club-identity paths** — is part of this Phase 3 entry and is
> **FUTURE SYSTEM / DO NOT BUILD YET.** Active events remain only those listed under
> "Active events (current build — in code)" above.

Layer 1: What the player sees

The player shouldn’t be micromanaging every detail.

Instead they choose:

Private Party

Client wants to rent the club.

Examples:

* Birthday party
* Graduation party
* Corporate event
* Influencer event
* Wedding afterparty

Player choices:

* Accept
* Negotiate
* Reject

⸻

Theme Party

The club hosts its own themed event.

Examples:

* 90s Night
* Trance Revival Night
* Neon Future Night
* College Throwback
* Ibiza Sunset Session
* Masquerade Night
* Synthwave Saturday
* Halloween Special

Player chooses:

* Theme
* Budget
* Staff
* DJ
* Marketing intensity

⸻

Layer 2: Gameplay Effects

Each party affects:

Revenue

How much money it makes.

Reputation

What kind of reputation.

Crowd Type

Different guests attend.

Staff Morale

Some staff love certain nights.

Some hate them.

⸻

Example:

Trance Revival Night

Ayan:
+15 morale

“Bro this is what music is supposed to sound like.”

⸻

John:
0

“Music is music.”

⸻

Elfen:
+5

“At least everyone seems happy.”

⸻

Layer 3: Character Stories

This is where your friend-group system shines.

⸻

Example Private Party Event

Wealthy Influencer Birthday

A social media personality wants to rent the venue.

Guaranteed profit.

Potential reputation risk.

⸻

Options:

1. Accept
2. Negotiate conditions
3. Refuse

⸻

Ayan:

“Bro this is free money.”

⸻

Caramel:

“Bro every time somebody says free money we end up with a problem.”

⸻

Elfen:

“Just make sure they’re renting the club because they like it, not because they think they can do whatever they want.”

⸻

Possible outcome:

* Huge profit
* New VIP customers
* Property damage
* Reputation changes

⸻

Example Theme Party

Trance Resurrection

A niche trance event.

Small attendance.

Extremely loyal crowd.

⸻

Ayan:

“This is our people.”

⸻

Choices:

Low Budget

Small profit.

Little risk.

⸻

Medium Budget

Balanced.

⸻

High Budget

Huge reputation boost if successful.

Potential financial disaster if attendance is poor.

⸻

Event Categories

I would create 6 main categories.

⸻

Public Theme Events

Run by the club.

Examples:

* Trance Night
* House Night
* Techno Night
* Latin Night
* Student Night

⸻

Seasonal Events

Examples:

* Halloween
* New Year
* Summer Opening
* Valentine’s

⸻

Community Events

Examples:

* Local DJ Showcase
* Artist Night
* Charity Event
* Open Deck Session

These often attract Elfen’s approval.

⸻

VIP Events

Examples:

* Influencer Party
* Celebrity Appearance
* Luxury Brand Launch

Huge money.

Huge risk.

⸻

Private Rentals

Examples:

* Birthday
* Graduation
* Wedding
* Corporate

Stable income.

⸻

Underground Events

Be careful with how these are portrayed.

Instead of criminality, present them as:

* Secret concert
* Invite-only music event
* Exclusive gathering

High reputation among certain crowds.

Higher scrutiny and operational risk.

⸻

Long-Term Dream

Eventually players shouldn’t just think:

“I’m hosting a party.”

They should think:

“I’m deciding what kind of club this becomes.”

For example:

Ayan Path

* Music-focused
* Wild nights
* High energy
* Higher operational risk

⸻

Caramel Path

* Stable growth
* Reliable operations
* Strong staff culture

⸻

Elfen Influence

* Community reputation
* Loyal regulars
* Positive club culture

⸻

Then every party choice slowly shapes the identity of the club.


---

## Phase 3 / 4 — Seasonal Week & Daily Events (St. Patrick's Week)

**Implementation Status: FUTURE SYSTEM / DO NOT BUILD YET.**

**Phase:** Phase 3 Event System Upgrade + Phase 4 Relationship & Interaction Layer crossover.

**Dependencies (do NOT build until these exist):**
- future theme / holiday / **seasonal event** support (a week-by-week calendar of events)
- future **special guest / VIP access** system (Wednesday "Suspicious VIP"; Sunday crisis)
- future **DJ role / system** (Thursday "DJ Equipment Failure")
- future **Phase 4 Relationship & Interaction Layer** (every character reaction / dialogue line)
- future **crowd / fairness reputation + crowd memory** (skip-the-line consequences that "are remembered")
- future **night interaction systems** (controlling a live mid-night crisis during an event)

> Ultan's writing and dialogue below are preserved as **canon**, not a build spec.
> None of it is active. NOTE — duplicate beat: the Sunday "Mid-Night Crisis Event"
> here is the SAME moment as the detailed **"Important Guest"** event in the next
> section; that fuller version is the canonical write-up. Keep both, but treat them
> as one event when this is eventually built.

WEEK 11 – ST. PATRICK’S WEEK

Theme:
The biggest week of the year for the club.

Crowds are larger.

Expectations are higher.

Everyone is stressed.

⸻

MONDAY

Slow Recovery

The weekend was successful.

Staff are tired.

Some want extra shifts.

Some want rest.

Choices

1. Push business.
2. Give staff rest.
3. Rotate schedules.

Character Reactions

Ayan:
“Bro let’s keep the momentum.”

Caramel:
“Bro half the staff look dead.”

⸻

TUESDAY

Student Society Request

A university society wants discounted entry.

Choices

1. Approve.
2. Reject.
3. Offer compromise.

Effects

* Crowd size
* Revenue
* Reputation

⸻

WEDNESDAY

Suspicious VIP

A wealthy guest arrives with a large entourage.

They’re spending heavily.

They expect special treatment.

Other guests are becoming uncomfortable.

Choices

1. Prioritize the VIP.
2. Treat everyone equally.
3. Give limited accommodation.

Dialogue

Ayan:
“Bro look how much they’re spending.”

Elfen:
“Money isn’t the only thing people notice.”

⸻

THURSDAY

DJ Equipment Failure

The headline DJ discovers technical issues.

Choices

1. Delay opening.
2. Improvise.
3. Pay emergency technicians.

Dialogue

Ayan:
“We can save this.”

Caramel:
“Please tell me you actually have a plan.”

⸻

FRIDAY

Rival Club Promotion

A rival venue launches a huge marketing campaign.

Attendance could suffer.

Choices

1. Counter-promotion.
2. Focus on regulars.
3. Ignore them.

⸻

SATURDAY

St. Patrick’s Eve

Crowds exceed expectations.

The club is packed.

Security is stretched.

Bar staff are overwhelmed.

Choices

1. Keep accepting guests.
2. Slow admissions.
3. Temporary entry pause.

Dialogue

John:
“We can fit more.”

Caramel:
“No we can’t.”

John:
“Probably.”

Caramel:
“That’s not confidence.”

⸻

SUNDAY – MAIN EVENT

ST. PATRICK’S DAY

The biggest event of the year.

Irish decorations.

Live performers.

Special drinks.

Massive attendance.

Everything is at stake.

⸻

Mid-Night Crisis Event

A powerful local businessman arrives unexpectedly with a large group.

They expect immediate VIP access.

Granting it will upset guests who waited.

Refusing may create problems.

Choices

1. Let Them Skip The Line

Immediate tension reduced.

VIP guests unhappy.

Regular customers lose trust.

⸻

2. Refuse Special Treatment

Regulars respect the decision.

Risk confrontation.

Security pressure increases.

⸻

3. Negotiate

Offer premium treatment without breaking club policy.

Harder choice.

Potential best outcome.

⸻

Character Reactions

Ayan:
“Bro this could get awkward.”

⸻

Caramel:
“Then let’s not make it worse.”

⸻

John:
“Just tell me where to stand.”

⸻

Janer:
“I think there are valid points on both sides…”

⸻

Everyone:
“NOT NOW JANER.”

⸻

Elfen:
“The way you handle people tonight will be remembered longer than the profits.”

⸻

Success Outcome

The club survives its biggest night.

Revenue surges.

Reputation grows.

Staff feel proud.

⸻

Failure Outcome

Complaints rise.

Staff morale drops.

Reputation suffers.

The club still survives—but the consequences follow into future weeks.

⸻

This style of event design works well because every event isn’t just:

+10 reputation or +$5,000

It’s:

Ayan wants one thing.

Caramel wants another.

Elfen sees a hidden consequence.

John wants action.

Janer can’t decide.

The owner chooses.

That’s where the personality of Club Empire comes from.

---

## Future Relationship / Special Guest Events

**Implementation Status: FUTURE SYSTEM / DO NOT BUILD YET.**

**Phase:** Phase 3 Event System Upgrade + Phase 4 Relationship & Interaction Layer crossover.

**Dependencies (do NOT build until these exist):**
- future special guest / VIP access logic
- future door fairness / crowd memory system
- future relationship reaction system (Phase 4)
- future theme / holiday event support
- future character dialogue event framework

> The "Important Guest" event below is **future event canon only** — a
> character-pressure moment (fairness vs money vs compromise; Party vs Empire),
> not a stat check. **St. Patrick's Day is NOT an active event** and is not added
> to the live catalog (`src/domain/events.ts`). This is the canonical, detailed
> version of the Sunday "Mid-Night Crisis" beat above. Cross-reference:
> `relationship-web.md` (Phase 4). Store as canon; build nothing here.

EVENT: ST. PATRICK’S DAY – THE IMPORTANT GUEST

DESCRIPTION

The club is at maximum capacity.

The bar is packed.

The dance floor is alive.

The biggest night of the year is running perfectly.

Then John approaches the owner.

DIALOGUE

JOHN:
Boss.

OWNER:
That doesn’t sound good.

JOHN:
Guy at the front wants VIP access.

OWNER:
So?

JOHN:
He says waiting isn’t an option.

OWNER:
Everybody waits.

JOHN:
Apparently not everybody.

(Carousel of crowd noise)

AYAN:
Bro who is he?

JOHN:
No idea.

But his friends look like they own three restaurants and six lawsuits.

AYAN:
Bro that’s oddly specific.

JOHN:
I’m a good judge of character.

CARAMEL:
You’re a terrible judge of character.

JOHN:
I’m literally security.

CARAMEL:
Exactly.

ELFEN:
What’s happening?

OWNER:
Somebody important wants special treatment.

ELFEN:
Important according to who?

JANER:
I mean technically importance is subjective—

EVERYONE:
JANER.

JANER:
Sorry.

AYAN:
Look bro, they’re spending money.

Tonight is already huge.

Let’s not start a problem.

CARAMEL:
And let’s not tell everyone waiting outside that rules don’t matter.

ELFEN:
People notice these things.

Maybe not tonight.

But they remember.

JOHN:
Or I can tell him no.

OWNER:
Please don’t say it like that.

JOHN:
How should I say it?

OWNER:
Politely.

JOHN:
I don’t know that language.

CHOICES

1. Let them skip the line.
2. Refuse special treatment.
3. Offer a compromise.

OPTION 1 RESULT

AYAN:
Bro easy.

Problem solved.

ELFEN:
For tonight.

CARAMEL:
You just taught everybody watching that money buys exceptions.

OPTION 2 RESULT

JOHN:
Finally.

My favourite option.

CARAMEL:
That’s exactly why I was worried.

ELFEN:
At least people know the rules mean something.

OPTION 3 RESULT

OWNER:
We’ll find a solution.

But nobody skips the line.

AYAN:
Bro that’s actually smart.

CARAMEL:
Don’t sound surprised.

AYAN:
I am surprised.

CARAMEL:
Fair.






