/** Composable input controls: SegmentedControl, Toggle, Stepper, Pill, ResultRow. */
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/theme/tokens';
import { Text } from './Text';

// --- SegmentedControl ---------------------------------------------------------
interface Segment<T extends string | number> {
  value: T;
  label: string;
}
interface SegmentedProps<T extends string | number> {
  label?: string;
  value: T;
  options: Segment<T>[];
  onChange: (value: T) => void;
  accent?: string;
}
export function SegmentedControl<T extends string | number>({
  label,
  value,
  options,
  onChange,
  accent = colors.neonCyan,
}: SegmentedProps<T>) {
  return (
    <View style={styles.field}>
      {label ? (
        <Text variant="label" muted>
          {label.toUpperCase()}
        </Text>
      ) : null}
      <View style={styles.segments}>
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <Pressable
              key={String(opt.value)}
              onPress={() => onChange(opt.value)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={[styles.segment, active && { backgroundColor: accent, borderColor: accent }]}
            >
              <Text variant="label" color={active ? colors.bg : colors.textPrimary}>
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

// --- Toggle -------------------------------------------------------------------
interface ToggleProps {
  label: string;
  description?: string;
  value: boolean;
  onChange: (value: boolean) => void;
  accent?: string;
}
export function Toggle({ label, description, value, onChange, accent = colors.neonViolet }: ToggleProps) {
  return (
    <Pressable
      onPress={() => onChange(!value)}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      style={styles.toggleRow}
    >
      <View style={styles.flex}>
        <Text variant="body">{label}</Text>
        {description ? (
          <Text variant="label" muted>
            {description}
          </Text>
        ) : null}
      </View>
      <View style={[styles.track, value && { backgroundColor: accent }]}>
        <View style={[styles.knob, value && styles.knobOn]} />
      </View>
    </Pressable>
  );
}

// --- Stepper ------------------------------------------------------------------
interface StepperProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
}
export function Stepper({ label, value, min = 0, max = 99, onChange }: StepperProps) {
  const set = (n: number) => onChange(Math.max(min, Math.min(max, n)));
  return (
    <View style={styles.toggleRow}>
      <Text variant="body" style={styles.flex}>
        {label}
      </Text>
      <View style={styles.stepper}>
        <Pressable
          onPress={() => set(value - 1)}
          accessibilityRole="button"
          accessibilityLabel={`decrease ${label}`}
          style={styles.stepBtn}
          disabled={value <= min}
        >
          <Text variant="heading" color={value <= min ? colors.textMuted : colors.textPrimary}>
            −
          </Text>
        </Pressable>
        <Text variant="heading" style={styles.stepValue}>
          {value}
        </Text>
        <Pressable
          onPress={() => set(value + 1)}
          accessibilityRole="button"
          accessibilityLabel={`increase ${label}`}
          style={styles.stepBtn}
          disabled={value >= max}
        >
          <Text variant="heading" color={value >= max ? colors.textMuted : colors.textPrimary}>
            +
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

// --- Pill ---------------------------------------------------------------------
export function Pill({ label, color = colors.neonMagenta }: { label: string; color?: string }) {
  return (
    <View style={[styles.pill, { borderColor: color }]}>
      <Text variant="label" color={color}>
        {label}
      </Text>
    </View>
  );
}

// --- ResultRow ----------------------------------------------------------------
export function ResultRow({
  label,
  value,
  valueColor,
  strong,
}: {
  label: string;
  value: string;
  valueColor?: string;
  strong?: boolean;
}) {
  return (
    <View style={styles.resultRow}>
      <Text variant="body" muted={!strong}>
        {label}
      </Text>
      <Text variant={strong ? 'heading' : 'body'} color={valueColor}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: spacing.sm },
  flex: { flex: 1 },
  segments: { flexDirection: 'row', gap: spacing.sm },
  segment: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  track: {
    width: 48,
    height: 28,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 2,
    justifyContent: 'center',
  },
  knob: {
    width: 22,
    height: 22,
    borderRadius: radius.pill,
    backgroundColor: colors.textPrimary,
    alignSelf: 'flex-start',
  },
  knobOn: { alignSelf: 'flex-end' },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  stepBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepValue: { minWidth: 24, textAlign: 'center' },
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
});
