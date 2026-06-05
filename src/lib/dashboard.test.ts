/**
 * Tests for the pure Dashboard helpers (Floor View + Next Goal). Presentation
 * derivations only — no sim, no RNG, no state changes.
 */

import { defaultDayConfig, STARTING_ROSTER } from '@/domain/staff';
import type { ClubState, NightResult } from '@/domain/types';
import {
  buildBoardGoals,
  buildFloorView,
  floorBubbles,
  floorClusters,
  floorEmotes,
  goalBoard,
  nextGoal,
} from './dashboard';

function club(over: Partial<ClubState> = {}): ClubState {
  const staff = STARTING_ROSTER.map((m) => ({ ...m }));
  return {
    name: 'T', day: 5, cash: 1500, reputation: 50, baseCapacity: 60,
    ownedUpgradeIds: [], staff, lastConfig: defaultDayConfig(staff), ...over,
  };
}
function result(over: Partial<NightResult> = {}): NightResult {
  return {
    day: 4, guests: 30, capacity: 60, revenue: 600, costs: 300, net: 300,
    coverRevenue: 200, barRevenue: 400, vipBonus: 0, wages: 340, theft: 0, fines: 0,
    incidents: 0, noShows: 0, eventId: 'regular', eventCost: 0, bookingFee: 0,
    reputationBefore: 50, reputationAfter: 50, reputationDelta: 0,
    vipSatisfaction: 60, regularLoyalty: 60, serviceRatio: 1, notes: [], ...over,
  };
}

describe('buildFloorView', () => {
  it('shows a quiet, growable room before any night is played (never empty/broken)', () => {
    const fv = buildFloorView(club(), null);
    expect(fv.hasPlayedNight).toBe(false);
    expect(fv.density).toBe('sparse');
    expect(fv.dots).toBeGreaterThan(0);
    expect(fv.lastGuests).toBeNull();
  });

  it('derives crowd density from the last night when present', () => {
    expect(buildFloorView(club(), result({ guests: 6, capacity: 60 })).density).toBe('sparse');
    expect(buildFloorView(club(), result({ guests: 30, capacity: 60 })).density).toBe('busy');
    expect(buildFloorView(club(), result({ guests: 58, capacity: 60 })).density).toBe('packed');
  });

  it('maps each event to a distinct vibe', () => {
    const vibe = (e: NightResult['eventId']) => {
      const c = club();
      c.lastConfig = { ...c.lastConfig, eventId: e };
      return buildFloorView(c, null).vibe;
    };
    const vibes = ['regular', 'private-party', 'student-night', 'grand-opening', 'industry-night'].map(
      (e) => vibe(e as NightResult['eventId'])
    );
    expect(new Set(vibes).size).toBe(5); // all distinct
  });

  it('shows only on-duty bartenders and bouncers, with initials', () => {
    const fv = buildFloorView(club(), null);
    expect(fv.bartenders.length).toBeGreaterThan(0);
    expect(fv.bouncers.length).toBeGreaterThan(0);
    expect(fv.bartenders[0].initials).toMatch(/^[A-Z]{1,2}$/);
  });

  it('shows empty posts when nobody is scheduled for that role', () => {
    const c = club();
    const bartenderId = c.staff.find((m) => m.role === 'bartender')!.id;
    c.lastConfig = { ...c.lastConfig, staffOnDuty: [bartenderId] }; // no bouncers on duty
    const fv = buildFloorView(c, null);
    expect(fv.bouncers).toHaveLength(0);
    expect(fv.bartenders).toHaveLength(1);
  });
});

