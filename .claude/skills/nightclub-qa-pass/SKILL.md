---
name: nightclub-qa-pass
description: Use when doing QA, regression testing, route checks, save/load checks, and economy exploit checks for Club Empire After Dark.
---

# Nightclub QA Pass Skill

Use this skill to verify stability before or after major changes.

## Required checks

1. TypeScript:
   npx tsc --noEmit

2. Tests:
   npm test

3. Route sanity:
   Check Expo Router screens under src/app.

4. Save/load:
   Confirm persistence versioning still makes sense.

5. Economy:
   Look for impossible or absurd states:
   - Cash exploding too early.
   - Cash going unrecoverably negative.
   - Reputation becoming meaningless.
   - Upgrades not mattering.
   - One strategy dominating all others.

6. UI:
   Check whether the player can understand:
   - Current money.
   - Reputation.
   - Night results.
   - Upgrade ownership.
   - Why an incident happened.

## Reporting format

Use:
- Confirmed issues.
- Possible risks.
- Recommended fixes.
- Verification commands run.
- Files affected.

Prefer small fixes.
Do not rewrite architecture unless a bug truly requires it.
