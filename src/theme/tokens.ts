/**
 * Design tokens for Club Empire: After Dark.
 * Neon-noir nightclub palette. See docs/ui-style.md.
 * Single source of truth for color/spacing/radius/type used by all components.
 */

export const colors = {
  bg: '#0B0B12',
  surface: '#15151F',
  surfaceAlt: '#1E1E2C',
  border: '#2A2A3C',

  textPrimary: '#F2F2F7',
  textMuted: '#9A9AB0',

  neonMagenta: '#FF2E97',
  neonCyan: '#22E0FF',
  neonViolet: '#9B5CFF',

  success: '#36E29A',
  warning: '#FFC857',
  danger: '#FF5C5C',
} as const;

export type ColorToken = keyof typeof colors;

/** 4-pt spacing scale. */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
} as const;

export const fontSize = {
  display: 32,
  title: 24,
  heading: 18,
  body: 15,
  label: 13,
} as const;

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;
