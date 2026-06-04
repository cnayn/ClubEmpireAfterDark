/**
 * Floor-as-Home venue panel — a flat, stylized top-down club that re-presents
 * EXISTING state only: crowd density, staff as character tokens at their posts,
 * event vibe, and last-night outcomes as floor bubbles (derived from aggregate
 * signals, never per-guest/located data). Pure presentation. No 3D, no real-time,
 * no simulated guests.
 */

import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { Card } from '@/components/Card';
import { Pill } from '@/components/Controls';
import { Text } from '@/components/Text';
import type { BubbleTone, FloorBubble, FloorStaff, FloorView as FloorViewModel, Vibe } from '@/lib/dashboard';
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

/** A placeholder character token: role-colored glyph with initials + name.
 *  Layout/identity test only — not final art. */
function StaffToken({ s, color }: { s: FloorStaff; color: string }) {
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
}: {
  floor: FloorViewModel;
  bubbles?: FloorBubble[];
  /** Optional override (e.g. the live intervention reaction) for the floor's
   *  accent + vibe label, so the room can visibly react to a choice. */
  moodAccent?: string;
  moodLabel?: string;
  title?: string;
  /** Subtle crowd shimmer during the live night — presentation only (no logic,
   *  no simulated agents, no saved state). Off everywhere else. */
  pulse?: boolean;
}) {
  const accent = moodAccent ?? VIBE_COLOR[floor.vibe];
  const dotOpacity = floor.density === 'packed' ? 1 : floor.density === 'busy' ? 0.85 : 0.6;
  const inZone = (z: FloorBubble['zone']) => bubbles.filter((b) => b.zone === z);

  // A gentle opacity breathe applied to crowd dots while the night plays. Pure
  // animation — it never affects guests, outcomes, or any stored state.
  const shimmer = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!pulse) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 0.5, duration: 900, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse, shimmer]);
  const dotColorStyle = { backgroundColor: accent };
  const CrowdDot = pulse ? Animated.View : View;
  const crowdDotStyle = pulse
    ? [styles.dot, dotColorStyle, { opacity: Animated.multiply(shimmer, dotOpacity) }]
    : [styles.dot, dotColorStyle, { opacity: dotOpacity }];

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
          <Text variant="label" muted style={styles.zoneLabel}>
            DOOR
          </Text>
          <View style={styles.posts}>
            {floor.bouncers.length > 0 ? (
              floor.bouncers.map((b) => <StaffToken key={b.id} s={b} color={colors.neonCyan} />)
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
        <View style={styles.crowd}>
          {floor.dots > 0 ? (
            Array.from({ length: floor.dots }).map((_, i) => (
              <CrowdDot key={i} style={crowdDotStyle} />
            ))
          ) : (
            <Text variant="label" muted>
              The floor is quiet.
            </Text>
          )}
        </View>
        {inZone('floor').length > 0 ? (
          <View style={styles.bubbleRow}>{inZone('floor').map((b) => <Bubble key={b.id} b={b} />)}</View>
        ) : null}

        {/* BAR (bottom) + DJ future zone */}
        {inZone('bar').length > 0 ? (
          <View style={styles.bubbleRow}>{inZone('bar').map((b) => <Bubble key={b.id} b={b} />)}</View>
        ) : null}
        <View style={styles.zoneRow}>
          <Text variant="label" muted style={styles.zoneLabel}>
            BAR
          </Text>
          <View style={styles.posts}>
            {floor.bartenders.length > 0 ? (
              floor.bartenders.map((b) => <StaffToken key={b.id} s={b} color={colors.neonViolet} />)
            ) : (
              <EmptyPost />
            )}
          </View>
          <View style={styles.futureZone}>
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
  token: { alignItems: 'center', width: 52, gap: 2 },
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
  tokenName: { maxWidth: 52, textAlign: 'center' },
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
