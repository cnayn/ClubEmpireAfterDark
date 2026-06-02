/** Typed text primitives that read from theme tokens. */
import { Text as RNText, StyleSheet, TextProps } from 'react-native';

import { colors, fontSize, fontWeight } from '@/theme/tokens';

type Variant = 'display' | 'title' | 'heading' | 'body' | 'label';

interface Props extends TextProps {
  variant?: Variant;
  muted?: boolean;
  color?: string;
}

export function Text({ variant = 'body', muted, color, style, ...rest }: Props) {
  return (
    <RNText
      style={[styles[variant], muted && styles.muted, color ? { color } : null, style]}
      {...rest}
    />
  );
}

const base = { color: colors.textPrimary } as const;

const styles = StyleSheet.create({
  display: { ...base, fontSize: fontSize.display, fontWeight: fontWeight.bold, letterSpacing: -0.5 },
  title: { ...base, fontSize: fontSize.title, fontWeight: fontWeight.bold },
  heading: { ...base, fontSize: fontSize.heading, fontWeight: fontWeight.semibold },
  body: { ...base, fontSize: fontSize.body, fontWeight: fontWeight.regular },
  label: { ...base, fontSize: fontSize.label, fontWeight: fontWeight.medium },
  muted: { color: colors.textMuted },
});
