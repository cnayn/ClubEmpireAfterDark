import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Pill } from '@/components/Controls';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import {
  canEquip,
  equippedIn,
  FURNITURE,
  getFurniture,
  getVenue,
  VENUE_ZONES,
  venueStats,
  ZONE_LABEL,
  ZONE_SLOTS,
} from '@/domain/furniture';
import { minViableNightCost } from '@/domain/staff';
import type { FurnitureStats, VenueZone } from '@/domain/types';
import { money } from '@/lib/format';
import { useGameStore } from '@/state/store';
import { colors, radius, spacing } from '@/theme/tokens';

const STAT_LABEL: Record<keyof FurnitureStats, string> = {
  style: 'Style',
  comfort: 'Comfort',
  sound: 'Sound',
  hygiene: 'Hygiene',
  doorAppeal: 'Door',
};

function statLine(stats: FurnitureStats): string {
  return (Object.keys(STAT_LABEL) as (keyof FurnitureStats)[])
    .filter((k) => (stats[k] ?? 0) > 0)
    .map((k) => `+${stats[k]} ${STAT_LABEL[k]}`)
    .join(' · ');
}

export default function VenueScreen() {
  const club = useGameStore((s) => s.club);
  const buyFurniture = useGameStore((s) => s.buyFurniture);
  const equipFurniture = useGameStore((s) => s.equipFurniture);
  const unequipFurniture = useGameStore((s) => s.unequipFurniture);

  if (!club) {
    router.replace('/');
    return null;
  }

  const venue = getVenue(club.venue);
  const stats = venueStats(venue);
  const reserve = minViableNightCost(club.staff);
  const zoneOf = (id: string): VenueZone | undefined =>
    VENUE_ZONES.find((z) => (venue.equipped[z] ?? []).includes(id));

  return (
    <Screen footer={<Button label="Prepare Tonight" onPress={() => router.push('/day-prep')} />}>
      <View style={styles.header}>
        <Text variant="title">Your Venue</Text>
        <Pill label={money(club.cash)} color={club.cash < 0 ? colors.danger : colors.success} />
      </View>

      {/* Club style stats */}
      <Card title="Club Style">
        <View style={styles.statRow}>
          {(Object.keys(STAT_LABEL) as (keyof FurnitureStats)[]).map((k) => (
            <View key={k} style={styles.statChip}>
              <Text variant="label" muted>
                {STAT_LABEL[k]}
              </Text>
              <Text variant="heading" color={stats[k] > 0 ? colors.neonMagenta : colors.textMuted}>
                {stats[k]}
              </Text>
            </View>
          ))}
        </View>
        <Text variant="label" muted>
          Furniture gives your club character — and small, steady help on the night.
        </Text>
      </Card>

      {/* Zones + equipped slots */}
      <Card title="Zones">
        {VENUE_ZONES.map((zone) => {
          const slots = ZONE_SLOTS[zone];
          const equipped = equippedIn(venue, zone);
          if (zone === 'vip') {
            return (
              <View key={zone} style={styles.zoneRow}>
                <Text variant="heading" muted style={{ flex: 1 }}>
                  {ZONE_LABEL[zone]}
                </Text>
                <Pill label="Locked — coming later" color={colors.textMuted} />
              </View>
            );
          }
          return (
            <View key={zone} style={styles.zoneBlock}>
              <View style={styles.zoneRow}>
                <Text variant="heading" style={{ flex: 1 }}>
                  {ZONE_LABEL[zone]}
                </Text>
                <Text variant="label" muted>
                  {equipped.length}/{slots} slots
                </Text>
              </View>
              {equipped.length === 0 ? (
                <Text variant="label" muted>
                  Nothing set up here yet.
                </Text>
              ) : (
                equipped.map((id) => (
                  <View key={id} style={styles.equippedRow}>
                    <Text variant="label" style={{ flex: 1 }}>
                      {getFurniture(id)?.name}
                    </Text>
                    <Button label="Remove" variant="secondary" onPress={() => unequipFurniture(id, zone)} />
                  </View>
                ))
              )}
            </View>
          );
        })}
      </Card>

      {/* Catalog */}
      <Text variant="heading" style={styles.catalogHead}>
        For the Venue
      </Text>
      {FURNITURE.map((item) => {
        const owned = venue.owned.includes(item.id);
        const equippedZone = zoneOf(item.id);
        const canBuy = !owned && club.cash - item.cost >= reserve;
        // Compatible zones that currently have a free slot.
        const openZones = item.zones.filter((z) => canEquip(venue, item.id, z));
        return (
          <Card key={item.id} accent={equippedZone ? colors.success : undefined}>
            <View style={styles.itemHead}>
              <Text variant="heading" style={{ flex: 1 }}>
                {item.name}
              </Text>
              <Pill label={item.zones.map((z) => ZONE_LABEL[z]).join(' / ')} color={colors.neonCyan} />
            </View>
            <Text variant="label" color={colors.neonMagenta}>
              {statLine(item.stats)}
            </Text>
            <Text variant="body" muted style={styles.itemDesc}>
              {item.description}
            </Text>
            {!owned ? (
              <Button
                label={`Buy — ${money(item.cost)}`}
                accent={colors.neonMagenta}
                disabled={!canBuy}
                onPress={() => buyFurniture(item.id)}
              />
            ) : equippedZone ? (
              <Button label={`Equipped · ${ZONE_LABEL[equippedZone]}`} variant="secondary" disabled onPress={() => {}} />
            ) : openZones.length > 0 ? (
              <View style={styles.equipRow}>
                {openZones.map((z) => (
                  <Button key={z} label={`Equip → ${ZONE_LABEL[z]}`} onPress={() => equipFurniture(item.id, z)} style={{ flexGrow: 1 }} />
                ))}
              </View>
            ) : (
              <Button label="All its zones are full — remove something first" variant="secondary" disabled onPress={() => {}} />
            )}
          </Card>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  statChip: { alignItems: 'center', minWidth: 52 },
  zoneBlock: { gap: spacing.xs, marginBottom: spacing.sm },
  zoneRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  equippedRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.surfaceAlt, borderRadius: radius.sm, padding: spacing.sm },
  catalogHead: { marginTop: spacing.sm },
  itemHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  itemDesc: { lineHeight: 20, marginTop: 2 },
  equipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
