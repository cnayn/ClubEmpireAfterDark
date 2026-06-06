/**
 * 2D Club Board v1 — pure board model. Deterministic; no UI, no sim.
 */

import { defaultDayConfig, STARTING_ROSTER } from '@/domain/staff';
import type { ClubState } from '@/domain/types';
import { BOARD_ZONES, boardFurniture, boardTokens, tokensInZone, zoneActions } from './board';

function club(over: Partial<ClubState> = {}): ClubState {
  const staff = STARTING_ROSTER.map((m) => ({ ...m }));
  return {
    name: 'T', day: 4, cash: 1500, reputation: 50, baseCapacity: 60,
    ownedUpgradeIds: [], staff, lastConfig: defaultDayConfig(staff), ...over,
  };
}

describe('BOARD_ZONES + zoneActions', () => {
  it('covers the seven board zones, with VIP locked and non-actionable', () => {
    expect(BOARD_ZONES.map((z) => z.id).sort()).toEqual(
      ['bar', 'bathroom', 'dj', 'door', 'floor', 'staff', 'vip']
    );
    const vip = BOARD_ZONES.find((z) => z.id === 'vip')!;
    expect(vip.locked).toBe(true);
    expect(vip.actions).toEqual([]);
  });

  it('maps each zone to the right boss actions', () => {
    expect(zoneActions('door')).toEqual(['send-bouncer']);
    expect(zoneActions('bar')).toEqual(['check-bar']);
    expect(zoneActions('dj')).toEqual(['push-dj']);
    expect(zoneActions('floor')).toEqual(['push-dj', 'work-room']);
    expect(zoneActions('bathroom')).toEqual([]);
    expect(zoneActions('vip')).toEqual([]);
  });
});

describe('boardFurniture', () => {
  it('places equipped furniture in its board zone', () => {
    const c = club({ venue: { owned: ['neon-sign', 'backbar-glow'], equipped: { entrance: ['neon-sign'], bar: ['backbar-glow'] } } });
    expect(boardFurniture(c, 'door').map((f) => f.id)).toContain('neon-sign');
    expect(boardFurniture(c, 'bar').map((f) => f.id)).toContain('backbar-glow');
    expect(boardFurniture(c, 'floor')).toEqual([]); // nothing equipped on the dancefloor
  });

  it('a zone with no venue mapping (staff) never has furniture', () => {
    expect(boardFurniture(club(), 'staff')).toEqual([]);
  });

  it('is safe on a club with no venue', () => {
    const c = club();
    delete (c as { venue?: unknown }).venue;
    expect(() => boardFurniture(c, 'bar')).not.toThrow();
    expect(boardFurniture(c, 'bar')).toEqual([]);
  });
});

describe('boardTokens / tokensInZone', () => {
  it('places on-duty bartenders at the bar and bouncers at the door', () => {
    const tokens = boardTokens(club());
    expect(tokens.some((t) => t.role === 'bartender' && t.zone === 'bar')).toBe(true);
    expect(tokens.some((t) => t.role === 'bouncer' && t.zone === 'door')).toBe(true);
    expect(tokensInZone(club(), 'bar').every((t) => t.zone === 'bar')).toBe(true);
  });

  it('only on-duty crew appear', () => {
    const c = club();
    const oneBartender = c.staff.find((m) => m.role === 'bartender')!.id;
    c.lastConfig = { ...c.lastConfig, staffOnDuty: [oneBartender] };
    const tokens = boardTokens(c);
    expect(tokens).toHaveLength(1);
    expect(tokens[0].id).toBe(oneBartender);
  });

  it('a booked DJ act (not the house playlist) appears at the DJ booth', () => {
    const house = club();
    house.lastConfig = { ...house.lastConfig, dj: 'house' };
    expect(boardTokens(house).some((t) => t.role === 'dj')).toBe(false);

    const hype = club();
    hype.lastConfig = { ...hype.lastConfig, dj: 'hype' };
    const djToken = boardTokens(hype).find((t) => t.role === 'dj');
    expect(djToken?.zone).toBe('dj');
  });

  it('is deterministic for the same club', () => {
    expect(boardTokens(club())).toEqual(boardTokens(club()));
  });
});
