/** Display formatting helpers. */
import { colors } from '@/theme/tokens';

export function money(n: number): string {
  const sign = n < 0 ? '-' : '';
  return `${sign}$${Math.abs(Math.round(n)).toLocaleString('en-US')}`;
}

/** Money with an explicit + for positives (e.g. net / deltas). */
export function signedMoney(n: number): string {
  return n > 0 ? `+${money(n)}` : money(n);
}

export function signed(n: number): string {
  return n > 0 ? `+${n}` : `${n}`;
}

/** Color for a profit/loss value. */
export function moneyColor(n: number): string {
  if (n > 0) return colors.success;
  if (n < 0) return colors.danger;
  return colors.textPrimary;
}
