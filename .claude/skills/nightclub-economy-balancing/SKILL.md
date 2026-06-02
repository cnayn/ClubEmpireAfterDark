---
name: nightclub-economy-balancing
description: Use when balancing Club Empire After Dark economy, early nights, pricing, reputation, upgrades, risk, and player progression.
---

# Nightclub Economy Balancing Skill

Use this skill for economy work in Club Empire After Dark.

## Goal

Make the first 10 nights feel fun, fair, readable, and addictive.

The player should understand:
- Why they made money or lost money.
- Why reputation changed.
- Why guests came or stayed away.
- Why upgrades matter.
- Why risky choices can pay off or backfire.

## Required workflow

1. Inspect:
   - src/domain/balance.ts
   - src/sim/night.ts
   - src/sim/night.test.ts
   - docs/economy.md
   - docs/decision-log.md

2. Analyze at least these strategies:
   - Conservative pricing and staffing.
   - Aggressive drink/cover pricing.
   - High staffing.
   - Low staffing.
   - VIP-focused setup.
   - Relaxed smoking policy / compliance-risk setup.

3. Check:
   - Can the player get stuck early?
   - Can the player snowball too fast?
   - Are upgrades worth buying?
   - Are risky strategies clearly risky?
   - Are safe strategies too boring?
   - Are results explained clearly?

4. Before editing, propose specific balance changes.

5. After approval, update:
   - Balance constants.
   - Simulation tests.
   - Economy docs.
   - Decision log.

6. Verify:
   - npx tsc --noEmit
   - npm test

## Hard limits

Do not add new screens.
Do not add named staff.
Do not add events.
Do not add celebrities.
Do not change the visual design unless specifically asked.
Do not move game logic into React components.