describe('floorBubbles — interpretations of aggregate signals only', () => {
  it('no bubbles before any night, and none on a clean profitable night', () => {
    expect(floorBubbles(null)).toEqual([]);
    expect(floorBubbles(result({ serviceRatio: 1, net: 300, reputationDelta: 2 }))).toEqual([]);
  });

  it('maps each aggregate signal to a zone bubble', () => {
    const z = (over: Partial<NightResult>, id: string) =>
      floorBubbles(result(over)).find((b) => b.id === id);
    expect(z({ incidents: 2 }, 'incidents')?.zone).toBe('door');
    expect(z({ fines: 300, incidents: 0 }, 'inspector')?.zone).toBe('door'); // compliance
    expect(z({ theft: 40 }, 'theft')?.zone).toBe('bar');
    expect(z({ serviceRatio: 0.6 }, 'service')?.zone).toBe('bar');
    expect(z({ noShows: 1 }, 'noshow')?.zone).toBe('floor');
    expect(z({ reputationDelta: -3 }, 'rep')?.zone).toBe('floor');
    expect(z({ net: -100 }, 'net')?.zone).toBe('floor');
  });

  it('does not invent an inspector bubble when fines come from incidents', () => {
    // incidents>0 means fines are incident fines, not a compliance inspector visit
    const bubbles = floorBubbles(result({ incidents: 1, fines: 80 }));
    expect(bubbles.some((b) => b.id === 'inspector')).toBe(false);
    expect(bubbles.some((b) => b.id === 'incidents')).toBe(true);
  });
});

describe('floorEmotes — ambient guest voices from aggregate signals', () => {
  it('no emotes before a night or on an empty room', () => {
    expect(floorEmotes(null, club())).toEqual([]);
    expect(floorEmotes(result({ guests: 0 }), club())).toEqual([]);
  });

  it('a strained bar prompts a "where\'s my drink" emote at the bar', () => {
    const emotes = floorEmotes(result({ guests: 50, capacity: 60, serviceRatio: 0.5 }), club());
    const bar = emotes.find((e) => e.zone === 'bar');
    expect(bar).toBeDefined();
    expect(bar!.label.toLowerCase()).toContain('drink');
  });

  it('an incident prompts a tense-door emote, and emotes are capped', () => {
    const emotes = floorEmotes(result({ guests: 58, capacity: 60, serviceRatio: 0.5, incidents: 1 }), club());
    expect(emotes.some((e) => e.zone === 'door' && e.tone === 'bad')).toBe(true);
    expect(emotes.length).toBeLessThanOrEqual(3);
  });
});

describe('floorClusters — readable guest clusters per zone', () => {
  const quiet = { crowd: 0.1, bar: 0.1, door: 0.1, bathroom: 0.1, energy: 0.6 };
  const packed = { crowd: 0.95, bar: 0.7, door: 0.7, bathroom: 0.7, energy: 0.8 };

  it('a calm room shows only the floor crowd (no queues yet)', () => {
    const cs = floorClusters(club(), quiet);
    const zones = cs.map((c) => c.zone);
    expect(zones).toContain('floor');
    expect(zones).not.toContain('bar');
    expect(zones).not.toContain('door');
    expect(zones).not.toContain('bath');
  });

  it('a packed, strained room grows queues at every strained zone', () => {
    const cs = floorClusters(club(), packed);
    const zones = new Set(cs.map((c) => c.zone));
    expect(zones.has('bar')).toBe(true);
    expect(zones.has('door')).toBe(true);
    expect(zones.has('bath')).toBe(true);
    expect(zones.has('floor')).toBe(true);
  });

  it('bar mood escalates from waiting → angry as pressure rises', () => {
    const mild = floorClusters(club(), { ...quiet, bar: 0.5 }).find((c) => c.zone === 'bar');
    const heavy = floorClusters(club(), { ...quiet, bar: 0.85 }).find((c) => c.zone === 'bar');
    expect(mild?.mood).toBe('waiting');
    expect(heavy?.mood).toBe('angry');
  });

  it('floor mood reflects energy (dancing high / tired low)', () => {
    const tired = floorClusters(club(), { ...quiet, crowd: 0.5, energy: 0.2 }).find((c) => c.zone === 'floor');
    const dancing = floorClusters(club(), { ...quiet, crowd: 0.5, energy: 0.9 }).find((c) => c.zone === 'floor');
    expect(tired?.mood).toBe('tired');
    expect(dancing?.mood).toBe('dancing');
  });

  it('cluster counts stay bounded (phones are small)', () => {
    const cs = floorClusters(club(), packed);
    for (const c of cs) {
      expect(c.count).toBeGreaterThanOrEqual(1);
      expect(c.count).toBeLessThanOrEqual(14);
    }
  });

  it('a regular base surfaces a small regulars cluster when the room has bodies', () => {
    const c = club({ regularBase: { locals: 30, students: 0, regulars: 28, musicheads: 0, vipcurious: 0, rough: 0 } });
    const cs = floorClusters(c, { ...quiet, crowd: 0.5 });
    expect(cs.some((x) => x.zone === 'regulars')).toBe(true);
  });
});

