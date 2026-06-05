# Phone Messages (Off-Floor Pressure Bank)

> **Status: FUTURE CONTENT / DO NOT BUILD YET unless current systems support it.**
>
> Content bank for moments that reach the owner via **phone** — texts from
> crew, booking inquiries, supplier reach-outs, rumors. Same engine target as
> [random-events.md](random-events.md); same authoring discipline. On-floor
> beats live in [night-encounters.md](night-encounters.md).
>
> Phone is a different surface from the floor: shorter messages, slower
> tempo, can land between nights as well as during. A phone beat must
> survive being read on a small chat bubble — keep dialogue tight.
>
> **Cast rule:** John, Caramel, Rosa, Milo, Jin, Vince, Grace, Pavel, Dimitri,
> Marcus can text now. Ayan, Janer, Elfen, Kerem, DJs, waiters, dancers,
> VIPs are tagged `(future)` and gated on their role/system existing.
>
> **Tone:** Neon Noir, original IP. No real brands, no real DJs, no real
> venues. References are archetypes (a luxury-brand guy, a corporate event
> coordinator), not names.

---

## 6. Crew Text Message

### Caramel – "Door's Already A Line"

Status:
FUTURE CONTENT / DO NOT BUILD YET unless current systems support it

Trigger:
Sent 30 minutes before open AND prep state isn't finalized.

Location:
Phone

Characters:
Caramel.

Situation:
Pre-night text from Caramel. He's at the rope already.

Dialogue:
Caramel: "Bro. Line forming. We doing fast IDs or slow IDs tonight?"
Caramel: "Joking. Mostly."

Player Choices:
1. "Fast tonight."
2. "Slow tonight."
3. No reply — let Caramel call it.

Outcome Direction:
1. door pressure down · risk shifts up.
2. door pressure up · risk down · vibe up.
3. Caramel calls it · staff trust earn.

Visual Cue:
Phone notification badge, Caramel avatar.

Implementation Note:
Hooks future pre-night phone screen. Sets a soft door-policy modifier without
a new menu.

---

### John – "Can I Tase A Guy"

Status:
FUTURE CONTENT / DO NOT BUILD YET unless current systems support it

Trigger:
John on door AND first incident of the night logged.

Location:
Phone

Characters:
John.

Situation:
Mid-night text from John. Probably joking.

Dialogue:
John: "Boss can I tase a guy."
John: "Joking. Mostly."

Player Choices:
1. "No."
2. "No. Be polite."
3. "Caramel handles this one."

Outcome Direction:
1. neutral · John morale neutral.
2. risk down · John morale down small.
3. risk down · Caramel earns trust · John morale down small.

Visual Cue:
Phone bubble with John avatar, red mood ring.

Implementation Note:
Sets John's mid-night posture without an on-floor encounter. Light-touch.

---

### Rosa – "We're Out Of Lime"

Status:
FUTURE CONTENT / DO NOT BUILD YET unless current systems support it

Trigger:
Bar consumable depletion — NEEDS SIGNAL.

Location:
Phone

Characters:
Rosa.

Situation:
Rosa, very dry, very tired.

Dialogue:
Rosa: "Out of lime. It's 9:14."
Rosa: "I'm not angry. I'm informing."

Player Choices:
1. Send the runner.
2. Tell Rosa to improvise — lemon's fine.
3. Cancel the cocktail menu for the night.

Outcome Direction:
1. money cost · Rosa morale up · service ratio holds.
2. Rosa morale down small · spend per guest down small.
3. spend per guest down · clean reckoning · Rosa morale down hard.

Visual Cue:
Phone bubble, empty-bottle icon.

Implementation Note:
Future stock/consumable signal. Tag NEEDS SIGNAL.

---

### Vince – "Running 10 Min Late"

Status:
FUTURE CONTENT / DO NOT BUILD YET unless current systems support it

Trigger:
Sent within 30 min of open AND Vince scheduled.

Location:
Phone

Characters:
Vince.

Situation:
Vince, classic Vince.

Dialogue:
Vince: "Running 10 min late. Don't kill me."
Vince: "It's actually 15."

Player Choices:
1. "Fine. Don't be later than 15."
2. "Pull someone else, you're out tonight."
3. No reply.

Outcome Direction:
1. open delayed · Vince morale neutral · Sticky-Fingers may surface later (future).
2. money cost (cover shift) · Vince stance hardens · clean.
3. Vince shows up at 17 min · Rosa stance hardens.

Visual Cue:
Phone bubble, Vince avatar with clock icon.

Implementation Note:
Demonstrates hidden-trait gating — only future Sticky Fingers reveal layer
consumes the consequence chain.

