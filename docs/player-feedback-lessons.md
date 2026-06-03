# Lessons from Nightclub City / Nightclub Story Player Feedback

> **Docs capture, not a build ticket.** This records what players *remembered* and
> *complained about* in Nightclub City-style games so it can guide Club Empire —
> **without pulling scope forward**. It does **not** change the implementation
> roadmap. The immediate next frontend pass remains **Dashboard Floor View +
> Next Goal only**. See [roadmap.md](roadmap.md).

Each lesson is tagged: **[Now]** validates current/next work · **[Future]** banked,
do not build yet.

## 1. A living, populated club floor — **[Now: validates Floor View]**
Players miss a visible, populated floor; they remember guests staying, dancing,
sitting — the club feeling *alive*. This validates the **Dashboard Floor View** pass.
- Floor View shows living-club state through **existing data only**: crowd density,
  staff positions, event vibe, bar/door pressure.
- It must **not** simulate individual guests yet.

## 2. Boredom / no goals — **[Now: validates Next Goal]**
Players complained about boredom and a lack of missions/goals. This validates the
**Dashboard Next Goal** module.
- Next Goal is the *seed* of future missions/objectives.
- For now it shows the **nearest climb using existing game data** (e.g. next
  reputation tier, a cash/upgrade milestone).
- Do **not** build a full mission system yet.

## 3. Timed club moments — **[Future: single intervention-beat experiment]**
Players strongly remember the **DJ bass-drop** moment with the crowd reacting, and
**bodyguards handling trouble** before it ruined the night. This validates a *future*
single intervention-beat experiment (e.g. "Trigger the bass drop?", "Security is
watching a guest about to cause a scene — intervene?").
- **Do not build this yet.** Current next step remains Floor View + Next Goal only.
- Note: today's night timeline is **witness-only** (no choices) — intervention beats
  would be a deliberate, carefully scoped later step.

## 4. Visible, performing staff — **[Future: DJ + staff depth]**
Players remember DJs, bartenders, bodyguards visibly performing. This supports future
DJ and staff-depth systems, but **current active roles remain bartenders and bouncers
only**. Do **not** add DJs, waiters, or food service in the current pass. (DJ stays
behind the baseline-neutral gate in the roadmap.)

## 5. Food / broader service — **[Future]**
Players asked for food and more than drinks. Supports future table/bottle/waiter/food
service — but only **after** VIP/table systems exist. Do **not** build now.

## 6. Interior / decor freedom — **[Future]**
Players complained about restricted floor design. Supports the future interior
slot/decor direction. **Current rule stands: slots first, no free-form Sims-style
editor yet.**

## 7. Save durability — **[Future: serious launch risk]**
Players complained about **losing progress** after reinstalling or changing phones.
This is a serious launch risk.
- **Roadmap note:** before public release, solve save durability via
  export/backup/cloud/account options.
- Do **not** implement backend/login now. (Saves remain local AsyncStorage,
  versioned — see decision-log #0005 / nightclub-save-migration.)

## 8. Social / friends — **[Future: far-future only]**
Players miss Facebook-style social visiting/lobbies. **Bank as far-future only.** Do
**not** move multiplayer/social forward. Club Empire's strategic bet remains **deeper
single-player management first**.

## 9. Custom music — **[Future fantasy]**
Players liked using their own music. **Bank as future fantasy.** For now, represent
music identity through **club genre, DJ energy, and future bass-drop/intervention
moments**. Do **not** promise or implement custom phone music now.

## 10. Strategic synthesis
> The clone failed because the room felt dead, there were no timed club moments, and
> there was no clear reason to keep playing. Club Empire's response is: a **living
> Floor View**, **Next Goal** progression, and later **carefully scoped intervention
> beats** — built on the existing tested sim, not bolted on as new economies.

---

### What this means for the next pass (unchanged)
- **Build now:** Dashboard **Floor View** (sim-driven, no per-guest simulation) +
  **Next Goal** (nearest climb from existing data).
- **Everything else above is banked** — captured here so it informs design without
  pulling scope forward. No DJs, missions, social, accounts, food service, waiters,
  or interventions in the current pass.
