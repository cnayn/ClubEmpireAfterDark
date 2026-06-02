@AGENTS.md

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

Rule:
Do not run multiple agents editing the same files at the same time. Use specialist agents for investigation, planning, review, and controlled implementation.