---

### Future Ayan – "I Dropped My USB"

Status:
FUTURE CONTENT / DO NOT BUILD YET unless current systems support it — requires DJ role.

Trigger:
DJ booked AND pre-night.

Location:
Phone

Characters:
Future Ayan.

Situation:
Pre-night meltdown text.

Dialogue:
Future Ayan: "Bro I dropped my favorite USB. Tonight is cancelled."
Future Ayan: "Just kidding bro. Mostly."

Player Choices:
1. "Pull yourself together."
2. "Take a breath. We'll figure it out."
3. "Pull Caramel into the booth, joking."

Outcome Direction:
1. Ayan morale dip · vibe risk up.
2. Ayan morale up · neutral risk.
3. Ayan stance soft · Caramel notes (future).

Visual Cue:
Phone bubble with Ayan avatar.

Implementation Note:
Gated on DJ role.

---

## 7. Venue Booking Request

### Booking – Wealthy Birthday Party

Status:
FUTURE CONTENT / DO NOT BUILD YET unless current systems support it

Trigger:
Off-night inbox poll. NEEDS SIGNAL.

Location:
Phone

Characters:
Owner, the booking client. Future: Janer.

Situation:
A polite inquiry from a wealthy birthday host. Wants the whole venue. Vague
about guest count. Generous about the deposit.

Dialogue:
Client: "Hi! Looking to book your venue for a private birthday. 100ish guests?
Maybe 200. We're flexible."
Client: "Budget is not a concern."

Player Choices:
1. Accept at standard private-party fee.
2. Negotiate — full venue + premium fee.
3. Reject.

Outcome Direction:
1. private-party event triggers · booking fee · standard execution.
2. money risk · money gain if executed clean · reputation risk if not.
3. neutral · clean reckoning · Caramel approves.

Visual Cue:
Phone bubble with envelope icon.

Implementation Note:
Hooks the future Phase 3 booking flow (Accept / Negotiate / Reject).
Today's Private Party event is the modifier vector this would generate.

---

### Booking – Corporate "Small Team Thing"

Status:
FUTURE CONTENT / DO NOT BUILD YET unless current systems support it

Trigger:
Off-night inbox poll. NEEDS SIGNAL.

Location:
Phone

Characters:
Owner, the booking coordinator.

Situation:
A corporate event coordinator. Email reads professional. Headcount is twelve.
Wants the back lounge only.

Dialogue:
Coordinator: "Hi! Our team would like to book the lounge. Around 12 guests.
Two-hour window."
Coordinator: "We'll cover any bar minimum you set."

Player Choices:
1. Accept — lounge only, set bar minimum.
2. Counter — upsell food, add a host (future Janer).
3. Reject.

Outcome Direction:
1. small private booking · clean money · neutral.
2. money up · NEEDS Janer role · clean if executed.
3. neutral · zero risk.

Visual Cue:
Phone bubble with calendar icon.

Implementation Note:
Cleanest version of a booking — low-risk anchor. Sets the floor for the
booking system's "boring but reliable" pole.

---

### Booking – Influencer With Vague Brief

Status:
FUTURE CONTENT / DO NOT BUILD YET unless current systems support it

Trigger:
Off-night inbox poll AND reputation tier ≥ Rising Name. NEEDS SIGNAL.

Location:
Phone

Characters:
Owner, the influencer's assistant. Future: Ayan, Caramel, Elfen.

Situation:
A vague pitch from someone's assistant. "Brand activation." No headcount.
No date.

Dialogue:
Assistant: "We'd love to host a brand activation. Looking for a vibe-forward
venue."
Assistant: "Comped bottles for the talent and her entourage, of course."

Player Choices:
1. Accept — comped bottles, big crowd.
2. Negotiate — paid bottles, smaller comp.
3. Reject.

Outcome Direction:
1. draw up · money risk · culture-drift mark (future) · Ayan loves it.
2. money risk down · Caramel approves · Elfen (future) approves.
3. neutral · clean reckoning · Elfen (future) approves.

Visual Cue:
Phone bubble with question-mark icon.

Implementation Note:
Hooks future culture / club-identity layer. Choices feed Party/Empire lean.

---

### Booking – "Private Gathering," No Details

Status:
FUTURE CONTENT / DO NOT BUILD YET unless current systems support it

Trigger:
Off-night inbox poll, randomized. NEEDS SIGNAL.

Location:
Phone

Characters:
Owner.

Situation:
A message from a number not in contacts. Wants the back room. Will pay cash.
No headcount. No name.

Dialogue:
Anon: "Looking for a private space Saturday. Will pay cash up front. Discretion
appreciated."

