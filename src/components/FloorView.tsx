/**
 * Floor-as-Home venue panel — a flat, stylized top-down club that re-presents
 * EXISTING state only: crowd density, staff as character tokens at their posts,
 * event vibe, zone pressure, and last-night outcomes as floor bubbles. Pure
 * presentation. No 3D, no real-time sim, no simulated guests, no saved positions.
 * The crowd "movement" is a deterministic opacity/drift shimmer (UI only).
 */

import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { Card } from '@/components/Card';
import { Pill } from '@/components/Controls';
import { Text } from '@/components/Text';
import type { BubbleTone, FloorBubble, FloorStaff, FloorView as FloorViewModel, Vibe } from '@/lib/dashboard';
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
};

const zoneColor = (tone: ZoneTone | undefined, accent: string): string =>
  tone === 'warn' ? colors.warning : tone === 'busy' ? accent : colors.textMuted;

/** Short marker state word for a post, from its zone pressure. */
function staffState(role: 'bartender' | 'bouncer', tone: ZoneTone | undefined): string {
  if (!tone) return 'on duty';
  if (role === 'bartender') return tone === 'warn' ? 'slammed' : tone === 'busy' ? 'working' : 'steady';
  return tone === 'warn' ? 'on alert' : tone === 'busy' ? 'watching' : 'calm';
}

function StaffToken({ s, color, state }: { s: FloorStaff; color: string; state?: string }) {
  return (
    <View style={styles.token} accessibilityLabel={s.name}>
      <View style={[styles.avatar, { borderColor: color }]}>
        <Text variant="label" color={color}>
          {s.initials}
        </Text>
      </View>
      <Text variant="label" muted numberOfLines={1} style={styles.tokenName}>
        {s.name}
      </Text>
      {state ? (
        <Text variant="label" color={color} numberOfLines={1} style={styles.tokenState}>
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
      <Text variant="label" muted style={styles.tokenName}>
        empty
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

export function FloorView({
  floor,
  bubbles = [],
  moodAccent,
  moodLabel,
  title = 'The Floor',
  pulse = false,
  zones,
  flashZone,
}: {
  floor: FloorViewModel;
  bubbles?: FloorBubble[];
  moodAccent?: string;
  moodLabel?: string;
  title?: string;
  /** Subtle crowd movement during the live night — presentation only. */
  pulse?: boolean;
  /** Per-zone pressure states (door/bar/floor) to glow the venue. */
  zones?: NightZones;
  /** A zone to briefly highlight after a boss action (door/bar/floor). */
  flashZone?: ZoneKey;
}) {
  const accent = moodAccent ?? VIBE_COLOR[floor.vibe];
  const dotOpacity = floor.density === 'packed' ? 1 : floor.density === 'busy' ? 0.85 : 0.6;
  const inZone = (z: FloorBubble['zone']) => bubbles.filter((b) => b.zone === z);

  // Three staggered shimmer loops give the crowd a lively, non-uniform drift
  // without per-dot state or any simulated agents. Deterministic UI animation.
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
    if (flashZone === key) return accent; // highlight the zone the boss just touched
    return zoneColor(zones?.[key], accent);
  };

  const renderDots = () => {
    if (floor.dots <= 0) {
      return (
        <Text variant="label" muted>
          The floor is quiet.
        </Text>
      );
    }
    return Array.from({ length: floor.dots }).map((_, i) => {
      if (!pulse) {
        return <View key={i} style={[styles.dot, { backgroundColor: accent, opacity: dotOpacity }]} />;
      }
      const v = shimmers[i % shimmers.length];
      const opacity = v.interpolate({ inputRange: [0, 1], outputRange: [Math.max(0.3, dotOpacity * 0.45), dotOpacity] });
      const translateY = v.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, -2.5, 0] });
      return <Animated.View key={i} style={[styles.dot, { backgroundColor: accent, opacity, transform: [{ translateY }] }]} />;
    });
  };

  return (
    <Card title={title}>
      <View style={styles.head}>
        <Text variant="label" muted>
          {floor.eventName}
        </Text>
        <Pill label={moodLabel ?? VIBE_LABEL[floor.vibe]} color={accent} />
      </View>

      <View style={[styles.room, { borderColor: accent }]}>
        {/* DOOR (top) + VIP future zone */}
        <View style={styles.zoneRow}>
          <Text variant="label" style={[styles.zoneLabel, { color: zoneTint('door') }]}>
            DOOR
          </Text>
          <View style={styles.posts}>
            {floor.bouncers.length > 0 ? (
              floor.bouncers.map((b) => (
                <StaffToken key={b.id} s={b} color={zoneTint('door')} state={staffState('bouncer', zones?.door)} />
              ))
            ) : (
              <EmptyPost />
            )}
          </View>
          <View style={styles.futureZone}>
            <Text variant="label" muted>
              VIP — reserved
            </Text>
          </View>
        </View>
        {inZone('door').length > 0 ? (
          <View style={styles.bubbleRow}>{inZone('door').map((b) => <Bubble key={b.id} b={b} />)}</View>
        ) : null}

        {/* CROWD (middle) + floor-level bubbles */}
        <View style={styles.crowd}>{renderDots()}</View>
        {inZone('floor').length > 0 ? (
          <View style={styles.bubbleRow}>{inZone('floor').map((b) => <Bubble key={b.id} b={b} />)}</View>
        ) : null}

        {/* BAR (bottom) + DJ future zone */}
        {inZone('bar').length > 0 ? (
          <View style={styles.bubbleRow}>{inZone('bar').map((b) => <Bubble key={b.id} b={b} />)}</View>
        ) : null}
        <View style={styles.zoneRow}>
          <Text variant="label" style={[styles.zoneLabel, { color: zoneTint('bar') }]}>
            BAR
          </Text>
          <View style={styles.posts}>
            {floor.bartenders.length > 0 ? (
              floor.bartenders.map((b) => (
                <StaffToken key={b.id} s={b} color={zoneTint('bar')} state={staffState('bartender', zones?.bar)} />
              ))
            ) : (
              <EmptyPost />
            )}
          </View>
          <View style={[styles.futureZone, flashZone === 'floor' && { borderColor: accent, opacity: 0.9 }]}>
            <Text variant="label" muted>
              DJ Booth — soon
            </Text>
          </View>
        </View>
      </View>

      <Text variant="label" muted>
        {floor.hasPlayedNight
          ? `Last night: ${floor.lastGuests}/${floor.capacity} guests`
          : 'Doors closed — open the club tonight.'}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  room: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.sm,
    minHeight: 240,
    justifyContent: 'space-between',
  },
  zoneRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  zoneLabel: { width: 44, letterSpacing: 1 },
  posts: { flexDirection: 'row', gap: spacing.sm, flex: 1, flexWrap: 'wrap' },
  token: { alignItems: 'center', width: 56, gap: 2 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  emptyAvatar: { borderColor: colors.border, borderStyle: 'dashed' },
  tokenName: { maxWidth: 56, textAlign: 'center' },
  tokenState: { maxWidth: 56, textAlign: 'center', fontSize: 9 },
  futureZone: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    opacity: 0.5,
  },
  crowd: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: spacing.sm,
  },
  dot: { width: 10, height: 10, borderRadius: radius.pill },
  bubbleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, justifyContent: 'center' },
  bubble: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
    borderWidth: 1,
    backgroundColor: colors.surface,
  },
});
