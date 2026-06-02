# MVP Scope — Playable Prototype

Goal: a **complete, satisfying day/night loop** you can play for several cycles,
with money, reputation, a few real decisions, a night that visibly reacts to
those decisions, an upgrade to spend on, and a save that survives app restart.

We deliberately ship a **subset** of the full design (see game-design.md) and
grow it via the roadmap.

## In Scope (MVP)

### Screens (the prototype target)
1. **Home** — title, "Continue" / "New Club", brief flavor. Entry point.
2. **Club Dashboard** — current club name, day #, cash, reputation, capacity,
   quick status; primary CTA to "Prepare Tonight."
3. **Day Preparation** — the decision screen. MVP levers:
   - Music style (pick from a small set)
   - Cover charge (low / med / high or a slider)
   - Drink price multiplier (low / med / high)
   - Staffing: bartenders count, security level (1–3)
   - One toggle each for: VIP focus (on/off), Smoking policy (strict / relaxed)
   - "Open the Doors" → runs the night.
4. **Night Results** — readable summary: guests, revenue, costs, net,
   reputation Δ, incidents, VIP satisfaction, regular loyalty, 2–3 flavor notes
   explaining *why*. CTA: "Go to Shop" / "Next Day."
5. **Upgrade Shop** — small list (4–6 upgrades) with cost, effect, buy button.
6. **(Implicit) Save state** — auto-save after each night and on key actions.

### Systems (MVP depth)
- **Economy**: cash, nightly revenue/costs/net. (see economy.md)
- **Reputation**: single 0–100 score driving attendance + tier label.
- **Attendance model**: reputation × price factor × music-fit × capacity cap,
  with seeded randomness.
- **Revenue**: cover + drink spend, throttled by bartender service capacity;
  small VIP bonus if VIP focus on and reputation high enough.
- **Incidents**: probability from (crowd vs. security vs. risk), affecting
  costs + reputation.
- **VIP satisfaction & regular loyalty**: simple derived scores shown in
  results and feeding small reputation nudges.
- **Upgrades**: permanent modifiers (e.g. +capacity, +service, +vibe,
  +security base). 4–6 items.
- **Save/Load**: versioned schema in AsyncStorage; auto-save; "New Club" reset.

## Out of Scope for MVP (deferred to roadmap)
- Named individual staff with morale/skill (MVP uses counts + a security level).
- Events / themed nights.
- Cleaners, promoters, DJ-as-hire, host role.
- Day-of-week / calendar effects.
- Multiple risk dials (MVP has at most smoking policy + security as the
  risk surface).
- Marketing/promotion spend.
- City ranking ladder beyond a simple tier label.
- Sound/music, animations beyond basic transitions.
- Settings, achievements, tutorials (light onboarding text only).

## Definition of Done (MVP)
- New game → prepare → run night → see results → buy an upgrade → next day,
  repeated, with numbers that move sensibly.
- Decisions measurably change outcomes (e.g. high price = fewer, richer guests).
- Close and reopen the app → state restored.
- Simulation core covered by unit tests; no React imports in `src/sim`.
```