Player Choices:
1. Decline — no cash bookings without ID.
2. Ask for a name and headcount before quoting.
3. Accept blind.

Outcome Direction:
1. neutral · clean reckoning · Caramel approves.
2. negotiation continues · safer · neutral.
3. money in · compliance risk up sharply · reputation risk · DO NOT WRITE AS A POSITIVE OUTCOME.

Visual Cue:
Phone bubble with unknown-contact icon.

Implementation Note:
Abstract per nightclub-safety-framing. Outcome of accept-blind is a manageable
consequence (inspection risk, reputation hit) — never a glamorous shady win.

---

## 8. Supplier Offer

### Supplier – Spirits Rep, Close-Dated Stock

Status:
FUTURE CONTENT / DO NOT BUILD YET unless current systems support it

Trigger:
Inbox poll AND `cash ≥ threshold`. NEEDS SIGNAL.

Location:
Phone

Characters:
Owner, supplier rep. Future: Caramel reaction.

Situation:
A spirits rep texts. Wants to move close-dated stock at 40% off.

Dialogue:
Rep: "Got a pallet of premium gin that needs to move this month. 40% off list.
Yours if you want it."

Player Choices:
1. Buy the pallet.
2. Counter — 50% off, smaller lot.
3. Decline.

Outcome Direction:
1. cash down · margin up over next few nights · waste risk if it doesn't sell.
2. negotiation · clean if landed · clean if not.
3. neutral.

Visual Cue:
Phone bubble with bottle icon.

Implementation Note:
Hooks future stock / inventory system. Tag NEEDS SIGNAL.

---

### Supplier – Lighting Rig Rental

Status:
FUTURE CONTENT / DO NOT BUILD YET unless current systems support it

Trigger:
Reputation tier ≥ Local Spot AND theme/event signal. NEEDS SIGNAL.

Location:
Phone

Characters:
Owner, rental contact. Future: Ayan.

Situation:
A rig company offers a half-price weekend rental — they have a cancellation.

Dialogue:
Rep: "Big rig dropped off our schedule. You want it for the weekend? Half price."

Player Choices:
1. Take it.
2. Negotiate cheaper.
3. Decline.

Outcome Direction:
1. cash down · vibe up next event · Ayan (future) loves it.
2. clean if landed · neutral if not.
3. neutral.

Visual Cue:
Phone bubble with lighting-rig icon.

Implementation Note:
Hooks future event upgrades / theme parties.

---

### Supplier – Glass-And-Ice Quarterly Contract

Status:
FUTURE CONTENT / DO NOT BUILD YET unless current systems support it

Trigger:
Inbox poll AND first quarter completed. NEEDS SIGNAL.

Location:
Phone

Characters:
Owner.

Situation:
Boring supplier. Boring offer. Stable price for three months.

Dialogue:
Rep: "Quarterly contract. Same price. Auto-delivery. Sign and forget."

Player Choices:
1. Sign.
2. Counter — month-to-month.
3. Decline.

Outcome Direction:
1. spend predictability up · small cash lock-in.
2. neutral · slight cash flexibility cost.
3. neutral · stock risk later (NEEDS SIGNAL).

Visual Cue:
Phone bubble with contract icon.

Implementation Note:
Reliability / boring-but-good supplier pole. Kerem-coded (future).

---

### Supplier – "Promoter" Offering Guest List Partnership

Status:
FUTURE CONTENT / DO NOT BUILD YET unless current systems support it

Trigger:
Reputation tier ≥ Rising Name AND `Rough Crowd` segment trending. NEEDS SIGNAL.

Location:
Phone

Characters:
Owner. Future: Caramel, Elfen.

Situation:
A "promoter" pitches a guest-list partnership. Will bring 200 guests Saturday.
Wants 50% of door comp and free bottles for "his team."

Dialogue:
Promoter: "I bring the crowd. You bring the venue. Easy."

Player Choices:
1. Accept.
2. Negotiate — flat fee, no comp.
3. Decline.

Outcome Direction:
1. draw up · culture-drift mark (future) · risk up · Caramel cautions.
2. money risk down · Caramel approves.
3. neutral · Elfen (future) approves.

Visual Cue:
Phone bubble with two-handshake icon.

Implementation Note:
Abstract per safety framing — promoter pitch is a normal nightlife business
offer, not coded as shady. Risk lives in execution, not framing.

---

## 11. Police / Inspection Rumor

### Rumor – Caramel Hears About A Sweep

Status:
FUTURE CONTENT / DO NOT BUILD YET unless current systems support it

Trigger:
Smoking policy `relaxed` OR last 3 nights had compliance issues. NEEDS SIGNAL.

