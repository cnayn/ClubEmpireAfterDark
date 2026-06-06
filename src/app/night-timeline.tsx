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
import { type BoardZone, getBoardZone, zoneActions } from '@/lib/board';
import { CROWD_SEGMENTS, crowdMix, topCrowd } from '@/domain/crowd';
import { DJ_FLOOR_LABEL } from '@/domain/dj';
import { topRegulars } from '@/domain/regulars';
import { nightMentorLine } from '@/lib/mentor';
import { type Encounter, type EncounterChoice, pickEncounter } from '@/lib/encounters';
import { buildFloorView, type FloorBubble, floorBubbles, floorClusters, venueFloorChips } from '@/lib/dashboard';
import type { BeatTone } from '@/lib/timeline';
import { clockLabel, liveCrowdFraction, NIGHT_DURATION_MS, NIGHT_TICK_MS } from '@/lib/nightClock';
import {
  encounterTrigger,
  liveEmotes,
  livePressures,
  livingStreamTicks,
  type NightPressures,
  pressureHeadline,
  type StreamTick,
} from '@/lib/nightPressure';
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

type MeterMode = 'crowd' | 'strain' | 'good';
function meterColor(value: number, mode: MeterMode): string {
  if (mode === 'crowd') return colors.neonCyan;
  const hi = mode === 'good' ? colors.success : colors.danger;
  const lo = mode === 'good' ? colors.danger : colors.success;
  return value >= 0.66 ? hi : value >= 0.33 ? colors.warning : lo;
}

/** Compact, single-row meter — small enough to stack four across the floor. */
/** A short at-a-glance status word per meter, so the bar reads without math. */
function meterStatus(value: number, mode: MeterMode): string {
  if (mode === 'strain') return value >= 0.66 ? 'HIGH' : value >= 0.33 ? 'busy' : 'ok';
  if (mode === 'good') return value >= 0.66 ? 'good' : value >= 0.33 ? 'ok' : 'LOW';
  return `${Math.round(value * 100)}%`;
}

