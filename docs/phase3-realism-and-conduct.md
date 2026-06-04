# Phase 3+ (Future) — Realism Systems & Conduct Boundaries

> **Roadmap/design note, not a build ticket.** Nothing here is approved to build.
> Current scope stays **Dashboard Floor View + Next Goal**, then a small
> **night-intervention experiment**. See [roadmap.md](roadmap.md),
> [phase3-supply-stock-loop.md](phase3-supply-stock-loop.md),
> [vision-life-management-loop.md](vision-life-management-loop.md).

## Core framing
Club Empire simulates nightlife **business pressure through management
consequences** — cash leakage, guest satisfaction, reputation risk, staff trust,
security quality, service quality, venue cleanliness, compliance risk. It is a
management sim with satirical risk, **not a crime/violence simulator**. The
player's power is **managerial, never physical harm** (see Part 4).

Tone rule throughout: **mechanics, not methods; business consequences, not
instructions; satirical nightlife pressure, not glamorized violence.**
(See `.claude/skills/nightclub-safety-framing`.)

---

## Part 1 — Spirits Quality / Drink Authenticity Dial — **[Future: Phase 3]**
A future system connected to the drink supply loop. The owner chooses the quality
level of spirits/drinks served — a **margin-vs-reputation** decision.

- **cheap / questionable stock** → higher short-term margin, lower guest
  satisfaction, higher complaint/reputation risk.
- **standard stock** → stable middle option.
- **premium / real stock** → lower margin, better satisfaction, stronger
  VIP / Industry Night fit.

**Connections:** drink supply/stock ordering, guest satisfaction, future VIP vs
regular axis, Industry Night, Private Party expectations, future table/bottle
service, future staff honesty/leakage.

**Rules:** keep it abstract as business risk. **No real-world methods for fraud or
counterfeiting; do not glamorize serving unsafe alcohol.** Mechanics, not methods.

**Smallest safe version:** one pre-night choice — **Budget / Standard / Premium** —
affecting margin, satisfaction, and complaint risk. No detailed bottle inventory.

---

## Part 2 — Delayed Theft Discovery / Staff Leakage — **[Future: Phase 3+]**
Built on existing honesty/security logic plus a future staff performance review.
Some losses aren't obvious immediately; the owner may discover at the end of a
week/period that money or stock has been leaking.

**Design value — management tension:** trust this staffer? investigate? improve
security? fire them? or tolerate leakage because they perform well?

**Possible leakage sources:** cash theft, stock leakage, overcharging guests and
pocketing the difference, poor inventory handling, fake refunds, waste.

**Connections:** staff honesty traits, bouncer/security strength, future cameras,
future staff performance review, future trust system, drink stock loop, and
cleaners/maintenance once venue condition exists.

**Smallest safe version:** an end-of-week leakage report — *"You lost $X this week
to unexplained cash/stock leakage."* No named accusation until staff
review/investigation exists; later reports can point to a suspect *with
uncertainty*.

**Fairness rule (non-negotiable):** unreliable information must eventually be
**checkable by careful players**. Do not punish the player with unavoidable hidden
lies. **Suspicion should create decisions, not random punishment.**

---

## Part 3 — Cleaners / Maintenance — **[Future: Phase 3+/4, gated behind venue condition/interior]**
Cleaners and maintenance keep the venue functioning and presentable — making the
club feel like a real operation, not just bar + door.

**Possible effects:** cleanliness affects guest satisfaction; a dirty venue raises
complaints; broken lighting/sound/bar equipment hurts night quality; maintenance
reduces breakdown risk; cleaners reduce post-incident reputation damage.

**Connections:** interior slots, venue condition, incidents, VIP satisfaction,
Industry Night, future equipment system, future staff performance review.

**Smallest safe version:** a cleanliness/condition readout attached to
venue/interior. **The cleaner/maintenance role only appears after venue condition
exists** — no cleaner role before there's something meaningful to clean or maintain.

---

## Part 4 — Management responses to staff theft (conduct boundary)

**Allowed responses** (managerial):
- warn staff
- fire staff
- investigate
- improve security
- review cameras (if/when cameras exist)
- accept / tolerate leakage
- change scheduling
- pay better / improve conditions (if/when morale exists)

**Explicitly excluded — permanently, not deferred:**
- killing staff
- physically harming staff
- torturing staff
- threatening staff with violence
- revenge violence
- instructional intimidation

**Reason:** Club Empire is a nightlife **business management** sim with satirical
risk, not a violence simulator. The player's power is **managerial, not physical
harm.** This exclusion is a permanent design boundary, not a future feature.

---

## Roadmap placement
| Idea | Placement |
|---|---|
| Spirits Quality / Authenticity dial | **Phase 3**, alongside the supply/drink stock loop |
| Delayed Theft Discovery / leakage | **Phase 3+**, after staff review / trust foundations |
| Cleaners / Maintenance | **Phase 3+/4**, after venue condition / interior slots |
| Violence against staff | **Excluded permanently** — not on any roadmap phase |
