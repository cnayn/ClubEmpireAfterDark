# Vision — The Nightclub Life-Management Loop

> **Long-term direction, not a build ticket.** Captures where Club Empire should
> evolve — inspired by Nightclub City but deeper and more realistic. Nothing here
> is approved for implementation. The immediate build remains **Dashboard Floor
> View + Next Goal** (see §8). All systems below are **future / do-not-build-now**.
> See [roadmap.md](roadmap.md) and [player-feedback-lessons.md](player-feedback-lessons.md).

## The loop we're growing toward

Club Empire should not stay only:

> set numbers → press next night → read report.

It should become:

> **prepare the club → stock and staff the night → watch the room come alive →
> make a few decisive timed calls → read the consequences → grow into better venues.**

The tested night resolver stays the backend; these systems layer *on top of* it as
preparation, presentation, and a thin decision layer — never a replacement economy.

## Future systems (roadmap notes only — do not build now)

### 1. Location / venue start — **[Future]**
The player eventually chooses or rents a cheap starting location (basement dive,
bad-neighborhood bar, small beach club, warehouse unit). Location affects rent,
capacity, crowd type, risk, and the growth path. *Do not build now.*

### 2. Drink stock / supplier prep — **[Future]**
Before the night the owner orders stock. Over-ordering hurts cash; under-ordering
causes sell-outs; supplier failure creates a crisis. A later emergency/"black-market"
buy could exist — expensive and risky, framed strictly as **business risk, not
real-world instruction** (mechanics, not methods). *Do not build now.*

### 3. Night intervention layer — **[Future]**
During the night the player makes a *few* decisive **turn-based** calls — bar backing
up, crowd losing energy, security spotting trouble, a supplier shortage, a later DJ
bass-drop moment. Stays turn-based; **no real-time micromanagement, no live-control
dashboard.** The current witness-only timeline is the seed; the *next experiment* is
one small intervention beat using existing systems only. *Do not build now.*

### 4. DJ / music energy — **[Future, behind the DJ gate]**
A future DJ supports music identity, a bass-drop/hype moment, crowd reaction, and
event fit. Ships only through the roadmap's baseline-neutral **DJ gate**; current
active roles remain bartenders and bouncers. *Do not build before the gate.*

### 5. Venue growth — **[Future]**
Build up from cheap, rough locations into stronger, bigger, more iconic venues:
underground club → warehouse club → beach club → luxury nightclub. Connects to future
location, interior, the VIP/regular axis, and club identity. *Do not build now.*

### 6. Interior redesign — **[Future]**
Interior is **slot-based first**: bar, door, dance floor, DJ booth, VIP/seating,
lighting, sound. **No free-form Sims-style editor, no real 3D engine** now.
(Consistent with the roadmap's "Visual presentation & 3D" note.)

### 7. Realism principle (applies to all of the above)
Use real nightlife problems as **business simulation**: stock shortage,
over-ordering, staff reliability, crowd pressure, security incidents, VIP demands,
supplier failure. Keep everything abstract and safe — **mechanics, not methods;
business/reputation/compliance risk, not instruction.** (See
`.claude/skills/nightclub-safety-framing`.)

## 8. Current scope reminder (the only thing being built)
- **Now:** Dashboard **Floor View + Next Goal** (committed) — presentation over
  existing state.
- **Next experiment:** one small **intervention beat** using existing systems only.
- **Not now:** DJs, waiters, location system, stock/supplier system, black market,
  venue progression, VIP/table service, interiors. These are captured here so they
  guide design **without pulling scope forward**.
