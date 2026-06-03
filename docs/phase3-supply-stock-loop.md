# Phase 3 (Future) — Day Prep Supply & Drink Stock Loop

> **Roadmap/design note, not a build ticket.** Captures a future Phase 3 system.
> Nothing here is approved for implementation. The current build stays **Dashboard
> Floor View + Next Goal**, then a small **night-intervention experiment** — this
> loop comes *after* both and must not interrupt them. See [roadmap.md](roadmap.md),
> [vision-life-management-loop.md](vision-life-management-loop.md).

## Purpose
Make Day Prep feel like *running a real club*, not just staff/prices/event
selection. Add a **business-risk layer before the night starts** whose
consequences play out during the resolved night.

## Core concept
Before the night, the owner orders drink stock and balances **cash vs. expected
crowd vs. event type vs. risk**:
- **Over-ordering** ties up cash.
- **Under-ordering** causes sell-outs / lost sales.
- **Supplier failure** creates a pre-night crisis.
- **Emergency restock** is costly and risky.

It stays a **turn-based management sim** — no real-time timers, no live drink
queue. Stock is a *pre-night decision* resolved by the existing night sim.

## Future mechanics (document only — do not build now)

### 1. Drink ordering
Player chooses how much stock to order pre-night. Stock connects to expected guest
count, event type, and drink price. Too much ties up cash; too little loses sales
during the night.

### 2. Supplier reliability
Orders may arrive late, partially, or fail — pre-night uncertainty. Reliable
suppliers may cost more later.

### 3. Emergency restock / fallback
If stock is too low or delivery fails, an emergency restock option may exist.
Framed **abstractly only**: an expensive backup supplier / risky emergency source =
**business / reputation / compliance risk**. **No real-world methods or
instructions — mechanics, not methods.** (See `.claude/skills/nightclub-safety-framing`.)

### 4. Event interaction
- **Student Night** → more low-margin stock.
- **Grand Opening** → enough supply for a surge.
- **Industry Night** → premium service reliability.
- **Private Party** → fixed stock expectations.

### 5. Staff interaction
Bartender skill affects how efficiently stock converts to revenue. Future
waiters/table service may add premium bottle stock. Staff dishonesty may later tie
to stock leakage — **not in the MVP**.

### 6. Smallest safe version (when this phase begins)
- A single pre-night **order amount**: conservative / normal / heavy.
- One **stock-shortage** outcome (lost sales) and one **over-order** cash-pressure
  outcome.
- No detailed inventory catalog yet.

### 7. Later version
Drink menu categories, premium bottles, supplier tiers, stock waste, VIP/table
service, special event requirements.

### 8. What NOT to build (even when this phase begins)
- No real-time drink timers.
- No spoilage timers (Nightclub Story style).
- No full inventory spreadsheet.
- No detailed black-market system.
- No illegal-method content.
- No waiters / bottle service until their prerequisite systems exist.

## Roadmap placement
**Phase 3**, sequenced **after** the current Floor View + Next Goal test **and**
after the basic night-intervention experiment. It must not interrupt the current
dashboard work.

## Inspiration & stance
Inspired by real nightlife preparation and by the player desire for drinks/service
depth in Nightclub City / Nightclub Story-style games — but Club Empire's version
should be **deeper, fairer, and not timer/gem-wall based**: a readable
business-risk decision, not a monetized waiting mechanic.
