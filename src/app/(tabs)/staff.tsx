import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Pill } from '@/components/Controls';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import {
  canFireStaff,
  CANDIDATE_POOL,
  hireCost,
  minViableNightCost,
  ROLE_LABEL,
  strengthLabel,
  TRAIT_LABEL,
} from '@/domain/staff';
import { getCharacter, hasHiddenTrait } from '@/domain/characters';
import type { StaffMember, StaffRole } from '@/domain/types';
import { money } from '@/lib/format';
import { useGameStore } from '@/state/store';
import { colors, radius, spacing } from '@/theme/tokens';

const ROLE_PLURAL: Record<StaffRole, string> = { bartender: 'Bartenders', bouncer: 'Bouncers' };
const roleAccent = (role: StaffRole) => (role === 'bouncer' ? colors.neonCyan : colors.neonViolet);

/** A short, safe one-liner — prefers the character profile, then the staffer's
 *  own bio, then a generic role line. Never reveals hidden traits. */
function flavorLine(m: StaffMember): string {
  if (m.description) return m.description;
  return m.role === 'bartender'
    ? 'Works the bar and keeps the drinks moving.'
    : 'Holds the door and keeps the room calm.';
}

/** Coarse skill read + the player-facing visible trait (flavor name if we have a
 *  character profile, otherwise the mechanical trait label). */
function strengthLine(m: StaffMember, visibleTrait?: string): string {
  const trait = visibleTrait
    ? ` · ${visibleTrait}`
    : m.visibleTrait !== 'none'
      ? ` · ${TRAIT_LABEL[m.visibleTrait]}`
      : '';
  return `${strengthLabel(m.skill)}${trait}`;
}

function CharacterCard({
  member,
  statusLabel,
  statusColor,
  actionLabel,
  actionAccent,
  actionDisabled,
  actionVariant,
  onAction,
}: {
  member: StaffMember;
  statusLabel: string;
  statusColor: string;
  actionLabel: string;
  actionAccent?: string;
  actionDisabled?: boolean;
  actionVariant?: 'primary' | 'secondary';
  onAction: () => void;
}) {
  const accent = roleAccent(member.role);
  const profile = getCharacter(member.id);
  const displayName = profile?.displayName ?? member.name;
  const oneLiner = profile?.oneSentence ?? flavorLine(member);
  const dialogue = profile?.dialogueLines[0];
  const locked = hasHiddenTrait(profile);
  return (
    <Card accent={accent}>
      <View style={styles.cardTop}>
        <View style={[styles.avatar, { borderColor: accent }]}>
          <Text variant="heading" color={accent}>
            {displayName.slice(0, 2).toUpperCase()}
          </Text>
        </View>
        <View style={styles.cardBody}>
          <View style={styles.cardHead}>
            <Text variant="heading" style={{ flex: 1 }} numberOfLines={1}>
              {displayName}
              {profile?.nickname ? <Text variant="heading" color={accent}>{` “${profile.nickname}”`}</Text> : null}
            </Text>
            <Pill label={statusLabel} color={statusColor} />
          </View>
          {/* Role badge + archetype */}
          <Text variant="label" color={accent} numberOfLines={1}>
            {ROLE_LABEL[member.role]}
            {profile?.archetype ? ` · ${profile.archetype}` : ''}
          </Text>
          {/* Skill read + visible trait + wage */}
          <Text variant="label" muted>
            {strengthLine(member, profile?.visibleTrait)} · {money(member.salary)}/night
          </Text>
          <Text variant="body" muted style={styles.flavor}>
            {oneLiner}
          </Text>
        </View>
      </View>

      {dialogue ? (
        <View style={[styles.bubble, { borderLeftColor: accent }]}>
          <Text variant="label" muted style={styles.bubbleText}>
            {dialogue}
          </Text>
        </View>
      ) : null}

      {locked ? (
        <Text variant="label" muted style={styles.locked}>
          🔒 Hidden side — locked (you’ll learn it on the floor)
        </Text>
      ) : null}

      <Button
        label={actionLabel}
        variant={actionVariant ?? 'secondary'}
        accent={actionAccent}
        disabled={actionDisabled}
        onPress={onAction}
      />
    </Card>
  );
}

