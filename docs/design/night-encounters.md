# Night Encounters (On-Floor Pressure Bank)

> **Status: FUTURE CONTENT / DO NOT BUILD YET unless current systems support it.**
>
> Content bank for moments that happen **inside the room** while the night runs
> — door, bar, dance floor, bathroom, DJ booth, staff area. Pressure beats with
> forced decisions, not scripted scenes. Use the engine in
> [random-events.md](random-events.md) (Layer A × B × C) as the build target;
> this file is the on-floor source pool.
>
> Phone-delivered beats live in [phone-messages.md](phone-messages.md).
>
> Authoring discipline: Neon Noir, original IP, satirical, no real brands, no
> graphic violence, no sexual mechanics, no player-on-staff harm. Bad behavior
> = management consequence, not instruction.
>
> **Cast rule:** beats featuring John, Caramel, Rosa, Milo, Jin, Vince, Grace,
> Pavel, Dimitri, Marcus may be authored now (current roles). Beats featuring
> Ayan, Janer, Elfen, Kerem, DJs, waiters, dancers, VIPs are tagged
> `(future)` and gated on their role/system existing.

---

## How encounters land during the night (pacing + comm canon)

Encounters in this bank are **presented, not interrupted.** The room
keeps running underneath any encounter overlay. The clock does not
pause. Pressure builds visibly *before* an encounter modal appears.

Canonical sources for *how* these beats surface visually and at what
pace:

- **Pacing rules** — [`UIUX_Reference_Pack.md`](UIUX_Reference_Pack.md)
  **Section 15** (Night Pacing Philosophy). Observation is gameplay;
  boss actions are deliberate; "ride it out" is valid.
- **Readability rules** — UIUX **Section 16** (UI Rules for Night
  Readability). Pressure visible before text; every problem gets a
  zone + signal + owner response; the player knows what's happening
  before the debrief.
- **Live communication language** — UIUX **Section 17** (Staff, Guest,
  Story Inside the Night). Staff speak through posture/ring/bubble
  icons; guests through cluster tints/bubbles; story through bubbles,
  phone overlays, staff warnings, and visible floor reactions.

**Authoring implication:** the **Visual Cue** field on every beat
below is the *primary* surface — text Dialogue supports it, never
replaces it. If a beat can't surface visually before its text fires,
revise the visual cue, not the dialogue.

---

## 1. Door Tension

### Door – Line Is Getting Mean

Status:
FUTURE CONTENT / DO NOT BUILD YET unless current systems support it

Trigger:
`crowdPressure ≥ 0.9` AND door queue stalled for two beats.

Location:
Door

Characters:
Caramel, John, Owner. Future: Janer.

Situation:
The line is twenty deep and the front of it is loud. A guy in a leather jacket
is filming. A woman behind him is asking who's in charge.

Dialogue:
John: "Boss, front of the line wants a name."
Caramel: "And the back of the line wants a drink, bro."
John: "Same problem."
Caramel: "Different problem."

Player Choices:
1. Let Caramel run a faster ID sweep — move people in.
2. Hold rigorous checks — let the line wait.
3. Step out yourself and work the rope.

