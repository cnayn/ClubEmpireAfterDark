## Local Claude Code Agents and Skills

This project includes local agents in `.claude/agents/` and local skills in `.claude/skills/`.

Use them like a small studio:

- economy-balancer: balance cash, reputation, upgrade pacing, first 10 nights.
- game-designer: design new mechanics without feature bloat.
- qa-tester: find bugs, broken saves, route issues, economy exploits.
- react-native-engineer: implement Expo/React Native/TypeScript changes.

Useful skills:

- nightclub-economy-balancing: use before changing balance constants or simulation economy.
- nightclub-feature-design: use before adding staff, events, VIPs, regulars, or city systems.
- nightclub-qa-pass: use before committing or after major feature work.
- expo-mobile-game-dev: use when touching Expo Router, React Native UI, Zustand, AsyncStorage, or mobile build behavior.
- nightclub-scope-guard: use before adding ANY feature/system/screen/stat, to confirm it fits the current phase.
- nightclub-staff-system: use for named-staff work (bartenders/bouncers, traits, hiring, scheduling).
- nightclub-save-migration: use whenever a change alters ClubState/DayConfig or any persisted shape.
- nightclub-content-writing: use when writing player-facing flavor (debriefs, bios, reveals, tags).
- nightclub-safety-framing: use when designing or writing any "risky" nightlife system.

North-star rule:
Legibility before depth; depend only on what exists; the reckoning ships before the reward.

Rule:
Do not run multiple agents editing the same files at the same time. Use specialist agents for investigation, planning, review, and controlled implementation.
