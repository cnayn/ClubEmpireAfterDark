import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Pill } from '@/components/Controls';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { buildInbox, CATEGORY_LABEL, type PhoneCategory, type PhoneMessage } from '@/lib/phone';
import { useGameStore } from '@/state/store';
import { colors, radius, spacing } from '@/theme/tokens';

const CATEGORY_COLOR: Record<PhoneCategory, string> = {
  crew: colors.neonViolet,
  guest: colors.neonCyan,
  booking: colors.success,
  supplier: colors.warning,
  market: colors.neonMagenta,
  warning: colors.danger,
};

export default function PhoneScreen() {
  const club = useGameStore((s) => s.club);
  const lastResult = useGameStore((s) => s.lastResult);
  // Read-state is UI-only (not persisted) — Phone v1 derives the inbox each visit.
  const [read, setRead] = useState<Set<string>>(() => new Set());

  if (!club) {
    return (
      <Screen>
        <Text>No club loaded.</Text>
        <Button label="Go Home" variant="secondary" onPress={() => router.replace('/')} />
      </Screen>
    );
  }

  const inbox = buildInbox(club, lastResult);
  const markRead = (id: string) => setRead((s) => (s.has(id) ? s : new Set(s).add(id)));

  return (
    <Screen footer={<Button label="Back to the Club" variant="secondary" onPress={() => router.back()} />}>
      <Text variant="title">Phone</Text>
      <Text variant="label" muted style={{ marginBottom: spacing.sm }}>
        {inbox.length} message{inbox.length === 1 ? '' : 's'} — the city talking to you between nights.
      </Text>

      {inbox.length === 0 ? (
        <Card>
          <Text variant="body" muted>
            Quiet phone tonight. Run a night and the texts start coming.
          </Text>
        </Card>
      ) : null}

      {inbox.map((m: PhoneMessage) => {
        const isRead = read.has(m.id);
        const color = CATEGORY_COLOR[m.category];
        return (
          <Pressable key={m.id} onPress={() => markRead(m.id)} accessibilityRole="button">
            <Card accent={isRead ? undefined : color}>
              <View style={styles.head}>
                <View style={styles.senderRow}>
                  {!isRead ? <View style={[styles.unread, { backgroundColor: color }]} /> : null}
                  <Text variant="heading">{m.sender}</Text>
                </View>
                <Pill label={CATEGORY_LABEL[m.category]} color={color} />
              </View>
              <Text variant="body" color={color}>
                {m.title}
              </Text>
              <Text variant="body" muted style={styles.body}>
                {m.body}
              </Text>
              {m.actionLabel && m.route ? (
                <Button
                  label={m.actionLabel}
                  variant="secondary"
                  onPress={() => {
                    markRead(m.id);
                    router.push(m.route!);
                  }}
                />
              ) : null}
            </Card>
          </Pressable>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  senderRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
  unread: { width: 8, height: 8, borderRadius: radius.pill },
  body: { lineHeight: 21 },
});
