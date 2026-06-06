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
import { Animated, Pressable, StyleSheet, View } from 'react-native';

import { Card } from '@/components/Card';
import { Pill } from '@/components/Controls';
import { Text } from '@/components/Text';
import type { BoardZone } from '@/lib/board';
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

/** Character-driven tint — Caramel reads calm cyan, John reads hot magenta,
 *  every other staffer takes the zone color. Pure cosmetic. */
function staffTint(id: string, role: 'bartender' | 'bouncer', baseTint: string): string {
  if (role === 'bouncer' && id === CARAMEL) return colors.neonCyan;
  if (role === 'bouncer' && id === JOHN) return colors.neonMagenta;
  return baseTint;
}

function StaffToken({ s, role, color, state }: { s: FloorStaff; role: 'bartender' | 'bouncer'; color: string; state?: string }) {
  const tint = staffTint(s.id, role, color);
  return (
    <View style={styles.token} accessibilityLabel={s.name}>
      <View style={[styles.avatar, { borderColor: tint, shadowColor: tint }]}>
        <Text variant="label" color={tint}>
          {s.initials}
        </Text>
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
  const h = bodyHeight(mood);
  const op = moodOpacity(mood);

  // Pick the transform style for this silhouette based on motion. Each motion
  // reads the same shimmer 0..1 loop differently — that single source of truth
  // is what keeps "movement" cheap and deterministic.
  let translateY: Animated.AnimatedInterpolation<number> | number = 0;
  let translateX: Animated.AnimatedInterpolation<number> | number = 0;
  let opacity: number | Animated.AnimatedInterpolation<number> = op;
  if (pulse && motion !== 'still') {
    if (motion === 'bounce') {
      translateY = shimmer.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, -3 - offset * 0.4, 0] });
      opacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [Math.max(0.55, op * 0.7), op] });
    } else if (motion === 'shuffle') {
      translateX = shimmer.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 1.2 + offset * 0.15, 0] });
    } else if (motion === 'shake') {
      translateX = shimmer.interpolate({ inputRange: [0, 0.25, 0.5, 0.75, 1], outputRange: [0, 1.2, -1.2, 1.2, 0] });
    } else if (motion === 'sway') {
      translateX = shimmer.interpolate({ inputRange: [0, 0.5, 1], outputRange: [-0.8, 0.8, -0.8] });
    }
  }

  return (
    <Animated.View style={[styles.silhouette, { opacity, transform: [{ translateX }, { translateY }] }]}>
      <View style={[styles.silhouetteHead, { backgroundColor: c, shadowColor: c }]} />
      <View style={[styles.body, { height: h, backgroundColor: c, shadowColor: c }]} />
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
  /** Tap a board zone to command it (opens a zone action sheet in the caller). */
  onZonePress?: (zone: BoardZone) => void;
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

  return (
    <Card title={title} accent={moodAccent}>
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

      <View style={[styles.room, { borderColor: accent, shadowColor: accent }]}>
        {/* Back wall — a subtle scanline strip evokes a back wall behind the door. */}
        <View style={[styles.backWall, { borderColor: accent }]} pointerEvents="none">
          {[0, 1, 2].map((i) => (
            <View key={i} style={[styles.scanline, { backgroundColor: accent, opacity: 0.08 + i * 0.04 }]} />
          ))}
        </View>

        {/* DOOR — a doorway frame across the back wall. Two glowing posts
            bracket the opening; the bouncer stands LEFT of the door, a guest
            line queues in the middle, the VIP rope on the right is locked. */}
        <Pressable accessibilityRole="button" onPress={() => onZonePress?.('door')} style={[styles.doorway, { borderColor: zoneTint('door'), shadowColor: zoneTint('door'), shadowOpacity: 0.2 + glow('door') * 0.5, shadowRadius: 6 + glow('door') * 10 }]}>
          <View style={[styles.doorPostBeam, { backgroundColor: zoneTint('door') }]} />
          <View style={[styles.doorTopBeam, { backgroundColor: zoneTint('door') }]} />
          <View style={[styles.doorPostBeam, styles.doorPostRight, { backgroundColor: zoneTint('door') }]} />
          <View style={styles.doorRow}>
            <View style={styles.doorPost}>
              {floor.bouncers.length > 0 ? (
                floor.bouncers.map((b) => (
                  <StaffToken key={b.id} s={b} role="bouncer" color={zoneTint('door')} state={staffState('bouncer', zones?.door)} />
                ))
              ) : (
                <EmptyPost />
              )}
            </View>
            {doorCluster ? (
              <View style={styles.doorLine}>
                <TokenCluster cluster={doorCluster} pulse={pulse} shimmer={shimmers[0]} showLabel={false} />
              </View>
            ) : null}
            <View style={styles.vipChip}>
              <Text variant="label" muted style={styles.vipText}>
                VIP
              </Text>
              <View style={styles.vipRope} />
            </View>
          </View>
          <Text variant="label" style={[styles.zoneStamp, { color: zoneTint('door') }]}>
            DOOR
          </Text>
        </Pressable>
        {venueChips ? <ObjectStrip names={venueChips.door} tint={zoneTint('door')} /> : null}
        {inZone('door').length > 0 ? (
          <View style={styles.bubbleRow}>{inZone('door').map((b) => <Bubble key={b.id} b={b} />)}</View>
        ) : null}

        {/* MID STRIP — Bathroom · DJ Booth · Staff Area. */}
        <View style={styles.midRow}>
          <MiniZone
            label="BATH"
            tint={bathTint}
            hint={bathCluster ? bathCluster.label : 'clear'}
            glow={glow('bath')}
            highlighted={!!bathCluster}
            onPress={onZonePress ? () => onZonePress('bathroom') : undefined}
          />
          <MiniZone
            label="DJ"
            tint={djTint}
            hint={djLabel ? `♪ ${djLabel}` : 'soon'}
            glow={glow('dj')}
            highlighted={flashZone === 'floor'}
            onPress={onZonePress ? () => onZonePress('dj') : undefined}
          />
          <MiniZone
            label="STAFF"
            tint={staffAreaTint}
            hint={onDutyCount > 0 ? `${onDutyCount} on duty` : 'nobody on'}
            onPress={onZonePress ? () => onZonePress('staff') : undefined}
          />
        </View>
        {bathCluster ? (
          <View style={styles.midClusters}>
            <TokenCluster cluster={bathCluster} pulse={pulse} shimmer={shimmers[1]} showLabel={false} />
          </View>
        ) : null}

        {/* DANCE FLOOR — the hero. */}
        <Pressable
          accessibilityRole="button"
          onPress={() => onZonePress?.('floor')}
          style={[
            styles.floorPanel,
            {
              borderColor: floorTint,
              shadowColor: floorTint,
              shadowOpacity: 0.25 + glow('floor') * 0.5,
              shadowRadius: 10 + glow('floor') * 14,
            },
          ]}
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
            {/* Floor tile grid — a 4x3 checker reads as a real dance-floor
                surface, not just stripes. Opacities staggered. */}
            <View style={styles.tiles} pointerEvents="none">
              {Array.from({ length: 12 }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.tile,
                    {
                      backgroundColor: floorTint,
                      opacity: 0.04 + ((i + Math.floor(i / 4)) % 2) * 0.05 + glow('floor') * 0.04,
                    },
                  ]}
                />
              ))}
            </View>
            {/* Center spotlight beam from the DJ booth direction. */}
            <View pointerEvents="none" style={[styles.spotlight, { backgroundColor: floorTint, opacity: 0.05 + glow('floor') * 0.18 }]} />
            <View style={styles.crowd}>
              {floorCluster ? (
                <TokenCluster cluster={floorCluster} pulse={pulse} shimmer={shimmers[0]} showLabel={false} />
              ) : (
                renderFallbackCrowd()
              )}
            </View>
          </View>

          {inZone('floor').length > 0 ? (
            <View style={styles.bubbleRow}>{inZone('floor').map((b) => <Bubble key={b.id} b={b} />)}</View>
          ) : null}
        </Pressable>

        {/* BAR — a real bar counter across the front of the room. The
            bartender(s) stand BEHIND the counter; the guest queue stacks IN
            FRONT of it. A bottle row sits behind the bartender. */}
        {inZone('bar').length > 0 ? (
          <View style={styles.bubbleRow}>{inZone('bar').map((b) => <Bubble key={b.id} b={b} />)}</View>
        ) : null}
        <Pressable accessibilityRole="button" onPress={() => onZonePress?.('bar')} style={[styles.barCounter, { borderColor: zoneTint('bar'), shadowColor: zoneTint('bar'), shadowOpacity: 0.25 + glow('bar') * 0.45, shadowRadius: 8 + glow('bar') * 10 }]}>
          {/* Backbar / bottle row: a thin glowing strip with three notches. */}
          <View style={[styles.backbar, { borderColor: zoneTint('bar') }]}>
            {[0, 1, 2, 3].map((i) => (
              <View key={i} style={[styles.bottle, { backgroundColor: zoneTint('bar'), opacity: 0.7 - i * 0.1 }]} />
            ))}
          </View>
          {/* Posts + queue. */}
          <View style={styles.barRow}>
            <View style={styles.barPost}>
              {floor.bartenders.length > 0 ? (
                floor.bartenders.map((b) => (
                  <StaffToken key={b.id} s={b} role="bartender" color={zoneTint('bar')} state={staffState('bartender', zones?.bar)} />
                ))
              ) : (
                <EmptyPost />
              )}
            </View>
            {barCluster ? (
              <View style={styles.barQueue}>
                <TokenCluster cluster={barCluster} pulse={pulse} shimmer={shimmers[2]} showLabel={false} />
              </View>
            ) : null}
          </View>
          {/* Bar top — a thick magenta strip is what the eye reads as "the bar". */}
          <View style={[styles.barTop, { backgroundColor: zoneTint('bar') }]} />
          <Text variant="label" style={[styles.zoneStamp, { color: zoneTint('bar') }]}>
            BAR
          </Text>
        </Pressable>
        {venueChips ? <ObjectStrip names={venueChips.bar} tint={zoneTint('bar')} /> : null}
      </View>

      {belowRoom ? <View style={styles.belowRoom}>{belowRoom}</View> : null}

      {hideFooter ? null : (
        <Text variant="label" muted>
          {floor.hasPlayedNight
            ? `Last night: ${floor.lastGuests}/${floor.capacity} guests`
            : 'Doors closed — open the club tonight.'}
        </Text>
      )}
    </Card>
  );
}

// Dummy reference to silence the unused-var lint while keeping the prop in the
// component signature for future use (kept dim by callers).
const _unusedDotOpacity = (n: number) => n;
void _unusedDotOpacity;

const styles = StyleSheet.create({
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
    minHeight: 140,
    borderRadius: radius.sm,
    overflow: 'hidden',
    backgroundColor: colors.bg,
    justifyContent: 'center',
  },
  // 4x3 tile grid behind the dance floor — reads as a real club floor.
  tiles: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, flexDirection: 'row', flexWrap: 'wrap' },
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
  tokenName: { maxWidth: 56, textAlign: 'center', fontSize: 10 },
  tokenState: { maxWidth: 56, textAlign: 'center', fontSize: 9 },
  crowd: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
  // --- Guest silhouette (head + body) ---
  silhouette: { alignItems: 'center', width: 8 },
  silhouetteHead: {
    width: 4,
    height: 4,
    borderRadius: 2,
    shadowOpacity: 0.6,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 0 },
    marginBottom: 1,
  },
  body: {
    width: 6,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    borderBottomLeftRadius: 1,
    borderBottomRightRadius: 1,
    shadowOpacity: 0.5,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 0 },
  },
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
