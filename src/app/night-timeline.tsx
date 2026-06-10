/**
 * Living Floor Loop v2 — the night IS the floor.
 *
 * One persistent surface: the clock runs at the top of the room, pressure meters
 * sit under it, guests react in-zone, the boss-action chips dock below the floor,
 * and a situation appears as an in-room banner (not a stacked card). The night's
 * books still come from the deterministic resolver — every live read here is a
 * pure projection of the no-intervention preview + the current progress.
 */

import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { FloorView } from '@/components/FloorView';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import {
  BOSS_ACTIONS,
  type BossActionId,
  bossIntervention,
  combineInterventions,
  focusCost,
  type MoodTone,
  NIGHT_FOCUS,
  resolveBossAction,
} from '@/lib/bossActions';
import { bossLifts, bossRelief, guestHappiness, staffMorale } from '@/lib/roomMood';
import { type DjActionId, DJ_ACTIONS, djFocusCost, djIntervention, resolveDjAction } from '@/lib/djActions';
import { type BoardZone, getBoardZone, type InspectTarget, zoneActions } from '@/lib/board';
import { CROWD_SEGMENTS, crowdMix, topCrowd } from '@/domain/crowd';
import { DJ_FLOOR_LABEL } from '@/domain/dj';
import { topRegulars } from '@/domain/regulars';
import { nightMentorLine } from '@/lib/mentor';
import { type Encounter, type EncounterChoice, pickEncounter } from '@/lib/encounters';
import { buildFloorView, type FloorBubble, floorBubbles, floorClusters } from '@/lib/dashboard';
import type { BeatTone } from '@/lib/timeline';
import { clockLabel, liveCrowdFraction, NIGHT_DURATION_MS, NIGHT_TICK_MS, phaseForProgress } from '@/lib/nightClock';
import {
  encounterTrigger,
  livePressures,
  livingStreamTicks,
  type NightPressures,
  pressureHeadline,
  type StreamTick,
} from '@/lib/nightPressure';
import { crewVoice, crewVoiceState, djBoothVoice, djSendVoice, guestCard, guestVoices, workRoomAck } from '@/lib/floorVoices';
import {
  guestsInside,
  hypeLevel,
  liveTill,
  musicMatch,
  type MusicMatchLevel,
  nightTroublemakers,
  type Troublemaker,
  troublemakerIntervention,
  troublemakerTicks,
} from '@/lib/nightLife';
import { nightZones, type ZoneKey } from '@/lib/venue';
import type { ClubState, DayConfig } from '@/domain/types';
import { useGameStore } from '@/state/store';
import { colors, radius, spacing } from '@/theme/tokens';

const TONE_COLOR: Record<BeatTone, string> = {
  good: colors.success,
  bad: colors.danger,
  warn: colors.warning,
  info: colors.neonCyan,
  neutral: colors.textMuted,
};
const MOOD_COLOR: Record<MoodTone, string> = {
  good: colors.success,
  info: colors.neonCyan,
  warn: colors.warning,
  neutral: colors.textMuted,
};

// How fast a Drop Bass / Change Mix live floor spike fades (progress units; ~12s at 1x).
const DJ_PULSE_DECAY = 0.05;

// Every meter has an identity: an icon, a label, and a plain-English STATE word
// (never an anonymous bar). Strain meters (bar/door/bath) read low = good; mood
// meters (floor/guests/crew) read high = good. Tone drives color + emphasis.
type MeterKind = 'bar' | 'door' | 'bath' | 'floor' | 'guests' | 'crew';
type MeterTone = 'good' | 'ok' | 'warn' | 'bad';

const METER_ICON: Record<MeterKind, string> = {
  bar: '🍸',
  door: '🚪',
  bath: '🚻',
  floor: '🔊',
  guests: '🙂',
  crew: '🧍',
};
const METER_TONE_COLOR: Record<MeterTone, string> = {
  good: colors.success,
  ok: colors.neonCyan,
  warn: colors.warning,
  bad: colors.danger,
};

/** Plain-English state word + good/neutral/bad tone per meter. */
function meterRead(kind: MeterKind, v: number): { status: string; tone: MeterTone } {
  switch (kind) {
    case 'bar':
      return v >= 0.85 ? { status: 'Slammed', tone: 'bad' } : v >= 0.66 ? { status: 'Backed up', tone: 'warn' } : v >= 0.33 ? { status: 'Busy', tone: 'ok' } : { status: 'Clear', tone: 'good' };
    case 'door':
      return v >= 0.85 ? { status: 'Hot', tone: 'bad' } : v >= 0.66 ? { status: 'Tense', tone: 'warn' } : v >= 0.33 ? { status: 'Line', tone: 'ok' } : { status: 'Calm', tone: 'good' };
    case 'bath':
      return v >= 0.85 ? { status: 'Bad', tone: 'bad' } : v >= 0.66 ? { status: 'Messy', tone: 'warn' } : v >= 0.33 ? { status: 'Line', tone: 'ok' } : { status: 'Clear', tone: 'good' };
    case 'floor':
      return v >= 0.66 ? { status: 'Hot', tone: 'good' } : v >= 0.45 ? { status: 'Alive', tone: 'good' } : v >= 0.3 ? { status: 'Warming', tone: 'ok' } : { status: 'Cold', tone: 'bad' };
    case 'guests':
      return v >= 0.66 ? { status: 'Happy', tone: 'good' } : v >= 0.4 ? { status: 'Okay', tone: 'ok' } : v >= 0.2 ? { status: 'Bored', tone: 'warn' } : { status: 'Angry', tone: 'bad' };
    case 'crew':
      return v >= 0.66 ? { status: 'Fresh', tone: 'good' } : v >= 0.45 ? { status: 'Working', tone: 'ok' } : v >= 0.25 ? { status: 'Pressured', tone: 'warn' } : { status: 'Tired', tone: 'bad' };
  }
}

/** Compact meter: "🍸 Bar … Backed up" + a tinted fill. The worst state pulses
 *  so a problem is unmistakable before the player reads anything. */
function MiniMeter({ kind, label, value }: { kind: MeterKind; label: string; value: number }) {
  const { status, tone } = meterRead(kind, value);
  const col = METER_TONE_COLOR[tone];
  const alert = tone === 'bad' || tone === 'warn';
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (tone !== 'bad') {
      pulse.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 600, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [tone, pulse]);
  const fillOpacity = tone === 'bad' ? pulse.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) : 1;
  return (
    <View style={styles.mini}>
      <View style={styles.miniHead}>
        <Text variant="label" muted style={styles.miniLabel} numberOfLines={1}>
          {METER_ICON[kind]} {label}
        </Text>
        <Text variant="label" color={col} style={[styles.miniStatus, alert && styles.miniStatusAlert]} numberOfLines={1}>
          {status}
        </Text>
      </View>
      <View style={[styles.miniTrack, alert && { borderColor: col, borderWidth: 1 }]}>
        <Animated.View style={[styles.miniFill, { width: `${Math.round(value * 100)}%`, backgroundColor: col, opacity: fillOpacity }]} />
      </View>
    </View>
  );
}

export default function NightTimelineScreen() {
  const club = useGameStore((s) => s.club);
  const plan = useGameStore((s) => s.plannedConfig);
  if (!club || !plan) {
    router.replace('/dashboard');
    return null;
  }
  return <LivingNight club={club} plan={plan} />;
}

interface StreamEntry {
  id: string;
  text: string;
  tone: BeatTone;
}

