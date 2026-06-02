/** Titled container card and a label/value stat card. */
import { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

import { colors, radius, spacing } from '@/theme/tokens';
import { Text } from './Text';

interface CardProps {
  title?: string;
  children: ReactNode;
  accent?: string;
  style?: ViewStyle;
}

export function Card({ title, children, accent, style }: CardProps) {
  return (
    <View style={[styles.card, accent ? { borderColor: accent } : null, style]}>
      {title ? (
        <Text variant="label" muted style={styles.cardTitle}>
          {title.toUpperCase()}
        </Text>
      ) : null}
      {children}
    </View>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  delta?: string;
  deltaColor?: string;
  accent?: string;
}

export function StatCard({ label, value, delta, deltaColor, accent }: StatCardProps) {
  return (
    <View style={[styles.stat, accent ? { borderColor: accent } : null]}>
      <Text variant="label" muted>
        {label.toUpperCase()}
      </Text>
      <Text variant="title" color={accent}>
        {value}
      </Text>
      {delta ? (
        <Text variant="label" color={deltaColor ?? colors.textMuted}>
          {delta}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  cardTitle: { letterSpacing: 1 },
  stat: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.xs,
  },
});
