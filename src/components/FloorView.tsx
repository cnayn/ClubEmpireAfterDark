/**
 * 2D Club Floor — visual identity pass.
 *
 * The room reads as a nightclub, not a dashboard: a DOORWAY at the back wall, a
 * mid-strip of BATHROOM · DJ BOOTH · STAFF AREA, the DANCE FLOOR (the hero) in
 * the middle, and a real BAR COUNTER across the front. Guests are mini head-
 * plus-body silhouettes that line up at the door, queue at the bar, scatter
 * across the floor, or stack at the bathroom — each cluster animated per mood
 * (dancing bounces, queues shuffle, angry shakes, tired stays still). Staff
 * tokens read at their station, character-tinted (Caramel calm cyan, John hot
 * magenta). Equipped furniture surfaces as small object icons embedded in their
 * zone, not as text chips below it.
 *
 * Still pure presentation: no per-guest sim, no pathfinding, no saved positions,
 * no resolver / economy / save-schema change. Movement is deterministic, driven
 * by three staggered shimmer loops shared across all silhouettes — no per-token
 * state, no RNG. The night's books still come from the resolver.
 */

import { ReactNode, useEffect, useRef } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Card } from '@/components/Card';
import { Pill } from '@/components/Controls';
import { Text } from '@/components/Text';
import { type BoardZone, zonePlacement } from '@/lib/board';
import type {
  BubbleTone,
  ClusterZone,
  FloorBubble,
  FloorStaff,
  FloorView as FloorViewModel,
  GuestCluster,
  GuestMood,
  Vibe,
  VenueFloorChips,
} from '@/lib/dashboard';
import type { NightZones, ZoneKey, ZoneTone } from '@/lib/venue';
import { colors, radius, spacing } from '@/theme/tokens';

const VIBE_COLOR: Record<Vibe, string> = {
  neutral: colors.textMuted,
  contained: colors.neonCyan,
  rowdy: colors.warning,
  spotlight: colors.neonMagenta,
  sharp: colors.neonViolet,
};
const VIBE_LABEL: Record<Vibe, string> = {
  neutral: 'Quiet',
  contained: 'Private',
  rowdy: 'Packed',
  spotlight: 'Spotlight',
  sharp: 'Industry',
};
const BUBBLE_COLOR: Record<BubbleTone, string> = {
  bad: colors.danger,
  warn: colors.warning,
  info: colors.neonCyan,
  good: colors.success,
};
const MOOD_COLOR: Record<GuestMood, string> = {
  dancing: colors.neonCyan,
  waiting: colors.textMuted,
  happy: colors.success,
  angry: colors.danger,
  tired: colors.warning,
  impressed: colors.neonViolet,
  confused: colors.warning,
};

/** Tiny mood pip drawn over an angry / waiting cluster — a one-character vent
 *  that lets the floor shout without a label. Returns null when the mood is
 *  neutral enough to skip the pip. */
function moodPip(mood: GuestMood): string | null {
  switch (mood) {
    case 'angry':
      return '!';
    case 'confused':
      return '?';
    case 'impressed':
      return '✦';
    case 'dancing':
      return '♪';
    default:
      return null;
  }
}

// Characters whose presence tints their station marker.
const CARAMEL = 'bnc-kareem';
const JOHN = 'bnc-john';

const zoneColor = (tone: ZoneTone | undefined, accent: string): string =>
  tone === 'warn' ? colors.warning : tone === 'busy' ? accent : colors.textMuted;

/** A short marker state word for a post, from its zone pressure. */
function staffState(role: 'bartender' | 'bouncer', tone: ZoneTone | undefined): string {
  if (!tone) return 'on duty';
  if (role === 'bartender') return tone === 'warn' ? 'slammed' : tone === 'busy' ? 'working' : 'steady';
  return tone === 'warn' ? 'on alert' : tone === 'busy' ? 'watching' : 'calm';
}

/** A short crew reaction shown as a speech bubble when their station is under
 *  load — so the crew read as people actively carrying (or losing) the room,
 *  not static initials. Tied to the same zone tone that drives their state. */
function staffReaction(role: 'bartender' | 'bouncer', tone: ZoneTone | undefined): string | undefined {
  if (tone === 'warn') return role === 'bartender' ? 'Slammed!' : 'Trouble!';
  if (tone === 'busy') return role === 'bartender' ? 'Hands full' : 'Eyes up';
  return undefined;
}

/** Character-driven tint — Caramel reads calm cyan, John reads hot magenta,
 *  every other staffer takes the zone color. Pure cosmetic. */
function staffTint(id: string, role: 'bartender' | 'bouncer', baseTint: string): string {
  if (role === 'bouncer' && id === CARAMEL) return colors.neonCyan;
  if (role === 'bouncer' && id === JOHN) return colors.neonMagenta;
  return baseTint;
}

/** Tiny role glyph for the staff avatar — a cocktail glass for the bartender,
 *  a shield-ish diamond for the bouncer. Pure cosmetic; helps a staff token
 *  read as "the bouncer" / "the bartender" at a glance. */
const ROLE_GLYPH: Record<'bartender' | 'bouncer', string> = {
  bartender: '◍',
  bouncer: '◆',
};

function StaffToken({
  s,
  role,
  color,
  state,
  reaction,
  onPress,
}: {
  s: FloorStaff;
  role: 'bartender' | 'bouncer';
  color: string;
  state?: string;
  reaction?: string;
  onPress?: () => void;
}) {
  const tint = staffTint(s.id, role, color);
  const body = (
    <View style={styles.token} accessibilityLabel={`${role} ${s.name}`} accessibilityRole={onPress ? 'button' : undefined}>
      {/* Crew reaction speech bubble when their station is under load. */}
      {reaction ? (
        <View style={[styles.crewBubble, { borderColor: tint }]} pointerEvents="none">
          <Text variant="label" color={tint} numberOfLines={1} style={styles.crewBubbleText}>
            {reaction}
          </Text>
        </View>
      ) : null}
      <View style={[styles.avatar, { borderColor: tint, shadowColor: tint }]}>
        <Text variant="label" color={tint}>
          {s.initials}
        </Text>
        <View style={[styles.roleBadge, { borderColor: tint, backgroundColor: colors.surface }]}>
          <Text variant="label" color={tint} style={styles.roleGlyph}>
            {ROLE_GLYPH[role]}
          </Text>
        </View>
      </View>
      <Text variant="label" muted numberOfLines={1} style={styles.tokenName}>
        {s.name}
      </Text>
      {state ? (
        <Text variant="label" color={tint} numberOfLines={1} style={styles.tokenState}>
          {state}
        </Text>
      ) : null}
    </View>
  );
  // Tapping a crew member opens their station's command sheet — the first step
  // toward "tap the crew / tap the zone → choose an action" replacing the fixed
  // boss-button tray. Falls back to a plain token when no handler is wired.
  return onPress ? (
    <Pressable onPress={onPress} accessibilityRole="button">
      {body}
    </Pressable>
  ) : (
    body
  );
}

