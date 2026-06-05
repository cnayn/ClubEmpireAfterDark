/**
 * Floor Identity Pass v1 — the club floor as the main game surface.
 *
 * A stylized, layered top-down nightclub: a back wall (DOOR / VIP), a middle
 * strip (BATHROOM · DJ BOOTH · STAFF AREA), the dance-floor hero, then the BAR
 * across the front. Zones glow with live pressure; guest CLUSTERS appear per
 * zone (bar queue, door line, dance crowd, bathroom queue, returning regulars),
 * each with a mood-colored token style. Staff markers tint by character
 * (Caramel reads calm, John reads hot). Pure presentation — no per-guest sim,
 * no pathfinding, no saved positions, no resolver/economy involvement. Depth is
 * faked with layered panels, subtle perspective, and a neon floor grid; crowd
 * "movement" is a deterministic shimmer (UI only).
 */

import { ReactNode, useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { Card } from '@/components/Card';
import { Pill } from '@/components/Controls';
import { Text } from '@/components/Text';
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

function EmptyPost({ label = 'empty' }: { label?: string }) {
  return (
    <View style={styles.token}>
      <View style={[styles.avatar, styles.emptyAvatar]}>
        <Text variant="label" muted>
          —
        </Text>
      </View>
      <Text variant="label" muted style={styles.tokenName}>
        {label}
      </Text>
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

/** Small muted chips naming equipped furniture in a zone. */
function FurnitureChips({ names }: { names: string[] }) {
  if (names.length === 0) return null;
  return (
    <View style={styles.furnRow}>
      {names.map((n) => (
        <View key={n} style={styles.furnChip}>
          <Text variant="label" muted>
            {n}
          </Text>
        </View>
      ))}
    </View>
  );
}

/** Mood-driven token shape — height + opacity carry the feeling, the color
 *  carries the mood. Deterministic. */
function tokenStyle(mood: GuestMood): { height: number; opacity: number } {
  switch (mood) {
    case 'dancing':
      return { height: 16, opacity: 1 };
    case 'impressed':
      return { height: 15, opacity: 0.95 };
    case 'happy':
      return { height: 14, opacity: 0.9 };
    case 'waiting':
      return { height: 12, opacity: 0.65 };
    case 'confused':
      return { height: 13, opacity: 0.8 };
    case 'tired':
      return { height: 9, opacity: 0.75 };
    case 'angry':
      return { height: 14, opacity: 1 };
  }
}

/** A row of mood-tinted tokens for a single cluster, with a tiny mood word
 *  underneath. Uses the shared shimmer when pulsing — the cluster feels alive
 *  without per-token state. */
function TokenCluster({
  cluster,
  pulse,
  shimmer,
}: {
  cluster: GuestCluster;
  pulse: boolean;
  shimmer: Animated.Value;
}) {
  const color = MOOD_COLOR[cluster.mood];
  const ts = tokenStyle(cluster.mood);
  return (
    <View style={styles.cluster}>
      <View style={styles.clusterRow}>
        {Array.from({ length: cluster.count }).map((_, i) => {
          const base = (
            <View
              key={i}
              style={[
                styles.token2d,
                {
                  height: ts.height,
                  backgroundColor: color,
                  opacity: ts.opacity,
                  shadowColor: color,
                },
              ]}
            />
          );
          if (!pulse || cluster.mood === 'tired' || cluster.mood === 'waiting') return base;
          const opacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [Math.max(0.5, ts.opacity * 0.6), ts.opacity] });
          const translateY = shimmer.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, cluster.mood === 'dancing' ? -3 : -1.5, 0] });
          return (
            <Animated.View
              key={i}
              style={[
                styles.token2d,
                {
                  height: ts.height,
                  backgroundColor: color,
                  opacity,
                  shadowColor: color,
                  transform: [{ translateY }],
                },
              ]}
            />
          );
        })}
      </View>
      <Text variant="label" color={color} style={styles.clusterLabel}>
        {cluster.label}
      </Text>
    </View>
  );
}