describe('nextGoal — one primary goal by precedence', () => {
  it('recovery when cash can barely cover a night', () => {
    expect(nextGoal(club({ cash: 150 })).kind).toBe('recovery');
  });

  it('almost-affordable upgrade/hire when close but not quite', () => {
    // cheapest upgrade is $800; $600 is 75% of it → "almost"
    const g = nextGoal(club({ cash: 600, ownedUpgradeIds: [] }));
    expect(g.kind).toBe('almost');
    expect(g.title).toMatch(/Almost there/);
    expect(g.progress).toBeGreaterThan(0.5);
    expect(g.progress).toBeLessThan(1);
  });

  it('next reputation tier when cash is comfortable and nothing is almost-affordable', () => {
    const g = nextGoal(club({ cash: 5000, reputation: 50 })); // above all costs → not "almost"
    expect(g.kind).toBe('tier');
    expect(g.title).toContain('City Favorite');
    expect(g.title).toContain('/ 60');
  });

  it('general growth at the top tier with nothing left to reach', () => {
    const owned = ['bigger-floor', 'better-sound', 'extra-bar', 'pro-lighting', 'security-office', 'vip-lounge'];
    const g = nextGoal(club({ cash: 9000, reputation: 90, ownedUpgradeIds: owned }));
    expect(g.kind).toBe('growth');
  });
});

describe('goalBoard — multiple active goals from real state', () => {
  const fresh = () => club({ day: 1, cash: 600, reputation: 20, ownedUpgradeIds: [] });

  it('always returns between 3 and 5 goals, with valid progress and status', () => {
    const states = [
      fresh(),
      club({ day: 10, cash: 5000, reputation: 50, ownedUpgradeIds: ['pro-lighting'] }),
      club({ day: 8, cash: -100, reputation: 30 }),
      club({ day: 30, cash: 12000, reputation: 90, ownedUpgradeIds: ['bigger-floor', 'extra-bar', 'pro-lighting'] }),
    ];
    for (const c of states) {
      const board = goalBoard(c, null);
      expect(board.length).toBeGreaterThanOrEqual(3);
      expect(board.length).toBeLessThanOrEqual(5);
      const ids = board.map((g) => g.id);
      expect(new Set(ids).size).toBe(ids.length); // no duplicates
      for (const g of board) {
        expect(g.progress).toBeGreaterThanOrEqual(0);
        expect(g.progress).toBeLessThanOrEqual(1);
        expect(['active', 'completed']).toContain(g.status);
        expect(g.title.length).toBeGreaterThan(0);
        expect(g.instruction.length).toBeGreaterThan(0);
      }
    }
  });

  it('a fresh club gets tutorial-style onboarding goals', () => {
    const board = goalBoard(fresh(), null);
    expect(board.some((g) => g.category === 'tutorial')).toBe(true);
    expect(board.some((g) => g.id === 'open-first-night' && g.status === 'active')).toBe(true);
  });

  it('a mid-game club gets business / reputation / venue goals, not onboarding', () => {
    const board = goalBoard(
      club({ day: 12, cash: 4000, reputation: 50, ownedUpgradeIds: ['pro-lighting'] }),
      result({ net: 200, incidents: 0 })
    );
    const cats = new Set(board.map((g) => g.category));
    expect(cats.has('business')).toBe(true);
    expect(cats.has('reputation')).toBe(true);
    // onboarding-only goals shouldn't dominate an established club
    expect(board.some((g) => g.id === 'open-first-night')).toBe(false);
  });

  it('negative cash surfaces a recovery goal first', () => {
    const board = goalBoard(club({ day: 9, cash: -150, reputation: 30 }), null);
    expect(board.some((g) => g.id === 'recover-cash')).toBe(true);
    expect(board[0].id).toBe('recover-cash');
  });

  it('a reputation drop last night surfaces a win-the-room-back goal', () => {
    const board = goalBoard(club({ day: 9, cash: 3000, reputation: 45 }), result({ reputationDelta: -4 }));
    expect(board.some((g) => g.id === 'recover-rep')).toBe(true);
  });

  it('reflects real completion: owning an upgrade marks its venue goal complete', () => {
    const board = goalBoard(
      club({ day: 12, cash: 4000, reputation: 50, ownedUpgradeIds: ['pro-lighting'] }),
      null
    );
    const lighting = board.find((g) => g.id === 'buy-pro-lighting');
    // It may or may not be shown (active goals are preferred), but if shown it must be completed.
    if (lighting) expect(lighting.status).toBe('completed');
    // The cash goal target must be a real milestone strictly above current cash.
    const cashGoal = board.find((g) => g.id === 'reach-cash');
    expect(cashGoal?.title).toMatch(/Reach \$5,000/);
  });

  it('the top goals span several categories (not five of one kind)', () => {
    const board = goalBoard(club({ day: 12, cash: 2000, reputation: 30, ownedUpgradeIds: [] }), null);
    const cats = new Set(board.map((g) => g.category));
    expect(cats.size).toBeGreaterThanOrEqual(3);
  });
});