function EmptyPost() {
  return (
    <View style={styles.token}>
      <View style={[styles.avatar, styles.emptyAvatar]}>
        <Text variant="label" muted>
          —
        </Text>
      </View>
    </View>
  );
}

function Bubble({ b }: { b: FloorBubble }) {
  return (
    <View style={[styles.bubble, { borderColor: BUBBLE_COLOR[b.tone] }]}>
      <Text variant="label" color={BUBBLE_COLOR[b.tone]}>
        {b.label}
      </Text>
    </View>
  );
}

/** Small "object" markers for equipped furniture in a zone — a tiny zone-tinted
 *  square + short name, so decoration reads as visible club objects on the
 *  floor instead of muted text chips. */
function ObjectStrip({ names, tint }: { names: string[]; tint: string }) {
  if (names.length === 0) return null;
  return (
    <View style={styles.furnRow}>
      {names.map((n) => (
        <View key={n} style={[styles.furnChip, { borderColor: tint, shadowColor: tint }]}>
          <View style={[styles.furnIcon, { backgroundColor: tint }]} />
          <Text variant="label" color={tint} style={styles.furnText}>
            {n}
          </Text>
        </View>
      ))}
    </View>
  );
}

// --- Guests as silhouettes -----------------------------------------------

/** Body height per mood — shorter for tired, taller for active. */
function bodyHeight(mood: GuestMood): number {
  switch (mood) {
    case 'dancing':
      return 12;
    case 'impressed':
      return 11;
    case 'happy':
      return 11;
    case 'waiting':
      return 10;
    case 'confused':
      return 10;
    case 'tired':
      return 7;
    case 'angry':
      return 11;
  }
}

/** Per-mood opacity — waiting/tired read dimmer; dancing/angry read sharp. */
function moodOpacity(mood: GuestMood): number {
  switch (mood) {
    case 'dancing':
      return 1;
    case 'impressed':
      return 0.95;
    case 'happy':
      return 0.9;
    case 'angry':
      return 1;
    case 'confused':
      return 0.8;
    case 'waiting':
      return 0.65;
    case 'tired':
      return 0.7;
  }
}

/** A motion mode for how the silhouette ANIMATES on the shimmer loop. The
 *  cluster's zone + mood pick which one — dancing bounces up, queue lines
 *  shuffle sideways, angry shakes, tired stays. Pure cosmetic.  */
type Motion = 'bounce' | 'shuffle' | 'shake' | 'sway' | 'still';

function motionFor(zone: ClusterZone, mood: GuestMood): Motion {
  if (mood === 'tired' || mood === 'waiting') return 'still';
  if (mood === 'angry') return 'shake';
  if (mood === 'confused') return 'sway';
  if (mood === 'dancing' || mood === 'impressed' || mood === 'happy') {
    // A dancer bounces; a happy guest on a queue still shuffles in line.
    if (zone === 'floor' || zone === 'regulars') return 'bounce';
    return 'shuffle';
  }
  return 'shuffle';
}

/** A single mini-person silhouette — head circle + body trapezoid, mood-
 *  colored, animated by the chosen Motion. The `offset` lets the cluster
 *  stagger neighbouring silhouettes so they don't move in lockstep. */
function GuestSilhouette({
  mood,
  motion,
  pulse,
  shimmer,
  offset = 0,
  color,
}: {
  mood: GuestMood;
  motion: Motion;
  pulse: boolean;
  shimmer: Animated.Value;
  offset?: number;
  color?: string;
}) {
  const c = color ?? MOOD_COLOR[mood];
  // Slight deterministic per-person variation (height + a tiny lean) so a cluster
  // reads as a crowd of different people, not identical bars. Pure: keyed off the
  // cluster offset, no RNG.
  const vary = (offset * 37) % 5; // 0..4
  const h = bodyHeight(mood) + (vary - 2); // ±2px torso height
  const lean = ((offset * 53) % 3) - 1; // -1 / 0 / +1 deg
  const op = moodOpacity(mood);

  // Pick the transform style for this silhouette based on motion. Each motion
  // reads the same shimmer 0..1 loop differently — that single source of truth
  // is what keeps "movement" cheap and deterministic.
  let translateY: Animated.AnimatedInterpolation<number> | number = 0;
  let translateX: Animated.AnimatedInterpolation<number> | number = 0;
  let opacity: number | Animated.AnimatedInterpolation<number> = op;
  if (pulse && motion !== 'still') {
    if (motion === 'bounce') {
      // Dancing — a bigger, livelier hop so a packed floor visibly moves.
      translateY = shimmer.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, -5 - offset * 0.5, 0] });
      opacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [Math.max(0.55, op * 0.7), op] });
    } else if (motion === 'shuffle') {
      translateX = shimmer.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 1.6 + offset * 0.2, 0] });
    } else if (motion === 'shake') {
      // Angry — a sharper, harder jitter that reads as agitation.
      translateX = shimmer.interpolate({ inputRange: [0, 0.25, 0.5, 0.75, 1], outputRange: [0, 2.2, -2.2, 2.2, 0] });
    } else if (motion === 'sway') {
      translateX = shimmer.interpolate({ inputRange: [0, 0.5, 1], outputRange: [-1.2, 1.2, -1.2] });
    }
  }

  return (
    <Animated.View style={[styles.silhouette, { opacity, transform: [{ translateX }, { translateY }, { rotate: `${lean}deg` }] }]}>
      <View style={[styles.silhouetteHead, { backgroundColor: c, shadowColor: c }]} />
      {/* Head + shoulders + two arms + torso + two splayed legs read as a little
          person, not a pencil. Cheap shapes only — no sprites/art, no AI. */}
      <View style={styles.shouldersRow} pointerEvents="none">
        <View style={[styles.arm, styles.armLeft, { backgroundColor: c }]} />
        <View style={[styles.shoulders, { backgroundColor: c }]} />
        <View style={[styles.arm, styles.armRight, { backgroundColor: c }]} />
      </View>
      <View style={[styles.body, { height: h, backgroundColor: c, shadowColor: c }]} />
      <View style={styles.legs} pointerEvents="none">
        <View style={[styles.leg, styles.legLeft, { backgroundColor: c }]} />
        <View style={[styles.leg, styles.legRight, { backgroundColor: c }]} />
      </View>
    </Animated.View>
  );
}