function MiniMeter({ label, value, mode }: { label: string; value: number; mode: MeterMode }) {
  const col = meterColor(value, mode);
  // A meter "shouts" when it's in a state the owner should act on.
  const alert = (mode === 'strain' && value >= 0.66) || (mode === 'good' && value < 0.33);
  // An alerting meter pulses so the eye is pulled to the problem before reading.
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!alert) {
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
  }, [alert, pulse]);
  const fillOpacity = alert ? pulse.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] }) : 1;
  return (
    <View style={styles.mini}>
      <View style={styles.miniHead}>
        <Text variant="label" muted style={styles.miniLabel} numberOfLines={1}>
          {label}
        </Text>
        <Text variant="label" color={col} style={[styles.miniStatus, alert && styles.miniStatusAlert]} numberOfLines={1}>
          {meterStatus(value, mode)}
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

  // Real-time clock state.
  const [progress, setProgress] = useState(0);
  const [running, setRunning] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [committed, setCommitted] = useState<ReturnType<typeof runNight>>(null);

  // Owner calls + their live floor reactions.
  const [chosen, setChosen] = useState<BossActionId[]>([]);
  const [reactions, setReactions] = useState<FloorBubble[]>([]);
  const [mood, setMood] = useState<{ label: string; tone: MoodTone } | null>(null);
  const [bossStream, setBossStream] = useState<StreamEntry[]>([]);
  const [flashZone, setFlashZone] = useState<ZoneKey | undefined>(undefined);
  const [encChoice, setEncChoice] = useState<EncounterChoice | null>(null);
  // Which board zone's command sheet is open (tap a zone to command it).
  const [sheetZone, setSheetZone] = useState<BoardZone | null>(null);
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
  }
  const pressures: NightPressures = {
    crowd: rawPressures.crowd,
    bar: Math.max(0, Math.min(1, rawPressures.bar - relief.bar + worsen.bar)),
    door: Math.max(0, Math.min(1, rawPressures.door - relief.door + worsen.door)),
    bathroom: Math.max(0, Math.min(1, rawPressures.bathroom - relief.bathroom + worsen.bathroom)),
    energy: Math.max(0, Math.min(1, rawPressures.energy + relief.energy + worsen.energy)),
  };
  const headline = pressureHeadline(pressures);
  const atEnd = committed != null || progress >= 1;
  const encounterDue = !!encounter && !committed && encTrigger != null && progress >= encTrigger;
  const encounterBlocking = encounterDue && !encChoice;

  const floor = buildFloorView(planClub, shownResult);
  const zones = nightZones(shownResult);
  const moodAccent = committed ? colors.neonViolet : mood ? MOOD_COLOR[mood.tone] : TONE_COLOR[headline.tone];
  const moodLabel = committed ? "That's a wrap." : mood ? mood.label : headline.label;

  // Bubbles fade in with the live pressure (room talks itself into life).
  const liveBubbles = committed ? floorBubbles(committed) : liveEmotes(preview, planClub, pressures).concat(reactions);
  const liveFlash = committed ? undefined : flashZone ?? headline.zone;
  const liveScale = committed ? 1 : liveCrowdFraction(progress);
  // Readable guest clusters per zone — the room reads as a club, not just dots.
  const liveClusters = committed ? undefined : floorClusters(planClub, pressures);

  // Owner Attention (Boss Focus): a bounded per-night command budget. Each call
  // costs Focus, so the owner acts repeatedly but never spams.
  const focusSpent = chosen.reduce((s, id) => s + focusCost(id), 0);
  const focusLeft = Math.max(0, NIGHT_FOCUS - focusSpent);

  // Room mood meters — Guest Happiness + Staff Morale. Boss commands visibly lift
  // them while the night is live (diminishing per repeat); the committed read drops
  // the lift since the result already reflects the calls in the resolver.
  const lifts = committed ? { happy: 0, morale: 0 } : bossLifts(chosen);
  const happy = guestHappiness(shownResult, planClub, pressures, lifts.happy);
  const morale = staffMorale(shownResult, planClub, pressures, lifts.morale);

  // The event stream: ambient ticks (progress-derived) merged with boss/encounter
  // reactions. Newest first; capped to keep the floor reading like a room.
  const ambient: StreamEntry[] = committed
    ? []
    : livingStreamTicks(preview, planClub, progress).map((t: StreamTick) => ({ id: `tk-${t.id}`, text: t.text, tone: t.tone }));
  const stream: StreamEntry[] = [...bossStream].reverse().concat([...ambient].reverse()).slice(0, 4);

  const commit = () => {
    if (committed) return committed;
    // Each serious situation ridden out costs a little reputation at the books —
    // a real consequence for ignoring the room, bounded by combineInterventions.
    const ignoreVibe = -3 * ignored.length;
    const combined = combineInterventions([
      bossIntervention(chosen, preview, planClub),
      ...(encChoice ? [encChoice.intervention] : []),
      ...(ignoreVibe < 0 ? [{ vibeBonus: ignoreVibe, revenueMod: 1 }] : []),
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
    setBossStream((r) => [...r, { id: `enc-${ch.id}`, text: ch.outcome, tone: ch.bubble.tone }]);
    setRunning(true); // resume after the call
  };

  const onAction = (id: BossActionId) => {
    if (committed || encounterBlocking) return;
    if (focusLeft < focusCost(id)) return; // out of Owner Attention for tonight
    const outcome = resolveBossAction(id, preview, planClub);
    setChosen((c) => [...c, id]); // repeats allowed; combineInterventions clamps the stack
    setReactions((b) => [...b.filter((x) => x.zone !== outcome.bubble.zone), outcome.bubble]);
    setMood(outcome.mood);
    setFlashZone(outcome.bubble.zone);
    setBossStream((r) => [...r, { id: `ba-${id}`, text: outcome.call, tone: outcome.bubble.tone }]);
  };

  // Tap a board zone → open its command sheet (and flash the zone if it maps to a
  // live pressure zone). Inspect-only zones (bathroom / staff) show status.
  const onZonePress = (zone: BoardZone) => {
    if (committed) return;
    setSheetZone(zone);
    if (zone === 'door' || zone === 'bar' || zone === 'floor') setFlashZone(zone);
  };

  const renderZoneSheet = () => {
    if (committed || !sheetZone) return null;
    const def = getBoardZone(sheetZone);
    const actions = zoneActions(sheetZone);
    return (
      <View style={styles.situation}>
        <View style={styles.situationHead}>
          <Text variant="label" color={colors.neonCyan} style={styles.situationTag}>
            {def.label.toUpperCase()}
          </Text>
          <Pressable onPress={() => setSheetZone(null)} accessibilityRole="button">
            <Text variant="label" muted>
              Close ✕
            </Text>
          </Pressable>
        </View>
        {actions.length > 0 ? (
          <>
            <View style={styles.tray}>
              {actions.map((id) => {
                const a = BOSS_ACTIONS.find((x) => x.id === id);
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
                      {a?.label ?? id}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Text variant="label" muted>
              Owner Attention: {focusLeft}/{NIGHT_FOCUS}
            </Text>
          </>
        ) : sheetZone === 'bathroom' ? (
          <Text variant="label" muted>
            Bathroom pressure {Math.round(pressures.bathroom * 100)}% —{' '}
            {pressures.bathroom >= 0.55 ? 'the line is backing up.' : 'holding for now.'}
          </Text>
        ) : sheetZone === 'staff' ? (
          <Text variant="label" muted>
            On duty: {[...floor.bartenders, ...floor.bouncers].map((s) => s.name).join(', ') || 'nobody'}.
          </Text>
        ) : (
          <Text variant="label" muted>Nothing to command here yet.</Text>
        )}
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
      setBossStream((r) => [...r, { id: `ride-${k}-${ignored.length}`, text: RIDE_TEXT[k] ?? 'You let it ride.', tone: 'warn' }]);
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
        {clockLabel(progress)} · {speed}× {running && !sheetZone ? '▶' : '❚❚'}
      </Text>
    </Pressable>
  ) : (
    <View style={styles.speed}>
      <Text variant="label" color={colors.neonViolet}>
        02:30 · done
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
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${Math.round(liveProgress * 100)}%`, backgroundColor: moodAccent ?? TONE_COLOR[headline.tone] },
          ]}
        />
      </View>

      {/* Pressure strip (strain) + Mood strip (happy / morale). Two rows: the
          top row reads what's HEAVY (bar/door/bath/energy), the bottom row
          reads how the room FEELS (guest happiness / staff morale) so the
          owner sees who they're hurting and who they're helping. */}
      <View style={styles.meters}>
        <MiniMeter label="Bar" value={pressures.bar} mode="strain" />
        <MiniMeter label="Door" value={pressures.door} mode="strain" />
        <MiniMeter label="Bath" value={pressures.bathroom} mode="strain" />
        <MiniMeter label="Energy" value={pressures.energy} mode="good" />
      </View>

      {/* Room mood — is the room happy, is the crew holding? */}
      <View style={styles.meters}>
        <MiniMeter label="Guests" value={happy} mode="good" />
        <MiniMeter label="Crew" value={morale} mode="good" />
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

  const bossDock = !committed ? (
    <View style={styles.dock}>
      <View style={styles.focusRow}>
        <Text variant="label" muted>OWNER ATTENTION</Text>
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
      {focusLeft === 0 ? (
        <Text variant="label" muted style={styles.dockHint} numberOfLines={1}>
          Out of attention — let the night ride to last call.
        </Text>
      ) : null}
    </View>
  ) : null;

  return (
    <Screen
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
        floor={floor}
        bubbles={liveBubbles}
        moodAccent={moodAccent}
        moodLabel={moodLabel}
        title="Tonight"
        pulse={!committed}
        zones={zones}
        flashZone={liveFlash}
        venueChips={venueFloorChips(planClub)}
        crowdTags={topCrowd(crowdMix(planClub, plan), 3).map((id) => CROWD_SEGMENTS[id].name)}
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
        onZonePress={committed ? undefined : onZonePress}
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
  progressTrack: { height: 6, borderRadius: radius.pill, backgroundColor: colors.surfaceAlt, overflow: 'hidden' },
  progressFill: { height: 6, borderRadius: radius.pill },
  meters: { flexDirection: 'row', gap: spacing.sm },
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
  stream: { gap: 4, paddingHorizontal: spacing.xs },
  streamRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  streamDot: { width: 6, height: 6, borderRadius: radius.pill, marginTop: 6 },
  streamText: { flex: 1, fontSize: 13, lineHeight: 19 },
});