function LivingNight({ club, plan }: { club: ClubState; plan: DayConfig }) {
  const runNight = useGameStore((s) => s.runNight);
  const [preview] = useState(() => useGameStore.getState().previewNight(plan));

  const planClub = { ...club, lastConfig: plan };

  const [encounter] = useState<Encounter | null>(() => (preview ? pickEncounter(preview, planClub) : null));
  const encTrigger = encounter ? encounterTrigger(encounter.zone) : null;

  // Nightclub City layer — tonight's troublemaker schedule (deterministic from
  // the preview, no RNG) + which ones the owner ejected in time. Tapping a
  // flagged guest is free; the time window is the challenge.
  const [tms] = useState<Troublemaker[]>(() => (preview ? nightTroublemakers(preview, planClub) : []));
  const [tmEjected, setTmEjected] = useState<string[]>([]);

  // Real-time clock state.
  const [progress, setProgress] = useState(0);
  const [running, setRunning] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [committed, setCommitted] = useState<ReturnType<typeof runNight>>(null);

  // Owner calls + their live floor reactions.
  const [chosen, setChosen] = useState<BossActionId[]>([]);
  const [reactions, setReactions] = useState<FloorBubble[]>([]);
  const [mood, setMood] = useState<{ label: string; tone: MoodTone } | null>(null);
  // Progress at which the last action result was shown — so the main floor text
  // reverts to LIVE room status a few beats after a call (it doesn't freeze).
  const [moodAt, setMoodAt] = useState(0);
  // Hype the Room is a TIMED window: the floor stays warmer until this progress.
  const [hypeUntil, setHypeUntil] = useState(0);
  // Drop Bass / Change Mix are TRANSIENT spikes that decay back to baseline (so
  // they're not a permanent free boost). The latest one + when it fired.
  const [djPulse, setDjPulse] = useState<{ at: number; energy: number; happy: number; morale: number } | null>(null);
  const [bossStream, setBossStream] = useState<StreamEntry[]>([]);
  const [flashZone, setFlashZone] = useState<ZoneKey | undefined>(undefined);
  const [encChoice, setEncChoice] = useState<EncounterChoice | null>(null);
  // Which board zone's command sheet is open (tap a zone to command it).
  // What the player is inspecting — the EXACT floor object they tapped (a crew
  // member, a station background, or a guest queue), not just the zone.
  const [sheetTarget, setSheetTarget] = useState<InspectTarget | null>(null);
  const sheetZone: BoardZone | null = sheetTarget?.zone ?? null;
  // The full boss tray is collapsed by default — tapping the floor is the primary
  // way to act; the tray is a fallback behind "More calls".
  const [dockExpanded, setDockExpanded] = useState(false);
  // DJ Booth multi-action pilot: the DJ calls made tonight + the last "Read the
  // Room" result (shown in the DJ card).
  const [djChosen, setDjChosen] = useState<DjActionId[]>([]);
  const [djRead, setDjRead] = useState<{ read: string; suggested: DjActionId } | null>(null);
  // Zones that have already auto-paused the night this run (so each serious
  // situation stops the clock ONCE — a prompt to read the room, not a nag loop).
  const [alerted, setAlerted] = useState<Set<string>>(() => new Set());
  const [alertMsg, setAlertMsg] = useState<string | null>(null);
  // The zone of the active situation, and the situations the owner chose to ride
  // out (ignoring a serious problem worsens that zone + costs a little at close).
  const [alertKey, setAlertKey] = useState<string | null>(null);
  const [ignored, setIgnored] = useState<string[]>([]);

  // The night runs itself: advance the clock while playing.
  useEffect(() => {
    // The clock holds while a command drawer is open, so opening a zone to make
    // a call pauses the room — deliberate calls, not a race against the timer.
    if (committed || !running || sheetZone) return;
    const id = setInterval(() => {
      setProgress((p) => Math.min(1, p + (NIGHT_TICK_MS * speed) / NIGHT_DURATION_MS));
    }, NIGHT_TICK_MS);
    return () => clearInterval(id);
  }, [committed, running, speed, sheetZone]);

  // Stop the clock at last call.
  useEffect(() => {
    if (progress >= 1 && running) setRunning(false);
  }, [progress, running]);

  // Auto-pause when a situation interrupts, so the owner has to respond.
  useEffect(() => {
    if (committed || encTrigger == null || encChoice) return;
    if (progress >= encTrigger && running) setRunning(false);
  }, [progress, committed, encTrigger, encChoice, running]);

  // Auto-pause the night the FIRST time a meter goes serious, and name the
  // problem — the room calls the owner to read it and make a deliberate call,
  // instead of the owner racing a timer. Each zone pauses once per night.
  useEffect(() => {
    if (!preview || committed || !running || sheetZone) return;
    // Use relieved pressures so acting on a situation actually resolves it (the
    // meter drops below threshold once the owner makes the call).
    const raw = livePressures(preview, planClub, progress);
    const r = bossRelief(chosen);
    const p: NightPressures = {
      crowd: raw.crowd,
      bar: Math.max(0, raw.bar - r.bar),
      door: Math.max(0, raw.door - r.door),
      bathroom: Math.max(0, raw.bathroom - r.bathroom),
      energy: Math.min(1, raw.energy + r.energy),
    };
    const lift = bossLifts(chosen);
    const checks: Array<[string, boolean, string]> = [
      ['bar', p.bar >= 0.7, 'The bar is overloaded — drinks are backing up.'],
      ['door', p.door >= 0.7, 'The door is getting tense.'],
      ['bath', p.bathroom >= 0.7, 'The bathroom line is backing up.'],
      ['energy', p.energy <= 0.3, 'The dance floor is cooling off.'],
      ['guests', guestHappiness(preview, planClub, p, lift.happy) <= 0.3, 'Guests are getting unhappy.'],
      ['crew', staffMorale(preview, planClub, p, lift.morale) <= 0.3, 'The crew is getting strained.'],
    ];
    for (const [key, bad, msg] of checks) {
      if (bad && !alerted.has(key)) {
        setAlerted((s) => new Set(s).add(key));
        setAlertMsg(msg);
        setAlertKey(key);
        setRunning(false);
        break;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress, running, committed, sheetZone]);

  if (!preview) {
    router.replace('/dashboard');
    return null;
  }

  const shownResult = committed ?? preview;
  const liveProgress = committed ? 1 : progress;
  // The floor REACTS to the owner's calls: each command relieves its zone's live
  // pressure (Check Bar cools the bar, Send Bouncer cools the door, Push DJ /
  // Work Room warm the floor). Presentation only — the books still come from the
  // resolver; this just makes the room visibly respond after an action.
  const rawPressures = livePressures(preview, planClub, liveProgress);
  const relief = committed ? { bar: 0, door: 0, bathroom: 0, energy: 0 } : bossRelief(chosen);
  // Troublemakers tonight: a LIVE one agitates its zone until handled; a
  // SLIPPED one (window missed — it boiled over) drags the room for the rest
  // of the night. Ejecting in time simply removes the drag — that's the save.
  const tmActive = committed
    ? []
    : tms.filter((t) => !tmEjected.includes(t.id) && progress >= t.at && progress < t.until);
  const tmSlipped = committed
    ? []
    : tms.filter((t) => !tmEjected.includes(t.id) && progress >= t.until);
  // Riding out a serious situation has a visible cost: that zone keeps slipping
  // (strain creeps up / energy keeps dropping) for the rest of the night.
  const worsen = { bar: 0, door: 0, bathroom: 0, energy: 0 };
  if (!committed) {
    for (const k of ignored) {
      if (k === 'bar') worsen.bar += 0.12;
      else if (k === 'door') worsen.door += 0.12;
      else if (k === 'bath') worsen.bathroom += 0.12;
      else worsen.energy -= 0.1; // energy / guests / crew
    }
    for (const t of [...tmActive, ...tmSlipped]) {
      const slipped = tmSlipped.includes(t);
      const strain = slipped ? 0.12 : 0.1;
      if (t.zone === 'bar') worsen.bar += strain;
      else if (t.zone === 'door') worsen.door += strain;
      worsen.energy -= slipped ? 0.08 : 0.05;
    }
  }
  // DJ booth calls also warm the floor / nudge mood live (presentation only).
  // Live DJ floor effect DECAYS back to baseline (~0.05 progress ≈ 12s at 1x), so
  // Drop Bass / Change Mix surge then settle — not a stuck permanent boost. The
  // committed books still reflect the DJ calls via djIntervention (bounded).
  const djLive =
    committed || !djPulse
      ? { energy: 0, morale: 0, happy: 0 }
      : (() => {
          const k = Math.max(0, 1 - (progress - djPulse.at) / DJ_PULSE_DECAY);
          return { energy: djPulse.energy * k, happy: djPulse.happy * k, morale: djPulse.morale * k };
        })();
  // Hype the Room: a sustained warm window that SCALES WITH THE CROWD (more
  // bodies → bigger lift) and fades when the window ends.
  const hypeActive = !committed && progress < hypeUntil;
  const hypeEnergy = hypeActive ? 0.1 + 0.22 * rawPressures.crowd : 0;
  const pressures: NightPressures = {
    crowd: rawPressures.crowd,
    bar: Math.max(0, Math.min(1, rawPressures.bar - relief.bar + worsen.bar)),
    door: Math.max(0, Math.min(1, rawPressures.door - relief.door + worsen.door)),
    bathroom: Math.max(0, Math.min(1, rawPressures.bathroom - relief.bathroom + worsen.bathroom)),
    energy: Math.max(0, Math.min(1, rawPressures.energy + relief.energy + worsen.energy + djLive.energy + hypeEnergy)),
  };
  const headline = pressureHeadline(pressures);
  const atEnd = committed != null || progress >= 1;
  const encounterDue = !!encounter && !committed && encTrigger != null && progress >= encTrigger;
  const encounterBlocking = encounterDue && !encChoice;

  const floor = buildFloorView(planClub, shownResult);
  const zones = nightZones(shownResult);
  // Show a fresh action result briefly (~0.06 progress ≈ a few beats), then fall
  // back to the live headline so the floor keeps narrating as the room changes.
  const moodFresh = !committed && mood !== null && progress - moodAt < 0.06;
  const moodAccent = committed ? colors.neonViolet : moodFresh ? MOOD_COLOR[mood!.tone] : TONE_COLOR[headline.tone];
  const moodLabel = committed ? "That's a wrap." : moodFresh ? mood!.label : headline.label;

  // Overheard guest lines from the floor-content voice bank: up to TWO at once,
  // always in different zones (one bar + one door, never stacked), and only when
  // their states are actually true — a calm room stays quiet. The speaking
  // segment and the line rotate on a slow progress bucket so the room re-speaks
  // every few beats (not every frame) and repeat nights use the bank's breadth.
  const topSegments = topCrowd(crowdMix(planClub, plan), 3);
  const voiceBucket = Math.floor(liveProgress / 0.08);
  const guestBubbles: FloorBubble[] = committed
    ? []
    : guestVoices(topSegments, pressures, voiceBucket).map((v) => ({
        id: `gv-${voiceBucket}-${v.zone}`,
        label: v.line,
        tone: v.tone,
        zone: v.zone,
      }));
  const liveBubbles = committed ? floorBubbles(committed) : [...guestBubbles, ...reactions];
  const liveFlash = committed ? undefined : flashZone ?? headline.zone;
  const liveScale = committed ? 1 : liveCrowdFraction(progress);
  // Readable guest clusters per zone — the room reads as a club, not just dots.
  const liveClusters = committed ? undefined : floorClusters(planClub, pressures);

  // Owner Attention (Boss Focus): a bounded per-night command budget. Each call
  // costs Focus, so the owner acts repeatedly but never spams.
  const focusSpent =
    chosen.reduce((s, id) => s + focusCost(id), 0) + djChosen.reduce((s, id) => s + djFocusCost(id), 0);
  const focusLeft = Math.max(0, NIGHT_FOCUS - focusSpent);

  // Room mood meters — Guest Happiness + Staff Morale. Boss commands visibly lift
  // them while the night is live (diminishing per repeat); the committed read drops
  // the lift since the result already reflects the calls in the resolver.
  const lifts = committed ? { happy: 0, morale: 0 } : bossLifts(chosen);
  const happy = guestHappiness(shownResult, planClub, pressures, lifts.happy + djLive.happy);
  const morale = staffMorale(shownResult, planClub, pressures, lifts.morale + djLive.morale);

  // Nightclub City reads — the till fills as the room earns, the occupancy
  // counter rises and thins with the arrival curve, HYPE is the one big floor
  // read, and the music chip surfaces the resolver's musicFit. All presentation.
  const tillNow = committed ? committed.revenue : liveTill(preview, progress);
  const insideNow = committed ? 0 : guestsInside(preview, progress);
  const hype = hypeLevel(pressures.energy);
  const music = musicMatch(planClub, plan);
  const MUSIC_TAG_COLOR: Record<MusicMatchLevel, string> = {
    hot: colors.success,
    warm: colors.neonCyan,
    cold: colors.warning,
  };

  // The event stream: ambient ticks (progress-derived) merged with boss/encounter
  // reactions. Newest first; capped to keep the floor reading like a room.
  const ambient: StreamEntry[] = committed
    ? []
    : livingStreamTicks(preview, planClub, progress).map((t: StreamTick) => ({ id: `tk-${t.id}`, text: t.text, tone: t.tone }));
  // Troublemaker warnings/slips surface ahead of the ambient ticks — they're the
  // time-sensitive read.
  const tmStream: StreamEntry[] = committed
    ? []
    : troublemakerTicks(tms, tmEjected, progress).map((t) => ({ id: t.id, text: t.text, tone: t.tone }));
  const stream: StreamEntry[] = [...bossStream]
    .reverse()
    .concat([...tmStream].reverse(), [...ambient].reverse())
    .slice(0, 4);

  const commit = () => {
    if (committed) return committed;
    // Each serious situation ridden out costs a little reputation at the books —
    // a real consequence for ignoring the room, bounded by combineInterventions.
    const ignoreVibe = -3 * ignored.length;
    const combined = combineInterventions([
      bossIntervention(chosen, preview, planClub),
      djIntervention(djChosen, preview, planClub, pressures.energy),
      ...(encChoice ? [encChoice.intervention] : []),
      ...(ignoreVibe < 0 ? [{ vibeBonus: ignoreVibe, revenueMod: 1 }] : []),
      // Ejected troublemakers save vibe (diminishing); slipped ones cost it.
      // At commit, EVERY unejected troublemaker counts as slipped — skipping to
      // the books early doesn't waive the reckoning (the night still ran; you
      // just weren't there to handle it).
      troublemakerIntervention(tmEjected.length, tms.filter((t) => !tmEjected.includes(t.id)).length),
    ]);
    const r = runNight(plan, combined, chosen);
    if (r) setCommitted(r);
    return r;
  };

  const onChoose = (ch: EncounterChoice) => {
    if (committed || encChoice) return;
    setEncChoice(ch);
    setReactions((b) => [...b.filter((x) => x.zone !== ch.bubble.zone), ch.bubble]);
    setFlashZone(ch.bubble.zone);
    setBossStream((r) => [...r, { id: `enc-${ch.id}-${r.length}`, text: ch.outcome, tone: ch.bubble.tone }]);
    setRunning(true); // resume after the call
  };

  const onAction = (id: BossActionId) => {
    if (committed || encounterBlocking) return;
    if (focusLeft < focusCost(id)) return; // out of Owner Attention for tonight
    const outcome = resolveBossAction(id, preview, planClub);
    // The room answers the owner's call in its own WRITTEN voice (floor-content
    // §Owner / §DJ booth), not a system message: working the room gets an
    // acknowledgement from whoever's actually on duty (Caramel / Rosa / a
    // regular, rotating across repeats); pushing the booth gets the DJ's
    // energy-matched line. Other calls keep their outcome bubble.
    let bubble = outcome.bubble;
    let voiceLine: string | null = null;
    if (id === 'work-room') {
      const onDutyIds = [...floor.bartenders, ...floor.bouncers].map((s) => s.id);
      const ack = workRoomAck(onDutyIds, chosen.filter((x) => x === 'work-room').length);
      voiceLine = `${ack.speaker}: “${ack.line}”`;
      bubble = { id: outcome.bubble.id, label: voiceLine, tone: 'good', zone: ack.zone };
    } else if (id === 'push-dj') {
      voiceLine = `DJ: “${djSendVoice(pressures.energy)}”`;
      bubble = { ...outcome.bubble, label: voiceLine };
    }
    setChosen((c) => [...c, id]); // repeats allowed; combineInterventions clamps the stack
    setReactions((b) => [...b.filter((x) => x.zone !== bubble.zone), bubble]);
    setMood(outcome.mood);
    setMoodAt(progress);
    setFlashZone(bubble.zone);
    // Unique key per push — the same action can fire many times a night, so the
    // id can't just be `ba-${id}` (that caused a duplicate-key console error).
    setBossStream((r) => {
      const next = [...r, { id: `ba-${id}-${r.length}`, text: outcome.call, tone: outcome.bubble.tone }];
      if (voiceLine) next.push({ id: `vx-${id}-${r.length}`, text: voiceLine, tone: 'good' as BeatTone });
      return next;
    });
  };

  // DJ Booth pilot — the four DJ calls. Read the Room is a free inspect (sets the
  // DJ card read); the others cost Attention and fold into the books at commit.
  const onDjAction = (id: DjActionId) => {
    if (committed || encounterBlocking) return;
    const cost = djFocusCost(id);
    if (cost > 0 && focusLeft < cost) return;
    const idx = djChosen.filter((x) => x === id).length;
    const o = resolveDjAction(id, preview, planClub, rawPressures.energy, idx);
    const bubbleTone = o.tone === 'neutral' ? 'info' : o.tone; // BubbleTone has no 'neutral'
    const moodTone = o.tone === 'bad' ? 'warn' : o.tone === 'neutral' ? 'neutral' : (o.tone as MoodTone);
    if (id === 'read-room') {
      setDjRead({ read: o.read ?? o.note, suggested: o.suggested ?? 'read-room' });
    } else {
      setDjChosen((c) => [...c, id]); // repeats diminish; djIntervention clamps the stack
      setDjRead(null);
      if (id === 'hype-room') {
        setHypeUntil(progress + 0.06); // ~10-15s sustained warm window, then settles
      } else {
        // Drop Bass / Change Mix: a transient spike that decays back to baseline.
        setDjPulse({ at: progress, energy: o.energy, happy: o.happy, morale: o.morale });
      }
    }
    // The booth answers the call in its own WRITTEN voice (floor-content §DJ
    // booth), matched to live floor energy — honest about a checked-out room
    // ("Trying. Room's checked out.") and a room that's already up.
    const spoken = id === 'read-room' ? o.call : `DJ: “${djSendVoice(pressures.energy)}”`;
    setReactions((b) => [...b.filter((x) => x.zone !== 'floor'), { id: `dj-${id}`, label: spoken, tone: bubbleTone, zone: 'floor' }]);
    setMood({ label: id === 'hype-room' ? 'Hyping the room…' : o.note, tone: moodTone });
    setMoodAt(progress);
    setFlashZone('floor');
    setBossStream((r) => {
      const next = [...r, { id: `dj-${id}-${r.length}`, text: o.call, tone: o.tone }];
      if (id !== 'read-room') next.push({ id: `djv-${id}-${r.length}`, text: spoken, tone: o.tone });
      return next;
    });
  };

  // Tap a flagged troublemaker IN TIME and the bouncer walks them out — the
  // room keeps its vibe. Free (reactive defense, not a Focus call); the time
  // window is the challenge. Folds into the books at commit.
  const onEject = (id: string) => {
    if (committed) return;
    const t = tms.find((x) => x.id === id);
    if (!t || tmEjected.includes(id) || progress < t.at || progress >= t.until) return;
    setTmEjected((e) => [...e, id]);
    setReactions((b) => [...b.filter((x) => x.zone !== t.zone), { id: `tm-out-${id}`, label: 'Walked out', tone: 'good', zone: t.zone }]);
    setFlashZone(t.zone);
    setBossStream((r) => [...r, { id: `tm-out-${id}-${r.length}`, text: 'Your bouncer walked one out.', tone: 'good' }]);
  };

  // "Leave it alone" — a deliberate owner choice (free): log that you let the
  // zone ride and clear its situation banner if it was the active alert, so the
  // night continues cleanly instead of nagging. No Focus, no boost.
  const ALERT_KEY_FOR: Partial<Record<BoardZone, string>> = { bar: 'bar', door: 'door', bathroom: 'bath', floor: 'energy', dj: 'energy' };
  const leaveAlone = (zone: BoardZone) => {
    const noun = zone === 'dj' ? 'booth' : zone;
    setBossStream((r) => [...r, { id: `leave-${zone}-${r.length}`, text: `You let the ${noun} ride.`, tone: 'neutral' }]);
    const k = ALERT_KEY_FOR[zone];
    if (k && alertKey === k) {
      setAlertMsg(null);
      setAlertKey(null);
    }
    setSheetTarget(null);
  };

  // Tap targets — each opens the inspect sheet for the EXACT object tapped, not
  // a blanket zone. (flash the zone if it maps to a live pressure zone.)
  const flashFor = (zone: BoardZone) => {
    if (zone === 'door' || zone === 'bar' || zone === 'floor') setFlashZone(zone);
  };
  const onZonePress = (zone: BoardZone) => {
    if (committed) return;
    setSheetTarget({ kind: 'station', zone });
    flashFor(zone);
  };
  const onStaffPress = (staffId: string, role: 'bartender' | 'bouncer', zone: BoardZone) => {
    if (committed) return;
    setSheetTarget({ kind: 'crew', zone, staffId, role });
    flashFor(zone);
  };
  const onClusterPress = (zone: BoardZone) => {
    if (committed) return;
    setSheetTarget({ kind: 'queue', zone });
    flashFor(zone);
  };

  // The actions a target offers. Crew offer their own verb; a queue offers the
  // service verb + Work the Room; a station offers its board actions. Related,
  // not identical (per the tap-target spec).
  const targetActions = (t: InspectTarget): BossActionId[] => {
    if (t.kind === 'crew') return t.role === 'bartender' ? ['check-bar'] : ['send-bouncer'];
    if (t.kind === 'queue') {
      if (t.zone === 'bar') return ['check-bar', 'work-room'];
      if (t.zone === 'door') return ['send-bouncer', 'work-room'];
      if (t.zone === 'floor') return ['push-dj', 'work-room'];
      return [];
    }
    return zoneActions(t.zone);
  };

  const renderZoneSheet = () => {
    if (committed || !sheetTarget) return null;
    const t = sheetTarget;
    const zone = t.zone;
    const def = getBoardZone(zone);
    const fill = preview.capacity > 0 ? preview.guests / preview.capacity : 0;
    const onDuty = [...floor.bartenders, ...floor.bouncers];
    const tappedName = t.kind === 'crew' ? onDuty.find((s) => s.id === t.staffId)?.name : undefined;
    // The inspected subject's own written voice (floor-content bank): a crew
    // member or the DJ booth (by floor energy) — so tapping Rosa ≠ tapping
    // John ≠ tapping the booth. Crew speak in one of three live-derived states
    // — fresh (early/calm) · working (mid) · worn (late + station running hot)
    // — each in their own written voice; tapping Rosa late on a slammed night
    // sounds like tired-Rosa. Derived live, presentation only: no fatigue
    // mechanics, no accumulating stats, no performance effects.
    const crewLine =
      t.kind === 'crew'
        ? crewVoice(
            t.staffId,
            t.role,
            crewVoiceState(liveProgress, t.role === 'bartender' ? pressures.bar : pressures.door),
            { barStrained: pressures.bar >= 0.66 }
          )
        : zone === 'dj'
          ? djBoothVoice(pressures.energy)
          : null;

    // Tapping a guest cluster opens the crowd's Block 2 info card — Type · Mood
    // (matched to the live night-state, zone-aware) · Want · Tell, in the top
    // segment's written voice — instead of a generic queue read.
    const card =
      t.kind === 'queue' && (zone === 'bar' || zone === 'door' || zone === 'floor') && topSegments[0]
        ? guestCard(topSegments[0], pressures, zone)
        : null;
    // The Mood row's accent tracks the matched state's feel (a hot floor reads
    // good, a tense door reads bad, a calm room reads muted).
    const cardMoodColor = !card?.state
      ? colors.textMuted
      : card.state === 'door-tense'
        ? colors.danger
        : card.state === 'bar-slow' || card.state === 'cooling'
          ? colors.warning
          : card.state === 'floor-hot'
            ? colors.success
            : colors.neonCyan;

    // Title + sub-line identify exactly what was tapped.
    let title = def.label.toUpperCase();
    let subtitle: string | null = null;
    if (t.kind === 'crew') {
      title = (tappedName ?? 'CREW').toUpperCase();
      const role = t.role === 'bartender' ? 'Bartender' : 'Bouncer';
      const v = t.role === 'bartender' ? pressures.bar : pressures.door;
      const state =
        t.role === 'bartender'
          ? v >= 0.85 ? 'slammed' : v >= 0.66 ? 'backed up' : v >= 0.33 ? 'working' : 'steady'
          : v >= 0.85 ? 'overwhelmed' : v >= 0.66 ? 'tense' : v >= 0.33 ? 'watching' : 'calm';
      subtitle = `${role} · ${def.label} · ${state}`;
    } else {
      // Station / queue cards carry an explicit Type · State sub-line too.
      const stateWord =
        zone === 'bar' ? meterRead('bar', pressures.bar).status
        : zone === 'door' ? meterRead('door', pressures.door).status
        : zone === 'bathroom' ? meterRead('bath', pressures.bathroom).status
        : zone === 'floor' || zone === 'dj' ? meterRead('floor', pressures.energy).status
        : zone === 'staff' ? meterRead('crew', morale).status
        : '';
      if (t.kind === 'queue') {
        title = zone === 'bar' ? 'BAR QUEUE' : zone === 'door' ? 'DOOR LINE' : 'DANCE FLOOR';
        // The card names WHO this crowd is (the night's top segment), not just
        // "Guest Cluster".
        subtitle = card
          ? `${CROWD_SEGMENTS[topSegments[0]].name}${stateWord ? ` · ${stateWord}` : ''}`
          : `Guest Cluster${stateWord ? ` · ${stateWord}` : ''}`;
      } else {
        const stationType =
          zone === 'bar' ? 'Service Station'
          : zone === 'door' ? 'Security'
          : zone === 'dj' ? 'Music Station'
          : zone === 'floor' ? 'Dance Floor'
          : zone === 'bathroom' ? 'Facilities'
          : zone === 'staff' ? 'Back of House'
          : 'Locked';
        subtitle = `${stationType}${stateWord ? ` · ${stateWord}` : ''}`;
      }
    }

    // The station/crew read — derived from LIVE state (current pressure + crowd +
    // whether you recently acted on the zone), so what you see CHANGES across the
    // night because the room is actually different, not because of varied text.
    // (Honest, actionable reads only — no theft/skimming/hidden-behaviour hints.)
    const reveal = ((): { text: string; tone: BeatTone } | null => {
      const quiet = pressures.crowd < 0.2; // early / thin room
      if (zone === 'bar') {
        const who = tappedName ?? floor.bartenders[0]?.name ?? 'The bar';
        if (quiet) return { text: `Too quiet — ${who} has nothing to push.`, tone: 'neutral' };
        if (relief.bar > 0.05 && pressures.bar < 0.5) return { text: 'Bar cooled down after your last check.', tone: 'good' };
        if (pressures.bar >= 0.8) return { text: `${who} is slammed. Pours are falling behind.`, tone: 'bad' };
        if (pressures.bar >= 0.6) return { text: 'Queue’s growing — drinks are backing up.', tone: 'warn' };
        if (pressures.bar >= 0.33) return { text: `${who} has the line moving.`, tone: 'info' };
        return { text: 'Bar’s clear. No need to step in.', tone: 'good' };
      }
      if (zone === 'door') {
        const who = tappedName ?? floor.bouncers[0]?.name ?? 'The door';
        if (quiet) return { text: 'Door’s quiet — nobody waiting.', tone: 'neutral' };
        if (relief.door > 0.05 && pressures.door < 0.5) return { text: `Door settled after you sent ${tappedName ?? 'a bouncer'}.`, tone: 'good' };
        if (preview.incidents > 0 && pressures.door >= 0.6) return { text: `Trouble at the door — ${tappedName ? `${tappedName} has their hands full` : 'nobody’s holding it'}.`, tone: 'bad' };
        if (pressures.door >= 0.7) return { text: `Line’s hot — ${who} is under pressure.`, tone: 'bad' };
        if (pressures.door >= 0.4) return { text: `${who} — line’s building, watch it.`, tone: 'warn' };
        return { text: `${who} has it calm.`, tone: 'good' };
      }
      if (zone === 'floor' || zone === 'dj') {
        if (quiet) return { text: 'Floor’s empty — nothing to lift yet.', tone: 'neutral' };
        if (hypeActive) return { text: 'Room’s hyped — the floor’s riding the wave.', tone: 'good' };
        if (pressures.energy <= 0.3) return { text: 'Floor’s cold — they need a jolt.', tone: 'bad' };
        if (pressures.energy >= 0.66) return { text: 'Floor’s hot — they’re dancing.', tone: 'good' };
        if (pressures.energy >= 0.45) return { text: 'Floor’s warming up.', tone: 'info' };
        return { text: 'Floor’s flat — give it a push.', tone: 'warn' };
      }
      return null;
    })();

    const actions = targetActions(t);
    const actionLabel = (id: BossActionId): string => {
      if (t.kind === 'crew' && tappedName) return id === 'check-bar' ? `Check ${tappedName}` : id === 'send-bouncer' ? `Send ${tappedName}` : BOSS_ACTIONS.find((x) => x.id === id)?.label ?? id;
      return BOSS_ACTIONS.find((x) => x.id === id)?.label ?? id;
    };

    return (
      <View style={styles.situation}>
        <View style={styles.situationHead}>
          <Text variant="label" color={colors.neonCyan} style={styles.situationTag}>
            {title}
          </Text>
          <Pressable onPress={() => setSheetTarget(null)} accessibilityRole="button">
            <Text variant="label" muted>
              Close ✕
            </Text>
          </Pressable>
        </View>
        {subtitle ? (
          <Text variant="label" muted>
            {subtitle}
          </Text>
        ) : null}
        {crewLine ? (
          <Text variant="body" color={colors.textPrimary} style={styles.crewQuote}>
            “{crewLine}”
          </Text>
        ) : null}
        {card ? (
          // Block 2 guest info card: Type · Mood (live-state-matched) · Want · Tell.
          <View style={styles.guestCard}>
            <Text variant="body" style={styles.guestCardRow}>
              <Text variant="label" color={colors.neonCyan}>Type · </Text>
              {card.type}
            </Text>
            <Text variant="body" style={styles.guestCardRow}>
              <Text variant="label" color={cardMoodColor}>Mood · </Text>
              {card.mood}
            </Text>
            <Text variant="body" style={styles.guestCardRow}>
              <Text variant="label" color={colors.neonCyan}>Want · </Text>
              {card.want}
            </Text>
            <Text variant="body" style={styles.guestCardRow}>
              <Text variant="label" color={colors.neonCyan}>Tell · </Text>
              {card.tell}
            </Text>
          </View>
        ) : null}
        {!card && reveal ? (
          <Text variant="body" color={TONE_COLOR[reveal.tone]} style={styles.bannerBody}>
            {reveal.text}
          </Text>
        ) : null}
        {zone === 'dj' ? (
          // DJ Booth pilot: four distinct calls, each its own choice + tradeoff.
          <>
            <View style={styles.tray}>
              {DJ_ACTIONS.map((a) => {
                const cost = djFocusCost(a.id);
                const disabled = cost > 0 && focusLeft < cost;
                const suggested = djRead?.suggested === a.id;
                return (
                  <Pressable
                    key={a.id}
                    onPress={() => onDjAction(a.id)}
                    disabled={disabled}
                    accessibilityRole="button"
                    accessibilityLabel={a.label}
                    style={[styles.choice, styles.djCard, disabled && styles.dockBtnDim, suggested && styles.djSuggested]}
                  >
                    <Text variant="body" color={disabled ? colors.textMuted : colors.neonMagenta}>
                      {a.label}
                    </Text>
                    <Text variant="label" muted style={styles.djHint}>
                      {a.hint}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            {djRead ? (
              <Text variant="label" color={colors.neonCyan} style={styles.bannerHint}>
                {djRead.read} → try {DJ_ACTIONS.find((x) => x.id === djRead.suggested)?.label ?? 'a call'}.
              </Text>
            ) : null}
            <Text variant="label" muted>
              Owner Focus: {focusLeft} major calls left · inspecting is free
            </Text>
          </>
        ) : actions.length > 0 ? (
          <>
            <View style={styles.tray}>
              {actions.map((id) => {
                const disabled = focusLeft < focusCost(id);
                return (
                  <Pressable
                    key={id}
                    onPress={() => onAction(id)}
                    disabled={disabled}
                    accessibilityRole="button"
                    style={[styles.choice, disabled && styles.dockBtnDim]}
                  >
                    <Text variant="body" color={disabled ? colors.textMuted : colors.neonMagenta}>
                      {actionLabel(id)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Text variant="label" muted>
              Owner Focus: {focusLeft} major calls left
            </Text>
          </>
        ) : zone === 'bathroom' ? (
          <Text variant="label" muted>
            Bathroom pressure {Math.round(pressures.bathroom * 100)}% —{' '}
            {pressures.bathroom >= 0.55 ? 'the line is backing up.' : 'holding for now.'}
          </Text>
        ) : zone === 'staff' ? (
          <Text variant="label" muted>
            On duty: {onDuty.map((s) => s.name).join(', ') || 'nobody'}.
          </Text>
        ) : (
          <Text variant="label" muted>Nothing to command here yet.</Text>
        )}
        {/* Inspecting and walking away is always free — never costs Focus. */}
        <Pressable onPress={() => leaveAlone(zone)} accessibilityRole="button" style={styles.leaveItRow}>
          <Text variant="label" color={colors.neonCyan}>Leave it alone ▸</Text>
        </Pressable>
      </View>
    );
  };

  const toResults = () => {
    if (!commit()) {
      router.replace('/dashboard');
      return;
    }
    router.replace('/results');
  };

  // Pause/resume; resuming clears any standing situation banner.
  const togglePause = () => {
    if (encounterBlocking) return;
    setRunning((r) => {
      if (!r) setAlertMsg(null);
      return !r;
    });
  };

  // Ride out the current situation: a real owner call with a visible cost — that
  // zone keeps slipping and it dings reputation at close. (Minor states never
  // pause, so you only ever ride out something that's genuinely serious.)
  const RIDE_TEXT: Record<string, string> = {
    bar: 'You let the bar ride — the queue kept backing up.',
    door: 'You let the door ride — the line stayed tense.',
    bath: 'You let the bathroom ride — the line kept growing.',
    energy: 'You let it ride — the floor kept cooling.',
    guests: 'You let it ride — the room stayed unhappy.',
    crew: 'You let it ride — the crew stayed strained.',
  };
  const rideOut = () => {
    if (alertKey) {
      const k = alertKey;
      setIgnored((i) => [...i, k]);
      setBossStream((r) => [...r, { id: `ride-${k}-${r.length}`, text: RIDE_TEXT[k] ?? 'You let it ride.', tone: 'warn' }]);
    }
    setAlertKey(null);
    togglePause();
  };

  const headerRight = !committed ? (
    <Pressable
      onPress={() => {
        if (encounterBlocking) return;
        if (running) setSpeed((s) => (s >= 3 ? 1 : s + 1));
        else togglePause();
      }}
      onLongPress={togglePause}
      accessibilityRole="button"
      accessibilityLabel={running ? `${speed}× — long press to pause` : 'Resume'}
      style={[styles.speed, encounterBlocking && styles.speedDisabled]}
    >
      <Text variant="label" color={encounterBlocking ? colors.textMuted : colors.neonCyan} style={styles.clockText}>
        {speed}× {running && !sheetZone ? '▶' : '❚❚'}
      </Text>
    </Pressable>
  ) : (
    <View style={styles.speed}>
      <Text variant="label" color={colors.neonViolet}>
        done
      </Text>
    </View>
  );

  const mentorHint = !committed && club.day <= 6 ? nightMentorLine(chosen.length) : null;

  const belowRoom = (
    <>
      {/* The room stopped you: a serious situation auto-paused the night. Read it,
          make a call (tap a zone / use the dock), then resume. */}
      {!committed && !running && !sheetZone && alertMsg && !encounterDue ? (
        <View style={styles.alertBanner}>
          <Text variant="label" color={colors.warning} style={styles.situationTag}>
            ⚠ SITUATION · NIGHT PAUSED
          </Text>
          <Text variant="body" style={styles.bannerBody}>{alertMsg}</Text>
          <Text variant="label" muted style={styles.bannerHint}>
            Your call: tap the zone to fix it — or ride it out and let it slip (it'll cost you).
          </Text>
          <Pressable onPress={rideOut} accessibilityRole="button" style={styles.rideItOut}>
            <Text variant="label" color={colors.warning} style={styles.bannerHint}>
              Ride it out ▸
            </Text>
          </Pressable>
        </View>
      ) : null}

      {/* Tap-a-zone command sheet (door / bar / floor / dj / bathroom / staff). */}
      {renderZoneSheet()}

      {/* Live progress bar — same color as the headline so the room reads as one signal. */}
      {/* Label the progress bar so it reads as the NIGHT CLOCK + phase, not just
          a moving color: "Tonight · 00:45 · Building". */}
      <View style={styles.progressHead}>
        <Text variant="label" muted style={styles.bannerHint}>
          Tonight · {clockLabel(liveProgress)}
        </Text>
        <Text variant="label" color={moodAccent ?? TONE_COLOR[headline.tone]} style={styles.bannerHint}>
          {committed ? 'Closed' : ['Doors open', 'Building', 'Peak', 'Last call'][phaseForProgress(liveProgress, 4)]}
        </Text>
      </View>
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${Math.round(liveProgress * 100)}%`, backgroundColor: moodAccent ?? TONE_COLOR[headline.tone] },
          ]}
        />
      </View>

      {/* HYPE — the one big floor read (Nightclub City style): the room's
          energy as a single prominent bar. Same live value the floor meter
          used to carry, promoted to the headline read. */}
      <View>
        <View style={styles.progressHead}>
          <Text variant="label" muted style={styles.bannerHint}>
            ⚡ HYPE
          </Text>
          <Text variant="label" color={METER_TONE_COLOR[hype.tone]} style={[styles.bannerHint, styles.hypeWord]}>
            {hype.label}
          </Text>
        </View>
        <View style={[styles.hypeTrack, hype.tone === 'bad' && { borderColor: METER_TONE_COLOR.bad, borderWidth: 1 }]}>
          <View
            style={[
              styles.hypeFill,
              { width: `${Math.round(pressures.energy * 100)}%`, backgroundColor: METER_TONE_COLOR[hype.tone] },
            ]}
          />
        </View>
      </View>

      {/* Pressure strip (strain) + Mood strip (happy / morale). Two rows: the
          top row reads what's HEAVY (bar/door/bath — floor energy lives on the
          HYPE bar above), the bottom row reads how the room FEELS (guest
          happiness / staff morale) so the owner sees who they're hurting and
          who they're helping. */}
      <View style={styles.meters}>
        <MiniMeter kind="bar" label="Bar" value={pressures.bar} />
        <MiniMeter kind="door" label="Door" value={pressures.door} />
        <MiniMeter kind="bath" label="Bath" value={pressures.bathroom} />
      </View>

      {/* Room mood — is the room happy, is the crew holding? */}
      <View style={styles.meters}>
        <MiniMeter kind="guests" label="Guests" value={happy} />
        <MiniMeter kind="crew" label="Crew" value={morale} />
      </View>

      {/* A situation in the room — pinned to the floor, not a stacked card. */}
      {encounterDue && encounter ? (
        <View style={styles.situation}>
          <View style={styles.situationHead}>
            <Text variant="label" color={colors.warning} style={styles.situationTag}>
              SITUATION · {encounter.zone.toUpperCase()}
            </Text>
            {!encChoice ? (
              <Text variant="label" muted>
                Night paused
              </Text>
            ) : null}
          </View>
          <Text variant="heading">{encounter.situation}</Text>
          {!encChoice ? (
            <View style={styles.tray}>
              {encounter.choices.map((ch) => (
                <Pressable
                  key={ch.id}
                  onPress={() => onChoose(ch)}
                  accessibilityRole="button"
                  style={styles.choice}
                >
                  <Text variant="body" color={colors.neonMagenta}>
                    {ch.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : (
            <Text variant="body" muted style={styles.choiceOutcome}>
              {encChoice.outcome}
            </Text>
          )}
        </View>
      ) : null}

      {/* Event stream — newest first, capped, so the floor narrates itself. */}
      {stream.length > 0 ? (
        <View style={styles.stream}>
          {stream.map((line) => (
            <View key={line.id} style={styles.streamRow}>
              <View style={[styles.streamDot, { backgroundColor: TONE_COLOR[line.tone] }]} />
              <Text variant="label" muted style={styles.streamText}>
                {line.text}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

    </>
  );

  /** A short glyph + zone hint per boss action — the dock reads as commands on
   *  the room, not as full-width buttons. Glyphs avoid emoji licensing risk. */
  const ACTION_GLYPH: Record<BossActionId, string> = {
    'push-dj': '♪',
    'check-bar': '◍',
    'send-bouncer': '◆',
    'work-room': '◉',
  };
  const ACTION_SHORT: Record<BossActionId, string> = {
    'push-dj': 'Push DJ',
    'check-bar': 'Check Bar',
    'send-bouncer': 'Door',
    'work-room': 'Work Room',
  };
  // The one call that fits the current situation, so an active alert offers a
  // single obvious tap instead of forcing a scan of four buttons.
  const ALERT_ACTION: Record<string, BossActionId> = {
    bar: 'check-bar',
    door: 'send-bouncer',
    bath: 'work-room',
    energy: 'push-dj',
    guests: 'work-room',
    crew: 'work-room',
  };
  const alertAction = alertKey ? ALERT_ACTION[alertKey] : undefined;

  const bossDock = !committed ? (
    <View style={styles.dock}>
      <View style={styles.focusRow}>
        {/* Primary instruction: tap the room. The tray is the fallback below. */}
        <Text variant="label" color={colors.neonCyan}>TAP THE ROOM TO ACT</Text>
        <View style={styles.focusDots}>
          {Array.from({ length: NIGHT_FOCUS }).map((_, i) => (
            <View key={i} style={[styles.focusDot, i < focusLeft && styles.focusDotOn]} />
          ))}
        </View>
      </View>
      {mentorHint ? (
        <Text variant="label" color={colors.neonCyan} style={styles.dockHint} numberOfLines={1}>
          {mentorHint}
        </Text>
      ) : null}

      {/* The visible tray holds ONE call: the situation's suggested action when a
          situation is live, otherwise the global owner move (Work the Room).
          Station calls (Check Bar / Push DJ / Send Bouncer) live on their
          stations — tap the room — and stay in the collapsed fallback below. */}
      {alertAction && focusLeft >= focusCost(alertAction) && !encounterBlocking ? (
        <Pressable onPress={() => onAction(alertAction)} accessibilityRole="button" style={styles.alertShortcut}>
          <Text variant="heading" color={colors.neonMagenta} style={styles.dockGlyph}>
            {ACTION_GLYPH[alertAction]}
          </Text>
          <Text variant="body" color={colors.textPrimary}>
            {ACTION_SHORT[alertAction]} — handle the {alertKey}
          </Text>
        </Pressable>
      ) : (
        <Pressable
          onPress={() => onAction('work-room')}
          disabled={encounterBlocking || focusLeft < focusCost('work-room')}
          accessibilityRole="button"
          accessibilityLabel="Work the Room"
          style={[styles.alertShortcut, (encounterBlocking || focusLeft < focusCost('work-room')) && styles.dockBtnDim]}
        >
          <Text variant="heading" color={colors.neonMagenta} style={styles.dockGlyph}>
            {ACTION_GLYPH['work-room']}
          </Text>
          <Text variant="body" color={colors.textPrimary}>
            Work the Room — own the floor
          </Text>
        </Pressable>
      )}

      {/* Fallback: the full four-button tray, collapsed by default. */}
      <Pressable onPress={() => setDockExpanded((v) => !v)} accessibilityRole="button" style={styles.dockToggle}>
        <Text variant="label" muted>{dockExpanded ? 'Hide calls ▲' : 'More calls ▾'}</Text>
      </Pressable>
      {dockExpanded ? (
        <View style={styles.dockRow}>
          {BOSS_ACTIONS.map((a) => {
            const disabled = encounterBlocking || focusLeft < focusCost(a.id);
            return (
              <Pressable
                key={a.id}
                onPress={() => onAction(a.id)}
                disabled={disabled}
                accessibilityRole="button"
                accessibilityLabel={a.label}
                accessibilityState={{ disabled }}
                style={[styles.dockBtn, disabled && styles.dockBtnDim]}
              >
                <Text variant="heading" color={disabled ? colors.textMuted : colors.neonMagenta} style={styles.dockGlyph}>
                  {ACTION_GLYPH[a.id]}
                </Text>
                <Text variant="label" color={disabled ? colors.textMuted : colors.textPrimary} style={styles.dockLabel} numberOfLines={1}>
                  {ACTION_SHORT[a.id]}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
      {focusLeft === 0 ? (
        <Text variant="label" muted style={styles.dockHint} numberOfLines={1}>
          No major calls left — keep tapping to inspect the room, or ride to last call.
        </Text>
      ) : null}
    </View>
  ) : null;

  // Compact top HUD — club identity + time/phase + cash/rep + any live situation.
  // Edge-only; the floor stays the hero.
  const phaseName = committed ? 'Closed' : ['Doors open', 'Building', 'Peak', 'Last call'][phaseForProgress(liveProgress, 4)];
  const topHud = (
    <View style={styles.hud}>
      <View style={styles.hudRow}>
        <Text variant="label" color={colors.neonMagenta} numberOfLines={1} style={styles.hudName}>
          {club.name} · Night {club.day}
        </Text>
        <Text variant="label" color={moodAccent} numberOfLines={1}>
          {clockLabel(liveProgress)} · {phaseName}
        </Text>
        {/* While the night is LIVE the right slot carries the live counters —
            tonight's till (~estimate; the owner's calls can land it higher) and
            who's in the room. Cash/rep don't move mid-night, so they return
            once the doors close. One row — the floor keeps its height. */}
        {committed ? (
          <Text variant="label" numberOfLines={1}>
            <Text variant="label" color={colors.success}>${club.cash}</Text>
            <Text variant="label" muted>{'  '}</Text>
            <Text variant="label" color={colors.neonViolet}>★{club.reputation}</Text>
          </Text>
        ) : (
          <Text variant="label" numberOfLines={1}>
            <Text variant="label" color={colors.success}>~${tillNow}</Text>
            <Text variant="label" muted>{'  '}</Text>
            <Text variant="label" color={colors.neonCyan}>{insideNow} in</Text>
          </Text>
        )}
      </View>
      {!committed && alertMsg && !running ? (
        <Text variant="label" color={colors.warning} numberOfLines={1}>
          ⚠ {alertMsg}
        </Text>
      ) : null}
    </View>
  );

  return (
    <Screen
      scroll={false}
      contentStyle={styles.nightContent}
      header={topHud}
      footer={
        atEnd ? (
          <Button label="See the books" onPress={toResults} />
        ) : (
          <View style={styles.footerStack}>
            {bossDock}
            <View style={styles.footerRow}>
              <View style={styles.footerBtn}>
                <Button
                  label={encounterBlocking ? 'Make the call ↑' : running ? 'Pause' : 'Resume'}
                  variant={encounterBlocking ? 'secondary' : 'primary'}
                  onPress={() => !encounterBlocking && setRunning((r) => !r)}
                  disabled={encounterBlocking}
                />
              </View>
              <View style={styles.footerBtn}>
                <Button label="Skip to the books" variant="secondary" onPress={toResults} />
              </View>
            </View>
          </View>
        )
      }
    >
      <FloorView
        fill
        floor={floor}
        bubbles={liveBubbles}
        moodAccent={moodAccent}
        moodLabel={moodLabel}
        pulse={!committed}
        zones={zones}
        flashZone={liveFlash}
        crowdTags={topSegments.map((id) => CROWD_SEGMENTS[id].name)}
        regularTags={topRegulars(club.regularBase, 2)
          .filter((r) => r.score >= 15)
          .map((r) => `${r.name} back`)}
        djLabel={DJ_FLOOR_LABEL[plan.dj ?? 'house']}
        liveScale={liveScale}
        headRight={headerRight}
        belowRoom={belowRoom}
        hideFooter
        clusters={liveClusters}
        pressures={pressures}
        troublemakers={tmActive.map((t) => ({ id: t.id, zone: t.zone }))}
        onTroublemakerPress={committed ? undefined : onEject}
        musicTag={committed ? undefined : { label: music.label, color: MUSIC_TAG_COLOR[music.level] }}
        earning={!committed && pressures.crowd >= 0.25}
        onZonePress={committed ? undefined : onZonePress}
        onStaffPress={committed ? undefined : onStaffPress}
        onClusterPress={committed ? undefined : onClusterPress}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  footerStack: { gap: spacing.sm },
  footerRow: { flexDirection: 'row', gap: spacing.sm },
  footerBtn: { flex: 1 },
  // HUD-style command dock for boss actions — sits above the primary CTAs.
  dock: {
    gap: 4,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
  },
  dockHint: { textAlign: 'center', lineHeight: 16 },
  focusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xs },
  focusDots: { flexDirection: 'row', gap: 4 },
  focusDot: { width: 9, height: 9, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  focusDotOn: { backgroundColor: colors.neonMagenta, borderColor: colors.neonMagenta },
  dockRow: { flexDirection: 'row', gap: spacing.xs },
  alertShortcut: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.neonMagenta,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  dockToggle: { alignSelf: 'center', paddingVertical: spacing.xs },
  dockBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: 4,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: 2,
  },
  dockBtnUsed: { opacity: 0.4 },
  dockBtnDim: { opacity: 0.6 },
  dockGlyph: { fontSize: 22, lineHeight: 24 },
  dockLabel: { fontSize: 11 },
  clockText: { fontSize: 14 },
  speed: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
  },
  speedDisabled: { opacity: 0.5 },
  progressHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 },
  progressTrack: { height: 8, borderRadius: radius.pill, backgroundColor: colors.surfaceAlt, overflow: 'hidden' },
  progressFill: { height: 6, borderRadius: radius.pill },
  meters: { flexDirection: 'row', gap: spacing.sm },
  // HYPE — the big single floor read; taller than the mini meters on purpose.
  hypeTrack: { height: 14, borderRadius: radius.pill, backgroundColor: colors.surfaceAlt, overflow: 'hidden' },
  hypeFill: { height: 14, borderRadius: radius.pill },
  hypeWord: { fontWeight: '700', letterSpacing: 1 },
  mini: { flex: 1, gap: 3 },
  miniHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  miniTrack: { height: 10, borderRadius: radius.pill, backgroundColor: colors.surfaceAlt, overflow: 'hidden' },
  miniFill: { height: 10, borderRadius: radius.pill },
  miniLabel: { fontSize: 12 },
  miniStatus: { fontSize: 11, letterSpacing: 0.5 },
  miniStatusAlert: { fontWeight: '700' },
  situation: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.warning,
    backgroundColor: colors.surfaceAlt,
    padding: spacing.md,
    gap: spacing.sm,
  },
  situationHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  situationTag: { letterSpacing: 1 },
  alertBanner: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.warning,
    backgroundColor: colors.surfaceAlt,
    padding: spacing.md,
    gap: spacing.xs,
  },
  rideItOut: { alignSelf: 'flex-start', paddingVertical: spacing.xs, marginTop: spacing.xs },
  // Slightly larger live-night text for readability until phone testing works.
  bannerBody: { fontSize: 16, lineHeight: 22 },
  crewQuote: { fontSize: 15, lineHeight: 21, fontStyle: 'italic' },
  // Block 2 guest info card rows (Type · Mood · Want · Tell).
  guestCard: { gap: 4 },
  guestCardRow: { fontSize: 14, lineHeight: 19 },
  bannerHint: { fontSize: 14, lineHeight: 19 },
  tray: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  choice: {
    flexGrow: 1,
    flexBasis: '47%',
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  choiceOutcome: { lineHeight: 22 },
  djSuggested: { borderColor: colors.neonCyan, borderWidth: 1 },
  // DJ action cards: full-width rows with left-aligned, fully-wrapping descriptions.
  djCard: { flexBasis: '100%', alignItems: 'flex-start' },
  djHint: { fontSize: 11, marginTop: 2, lineHeight: 15 },
  leaveItRow: { alignSelf: 'flex-start', paddingVertical: spacing.xs, marginTop: spacing.xs },
  nightContent: { paddingHorizontal: spacing.sm, paddingTop: spacing.xs, paddingBottom: 0, gap: spacing.sm, flex: 1 },
  hud: { gap: 2 },
  hudRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  hudName: { flexShrink: 1, fontSize: 13, letterSpacing: 0.5 },
  stream: { gap: 4, paddingHorizontal: spacing.xs },
  streamRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  streamDot: { width: 6, height: 6, borderRadius: radius.pill, marginTop: 6 },
  streamText: { flex: 1, fontSize: 13, lineHeight: 19 },
});
