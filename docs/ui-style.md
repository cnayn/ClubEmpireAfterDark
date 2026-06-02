# UI Style Guide

Direction: **neon-noir nightclub after dark.** Dark base, electric accents, big
readable numbers, tactile cards. Mobile-first, one-handed, snackable.

## Mood
Dim room, glowing signage. Calm dark canvas so the bright accents and key
numbers pop. Stylish but legible — this is a management game, data must read
instantly.

## Color Palette (tokens)
| Token            | Hex       | Use                                  |
|------------------|-----------|--------------------------------------|
| `bg`             | `#0B0B12` | app background (near-black indigo)   |
| `surface`        | `#15151F` | cards, panels                        |
| `surfaceAlt`     | `#1E1E2C` | raised / selected card               |
| `textPrimary`    | `#F2F2F7` | headings, key numbers                |
| `textMuted`      | `#9A9AB0` | labels, secondary text               |
| `neonMagenta`    | `#FF2E97` | primary accent / CTA glow            |
| `neonCyan`       | `#22E0FF` | secondary accent / info              |
| `neonViolet`     | `#9B5CFF` | tertiary accent                      |
| `success`        | `#36E29A` | profit, good outcomes                |
| `warning`        | `#FFC857` | caution, compliance risk             |
| `danger`         | `#FF5C5C` | losses, incidents, fines             |

Accents are for emphasis and one primary CTA per screen — avoid neon overload.

## Typography
- **Display / key numbers**: large, bold, tight (cash, guests, net).
- **Headings**: semibold.
- **Body / labels**: regular, `textMuted` for labels.
- Scale (approx): 32 / 24 / 18 / 15 / 13. Generous line height.
- Start with system font (SF/Roboto) for MVP; reserve a display font for later.

## Layout & Spacing
- 4-pt spacing scale: 4, 8, 12, 16, 24, 32.
- Screen padding 16. Cards: radius 16, padding 16, subtle border
  (`surfaceAlt`), optional soft accent glow on the active/primary card.
- Single-column, scrollable. Primary CTA pinned near the bottom (thumb reach).

## Core Components (small & composable)
- `Screen` — safe-area + bg + scroll wrapper.
- `StatCard` — label + big value + optional delta (colored ↑/↓).
- `Card` / `SectionCard` — titled container.
- `PrimaryButton` / `SecondaryButton` — CTA with optional glow.
- `SegmentedControl` — for low/med/high choices (price, music, security).
- `Toggle` — VIP focus, smoking policy.
- `Stepper` — bartender count.
- `ResultRow` — label ↔ value line for the results breakdown.
- `Pill` / `Badge` — tier label, status tags.
- `MoneyText` — formats $ with success/danger coloring by sign.

## Outcome Color Semantics
- Profit / good → `success`. Loss / fines / incidents → `danger`.
- Compliance & risk warnings → `warning`.
- Neutral info / VIP → `neonCyan` / `neonViolet`.

## Motion (light, later)
Keep MVP mostly static. Reserve subtle fades and a "doors open" reveal on the
night results for polish phase. No heavy animation, no 3D.

## Accessibility
- Maintain contrast for text on dark surfaces (mute, don't dim to illegible).
- Tap targets ≥ 44pt. Don't encode meaning in color alone — pair with
  ↑/↓ icons and labels.

## Tone of Copy
Playful, knowing, a little satirical. Results notes read like a club manager's
morning debrief ("Bar couldn't keep up past midnight — drinks were left on the
table."). Never instructional about real-world wrongdoing.
```