describe('buildBoardGoals — the full goal catalog reflects state', () => {
  const all = (c: ClubState, r: NightResult | null) => {
    const { interrupts, early, late } = buildBoardGoals(c, r);
    return [...interrupts, ...early, ...late];
  };
  const find = (c: ClubState, r: NightResult | null, id: string) => all(c, r).find((g) => g.id === id);

  it('big-night completes only when a single night nets the target', () => {
    expect(find(club(), result({ net: 200 }), 'big-night')?.status).toBe('active');
    expect(find(club(), result({ net: 600 }), 'big-night')?.status).toBe('completed');
    expect(find(club(), result({ net: 200 }), 'big-night')?.progress).toBeCloseTo(0.4);
  });

  it('no-no-shows reflects last night crew turnout (when data exists)', () => {
    expect(find(club(), null, 'no-no-shows')?.status).toBe('active'); // no data yet
    expect(find(club(), result({ noShows: 0 }), 'no-no-shows')?.status).toBe('completed');
    expect(find(club(), result({ noShows: 2 }), 'no-no-shows')?.status).toBe('active');
  });

  it('next-upgrade points at the cheapest un-named, unowned upgrade; completed when all owned', () => {
    const fresh = find(club({ ownedUpgradeIds: [] }), null, 'next-upgrade');
    expect(fresh?.title).toMatch(/Buy Better Sound System/); // cheapest non-named upgrade ($1,200)
    expect(fresh?.status).toBe('active');
    const allOwned = ['bigger-floor', 'better-sound', 'extra-bar', 'pro-lighting', 'security-office', 'vip-lounge'];
    expect(find(club({ ownedUpgradeIds: allOwned }), null, 'next-upgrade')?.status).toBe('completed');
  });

  it('have-bouncer becomes active only when the door has no bouncer', () => {
    expect(find(club(), null, 'have-bouncer')?.status).toBe('completed'); // starting roster has one
    const noBouncer = club();
    noBouncer.staff = noBouncer.staff.filter((m) => m.role !== 'bouncer');
    expect(find(noBouncer, null, 'have-bouncer')?.status).toBe('active');
  });

  it('buy-bigger-floor completes once capacity has grown', () => {
    expect(find(club({ ownedUpgradeIds: [] }), null, 'buy-bigger-floor')?.status).toBe('active');
    expect(find(club({ ownedUpgradeIds: ['bigger-floor'] }), null, 'buy-bigger-floor')?.status).toBe('completed');
  });
});