Outcome Direction:
1. door risk down · vibe up · small reputation ding if a borderline ID gets through.
2. door risk down · vibe down · reputation up.
3. reputation up · small bar pressure up (you're not on the floor) · Caramel trust up.

Visual Cue:
Crowd cluster bubble outside the door, red rope marker on the door tile.

Implementation Note:
Sits on top of today's door logic. Maps to a future encounter that hooks the
existing `crowdPressure` signal mid-night.

---

### Door – VIP Card Holder Stuck Behind A Walk-In Group

Status:
FUTURE CONTENT / DO NOT BUILD YET unless current systems support it

Trigger:
`vipFocus` ON AND a flagged regular waits more than two intervals.

Location:
Door

Characters:
John, Owner, the regular. Future: Janer.

Situation:
A regular who's normally a soft yes is stuck behind a loud walk-in group of
eight. He's polite. He won't be polite next week.

Dialogue:
John: "Regular at the rope. Looking at me funny."
Owner internal: He's allowed to look funny.

Player Choices:
1. Wave the regular up.
2. Hold the line — first-come.
3. Pull him aside, comp a drink, ask him to wait two minutes.

Outcome Direction:
1. regulars trust up · crowd-memory mark *negative* on fairness for the walk-ins.
2. crowd-memory mark *positive* on fairness · regular stance hardens · small reputation neutral.
3. money cost (comp) · regulars trust up · crowd reaction neutral.

Visual Cue:
A small gold dot on the regular's avatar at the rope.

Implementation Note:
Needs the future regulars-recognition signal (per-night recall). Today
`regularBase` exists but per-night flag does not.

---

## 2. Bar Backlog

### Bar – Three Deep, Tickets Stacking

Status:
FUTURE CONTENT / DO NOT BUILD YET unless current systems support it

Trigger:
`serviceRatio < 0.8` AND fill `≥ 0.5` (today's `isBarPressureNight`).

Location:
Bar

Characters:
Rosa (or Milo / Jin), Caramel, Owner. Future: Ayan.

Situation:
Rosa flags the owner over. Six tickets in. The guy at the end of the rail just
put his card back in his pocket.

Dialogue:
Rosa: "Boss. I'm not slow. I'm one person."
Caramel: "Don't strip the door."

Player Choices:
1. Pull a bouncer to back-bar runs.
2. Cut a flash happy hour to push people away from the rail in waves.
3. Ride it out.

Outcome Direction:
1. bar pressure down · door risk up.
2. bar pressure down over time · spend per guest down · vibe up.
3. bar pressure stays · vibe down · reputation ding if it lasts.

Visual Cue:
Three guests stacked icon at the bar tile, ticket-pile bubble on Rosa.

Implementation Note:
Already the today-baseline Bar Pressure intervention. Encounter version raises
the cap on how the player can address it — currently only one of three options
exists.

---

### Bar – Bartender About To Walk

Status:
FUTURE CONTENT / DO NOT BUILD YET unless current systems support it

Trigger:
A bartender's running solo for `> 90` minutes AND `serviceHeadroom < 0`.

Location:
Bar / Staff Area

Characters:
Rosa, Caramel, Owner.

Situation:
Rosa wipes her hands and walks to the back hallway. She's not coming back fast.

Dialogue:
Rosa: "I'm taking five. I need five."
Caramel: "Give her five, boss. Trust me."

Player Choices:
1. Cover the rail yourself for five minutes.
2. Send the runner to cover, comp Rosa a drink.
3. Tell her to come back now.

Outcome Direction:
1. bar pressure down briefly · owner-on-floor cost (other systems uncovered) · Rosa morale up.
2. money cost · bar pressure neutral · Rosa morale up · Caramel trust up.
3. Rosa morale down hard · service ratio degrades · regulars stance hardens.

Visual Cue:
Rosa's avatar dims, a "5 min" bubble on the staff door.

Implementation Note:
Needs a staff-fatigue signal that doesn't exist today. Tag NEEDS SIGNAL.

---

## 3. Bathroom Complaints

### Bathroom – Long Stall, Unhappy Queue

Status:
FUTURE CONTENT / DO NOT BUILD YET unless current systems support it

Trigger:
`crowdPressure ≥ 0.8` AND a bathroom complaint is logged. NEEDS SIGNAL: bathroom
state isn't tracked today.

Location:
Bathroom

Characters:
Caramel, Owner. Future: Janer.

Situation:
Three guests are in the hallway. Caramel's already heard. He's standing near
the door, arms crossed, waiting for the owner to call it.

Dialogue:
Caramel: "Boss. Stall's been busy fifteen minutes. Three people waiting,
two of them annoyed."
Caramel: "Your call."

Player Choices:
1. Caramel knocks — politely first, firmly second.
2. Wait it out, no scene.
3. Owner handles it — talk to the queue, smooth it.

Outcome Direction:
1. risk down · small vibe ding if it becomes a scene · Caramel trust up.
2. complaint accumulates · regulars stance hardens · reputation small ding.
3. reputation up · time off the floor · Janer (future) calms the queue.

Visual Cue:
Warning badge on the bathroom tile, small queue cluster icon.

Implementation Note:
Needs future bathroom signal. Abstracted on purpose — kept managerial, not
graphic.

---

### Bathroom – Out Of Supplies, Mid-Rush

Status:
FUTURE CONTENT / DO NOT BUILD YET unless current systems support it

Trigger:
Stock signal missing — NEEDS SIGNAL.

Location:
Bathroom

Characters:
Rosa, Owner.

Situation:
Rosa flags the owner. "Bathroom's out. Has been for an hour. A guest just
told me, not nicely."

Dialogue:
Rosa: "I can run for stock. I can also pour drinks. I cannot do both."

Player Choices:
1. Send Rosa for a quick supply run (bar uncovered briefly).
2. Send the bouncer (door uncovered briefly).
3. Comp the complaining guest, fix it after close.

Outcome Direction:
1. bar pressure up · bathroom fixed · regulars trust neutral.
2. door risk up · bathroom fixed · Caramel cautions.
3. money cost · reputation small ding · regulars memory neutral.

Visual Cue:
Empty-supply icon on the bathroom door.

Implementation Note:
Needs stock signal. Tag NEEDS SIGNAL.

---

## 4. DJ / Music Dip

### Floor – Room Cooled Off, Music Wrong For The Crowd

Status:
FUTURE CONTENT / DO NOT BUILD YET unless current systems support it

Trigger:
`isCoolingNight` true (loyalty `< 52` AND fill `< 0.4`).

Location:
Dance Floor / DJ Booth

Characters:
Owner. Future: Ayan, Janer, Elfen.

Situation:
The dance floor is half empty. The track is fine. The room doesn't believe it.

Dialogue:
Future Ayan: "Bro this room is sleeping."
Future Elfen: "It's not the music. They don't believe they're at the right place."

Player Choices:
1. Push the DJ (boss action `push-dj`).
2. Pull the DJ to the bar runner role.
3. Ride it out.

Outcome Direction:
1. vibe up · risk up if push overcommits · hidden-trait may surface (future).
2. bar pressure down · Ayan (future) stance hardens.
3. cooling continues · reputation small ding · Elfen (future) flags it.

Visual Cue:
Empty dance floor cluster icon, blue cooling tint on the floor tile.

Implementation Note:
Maps cleanly to today's DJ Cooling intervention. Encounter version adds the
future character voices when DJ role exists.

---

### Floor – DJ Equipment Glitching

Status:
FUTURE CONTENT / DO NOT BUILD YET unless current systems support it — requires DJ role.

Trigger:
DJ booked AND vibe drop event triggered mid-set. NEEDS SIGNAL: equipment fault.

Location:
DJ Booth

Characters:
Owner, Caramel. Future: Ayan.

Situation:
The mixer cuts. The room hears the silence. Two seconds feels like a minute.

Dialogue:
Future Ayan: "We can save this. Give me thirty seconds."
Caramel: "Please tell me you have a plan."

Player Choices:
1. Pay an emergency technician (future supplier system).
2. Improvise — let the DJ run a cold open from a phone.
3. Cut the night short.

Outcome Direction:
1. money cost · vibe recovers · reputation hold.
2. vibe risk · if it lands, hidden-trait may surface for Ayan (future).
3. money loss · reputation small ding · clean reckoning.

Visual Cue:
Red warning badge over the DJ booth tile, a silence icon on the floor.

Implementation Note:
Mirrors the St. Patrick's Thursday DJ Equipment Failure event canon. Future,
gated on DJ role.

---

## 5. Guest Wants Special Treatment

### Floor – "I Know The Owner" Guy

Status:
FUTURE CONTENT / DO NOT BUILD YET unless current systems support it

Trigger:
`vipFocus` OFF AND a walk-in claims a relationship to ownership. NEEDS SIGNAL.

Location:
Door / Floor

Characters:
John, Caramel, Owner.

Situation:
A guy at the rope tells John he knows the owner. John has never seen him before.

Dialogue:
John: "Boss. Says he knows you. Does he?"
Owner internal: He does not.

Player Choices:
1. Let him in to avoid a scene.
2. Refuse and stick to the line.
3. Let him in but charge full cover, no comps.

Outcome Direction:
1. crowd-memory mark *negative* on fairness · vibe neutral.
2. crowd-memory mark *positive* on fairness · risk of a scene · Caramel trust up.
3. money in · crowd-memory neutral · John morale up (he likes the small win).

Visual Cue:
Question-mark badge on the guest avatar.

Implementation Note:
Hooks future fairness / crowd-memory system. Abstract.

---

### Floor – Birthday Group Wants The Prime Booth

Status:
FUTURE CONTENT / DO NOT BUILD YET unless current systems support it

Trigger:
A walk-in birthday party AND prime booth occupied by regulars.

Location:
Floor

Characters:
Owner, Rosa, Caramel. Future: Janer.

Situation:
A group of ten in matching sashes wants the corner booth. Regulars are
already there. They are not moving.

Dialogue:
Rosa: "I know that table. They tip every week."
Caramel: "And those guys with the sashes will spend more in two hours than
the regulars do in a month, probably."

Player Choices:
1. Ask the regulars to slide to a smaller booth, comp them.
2. Hold the booth for the regulars, find the birthday group another spot.
3. Squeeze both — split the booth.

Outcome Direction:
1. money cost · short-term VIP spend up · regulars memory *negative*.
2. regulars trust up · short-term draw down · Caramel trust up.
3. vibe risk · both groups mildly unhappy · Janer (future) wavers visibly.

Visual Cue:
Two highlighted booth tiles with conflicting markers.

Implementation Note:
Repeatable sibling of the St. Patrick's "Important Guest" anchor. Bounded version.

---

## 9. Staff Warning

### Staff Area – Caramel Pulls You Aside

Status:
FUTURE CONTENT / DO NOT BUILD YET unless current systems support it

Trigger:
Hidden-trait warning signal — NEEDS SIGNAL (future trait surfacing).

Location:
Staff Area

Characters:
Caramel, Owner. Future: Elfen.

Situation:
Caramel waves the owner to the back. Phone in hand. Not loud. Not relaxed.

Dialogue:
Caramel: "Bro. Watch the bar tonight. I'm not making it up."
Caramel: "I won't say more. Just watch."

Player Choices:
1. Trust him — pull the named bartender quietly later.
2. Watch yourself, decide post-night.
3. Wave it off.

Outcome Direction:
1. theft / risk prevented · Caramel earns toward Stage 2 · service dip.
2. risk holds · Caramel stance neutral · clean evidence at debrief.
3. risk persists · Caramel stance hardens · Stage 2 path lost for the night.

Visual Cue:
Caramel avatar pulses with a subtle yellow ring.

Implementation Note:
Sits on the future hidden-trait reveal system. Feeds Caramel Stage 2 progression.

---

### Staff Area – Grace Flags A Policy Slip

Status:
FUTURE CONTENT / DO NOT BUILD YET unless current systems support it

Trigger:
A policy-relaxed setting AND any incident logged. NEEDS SIGNAL: policy surfacing
mid-night.

Location:
Staff Area

Characters:
Grace, Owner.

Situation:
Grace stops the owner in the corridor. Notebook out. She isn't joking.

Dialogue:
Grace: "Two things on the door tonight that shouldn't have been. I logged them."
Grace: "Up to you what to do with that."

Player Choices:
1. Tighten policy on the spot.
2. Note it, address it at debrief.
3. Tell her to drop it.

Outcome Direction:
1. risk down sharply · vibe small dip · staff trust split (Caramel approves; John resents).
2. risk holds · Grace stance neutral · clean accountability at debrief.
3. Grace stance hardens · she stops logging later · future compliance risk up.

Visual Cue:
Clipboard icon over Grace's avatar.

Implementation Note:
Future policies layer is gated. Use Grace's "By the Book" visible trait as the
authorising voice for now.

---

## 10. Regular Guest Complaint

### Bar – "Last Week Was Different"

Status:
FUTURE CONTENT / DO NOT BUILD YET unless current systems support it

Trigger:
`work-room` boss action resolved AND reputation trending down across 3 nights.
NEEDS SIGNAL: 3-night trend.

Location:
Bar

Characters:
Owner, Rosa, a regular. Future: Elfen.

Situation:
A regular catches the owner at the rail. She doesn't look upset. She looks
disappointed, which is worse.

Dialogue:
Regular: "Last week was different. Good different. Don't lose that."
Rosa: "She's been waiting to say that. She doesn't say it twice."

Player Choices:
1. Hear her out fully — ask what changed.
2. Acknowledge and keep moving.
3. Make a small promise about next week.

Outcome Direction:
1. regulars morale up · owner relationship earn · time off the floor.
2. neutral · Elfen (future) notices if present.
3. future reputation lift if kept · risk if not kept (NEEDS SIGNAL: promise tracking).

Visual Cue:
Regular's avatar pulses warm yellow at the rail.

Implementation Note:
Already drafted in random-events.md as "The Boss Was Just on the Floor."
Cross-link, don't duplicate.

---

### Door – "Why Is Your Bouncer So Rude?"

Status:
FUTURE CONTENT / DO NOT BUILD YET unless current systems support it

Trigger:
John on door AND an incident logged in the last interval.

Location:
Door

Characters:
John, Caramel, Owner, the complaining guest.

Situation:
A guest comes back to the door to complain about John. She's not screaming.
She's filming.

Dialogue:
Guest: "I asked one question."
John: "She asked five."
Caramel: "She asked one."

Player Choices:
1. Back John publicly.
2. Apologize publicly, offer a comp.
3. Pull John from the door for the rest of the night.

Outcome Direction:
1. John morale up · crowd-memory mark *negative* · Chip-on-Shoulder may surface.
2. money cost · crowd-memory mark *positive* · John stance hardens.
3. door risk shifts to backup bouncer · John morale down hard · Caramel earns trust.

Visual Cue:
Red filming icon over the guest, John avatar flashes red.

Implementation Note:
Aggressive Ejection sibling. Different trigger — same character pressure.

---

## 12. Smoking Policy Situation

### Floor – Cluster Lighting Up Inside

Status:
FUTURE CONTENT / DO NOT BUILD YET unless current systems support it

Trigger:
smoking policy `relaxed` AND `crowdPressure ≥ 0.7`.

Location:
Floor

Characters:
Owner, Caramel. Future: Elfen.

Situation:
A small group near the back corner is smoking on the floor, not in the smoking
area. Other guests are noticing. Two are leaving.

Dialogue:
Caramel: "Boss. The corner. You see it."
Future Elfen: "Whatever you decide, some of these regulars decided already."

Player Choices:
1. Caramel walks over politely, asks them to move.
2. Tighten the policy mid-night (flips to standard).
3. Ignore it.

Outcome Direction:
1. risk down · vibe small dip · regulars trust up.
2. draw nudge down · risk drops sharply · Caramel trust up.
3. compliance risk up · regulars trust down · Elfen (future) flags it.

Visual Cue:
Smoke-haze tint over the back-corner tile.

Implementation Note:
Builds on existing smoking policy in `night.ts`. Kept abstract per
nightclub-safety-framing.

---

### Outside – Smoking-Area Cluster Getting Loud

Status:
FUTURE CONTENT / DO NOT BUILD YET unless current systems support it

Trigger:
crowdPressure spike outside smoking area. NEEDS SIGNAL.

Location:
Door / Outside

Characters:
John, Caramel, Owner.

Situation:
Twenty guests outside, loud, blocking the door. A neighbor across the street
is watching from a window.

Dialogue:
John: "I can clear them. You won't like how fast."
Caramel: "Or I can clear them slow. You'll like that more."

Player Choices:
1. Let John clear them fast.
2. Let Caramel handle it slow.
3. Step out yourself.

Outcome Direction:
1. cluster down fast · complaint risk up · John morale up.
2. cluster down · slight bar pressure up (Caramel off door) · Caramel earns trust.
3. reputation up · time off the floor.

Visual Cue:
Crowd cluster icon outside, ear icon on the neighbor window.

Implementation Note:
Hooks future noise / neighbor complaint system. Abstract.

---

## 13. Underage / ID Issue

### Door – ID Doesn't Match The Face

Status:
FUTURE CONTENT / DO NOT BUILD YET unless current systems support it

Trigger:
Random door check sequence — NEEDS SIGNAL.

Location:
Door

Characters:
John, Caramel, Owner.

Situation:
John holds up an ID, looks at the guest, looks back at the ID. Caramel is
already shaking his head.

Dialogue:
John: "Boss. ID says she's twenty-three. She's not twenty-three."
Caramel: "She's not twenty-three, boss."

Player Choices:
1. Refuse entry firmly, keep the ID.
2. Refuse entry, hand the ID back.
3. Let it slide.

Outcome Direction:
1. risk drops sharply · short escalation chance · staff trust up.
2. risk drops · no escalation · neutral.
3. compliance risk up hard · Caramel stance hardens · reputation risk if caught.

Visual Cue:
Red ID-card icon at the door tile.

Implementation Note:
Abstract per safety framing — never narrate the guest beyond refusal. No
descriptions, no judgment of the person.

---

### Door – Regular's Younger Friend Tries To Walk In

Status:
FUTURE CONTENT / DO NOT BUILD YET unless current systems support it

Trigger:
A regular brings a guest who fails ID.

Location:
Door

Characters:
John, Owner, the regular. Future: Janer.

Situation:
A regular shows up with a friend. The friend can't show an ID. The regular
is asking, politely, just this once.

Dialogue:
Regular: "I'll vouch."
John: "You can vouch all you want."

Player Choices:
1. Refuse — politely.
2. Refuse — bluntly.
3. Let the regular in alone, friend turned away.

Outcome Direction:
1. regulars trust hold · risk drops · clean.
2. regulars trust dip · risk drops · John morale up.
3. regulars trust hold · friend complaint risk · neutral.

Visual Cue:
Two avatars at the rope, one greyed.

Implementation Note:
Reinforces door consistency. Abstract per safety framing.

---

## 14. Furniture / Venue Complaint

### Floor – "This Banquette Wobbles"

Status:
FUTURE CONTENT / DO NOT BUILD YET unless current systems support it

Trigger:
A guest complaint logged AND venue-condition signal exists. NEEDS SIGNAL.

Location:
Floor

Characters:
Rosa, Owner.

Situation:
A guest at the high-spend banquette flags Rosa. The seat tilts when his
girlfriend leans back.

Dialogue:
Rosa: "Banquette four. It wobbles. He's not wrong."

Player Choices:
1. Comp a round, move them to a stable booth.
2. Tape it for tonight, fix tomorrow.
3. Apologize, do nothing.

Outcome Direction:
1. money cost · spend per guest up · regulars memory positive.
2. neutral · risk if it gets worse · venue debt accumulates (future).
3. spend per guest down · guest leaves early · reputation small ding.

Visual Cue:
Yellow warning badge on the banquette tile.

Implementation Note:
Future venue-condition / maintenance signal. Tag NEEDS SIGNAL.

---

### Floor – AC Out In The Back Section

Status:
FUTURE CONTENT / DO NOT BUILD YET unless current systems support it

Trigger:
Venue condition signal — NEEDS SIGNAL.

Location:
Floor

Characters:
Rosa, Caramel, Owner.

Situation:
The back third of the room is too hot. Guests are drifting forward, the front
is now jammed.

Dialogue:
Rosa: "It's a sauna back there, boss."
Caramel: "Front's about to be one too if you don't do something."

Player Choices:
1. Pay emergency tech (future supplier system).
2. Open the back fire door for airflow (compliance risk).
3. Comp drinks to back-section guests, ride it out.

Outcome Direction:
1. money cost · venue fixed · clean.
2. airflow recovers · compliance risk up sharply · Caramel cautions.
3. money cost · vibe ding · regulars memory negative.

Visual Cue:
Heat-shimmer tint on the back-section tiles.

Implementation Note:
Hooks future supplier + compliance systems.

---

## 15. Rough Crowd Moment

### Door – Six Guests Already On Edge

Status:
FUTURE CONTENT / DO NOT BUILD YET unless current systems support it

Trigger:
`Rough Crowd` segment weight rises sharply at door.

Location:
Door

Characters:
John, Caramel, Owner. Future: Janer.

Situation:
A group of six at the door, body language already loaded. Loud, but not yet
a problem.

Dialogue:
Caramel: "Boss, this one smells like trouble. Let me read it."
John: "Just point and I'll handle it."
Caramel: "Bro. Read first, then handle."

Player Choices:
1. Caramel reads the group, decides at the door.
2. John takes the call.
3. Owner takes the call.

Outcome Direction:
1. risk drops · slight draw drop · Caramel earns trust.
2. risk neutral · Chip-on-Shoulder may surface · incident chance up.
3. small reputation nudge if clean · risk neutral.

Visual Cue:
Yellow alert ring around the group at the rope.

Implementation Note:
Already drafted in random-events.md ("Rough Crowd Walks In"). Cross-reference;
this is the on-floor presentation pass.

---

### Floor – Two Groups Facing Off Near The Bar

Status:
FUTURE CONTENT / DO NOT BUILD YET unless current systems support it

Trigger:
Two `Rough Crowd` clusters within proximity AND vibe peak — NEEDS SIGNAL.

Location:
Floor / Bar

Characters:
John, Caramel, Owner.

Situation:
Two groups eye each other near the rail. No contact yet. Rosa has stopped
pouring.

Dialogue:
Caramel: "Bro. Step in now or step in later."
John: "Later's more fun."
Caramel: "Later's more paperwork."

Player Choices:
1. Caramel and John split the two groups, calmly.
2. Owner intervenes personally.
3. Cut the music briefly — let the room reset.

Outcome Direction:
1. risk drops · vibe small dip · staff trust up.
2. risk drops · reputation up if clean · time off the floor.
3. risk drops · vibe drops harder · regulars notice.

Visual Cue:
Two red proximity rings near the rail.

Implementation Note:
Abstract per safety framing — never narrated as a fight. Resolution is
managerial: separate, defuse, reset.

---

### Floor – Aggressive Patron, Other Guests Affected

Status:
FUTURE CONTENT / DO NOT BUILD YET unless current systems support it

Trigger:
Incident pending AND `incidents == 0` so far — first incident of the night.

Location:
Floor

Characters:
John, Caramel, Owner. Future: Elfen.

Situation:
One guest is loud at another. Surrounding guests have stopped dancing. Rosa
is watching from the bar.

Dialogue:
Caramel: "Eject. Quiet."
John: "Eject. Loud."
Caramel: "Quiet. Bro."

Player Choices:
1. Caramel handles it quietly.
2. John handles it visibly.
3. Owner intervenes.

Outcome Direction:
1. risk drops · vibe neutral · Caramel trust up.
2. risk drops · Chip-on-Shoulder may surface · crowd-memory marks vary.
3. reputation up if clean · time off the floor · risk drops.

Visual Cue:
Red exclamation icon over the patron, dimmed surrounding crowd avatars.

Implementation Note:
Always abstract — no fight, no contact described. Resolution is removal +
de-escalation.

---

## Authoring rules (for adding new on-floor beats)

1. Pick a real sim signal from the detectable-states table in
   [random-events.md](random-events.md) or tag `NEEDS SIGNAL` honestly.
2. Use bounded effects only — no flat numbers.
3. Current characters can speak in beats meant to fire today (when the
   framework exists). Future characters are tagged `(future)` and the beat
   is gated on their role.
4. Tone discipline: no real brands, no graphic violence, no sexual mechanics,
   no player-on-staff harm. Bad behavior = management consequence.
5. Visual cues are abstract markers: bubbles, badges, tints, rings, icons —
   not new art assets.
6. Implementation Note must say which system would consume it, or tag
   NEEDS SIGNAL if it can't be built today.
