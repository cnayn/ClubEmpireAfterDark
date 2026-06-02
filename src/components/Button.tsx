/** Primary / secondary buttons with a neon-accented primary CTA. */
import { ActivityIndicator, Pressable, StyleSheet, ViewStyle } from 'react-native';

import { colors, radius, spacing } from '@/theme/tokens';
import { Text } from './Text';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  loading?: boolean;
  accent?: string;
  style?: ViewStyle;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  accent = colors.neonMagenta,
  style,
}: Props) {
  const isPrimary = variant === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        isPrimary
          ? { backgroundColor: accent, shadowColor: accent }
          : { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border },
        isPrimary && styles.glow,
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? colors.bg : colors.textPrimary} />
      ) : (
        <Text
          variant="heading"
          color={isPrimary ? colors.bg : colors.textPrimary}
          style={styles.label}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  glow: {
    shadowOpacity: 0.5,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  disabled: { opacity: 0.4 },
  pressed: { opacity: 0.85 },
  label: { fontWeight: '700' },
});