/** Arrangement style for a cluster — picks flex/wrap/gap so the cluster reads
 *  as a "line at the door" / "queue at the bar" / "spread on the dance floor" /
 *  "small knot at the bathroom or regulars area". */
type Layout = 'line' | 'scatter' | 'stack';

function layoutFor(zone: ClusterZone): Layout {
  if (zone === 'door' || zone === 'bar') return 'line';
  if (zone === 'floor') return 'scatter';
  return 'stack'; // bath, regulars
}

/** A cluster of silhouettes — arranged per zone (line / scatter / stack),
 *  animated per mood, with a tiny mood pip and an optional short label below.
 *  The cluster is fed one shimmer Animated.Value so neighbouring people don't
 *  move in lockstep but the floor still shares one motion source.  */
function TokenCluster({
  cluster,
  pulse,
  shimmer,
  showLabel = true,
}: {
  cluster: GuestCluster;
  pulse: boolean;
  shimmer: Animated.Value;
  showLabel?: boolean;
}) {
  const color = MOOD_COLOR[cluster.mood];
  const motion = motionFor(cluster.zone, cluster.mood);
  const layout = layoutFor(cluster.zone);
  const pip = moodPip(cluster.mood);

  const rowStyle =
    layout === 'line'
      ? styles.clusterLine
      : layout === 'scatter'
        ? styles.clusterScatter
        : styles.clusterStack;

  return (
    <View style={styles.cluster}>
      {pip ? (
        <View style={[styles.moodPip, { borderColor: color, backgroundColor: colors.surface }]}>
          <Text variant="label" color={color} style={styles.moodPipText}>
            {pip}
          </Text>
        </View>
      ) : null}
      <View style={rowStyle}>
        {Array.from({ length: cluster.count }).map((_, i) => (
          <GuestSilhouette
            key={i}
            mood={cluster.mood}
            motion={motion}
            pulse={pulse}
            shimmer={shimmer}
            offset={i}
          />
        ))}
      </View>
      {showLabel ? (
        <Text variant="label" color={color} style={styles.clusterLabel}>
          {cluster.label}
        </Text>
      ) : null}
    </View>
  );
}

/** A tinted, glowing zone panel. Used for back-row (DOOR) and front-row
 *  (BAR) — the dance floor is its own hero panel below. */
function ZonePanel({
  label,
  tint,
  inset,
  glow,
  children,
}: {
  label: string;
  tint: string;
  inset?: boolean;
  /** Higher = more bloom around the zone (pressure-driven). */
  glow?: number;
  children: ReactNode;
}) {
  return (
    <View
      style={[
        styles.zonePanel,
        inset && styles.zonePanelInset,
        {
          borderColor: tint,
          shadowColor: tint,
          shadowOpacity: 0.2 + (glow ?? 0) * 0.5,
          shadowRadius: 6 + (glow ?? 0) * 10,
        },
      ]}
    >
      <View style={[styles.zoneAccent, { backgroundColor: tint }]} />
      <Text variant="label" style={[styles.zoneLabel, { color: tint }]}>
        {label}
      </Text>
      <View style={styles.zoneBody}>{children}</View>
    </View>
  );
}

/** A small middle-row marker (Bathroom · DJ Booth · Staff Area). Compact —
 *  these never compete with the dance floor or the bar. */
function MiniZone({
  label,
  tint,
  hint,
  glow,
  highlighted,
  onPress,
}: {
  label: string;
  tint: string;
  hint?: string;
  glow?: number;
  highlighted?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      style={[
        styles.miniZone,
        {
          borderColor: highlighted ? tint : colors.border,
          shadowColor: tint,
          shadowOpacity: highlighted ? 0.5 : 0.15 + (glow ?? 0) * 0.4,
          shadowRadius: highlighted ? 12 : 4 + (glow ?? 0) * 8,
        },
      ]}
    >
      <Text variant="label" color={tint} style={styles.miniLabel}>
        {label}
      </Text>
      {hint ? (
        <Text variant="label" muted numberOfLines={1} style={styles.miniHint}>
          {hint}
        </Text>
      ) : null}
    </Pressable>
  );
}

/** TurntableBooth — two glowing deck circles + a center mixer panel. Reads as a
 *  real DJ object on the mid-strip, not a labelled box. A small silhouette
 *  inside represents the booked act when one is on the decks. Pressable. */
function TurntableBooth({
  tint,
  djLabel,
  glow,
  highlighted,
  onPress,
}: {
  tint: string;
  djLabel?: string;
  glow?: number;
  highlighted?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={djLabel ? `DJ ${djLabel}` : 'DJ booth'}
      style={[
        styles.booth,
        {
          borderColor: highlighted ? tint : colors.border,
          shadowColor: tint,
          shadowOpacity: highlighted ? 0.55 : 0.18 + (glow ?? 0) * 0.45,
          shadowRadius: highlighted ? 14 : 5 + (glow ?? 0) * 10,
        },
      ]}
    >
      <View style={styles.boothDecks}>
        <View style={[styles.deck, { borderColor: tint, shadowColor: tint }]}>
          <View style={[styles.deckSpindle, { backgroundColor: tint }]} />
        </View>
        <View style={[styles.mixer, { borderColor: tint, shadowColor: tint }]}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={[styles.fader, { backgroundColor: tint, opacity: 0.6 + i * 0.1 }]} />
          ))}
        </View>
        <View style={[styles.deck, { borderColor: tint, shadowColor: tint }]}>
          <View style={[styles.deckSpindle, { backgroundColor: tint }]} />
        </View>
      </View>
      {djLabel ? (
        <Text variant="label" color={tint} numberOfLines={1} style={styles.boothLabel}>
          ♪ {djLabel}
        </Text>
      ) : (
        <Text variant="label" muted style={styles.boothLabel}>
          DJ booth
        </Text>
      )}
    </Pressable>
  );
}