/** A tinted, glowing zone panel. Used for back-row (DOOR/VIP) and front-row
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
}: {
  label: string;
  tint: string;
  hint?: string;
  glow?: number;
  highlighted?: boolean;
}) {
  return (
    <View
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
    </View>
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
  /** Guest clusters per zone (Floor Identity Pass). When provided, the room
   *  renders them in addition to the fallback floor-crowd dots. */
  clusters?: GuestCluster[];
  /** Optional pressure reads (0..1) per zone — bar / door / bathroom / energy.
   *  Used to scale zone glow + give the bathroom & DJ markers something to react
   *  to. Live night passes these; dashboard can omit. */
  pressures?: { bar: number; door: number; bathroom: number; energy: number; crowd: number };
}) {
  const accent = moodAccent ?? VIBE_COLOR[floor.vibe];
  const dotOpacity = floor.density === 'packed' ? 1 : floor.density === 'busy' ? 0.85 : 0.6;
  const inZone = (z: FloorBubble['zone']) => bubbles.filter((b) => b.zone === z);

  // Three staggered shimmer loops give the crowd a lively, non-uniform drift
  // without per-token state or any simulated agents. Deterministic UI animation.
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

  // Glow strength per zone (0..1). Highest of (live pressure, zone-warn fallback).
  const glow = (key: ZoneKey | 'bath' | 'dj'): number => {
    if (key === 'bar') return pressures?.bar ?? (zones?.bar === 'warn' ? 0.6 : zones?.bar === 'busy' ? 0.35 : 0);
    if (key === 'door') return pressures?.door ?? (zones?.door === 'warn' ? 0.6 : zones?.door === 'busy' ? 0.35 : 0);
    if (key === 'floor') return Math.max(pressures?.energy ?? 0, pressures?.crowd ?? 0);
    if (key === 'bath') return pressures?.bathroom ?? 0;
    return djLabel ? 0.4 : 0; // dj: a low baseline glow when an act is booked
  };

  const liveDots = Math.max(0, Math.round(floor.dots * Math.max(0, Math.min(1, liveScale))));

  /** Fallback floor crowd (when no `floor` cluster is provided). */
  const renderFallbackDots = () => {
    if (liveDots <= 0) {
      return (
        <Text variant="label" muted>
          The floor is quiet.
        </Text>
      );
    }
    return Array.from({ length: liveDots }).map((_, i) => {
      if (!pulse) {
        return <View key={i} style={[styles.dot, { backgroundColor: accent, opacity: dotOpacity }]} />;
      }
      const v = shimmers[i % shimmers.length];
      const opacity = v.interpolate({ inputRange: [0, 1], outputRange: [Math.max(0.3, dotOpacity * 0.45), dotOpacity] });
      const translateY = v.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, -2.5, 0] });
      return <Animated.View key={i} style={[styles.dot, { backgroundColor: accent, opacity, transform: [{ translateY }] }]} />;
    });
  };

  const floorTint = zoneTint('floor');
  const djTint = djLabel ? colors.neonMagenta : colors.textMuted;
  const bathTint = pressures && pressures.bathroom >= 0.55 ? colors.warning : colors.textMuted;
  const staffAreaTint = colors.neonViolet;

  // Total staff on duty across both posts — used to label the Staff Area.
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

        {/* DOOR — back of the room (inset for depth), with the VIP placeholder. */}
        <ZonePanel label="DOOR · ENTRANCE" tint={zoneTint('door')} inset glow={glow('door')}>
          <View style={styles.posts}>
            {floor.bouncers.length > 0 ? (
              floor.bouncers.map((b) => (
                <StaffToken key={b.id} s={b} role="bouncer" color={zoneTint('door')} state={staffState('bouncer', zones?.door)} />
              ))
            ) : (
              <EmptyPost label="no door" />
            )}
            {doorCluster ? <TokenCluster cluster={doorCluster} pulse={pulse} shimmer={shimmers[0]} /> : null}
          </View>
          <View style={styles.cornerChip}>
            <Text variant="label" muted>
              VIP — locked
            </Text>
          </View>
        </ZonePanel>
        {venueChips ? <FurnitureChips names={venueChips.door} /> : null}
        {inZone('door').length > 0 ? (
          <View style={styles.bubbleRow}>{inZone('door').map((b) => <Bubble key={b.id} b={b} />)}</View>
        ) : null}

        {/* MID STRIP — Bathroom · DJ Booth · Staff Area. Compact markers; the
            DJ booth pulses when a real act is booked, the bathroom warns under
            strain, the staff area shows how many crew are working. */}
        <View style={styles.midRow}>
          <MiniZone
            label="BATHROOM"
            tint={bathTint}
            hint={bathCluster ? `${bathCluster.label}` : 'clear'}
            glow={glow('bath')}
            highlighted={!!bathCluster}
          />
          <MiniZone
            label={djLabel ? `DJ · ${djLabel}` : 'DJ BOOTH'}
            tint={djTint}
            hint={djLabel ? '♪ on the decks' : 'soon'}
            glow={glow('dj')}
            highlighted={flashZone === 'floor'}
          />
          <MiniZone
            label="STAFF"
            tint={staffAreaTint}
            hint={onDutyCount > 0 ? `${onDutyCount} on duty` : 'nobody on'}
          />
        </View>
        {bathCluster ? (
          <View style={styles.midClusters}>
            <TokenCluster cluster={bathCluster} pulse={pulse} shimmer={shimmers[1]} />
          </View>
        ) : null}

        {/* DANCE FLOOR — the hero. Subtle skew + a glowing border carry depth. */}
        <View
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
              DANCE FLOOR
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
            <View style={styles.gridLines} pointerEvents="none">
              {[0, 1, 2, 3, 4].map((i) => (
                <View key={i} style={[styles.gridLine, { opacity: 0.05 + i * 0.04, backgroundColor: floorTint }]} />
              ))}
            </View>
            <View style={styles.crowd}>
              {floorCluster ? (
                <TokenCluster cluster={floorCluster} pulse={pulse} shimmer={shimmers[0]} />
              ) : (
                renderFallbackDots()
              )}
            </View>
          </View>

          {inZone('floor').length > 0 ? (
            <View style={styles.bubbleRow}>{inZone('floor').map((b) => <Bubble key={b.id} b={b} />)}</View>
          ) : null}
        </View>

        {/* BAR — front of the room, with the bartender(s) + the queue cluster. */}
        {inZone('bar').length > 0 ? (
          <View style={styles.bubbleRow}>{inZone('bar').map((b) => <Bubble key={b.id} b={b} />)}</View>
        ) : null}
        <ZonePanel label="BAR" tint={zoneTint('bar')} glow={glow('bar')}>
          <View style={styles.posts}>
            {floor.bartenders.length > 0 ? (
              floor.bartenders.map((b) => (
                <StaffToken key={b.id} s={b} role="bartender" color={zoneTint('bar')} state={staffState('bartender', zones?.bar)} />
              ))
            ) : (
              <EmptyPost label="no bar" />
            )}
            {barCluster ? <TokenCluster cluster={barCluster} pulse={pulse} shimmer={shimmers[2]} /> : null}
          </View>
        </ZonePanel>
        {venueChips ? <FurnitureChips names={venueChips.bar} /> : null}
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
  // Zone panels (door / bar) — tinted, glowing, layered for depth.
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
  zoneLabel: { letterSpacing: 1 },
  posts: { flexDirection: 'row', gap: spacing.sm, flex: 1, flexWrap: 'wrap', alignItems: 'flex-end' },
  cornerChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    opacity: 0.65,
    alignSelf: 'flex-start',
  },
  // Middle row — Bathroom · DJ · Staff (compact markers under the back wall).
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
    minHeight: 120,
    borderRadius: radius.sm,
    overflow: 'hidden',
    backgroundColor: colors.bg,
    justifyContent: 'center',
  },
  gridLines: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'space-evenly', paddingVertical: spacing.sm },
  gridLine: { height: 1 },
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
  tokenName: { maxWidth: 56, textAlign: 'center' },
  tokenState: { maxWidth: 56, textAlign: 'center', fontSize: 9 },
  crowd: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
  // Mood-tinted guest token (cluster member).
  token2d: {
    width: 6,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderBottomLeftRadius: 1,
    borderBottomRightRadius: 1,
    shadowOpacity: 0.6,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 0 },
  },
  // Cluster wrapper: tokens above, mood word below.
  cluster: { alignItems: 'center', gap: 2 },
  clusterRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 2 },
  clusterLabel: { fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.5 },
  // Fallback dance dot (when no cluster passed).
  dot: { width: 7, height: 14, borderTopLeftRadius: 4, borderTopRightRadius: 4, borderBottomLeftRadius: 1, borderBottomRightRadius: 1 },
  bubbleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, justifyContent: 'center' },
  furnRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, justifyContent: 'center' },
  furnChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 1,
    borderRadius: radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
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
