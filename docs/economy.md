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
| Cash             | $2,000     |
| Reputation       | 20         |
| Capacity         | 60 guests  |
| Bartenders owned | up to 2    |
| Security base    | level 1    |

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
base      = capacity * reputationFactor          // reputationFactor = rep/100
priceMod  = lerp(1.15, 0.55, priceLevel)         // low price → more, high → fewer
musicFit  = 0.85 .. 1.10                          // how well music matches crowd
noise     = seededRandom(0.9 .. 1.1)
expected  = base * priceMod * musicFit * noise
guests    = clamp(round(expected), 0, capacity)   // hard-capped by capacity
```
`priceLevel` ∈ {0=low,0.5=med,1=high} for both cover and drinks (averaged).

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

## Satisfaction → Reputation
```
vipSatisfaction = vipFocus ? clamp(50 + rep*0.4 - crowdPressure*20, 0,100)
                           : clamp(40 - (rep>=40 ? 15 : 0), 0, 100)  // neglected VIPs
regularLoyalty  = clamp(70 - priceLevel*30 - incidents*8 + musicFit*10, 0, 100)

repDelta = round(
    (vibe-50)*0.05            // vibe from music fit + DJ/upgrades later
  + (regularLoyalty-50)*0.04
  + (vipSatisfaction-50)*0.03
  - incidents*1.5
  - (complianceFines>0 ? 4 : 0)
)
reputation = clamp(reputation + repDelta, 0, 100)
```

## Upgrades (MVP set — costs/effects to tune)
| Upgrade           | Cost   | Effect                                   |
|-------------------|--------|------------------------------------------|
| Bigger Floor      | $1,500 | capacity +30                             |
| Better Sound      | $1,200 | musicFit +0.06 (vibe)                    |
| Extra Bar Station | $1,000 | +1 effective bartender slot / service    |
| Pro Lighting      | $800   | vibe +5 (reputation drift assist)        |
| Security Office   | $1,400 | securityMod improves one tier cheaper    |
| VIP Lounge        | $2,000 | vipBonus and vipSatisfaction boost       |

## Tuning Notes
- Target: a careful low/med night nets roughly **$300–$700**; a good night more;
  a botched night (overcrowded, under-secured) can go **negative**.
- First upgrade should be reachable in ~3–5 solid nights.
- All constants live in `src/domain/balance.ts`; the sim reads from there so we
  can retune without touching logic or UI.
```
