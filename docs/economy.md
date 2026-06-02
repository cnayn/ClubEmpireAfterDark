# Economy & Balancing (MVP)

All numbers here are **starting baselines for tuning**, centralized so balancing
lives in one place (`src/domain/balance.ts`) — never scattered in UI. Currency is
abstract **$** (cash). One "tick" of play = one night.

## Currencies & Scores
- **Cash ($)** — spend on wages, events (later), upgrades. Can go negative
  briefly? No — MVP prevents committing to a night you can't afford wages for.
- **Reputation (0–100)** — drives attendance and tier. Slow to move.
- **VIP satisfaction (0–100)** and **Regular loyalty (0–100)** — derived per
  night, feed small reputation nudges and flavor.

## Starting State
| Field            | Value      |
|------------------|------------|
| Cash             | $600       |
| Reputation       | 20         |
| Capacity         | 60 guests  |
| Bartenders owned | up to 2    |
| Security base    | level 1    |

> **Balance pass (2026-06-02):** start cash lowered from $2,000 → $600 so the
> first upgrade is *earned* (around night 1–3) rather than bought instantly,
> then upgrades drip across the first ~10 nights. See decision-log #0007.

## Reputation Tiers (label only in MVP)
| Reputation | Tier              |
|------------|-------------------|
| 0–19       | Nobody's Club     |
| 20–39      | Local Spot        |
| 40–59      | Rising Name       |
| 60–79      | City Favorite     |
| 80–100     | Best in the City  |

## Attendance Model (per night)
```
reputationFactor = REP_FLOOR + (1 - REP_FLOOR) * (rep/100)   // REP_FLOOR = 0.30
base      = capacity * reputationFactor
priceMod  = lerp(1.15, 0.55, priceLevel)         // low price → more, high → fewer
musicFit  = 0.95 .. 1.10 (+upgrades)              // how well music matches crowd
smokeDraw = relaxedSmoking ? 1.10 : 1.00          // relaxed pulls a bigger crowd
noise     = seededRandom(0.9 .. 1.1)
expected  = base * priceMod * musicFit * smokeDraw * noise
guests    = clamp(round(expected), 0, capacity)   // hard-capped by capacity
```
`priceLevel` ∈ {0=low,0.5=med,1=high} for both cover and drinks (averaged).

> **Why REP_FLOOR.** Bare `rep/100` made a fresh club (rep 20) only ~13% full,
> so revenue couldn't cover fixed costs and *every* sensible opening night lost
> money. The 0.30 floor means a small club still pulls a curiosity crowd
> (~44% full at rep 20) — viable from night 1 — while reputation still drives
> absolute numbers, and matters more as capacity grows. See decision-log #0007.

## Revenue Model
```
coverPrice   = {low: $5,  med: $10, high: $20}[coverLevel]
drinkBase    = $8
drinkMult    = {low: 0.8, med: 1.0, high: 1.4}[drinkLevel]
drinksPerGuest (served) = min(guestDemand, serviceCapacity / guests)

serviceCapacity = bartenders * 90    // guests fully served per bartender / night
serviceRatio    = clamp(serviceCapacity / max(guests,1), 0, 1)

coverRevenue = guests * coverPrice
barRevenue   = guests * drinkBase * drinkMult * avgDrinks * serviceRatio
vipBonus     = vipFocus && rep>=40 ? guests * $6 (scaled by vipSatisfaction) : 0
revenue      = coverRevenue + barRevenue + vipBonus
```
`avgDrinks` baseline ≈ 2.0 per guest, reduced slightly by high drink prices.
`serviceRatio < 1` means understaffing left money on the table — surfaced as a
results note.

## Cost Model
```
wagePerBartender = $120 / night
securityCost     = {1: $100, 2: $220, 3: $380}[securityLevel]
fines            = incidentFines + complianceFines   // see Risk
costs            = bartenders*wagePerBartender + securityCost + fines
net              = revenue - costs
```

## Incidents & Risk
```
crowdPressure = guests / capacity                 // 0..1, >0.8 is rowdy
securityMod   = {1: 1.0, 2: 0.6, 3: 0.35}[securityLevel]
riskFromSmoking = relaxedSmoking ? 0.08 : 0.0      // compliance risk surface
incidentChance  = clamp(crowdPressure*0.5*securityMod + riskFromSmoking, 0, 0.9)

if roll(incidentChance): incidents = 1..3 (severity scales w/ crowdPressure)
incidentFines   = incidents * $80
complianceFines = relaxedSmoking && roll(0.10) ? $300 : 0
```
Incidents reduce reputation; compliance fines are framed as a satirical
"the inspector dropped by" risk event.

> **Relaxed smoking is a real gamble (risk *and* reward).** Reward: a +10%
> attendance draw (see Attendance Model). Risk: +0.08 incident chance, a 10%
> chance of a $300 compliance fine, and a −4 reputation hit when fined. Stacked
> with weak security it spirals fast (the sim showed a min-security relaxed club
> crashing to "Nobody's Club"); paired with strong security it's a defensible
> cash play. Either way it's a clear, satirical compliance tradeoff — never
> real-world instruction.