/** TiledRoom — a small tiled-room representation for the bathroom: a 3×2 mini
 *  tile grid with a WC corner sign. The whole room glows under strain.
 *  Pressable so the player can poke the zone. */
function TiledRoom({
  tint,
  glow,
  highlighted,
  hint,
  onPress,
}: {
  tint: string;
  glow?: number;
  highlighted?: boolean;
  hint?: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel="bathroom"
      style={[
        styles.bathRoom,
        {
          borderColor: highlighted ? tint : colors.border,
          shadowColor: tint,
          shadowOpacity: highlighted ? 0.55 : 0.15 + (glow ?? 0) * 0.45,
          shadowRadius: highlighted ? 14 : 4 + (glow ?? 0) * 9,
        },
      ]}
    >
      <View style={styles.bathTiles} pointerEvents="none">
        {Array.from({ length: 6 }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.bathTile,
              {
                backgroundColor: tint,
                opacity: 0.05 + ((i + Math.floor(i / 3)) % 2) * 0.06 + (glow ?? 0) * 0.05,
              },
            ]}
          />
        ))}
      </View>
      <View style={[styles.wcSign, { borderColor: tint }]}>
        <Text variant="label" color={tint} style={styles.wcText}>
          WC
        </Text>
      </View>
      {hint ? (
        <Text variant="label" muted numberOfLines={1} style={styles.boothLabel}>
          {hint}
        </Text>
      ) : null}
    </Pressable>
  );
}