Location:
Phone

Characters:
Caramel.

Situation:
Pre-night text from Caramel. Word from the street.

Dialogue:
Caramel: "Bro. Word from the corner. Inspections coming through this weekend."
Caramel: "Up to you what we do with that."

Player Choices:
1. Tighten policy for the weekend.
2. Carry on, manage on the night.
3. Close one night to be safe.

Outcome Direction:
1. compliance risk down sharply · draw down · Caramel trust up.
2. compliance risk holds · normal night · risk if hit.
3. money loss · compliance risk eliminated · clean.

Visual Cue:
Phone bubble, Caramel avatar with yellow ring.

Implementation Note:
Hooks future compliance / inspection layer. Voice from current character.

---

### Rumor – A Regular Hints At Something

Status:
FUTURE CONTENT / DO NOT BUILD YET unless current systems support it

Trigger:
Regular base growth AND off-night. NEEDS SIGNAL.

Location:
Phone

Characters:
Owner, a regular. Future: Elfen.

Situation:
A regular texts. Indirect. Doesn't want to be specific in writing.

Dialogue:
Regular: "Hey - heard from someone that some places nearby are getting visits.
Just a heads up."

Player Choices:
1. "Thanks. Owe you one."
2. Ask for details — who, when.
3. Ignore.

Outcome Direction:
1. regulars trust up · soft compliance prep · neutral.
2. risk drops if details land · NEEDS SIGNAL.
3. neutral.

Visual Cue:
Phone bubble with regular avatar, soft yellow tint.

Implementation Note:
Hooks future regulars-as-information-source layer.

---

### Rumor – Noise Complaint Two Blocks Down

Status:
FUTURE CONTENT / DO NOT BUILD YET unless current systems support it

Trigger:
Pre-night poll AND nearby-venue signal. NEEDS SIGNAL.

Location:
Phone

Characters:
Caramel. Future: Elfen.

Situation:
Caramel passes a story along. The bar two blocks down got a noise complaint.
Now there's pressure for a wider check.

Dialogue:
Caramel: "Bro. Two blocks down. Noise complaint. Now they're knocking on more
doors than usual."

Player Choices:
1. Pre-emptively lower the cap on sound levels tonight.
2. Brief Caramel to keep the smoking area quieter.
3. Ride it out.

Outcome Direction:
1. vibe down small · compliance risk down · clean.
2. compliance risk down · neutral vibe · Caramel trust up.
3. compliance risk holds.

Visual Cue:
Phone bubble with sound-wave icon.

Implementation Note:
Hooks future neighbor / noise complaint system. Abstract.

---

### Rumor – Inspector Posing As A Guest (future)

Status:
FUTURE CONTENT / DO NOT BUILD YET unless current systems support it — requires inspection system.

Trigger:
Compliance check-in event triggered AND policy `relaxed`.

Location:
Phone (during the night)

Characters:
Caramel.

Situation:
Caramel pings the owner mid-night. He spotted a polite guy at the door asking
the wrong questions.

Dialogue:
Caramel: "Boss. Guy at the rope. Asking about smoking policy and fire exits.
Wearing pressed pants. He's not here for the music."

Player Choices:
1. Tighten on the spot.
2. Treat him like any guest — let him in.
3. Refuse entry, polite.

Outcome Direction:
1. compliance risk down sharply · draw down · Caramel trust up.
2. compliance risk holds · clean if execution is clean.
3. compliance risk neutral · weird signal sent.

Visual Cue:
Phone bubble with eye icon, Caramel avatar.

Implementation Note:
Mid-night phone moment — pairs with Compliance Knock in random-events.md.

---

## Authoring rules (for adding new phone beats)

1. Phone messages must fit in a short chat bubble — keep dialogue terse.
2. Use bounded effects only.
3. Current characters can text now. Future characters tagged `(future)`.
4. Phone beats land **between or during** nights. Specify when in Trigger.
5. Tone discipline: original IP, no real brands, no graphic content. "Shady"
   offers (cash bookings, promoters, rumors) are normal nightlife
   business decisions — risk lives in execution, not framing.
6. Visual cue is the phone-bubble surface: icon + sender avatar + tint.
7. Implementation Note must say which system would consume it, or tag
   NEEDS SIGNAL.

---

## Cross-references

- Engine and bounded-effects vocabulary: [random-events.md](random-events.md).
- On-floor pressure beats: [night-encounters.md](night-encounters.md).
- Character voices: [character-bible.md](character-bible.md).
- Phase 3 booking layer canon: [event-bible.md](event-bible.md).
- Safety framing: skill `nightclub-safety-framing`.