## Satisfaction → Reputation
Reputation drifts toward a blended **satisfaction index** `S` (0–100). A night
must beat the anchor (55) to *gain* reputation; incidents and inspector fines
pull it down.
```
vibe            = clamp(50 + (musicFit-1)*100 + vibeBonus, 0, 100)
regularLoyalty  = clamp(70 - priceLevel*30 - incidents*8 + (musicFit-1)*100, 0,100)
serviceQuality  = serviceRatio * 100
vipComponent    = vipFocus ? vipSatisfaction : 60        // neutral when not courting VIPs

S = 0.35*vibe + 0.30*regularLoyalty + 0.15*serviceQuality + 0.20*vipComponent

repDelta = round(
    (S - 55) * 0.20                  // REP_ANCHOR=55, REP_GAIN_K=0.20
  - incidents * 2                    // INCIDENT_REP_HIT
  - (complianceFines>0 ? 4 : 0)      // COMPLIANCE_REP_HIT
)
reputation = clamp(reputation + repDelta, 0, 100)
```
> **Why the rework.** The old additive deltas yielded only +1–2/night, so tiers
> felt unreachable — after 10 nights every strategy was still "Local Spot". The
> anchored index gives a solid night **+3**, a great upgraded night **+5**, a bad
> night **−5**. Verified: balanced play reaches "Rising Name" (40) by ~night 8.
> Premium/aggressive play earns more *cash* but its reputation **stalls** (thin
> crowd → lower loyalty, early VIP focus underperforms) — a real cash-vs-fame
> tradeoff rather than a dominant strategy. See decision-log #0007.

## Upgrades (MVP set — costs/effects to tune)
| Upgrade           | Cost   | Effect                                   |
|-------------------|--------|------------------------------------------|
| Bigger Floor      | $1,500 | capacity +30                             |
| Better Sound      | $1,200 | musicFit +0.06 (vibe)                    |
| Extra Bar Station | $1,000 | +1 effective bartender slot / service    |
| Pro Lighting      | $800   | vibe +5 (reputation drift assist)        |
| Security Office   | $1,400 | securityMod improves one tier cheaper    |
| VIP Lounge        | $2,000 | vipBonus and vipSatisfaction boost       |

## Anti-Soft-Lock Guards
Two guards (added in the balance pass) guarantee the player can't get stuck:
- **Bankruptcy guard:** Day Prep won't open a night the club can't pay staff
  for (`cash < nightFixedCosts(config)`); the button disables with a message.
- **Shop reserve:** an upgrade purchase is blocked if it would drop cash below
  one minimum night (`MIN_NIGHT_COST` = 1 bartender + light security = $220).

Because the cheapest night is always affordable *and* always profitable (it nets
positive even at rock-bottom reputation — see the early-game tests), recovery is
always possible. No economic dead-ends.

## Tuning Notes
- Verified target: a careful low/med night nets roughly **$300–$550**; premium
  nights trade volume for margin; a botched night (overcrowded + under-secured,
  or risk-stacked) can go **negative** and bleed reputation.
- Opening night is **profitable** for nearly all sensible staffing (default
  config nets ~$300).
- First upgrade is earned around **night 1–3**; the full early kit fills in over
  ~10 nights.
- Reputation: balanced play reaches **"Rising Name" (40) by ~night 8**.
- All constants live in `src/domain/balance.ts`; the sim reads from there so we
  can retune without touching logic or UI. Early-game guarantees are locked by
  tests in `src/sim/night.test.ts` (`early-game balance`).

## Phase 2A Economy Notes (planned — not implemented)
Named staff **replace** the abstract bartender-count and security-level levers.
The economy stays intact by mapping staff onto the **same internal quantities**
the resolver already uses (see [phase2-scope.md](phase2-scope.md) §C–D):

```
BASELINE_SKILL = 50
service        = Σ over on-duty bartenders of SERVICE_PER_BARTENDER * (skill/50) * availability
securityMod    = f(Σ on-duty bouncer units),  units = skill/50
                 calibrated so 1 unit→1.0, 2→0.6, 3→0.35 (== old SECURITY_MOD tiers)
wages          = Σ on-duty staff salaries        // replaces bartenders*WAGE + SECURITY_COST[level]
MIN_NIGHT_COST = cheapest viable roster (one bartender)   // shop reserve / soft-lock guard
```
New per-night effects (kept small): low-`honesty` bartenders skim a slice of bar
revenue (**theft / shrinkage**); low-`reliability` staff have a seeded chance of a
**no-show**; low-`honesty` bouncers add incident/compliance risk. All are framed
as fictional business/compliance risk (tone, see scope §H), use the existing
seeded RNG, and are surfaced as result lines.

**Identity point (non-negotiable):** Regular Night + the starting roster
(2 skill-50 bartenders + 1 skill-50 bouncer, all on duty) must reproduce the
current curve — service 180, securityMod 1.0, wages ≈ today's $340 — so all
#0007 invariants still hold. Exact salaries (esp. bouncer tiers, open risk R1)
are set during the balance re-verification step before 2A sign-off. DJ and event
modifiers are **Phase 2B** and excluded from this baseline.