export function FloorView({
  floor,
  bubbles = [],
  moodAccent,
  moodLabel,
  title = 'The Floor',
  pulse = false,
  zones,
  flashZone,
  venueChips,
  crowdTags,
  regularTags,
  djLabel,
  liveScale = 1,
  headRight,
  belowRoom,
  hideFooter = false,
  clusters,
  pressures,
  onZonePress,
  onStaffPress,
  onClusterPress,
  fill = false,
}: {
  floor: FloorViewModel;
  bubbles?: FloorBubble[];
  moodAccent?: string;
  moodLabel?: string;
  title?: string;
  pulse?: boolean;
  liveScale?: number;
  zones?: NightZones;
  flashZone?: ZoneKey;
  venueChips?: VenueFloorChips;
  crowdTags?: string[];
  regularTags?: string[];
  djLabel?: string;
  headRight?: ReactNode;
  belowRoom?: ReactNode;
  hideFooter?: boolean;
  clusters?: GuestCluster[];
  pressures?: { bar: number; door: number; bathroom: number; energy: number; crowd: number };
  /** Tap a board zone's BACKGROUND to inspect the station. */
  onZonePress?: (zone: BoardZone) => void;
  /** Tap a specific crew token to inspect THAT crew member (not the zone). */
  onStaffPress?: (staffId: string, role: 'bartender' | 'bouncer', zone: BoardZone) => void;
  /** Tap a guest cluster/queue to inspect the crowd at that zone. */
  onClusterPress?: (zone: BoardZone) => void;
  /** Full-bleed mode (night screen): drop the Card chrome and let the room flex
   *  to fill the whole screen, so the floor is the hero — not a small card. */
  fill?: boolean;
}) {
  const accent = moodAccent ?? VIBE_COLOR[floor.vibe];
  const dotOpacity = floor.density === 'packed' ? 1 : floor.density === 'busy' ? 0.85 : 0.6;
  const inZone = (z: FloorBubble['zone']) => bubbles.filter((b) => b.zone === z);

  // Three staggered shimmer loops give the floor a non-uniform motion source
  // without per-token state. Deterministic.
  const shimmers = [useRef(new Animated.Value(0.5)).current, useRef(new Animated.Value(0.5)).current, useRef(new Animated.Value(0.5)).current];
  useEffect(() => {
    if (!pulse) return;
    const durations = [820, 1100, 1380];
    const loops = shimmers.map((v, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(v, { toValue: 1, duration: durations[i], useNativeDriver: true }),
          Animated.timing(v, { toValue: 0, duration: durations[i], useNativeDriver: true }),
        ])
      )
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pulse]);

  const zoneTint = (key: ZoneKey): string => {
    if (flashZone === key) return accent;
    return zoneColor(zones?.[key], accent);
  };

  const clusterIn = (zone: ClusterZone): GuestCluster | undefined =>
    clusters?.find((c) => c.zone === zone);

  const doorCluster = clusterIn('door');
  const barCluster = clusterIn('bar');
  const floorCluster = clusterIn('floor');
  const bathCluster = clusterIn('bath');
  const regularsCluster = clusterIn('regulars');

  // Glow strength per zone (0..1).
  const glow = (key: ZoneKey | 'bath' | 'dj'): number => {
    if (key === 'bar') return pressures?.bar ?? (zones?.bar === 'warn' ? 0.6 : zones?.bar === 'busy' ? 0.35 : 0);
    if (key === 'door') return pressures?.door ?? (zones?.door === 'warn' ? 0.6 : zones?.door === 'busy' ? 0.35 : 0);
    if (key === 'floor') return Math.max(pressures?.energy ?? 0, pressures?.crowd ?? 0);
    if (key === 'bath') return pressures?.bathroom ?? 0;
    return djLabel ? 0.4 : 0;
  };

  const liveDots = Math.max(0, Math.round(floor.dots * Math.max(0, Math.min(1, liveScale))));

  /** Fallback floor crowd as scattered silhouettes (when no `floor` cluster is
   *  provided — e.g. on the dashboard, where there are no live pressures). */
  const renderFallbackCrowd = () => {
    if (liveDots <= 0) {
      return (
        <Text variant="label" muted>
          The floor is quiet.
        </Text>
      );
    }
    return Array.from({ length: liveDots }).map((_, i) => (
      <GuestSilhouette
        key={i}
        mood={floor.density === 'packed' ? 'dancing' : floor.density === 'busy' ? 'happy' : 'waiting'}
        motion={floor.density === 'packed' ? 'bounce' : 'shuffle'}
        pulse={pulse}
        shimmer={shimmers[i % shimmers.length]}
        offset={i}
        color={accent}
      />
    ));
  };

  const floorTint = zoneTint('floor');
  const djTint = djLabel ? colors.neonMagenta : colors.textMuted;
  const bathTint = pressures && pressures.bathroom >= 0.55 ? colors.warning : colors.textMuted;
  const staffAreaTint = colors.neonViolet;

  const onDutyCount = floor.bartenders.length + floor.bouncers.length;

  const inner = (
    <>
      <View style={styles.head}>
        <Text variant="label" muted>
          {floor.eventName}
        </Text>
        {headRight ?? <Pill label={moodLabel ?? VIBE_LABEL[floor.vibe]} color={accent} />}
      </View>
      {headRight && moodLabel ? (
        <Text variant="heading" color={accent} style={styles.moodLine}>
          {moodLabel}
        </Text>
      ) : null}

      <View style={[styles.room, fill && styles.roomFill, { borderColor: accent, shadowColor: accent }]}>
        {/* Back wall — a subtle scanline strip evokes a back wall behind the door. */}
        <View style={[styles.backWall, { borderColor: accent }]} pointerEvents="none">
          {[0, 1, 2].map((i) => (
            <View key={i} style={[styles.scanline, { backgroundColor: accent, opacity: 0.08 + i * 0.04 }]} />
          ))}
        </View>

        {/* The room is laid out as a FLOOR PLAN driven by FIRST_FLOOR_LAYOUT
            (src/lib/board.ts): a top band (door + locked VIP), a middle band
            (dance-floor hero on the left, DJ booth over the bar down the right),
            and a bottom band (bathroom + staff). Column spans come from the
            layout model so the plan is data-driven, not a hand-stacked column. */}

        {/* TOP BAND (row 0) — DOOR across the back wall + locked VIP corner. */}
        <View style={styles.band}>
          <View style={{ flex: zonePlacement('door')?.colSpan ?? 3 }}>
            <Pressable
              accessibilityRole="button"
              onPress={() => onZonePress?.('door')}
              style={[styles.doorway, styles.cellFill, { borderColor: zoneTint('door'), shadowColor: zoneTint('door'), shadowOpacity: 0.2 + glow('door') * 0.5, shadowRadius: 6 + glow('door') * 10 }]}
            >
              <View style={[styles.doorPostBeam, { backgroundColor: zoneTint('door') }]} />
              <View style={[styles.doorTopBeam, { backgroundColor: zoneTint('door') }]} />
              <View style={[styles.doorPostBeam, styles.doorPostRight, { backgroundColor: zoneTint('door') }]} />
              <View style={styles.doorRow}>
                <View style={styles.doorPost}>
                  {floor.bouncers.length > 0 ? (
                    floor.bouncers.map((b) => (
                      <StaffToken key={b.id} s={b} role="bouncer" color={zoneTint('door')} state={staffState('bouncer', zones?.door)} reaction={staffReaction('bouncer', zones?.door)} onPress={onStaffPress ? () => onStaffPress(b.id, 'bouncer', 'door') : undefined} />
                    ))
                  ) : (
                    <EmptyPost />
                  )}
                </View>
                {doorCluster ? (
                  <Pressable
                    style={styles.doorLine}
                    onPress={onClusterPress ? () => onClusterPress('door') : undefined}
                    accessibilityRole={onClusterPress ? 'button' : undefined}
                    accessibilityLabel="Door line"
                  >
                    <TokenCluster cluster={doorCluster} pulse={pulse} shimmer={shimmers[0]} showLabel={false} />
                    <View style={styles.stanchionRow} pointerEvents="none">
                      <View style={[styles.stanchionPost, { backgroundColor: zoneTint('door') }]} />
                      <View style={[styles.stanchionRope, { backgroundColor: colors.warning }]} />
                      <View style={[styles.stanchionPost, { backgroundColor: zoneTint('door') }]} />
                    </View>
                  </Pressable>
                ) : null}
              </View>
              <Text variant="label" style={[styles.zoneStamp, { color: zoneTint('door') }]}>
                DOOR
              </Text>
            </Pressable>
          </View>
          {/* VIP — locked future expansion in the top-right corner. */}
          <View style={{ flex: zonePlacement('vip')?.colSpan ?? 1 }}>
            <View style={styles.vipCard}>
              <Text variant="label" muted style={styles.vipText}>
                VIP
              </Text>
              <View style={styles.vipRope} />
              <Text variant="label" muted style={styles.vipLocked}>
                locked
              </Text>
            </View>
          </View>
        </View>
        {venueChips ? <ObjectStrip names={venueChips.door} tint={zoneTint('door')} /> : null}
        {inZone('door').length > 0 ? (
          <View style={styles.bubbleRow}>{inZone('door').map((b) => <Bubble key={b.id} b={b} />)}</View>
        ) : null}

        {/* MIDDLE BAND (rows 1–2) — DANCE FLOOR hero on the LEFT; the RIGHT
            column stacks the DJ booth over the bar (col 3 of the plan). */}
        <View style={styles.band}>
          <View style={{ flex: zonePlacement('floor')?.colSpan ?? 3 }}>
            <Pressable
              accessibilityRole="button"
              onPress={() => onZonePress?.('floor')}
              style={[styles.floorPanel, styles.cellFill, { borderColor: floorTint, shadowColor: floorTint, shadowOpacity: 0.25 + glow('floor') * 0.5, shadowRadius: 10 + glow('floor') * 14 }]}
            >
              <View style={styles.floorHead}>
                <Text variant="label" style={[styles.zoneLabel, { color: floorTint }]}>
                  FLOOR
                </Text>
                {regularsCluster ? (
                  <View style={[styles.regularChip, { borderColor: MOOD_COLOR[regularsCluster.mood] }]}>
                    <Text variant="label" color={MOOD_COLOR[regularsCluster.mood]}>
                      {regularsCluster.label}
                    </Text>
                  </View>
                ) : null}
              </View>

              {crowdTags && crowdTags.length > 0 ? (
                <View style={styles.crowdTagRow}>
                  {crowdTags.map((t) => (
                    <View key={t} style={styles.crowdTag}>
                      <Text variant="label" color={colors.neonCyan}>
                        {t}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : null}
              {regularTags && regularTags.length > 0 ? (
                <View style={styles.crowdTagRow}>
                  {regularTags.map((t) => (
                    <View key={t} style={[styles.crowdTag, { borderColor: colors.success }]}>
                      <Text variant="label" color={colors.success}>
                        {t}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : null}

              <View style={styles.grid}>
                <View style={styles.tiles} pointerEvents="none">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <View
                      key={i}
                      style={[
                        styles.tile,
                        { backgroundColor: floorTint, opacity: 0.04 + ((i + Math.floor(i / 4)) % 2) * 0.05 + glow('floor') * 0.12 },
                      ]}
                    />
                  ))}
                </View>
                {/* Energy wash: the whole floor glows warmer as energy rises and
                    goes dark/cold when it drops — so 'cold / warming / alive' reads
                    at a glance without the meter. Pulses on the beat when hot. */}
                <Animated.View
                  pointerEvents="none"
                  style={[
                    styles.energyWash,
                    {
                      backgroundColor: floorTint,
                      opacity: shimmers[1].interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.02 + glow('floor') * 0.16, 0.02 + glow('floor') * 0.28],
                      }),
                    },
                  ]}
                />
                {/* Three pulsing spotlights on staggered loops read as a live
                    nightclub light rig (counter-phased so light "sweeps"). When
                    pulse is off (dashboard) the shimmers sit at 0.5 = steady glow. */}
                <Animated.View
                  pointerEvents="none"
                  style={[styles.spotlight, { backgroundColor: floorTint, opacity: shimmers[0].interpolate({ inputRange: [0, 1], outputRange: [0.06 + glow('floor') * 0.1, 0.24 + glow('floor') * 0.2] }) }]}
                />
                <Animated.View
                  pointerEvents="none"
                  style={[styles.spotlightLeft, { backgroundColor: floorTint, opacity: shimmers[1].interpolate({ inputRange: [0, 1], outputRange: [0.04, 0.18 + glow('floor') * 0.12] }) }]}
                />
                <Animated.View
                  pointerEvents="none"
                  style={[styles.spotlightRight, { backgroundColor: floorTint, opacity: shimmers[2].interpolate({ inputRange: [0, 1], outputRange: [0.18 + glow('floor') * 0.12, 0.04] }) }]}
                />
                <View style={styles.crowd}>
                  {floorCluster ? (
                    <Pressable
                      onPress={onClusterPress ? () => onClusterPress('floor') : undefined}
                      accessibilityRole={onClusterPress ? 'button' : undefined}
                      accessibilityLabel="Dance floor crowd"
                    >
                      <TokenCluster cluster={floorCluster} pulse={pulse} shimmer={shimmers[0]} showLabel={false} />
                    </Pressable>
                  ) : (
                    renderFallbackCrowd()
                  )}
                </View>
              </View>

              {inZone('floor').length > 0 ? (
                <View style={styles.bubbleRow}>{inZone('floor').map((b) => <Bubble key={b.id} b={b} />)}</View>
              ) : null}
            </Pressable>
          </View>

          {/* RIGHT COLUMN — DJ booth over the bar. */}
          <View style={styles.sideCol}>
            <TurntableBooth
              tint={djTint}
              djLabel={djLabel}
              glow={glow('dj')}
              highlighted={flashZone === 'floor'}
              onPress={onZonePress ? () => onZonePress('dj') : undefined}
            />
            <Pressable
              accessibilityRole="button"
              onPress={() => onZonePress?.('bar')}
              style={[styles.sideBar, { borderColor: zoneTint('bar'), shadowColor: zoneTint('bar'), shadowOpacity: 0.25 + glow('bar') * 0.45, shadowRadius: 8 + glow('bar') * 10 }]}
            >
              <View style={styles.sideBarHead}>
                <Text variant="label" style={[styles.zoneLabel, { color: zoneTint('bar') }]}>
                  BAR
                </Text>
                {/* A drink glyph that bobs continuously = the bar is pouring all
                    night; it lifts/brightens on the shimmer loop so the station
                    always reads as ACTIVE, not a static box. */}
                <Animated.Text
                  style={[
                    styles.serviceGlyph,
                    {
                      color: zoneTint('bar'),
                      opacity: shimmers[2].interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }),
                      transform: [{ translateY: shimmers[2].interpolate({ inputRange: [0, 1], outputRange: [0, -2] }) }],
                    },
                  ]}
                >
                  🍸
                </Animated.Text>
              </View>
              <View style={styles.sideBackbar}>
                {[10, 13, 8, 12, 9].map((h, i) => (
                  <View key={i} style={[styles.bottle, { height: h, backgroundColor: zoneTint('bar'), opacity: 0.4 + ((i * 17) % 7) / 18 }]} />
                ))}
              </View>
              <View style={[styles.barTop, { backgroundColor: zoneTint('bar') }]} />
              <View style={styles.sideBarPosts}>
                {floor.bartenders.length > 0 ? (
                  floor.bartenders.map((b) => (
                    <StaffToken key={b.id} s={b} role="bartender" color={zoneTint('bar')} state={staffState('bartender', zones?.bar)} reaction={staffReaction('bartender', zones?.bar)} onPress={onStaffPress ? () => onStaffPress(b.id, 'bartender', 'bar') : undefined} />
                  ))
                ) : (
                  <EmptyPost />
                )}
              </View>
              {barCluster ? (
                <Pressable
                  onPress={onClusterPress ? () => onClusterPress('bar') : undefined}
                  accessibilityRole={onClusterPress ? 'button' : undefined}
                  accessibilityLabel="Bar queue"
                >
                  <TokenCluster cluster={barCluster} pulse={pulse} shimmer={shimmers[2]} showLabel={false} />
                </Pressable>
              ) : null}
              {inZone('bar').length > 0 ? (
                <View style={styles.bubbleRow}>{inZone('bar').map((b) => <Bubble key={b.id} b={b} />)}</View>
              ) : null}
            </Pressable>
          </View>
        </View>
        {venueChips ? <ObjectStrip names={venueChips.bar} tint={zoneTint('bar')} /> : null}

        {/* BOTTOM BAND (row 3) — BATHROOM + STAFF AREA, secondary. */}
        <View style={styles.band}>
          <View style={{ flex: zonePlacement('bathroom')?.colSpan ?? 2 }}>
            <TiledRoom
              tint={bathTint}
              glow={glow('bath')}
              highlighted={!!bathCluster}
              hint={bathCluster ? bathCluster.label : 'clear'}
              onPress={onZonePress ? () => onZonePress('bathroom') : undefined}
            />
          </View>
          <View style={{ flex: zonePlacement('staff')?.colSpan ?? 2 }}>
            <MiniZone
              label="STAFF"
              tint={staffAreaTint}
              hint={onDutyCount > 0 ? `${onDutyCount} on duty` : 'nobody on'}
              onPress={onZonePress ? () => onZonePress('staff') : undefined}
            />
          </View>
        </View>
      </View>

      {belowRoom ? (
        fill ? (
          // Full-bleed: the meters/status/stream get their OWN bounded, scrollable
          // band BELOW the floor — so they never overlap the room when tall.
          <ScrollView style={styles.belowScroll} contentContainerStyle={styles.belowScrollContent} showsVerticalScrollIndicator={false}>
            {belowRoom}
          </ScrollView>
        ) : (
          <View style={styles.belowRoom}>{belowRoom}</View>
        )
      ) : null}

      {hideFooter ? null : (
        <Text variant="label" muted>
          {floor.hasPlayedNight
            ? `Last night: ${floor.lastGuests}/${floor.capacity} guests`
            : 'Doors closed — open the club tonight.'}
        </Text>
      )}
    </>
  );
  // Night screen uses full-bleed (no Card chrome, room flexes to fill); other
  // screens (dashboard) keep the titled Card.
  return fill ? <View style={styles.fillWrap}>{inner}</View> : <Card title={title} accent={moodAccent}>{inner}</Card>;
}