function RoleHeading({ title, accent, count }: { title: string; accent: string; count: number }) {
  return (
    <View style={styles.roleHeading}>
      <Text variant="heading" color={accent}>
        {title}
      </Text>
      <Text variant="label" muted>
        {count}
      </Text>
    </View>
  );
}

export default function StaffScreen() {
  const club = useGameStore((s) => s.club);
  const hireStaff = useGameStore((s) => s.hireStaff);
  const fireStaff = useGameStore((s) => s.fireStaff);

  if (!club) {
    router.replace('/');
    return null;
  }

  const reserve = minViableNightCost(club.staff);
  const candidates = CANDIDATE_POOL.filter((c) => !club.staff.some((m) => m.id === c.id));
  const byRole = (list: StaffMember[], role: StaffRole) => list.filter((m) => m.role === role);
  const ROLES: StaffRole[] = ['bartender', 'bouncer'];

  return (
    <Screen
      footer={
        <Button label="Back to Dashboard" variant="secondary" onPress={() => router.replace('/dashboard')} />
      }
    >
      <View style={styles.header}>
        <Text variant="title">Your Crew</Text>
        <Pill label={money(club.cash)} color={club.cash < 0 ? colors.danger : colors.success} />
      </View>
      <Text variant="label" muted>
        Everyone here is on your roster. Set who works tonight in Day Prep; wages are paid after the
        night. Firing removes someone for good.
      </Text>

      {ROLES.map((role) => {
        const crew = byRole(club.staff, role);
        return (
          <View key={`hired-${role}`} style={styles.section}>
            <RoleHeading title={ROLE_PLURAL[role]} accent={roleAccent(role)} count={crew.length} />
            {crew.length === 0 ? (
              <Text variant="label" muted>
                No {ROLE_PLURAL[role].toLowerCase()} on the roster yet.
              </Text>
            ) : (
              crew.map((m) => {
                const fireable = canFireStaff(club.staff, m.id);
                return (
                  <CharacterCard
                    key={m.id}
                    member={m}
                    statusLabel="ON ROSTER"
                    statusColor={colors.success}
                    actionLabel={fireable ? 'Let go' : 'Last bartender — kept'}
                    actionDisabled={!fireable}
                    onAction={() => fireStaff(m.id)}
                  />
                );
              })
            )}
          </View>
        );
      })}

      <Text variant="heading" style={styles.forHire}>
        For Hire
      </Text>
      <Text variant="label" muted>
        Hiring adds someone for a one-time fee; you then pay their wage only on nights they work.
      </Text>

      {ROLES.map((role) => {
        const pool = byRole(candidates, role);
        return (
          <View key={`hire-${role}`} style={styles.section}>
            <RoleHeading title={`${ROLE_PLURAL[role]} for hire`} accent={roleAccent(role)} count={pool.length} />
            {pool.length === 0 ? (
              <Text variant="label" muted>
                No {ROLE_PLURAL[role].toLowerCase()} available right now.
              </Text>
            ) : (
              pool.map((c) => {
                const fee = hireCost(c);
                const canHire = club.cash - fee >= reserve;
                return (
                  <CharacterCard
                    key={c.id}
                    member={c}
                    statusLabel="FOR HIRE"
                    statusColor={roleAccent(c.role)}
                    actionLabel={`Hire — ${money(fee)} fee`}
                    actionAccent={colors.neonMagenta}
                    actionVariant="primary"
                    actionDisabled={!canHire}
                    onAction={() => hireStaff(c.id)}
                  />
                );
              })
            )}
          </View>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  section: { gap: spacing.sm, marginTop: spacing.sm },
  roleHeading: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm },
  forHire: { marginTop: spacing.lg },
  cardTop: { flexDirection: 'row', gap: spacing.md },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
  },
  cardBody: { flex: 1, gap: 2 },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  flavor: { lineHeight: 20, marginTop: 2 },
  bubble: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    borderLeftWidth: 3,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  bubbleText: { fontStyle: 'italic', lineHeight: 18 },
  locked: { marginTop: 2 },
});
