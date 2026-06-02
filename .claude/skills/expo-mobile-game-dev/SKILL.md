---
name: expo-mobile-game-dev
description: Use when implementing or reviewing Expo Router, React Native, TypeScript, offline storage, navigation, mobile UI, and build verification for Club Empire After Dark.
---

# Expo Mobile Game Development Skill

Use this skill for Expo + React Native implementation work.

## Project stack

- Expo
- React Native
- Expo Router
- TypeScript
- Zustand
- AsyncStorage
- Jest
- Offline-first local save

## Rules

Keep simulation logic separate from UI.
Keep constants centralized.
Use small reusable components.
Avoid unnecessary dependencies.
Do not introduce backend services during MVP.
Do not add cloud save, multiplayer, ads, or IAP unless explicitly approved.
Prefer mobile-first layouts.
Use safe area aware screens where appropriate.
Keep app state predictable and testable.

## Before editing

1. Inspect the existing route/component/state structure.
2. Propose a short implementation plan.
3. Identify the files to touch.
4. Avoid fighting the template conventions.

## After editing

Run:
- npx tsc --noEmit
- npm test

When needed, verify Expo bundling:
- npx expo export

Update docs if architecture, game loop, or save structure changed.