// Dummy reference to silence the unused-var lint while keeping the prop in the
// component signature for future use (kept dim by callers).
const _unusedDotOpacity = (n: number) => n;
void _unusedDotOpacity;

const styles = StyleSheet.create({
  fillWrap: { flex: 1, gap: spacing.sm },
  // Full-bleed room is the hero (≈60% of the body) and CLIPS its own content so
  // the bands never spill onto the section below.
  roomFill: { flex: 3, minHeight: 0, overflow: 'hidden' },
  // The below-room band gets the remaining space and scrolls internally if the
  // meters + status + stream are taller than it — never overlapping the room.
  belowScroll: { flex: 2 },
  belowScrollContent: { gap: spacing.md, paddingBottom: spacing.sm },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  room: {
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.sm,
    gap: spacing.sm,
    minHeight: 380,
    justifyContent: 'space-between',
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
  },
  // Subtle "back wall" scanline strip behind the door (depth cue).
  backWall: {
    position: 'absolute',
    top: 0,
    left: spacing.sm,
    right: spacing.sm,
    height: 18,
    borderTopWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  scanline: { height: 1, marginVertical: 1 },
  // --- Floor-plan bands (data-driven from FIRST_FLOOR_LAYOUT) ---
  band: { flexDirection: 'row', gap: spacing.sm, alignItems: 'stretch' },
  cellFill: { flex: 1, marginHorizontal: 0 },
  sideCol: { flex: 1, gap: spacing.sm },
  // Locked VIP corner (top-right of the plan).
  vipCard: {
    flex: 1,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    gap: 2,
    opacity: 0.8,
  },
  vipLocked: { fontSize: 8, letterSpacing: 1 },
  // Compact side bar (right column, under the DJ booth).
  sideBar: {
    borderWidth: 1,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
    alignItems: 'center',
    gap: 2,
    shadowOffset: { width: 0, height: 0 },
  },
  sideBarHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  serviceGlyph: { fontSize: 11 },
  sideBackbar: { flexDirection: 'row', alignItems: 'flex-end', gap: 3, paddingVertical: 1 },
  sideBarPosts: { alignItems: 'center', marginTop: 2 },
  // Zone panels (door / bar) — tinted, glowing.
  zonePanel: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    borderWidth: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    gap: spacing.xs,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 0 },
  },
  zonePanelInset: { marginHorizontal: spacing.lg },
  zoneAccent: { position: 'absolute', top: 0, left: 0, right: 0, height: 2, opacity: 0.9 },
  zoneBody: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  zoneLabel: { letterSpacing: 1, fontSize: 10 },
  // --- Doorway frame — two posts + top beam evoke a doorway across the back wall.
  doorway: {
    position: 'relative',
    marginHorizontal: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 0 },
  },
  doorPostBeam: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, opacity: 0.9 },
  doorPostRight: { left: undefined, right: 0 },
  doorTopBeam: { position: 'absolute', left: 0, right: 0, top: 0, height: 3, opacity: 0.9 },
  doorRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: spacing.sm },
  doorPost: { width: 56 },
  doorLine: { flex: 1, alignItems: 'flex-end', minHeight: 24, paddingHorizontal: spacing.xs },
  vipChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    opacity: 0.7,
    alignItems: 'center',
  },
  vipText: { fontSize: 9 },
  vipRope: { width: 24, height: 2, backgroundColor: colors.warning, marginTop: 2, opacity: 0.8 },
  // A faint zone-stamp in the corner of the doorway/bar, so the label is there
  // but doesn't compete with the visible object for attention.
  zoneStamp: { position: 'absolute', right: 6, bottom: 4, fontSize: 8, letterSpacing: 1, opacity: 0.7 },
  // --- Bar counter — a real "object" at the front of the room.
  barCounter: {
    position: 'relative',
    borderRadius: radius.sm,
    borderWidth: 1,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
    gap: spacing.xs,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 0 },
  },
  backbar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  bottle: { width: 3, height: 10, borderTopLeftRadius: 2, borderTopRightRadius: 2 },
  barTop: { height: 4, borderRadius: 2, marginTop: 2, opacity: 0.85 },
  barRow: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm },
  barPost: { width: 56 },
  barQueue: { flex: 1, alignItems: 'flex-end', minHeight: 24, paddingHorizontal: spacing.xs },
  // Middle row — Bathroom · DJ · Staff (compact markers).
  midRow: { flexDirection: 'row', gap: spacing.sm, marginHorizontal: spacing.md },
  midClusters: { alignItems: 'center', marginTop: -spacing.xs },
  miniZone: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    borderWidth: 1,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    gap: 1,
    shadowOffset: { width: 0, height: 0 },
  },
  miniLabel: { letterSpacing: 1, fontSize: 10 },
  miniHint: { fontSize: 10 },
  // Floor panel — the hero.
  floorPanel: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.sm,
    gap: spacing.xs,
    shadowOffset: { width: 0, height: 0 },
  },
  floorHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  regularChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
    backgroundColor: colors.surfaceAlt,
  },
  grid: {
    position: 'relative',
    flex: 1,
    minHeight: 140,
    borderRadius: radius.sm,
    overflow: 'hidden',
    backgroundColor: colors.bg,
    justifyContent: 'center',
  },
  // 4x3 tile grid behind the dance floor — reads as a real club floor.
  tiles: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, flexDirection: 'row', flexWrap: 'wrap' },
  // Full-floor energy glow (opacity scales with floor energy).
  energyWash: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: radius.sm },
  tile: { width: '25%', height: '33.33%' },
  // A soft beam from the DJ booth direction; sits behind the silhouettes.
  spotlight: {
    position: 'absolute',
    top: -20,
    left: '50%',
    width: 24,
    height: 220,
    transform: [{ translateX: -12 }, { rotate: '0deg' }],
    borderRadius: 6,
  },
  // Two side beams angled inward — the floor gets three layered lights.
  spotlightLeft: {
    position: 'absolute',
    top: -30,
    left: '20%',
    width: 14,
    height: 220,
    transform: [{ translateX: -7 }, { rotate: '12deg' }],
    borderRadius: 6,
  },
  spotlightRight: {
    position: 'absolute',
    top: -30,
    right: '20%',
    width: 14,
    height: 220,
    transform: [{ translateX: 7 }, { rotate: '-12deg' }],
    borderRadius: 6,
  },
  // --- Stanchion rope under the door line.
  stanchionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
    marginTop: 2,
  },
  stanchionPost: { width: 2, height: 6, borderRadius: 1, opacity: 0.85 },
  stanchionRope: { flex: 1, maxWidth: 36, height: 1.5, opacity: 0.7 },
  // --- DJ TurntableBooth (replaces the labelled mini-zone in v1).
  booth: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    borderWidth: 1,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
    alignItems: 'center',
    gap: 2,
    shadowOffset: { width: 0, height: 0 },
  },
  boothDecks: { flexDirection: 'row', alignItems: 'center', gap: 4, justifyContent: 'center' },
  deck: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
    shadowOpacity: 0.5,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 0 },
  },
  deckSpindle: { width: 3, height: 3, borderRadius: 2, opacity: 0.9 },
  mixer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 1,
    paddingHorizontal: 2,
    paddingVertical: 1,
    borderRadius: 2,
    borderWidth: 1,
    backgroundColor: colors.bg,
    shadowOpacity: 0.4,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 0 },
  },
  fader: { width: 1.5, height: 8, borderRadius: 1 },
  boothLabel: { fontSize: 9, letterSpacing: 0.5 },
  // --- TiledRoom (bathroom).
  bathRoom: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    borderWidth: 1,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
    alignItems: 'center',
    gap: 2,
    shadowOffset: { width: 0, height: 0 },
    position: 'relative',
    overflow: 'hidden',
  },
  bathTiles: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  bathTile: { width: '33.33%', height: '50%' },
  wcSign: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    borderWidth: 1,
    backgroundColor: colors.bg,
    marginTop: 4,
  },
  wcText: { fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  // --- Role badge on the staff avatar.
  roleBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleGlyph: { fontSize: 8, lineHeight: 10 },
  // Staff avatar token.
  token: { alignItems: 'center', width: 56, gap: 2 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    shadowOpacity: 0.5,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  emptyAvatar: { borderColor: colors.border, borderStyle: 'dashed', shadowOpacity: 0 },
  tokenName: { maxWidth: 56, textAlign: 'center', fontSize: 11 },
  tokenState: { maxWidth: 56, textAlign: 'center', fontSize: 10 },
  crewBubble: {
    borderWidth: 1,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    paddingHorizontal: 4,
    paddingVertical: 1,
    marginBottom: 2,
  },
  crewBubbleText: { fontSize: 9 },
  crowd: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
  // --- Guest silhouette (head + body) ---
  silhouette: { alignItems: 'center', width: 9 },
  silhouetteHead: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    shadowOpacity: 0.6,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 0 },
    marginBottom: 1,
  },
  // Shoulders bar + two short arms so the figure reads human, not a bar.
  shouldersRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center' },
  shoulders: { width: 6, height: 1.5, borderRadius: 1, marginBottom: -0.5 },
  arm: { width: 1.5, height: 4, borderRadius: 1 },
  armLeft: { transform: [{ rotate: '28deg' }], marginRight: -0.5 },
  armRight: { transform: [{ rotate: '-28deg' }], marginLeft: -0.5 },
  body: {
    width: 5,
    borderTopLeftRadius: 2.5,
    borderTopRightRadius: 2.5,
    borderBottomLeftRadius: 1,
    borderBottomRightRadius: 1,
    shadowOpacity: 0.5,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 0 },
  },
  // Two splayed legs (an inverted V) under the torso.
  legs: { flexDirection: 'row', width: 8, justifyContent: 'center' },
  leg: { width: 1.5, height: 4, borderRadius: 1 },
  legLeft: { transform: [{ rotate: '18deg' }], marginRight: 0.5 },
  legRight: { transform: [{ rotate: '-18deg' }], marginLeft: 0.5 },
  // --- Cluster arrangements ---
  cluster: { alignItems: 'center', gap: 2 },
  clusterLine: { flexDirection: 'row', alignItems: 'flex-end', gap: 3 },
  clusterScatter: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-end', gap: 4, maxWidth: 220 },
  clusterStack: { flexDirection: 'row', alignItems: 'flex-end', gap: 2 },
  clusterLabel: { fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.5 },
  // Mood pip sits over a cluster (angry / confused / impressed / dancing).
  moodPip: {
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  moodPipText: { fontSize: 9, fontWeight: '700', lineHeight: 12 },
  bubbleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, justifyContent: 'center' },
  // Furniture as small "object" badges — tinted square + name, so decoration
  // reads like things ON the floor rather than text below it.
  furnRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, justifyContent: 'center' },
  furnChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
    borderWidth: 1,
    backgroundColor: colors.surface,
    shadowOpacity: 0.3,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 0 },
  },
  furnIcon: { width: 6, height: 6, borderRadius: 2 },
  furnText: { fontSize: 9, letterSpacing: 0.3 },
  crowdTagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, justifyContent: 'center' },
  crowdTag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 1,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.neonCyan,
    backgroundColor: colors.surface,
  },
  bubble: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
    borderWidth: 1,
    backgroundColor: colors.surface,
  },
  moodLine: { marginTop: -spacing.xs, lineHeight: 22 },
  belowRoom: { gap: spacing.md, marginTop: spacing.sm },
});
