/**
 * Dashboard Floor View — a flat, stylized top-down club panel that reflects
 * EXISTING state only (crowd density, on-duty staff at posts, event vibe).
 * Pure presentation: it renders a FloorView built by src/lib/dashboard.ts.
 * No real 3D, no simulated guest agents, no new systems.
 */

import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/Card';
import { Pill } from '@/components/Controls';
import { Text } from '@/components/Text';
import type { FloorStaff, FloorView as FloorViewModel, Vibe } from '@/lib/dashboard';
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

function StaffChip({ s, color }: { s: FloorStaff; color: string }) {
  return (
    <View style={[styles.staffChip, { borderColor: color }]} accessibilityLabel={s.name}>
      <Text variant="label" color={color}>
        {s.initials}
      </Text>
    </View>
  );
}

function EmptyPost() {
  return (
    <View style={[styles.staffChip, styles.emptyPost]}>
      <Text variant="label" muted>
        —
      </Text>
    </View>
  );
}

export function FloorView({ floor }: { floor: FloorViewModel }) {
  const accent = VIBE_COLOR[floor.vibe];
  // Crowd intensity scales the dot opacity a touch by density.
  const dotOpacity = floor.density === 'packed' ? 1 : floor.density === 'busy' ? 0.85 : 0.6;

  return (
    <Card title="The Floor">
      <View style={styles.head}>
        <Text variant="label" muted>
          {floor.eventName}
        </Text>
        <Pill label={VIBE_LABEL[floor.vibe]} color={accent} />
      </View>

      <View style={[styles.room, { borderColor: accent }]}>
        {/* DOOR (top) + VIP future zone */}
        <View style={styles.zoneRow}>
          <Text variant="label" muted style={styles.zoneLabel}>
            DOOR
          </Text>
          <View style={styles.posts}>
            {floor.bouncers.length > 0 ? (
              floor.bouncers.map((b) => <StaffChip key={b.id} s={b} color={colors.neonCyan} />)
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

        {/* CROWD (middle) */}
        <View style={styles.crowd}>
          {floor.dots > 0 ? (
            Array.from({ length: floor.dots }).map((_, i) => (
              <View key={i} style={[styles.dot, { backgroundColor: accent, opacity: dotOpacity }]} />
            ))
          ) : (
            <Text variant="label" muted>
              The floor is quiet.
            </Text>
          )}
        </View>

        {/* BAR (bottom) + DJ future zone */}
        <View style={styles.zoneRow}>
          <Text variant="label" muted style={styles.zoneLabel}>
            BAR
          </Text>
          <View style={styles.posts}>
            {floor.bartenders.length > 0 ? (
              floor.bartenders.map((b) => <StaffChip key={b.id} s={b} color={colors.neonViolet} />)
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
    gap: spacing.md,
    minHeight: 200,
    justifyContent: 'space-between',
  },
  zoneRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  zoneLabel: { width: 44, letterSpacing: 1 },
  posts: { flexDirection: 'row', gap: spacing.xs, flex: 1, flexWrap: 'wrap' },
  staffChip: {
    minWidth: 34,
    height: 28,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  emptyPost: { borderColor: colors.border, borderStyle: 'dashed' },
  futureZone: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    opacity: 0.5, // clearly inactive / future-ready
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
});
