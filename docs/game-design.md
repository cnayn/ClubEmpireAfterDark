# Club Empire: After Dark — Game Design

> Offline-first mobile management/tycoon game. React Native + Expo + TypeScript.
> Single-player, no backend, no multiplayer, no 3D, no ads, no IAP (yet).

## 1. Vision

You take over a cheap, run-down small club on the wrong side of town and grow it
into the best nightclub in the city. The fantasy is **the operator's chair**:
every night is a gamble of staff, music, crowd, money, and reputation, and the
morning after tells you whether your choices paid off.

The tone is **stylized, neon-noir, lightly satirical**. "Shady" pressures of
nightlife (door policy, capacity limits, licensing, the temptation to cut
corners) are modeled as **risk / reputation / compliance systems** — never as
real-world instructions. Cutting corners is a tradeoff with consequences, framed
the way a satirical tycoon game frames it.

## 2. Design Pillars

1. **Day plan, night reveal.** The player makes deliberate choices by day; the
   night plays out as a readable, slightly unpredictable simulation.
2. **Legible cause and effect.** Every result traces back to a decision. The
   night summary should let the player say "ah, that's why."
3. **Meaningful tradeoffs, not optimal buttons.** Higher prices vs. crowd size,
   tight security vs. vibe, VIP focus vs. regulars — no free wins.
4. **Offline, snackable, persistent.** A play session is one or a few day/night
   cycles. Progress is always saved locally.
5. **Tone as guardrail.** Edginess lives in satire, reputation, and compliance —
   never instructional, never illegal-real-world.

## 3. Core Loop

```
        ┌────────────────────────────────────────────────┐
        │                                                  │
        ▼                                                  │
   HOME / CLUB DASHBOARD                                    │
   (status, money, reputation, day #)                       │
        │                                                  │
        ▼                                                  │
   DAY PREPARATION                                          │
   set: music, prices, staffing, security level,            │
        VIP policy, smoking policy, event, risk dials       │
        │                                                  │
        ▼                                                  │
   [ OPEN THE DOORS ]  ──►  NIGHT SIMULATION (resolve)       │
        │                                                  │
        ▼                                                  │
   NIGHT RESULTS                                            │
   guests, revenue, costs, incidents, reputation Δ,          │
   VIP satisfaction, regular loyalty, staff notes            │
        │                                                  │
        ▼                                                  │
   UPGRADE SHOP (spend profits)  ──────────────────────────┘
   advance to next day
```

## 4. Systems (full design target — not all in MVP)

> **Phased rollout.** This section is the long-term north star. Implementation
> is incremental: MVP shipped abstract staffing + pricing + policies; **Phase 2A**
> adds named bartenders & bouncers (replacing the abstract levers); **Phase 2B**
> adds events + the DJ role. See [roadmap.md](roadmap.md) and the locked
> [phase2-scope.md](phase2-scope.md) for exact per-slice boundaries.

### 4.1 Staff
Roles: **Bartenders, Security, DJ/Host, Cleaners, Promoters.**
Each staff member has skill, wage, and morale. Understaffing slows service
(lost revenue), weak security raises incident chance, a good DJ lifts vibe.
- Levers: how many of each role to schedule tonight.
- Cost: wages are a nightly fixed cost.

### 4.2 Music / Vibe
A music style (e.g. House, Hip-Hop, Pop, Techno, Live) sets the crowd it
attracts and the base vibe. Matching music to the night's incoming crowd and to
your club's identity boosts satisfaction; mismatches thin the crowd.

### 4.3 Pricing
Cover charge + drink price multiplier. Higher prices raise per-guest revenue but
reduce attendance and can dent regular loyalty. Classic demand curve.

### 4.4 Events
Optional themed nights (Ladies' Night, Guest DJ, Launch Party). Cost money up
front, boost attendance/vibe/reputation when they land, fall flat if the club
isn't ready (capacity, staff, reputation gates).

### 4.5 Security Level
Low → high. Higher security cuts incident severity and protects reputation but
costs wages and can chill the vibe if overdone. Under-securing a big or rowdy
crowd is the main incident driver.

### 4.6 VIP Policy
How aggressively you court VIPs (table reservations, guest list, host
attention). VIPs spend big and lift prestige, but neglected VIPs hurt
reputation, and over-prioritizing VIPs annoys regulars.

### 4.7 Smoking Policy
A **compliance** lever: indoor / designated area / strict no-smoking. Looser
policy can please part of the crowd short-term but raises **compliance risk**
(fines, reputation hits) — modeled purely as a risk/reputation tradeoff.

### 4.8 Upgrades
Permanent improvements bought with profit: sound system, bar capacity, lighting,
larger floor (capacity), VIP lounge, better security infrastructure, decor.
Upgrades raise ceilings and unlock policies/events.

### 4.9 Risk & Compliance (the "shady" framing)
A small set of **risk dials** (e.g. overfill past safe capacity, lax door
checks, looser compliance) that trade short-term gain for a chance of a bad
event: fines, a bad-press reputation hit, a forced closed night. These are
**satirical risk/compliance mechanics**, surfaced as clear odds and consequences
— not how-to content.

## 5. Night Simulation — Output Factors

The night resolves these (MVP computes a subset; see mvp-scope.md):

- **Guests / attendance** — driven by reputation, price, music fit, event,
  marketing, day-of-week, capacity cap.
- **Revenue** — cover + drinks + VIP spend, scaled by service capacity (staff).
- **Costs** — wages + event cost + upgrade upkeep + any fines.
- **Reputation Δ** — vibe, incidents, VIP/regular treatment, compliance.
- **Incidents** — count/severity from crowd size vs. security vs. risk dials.
- **Staff performance** — service throughput, morale notes.
- **VIP satisfaction** — VIP policy vs. VIP demand met.
- **Regular customer loyalty** — fairness of prices, consistency, vibe.

## 6. Progression

- **Reputation tiers / city ranking**: from "Nobody's Club" up toward "Best in
  the City." Tiers gate events, upgrades, and VIP demand.
- **Capacity growth**: floor upgrades raise the attendance ceiling.
- **Soft goals**: hit a reputation tier, a cash milestone, survive a high-risk
  night, throw a successful launch event.

## 7. Tone & Content Guardrails

- Satire and stylization, not realism-instruction.
- No real celebrity names — use fictional archetypes ("The Visiting DJ",
  "City Tastemaker").
- Risk/compliance mechanics are abstract tradeoffs with stated odds and in-game
  consequences. No real-world illicit instruction, ever.
- Keep copy playful and knowing rather than gritty-exploitative.

## 8. Out of Scope (forever, per brief)

Backend, multiplayer, 3D, ads, in-app purchases (for now), online accounts.
```
