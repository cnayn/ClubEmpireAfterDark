/**
 * Phone Inbox v1 — a small, DERIVED set of nightlife "texts" that make the club
 * feel alive off the floor: crew, guests, booking leads, suppliers, hiring leads,
 * and rumors. PURE + DETERMINISTIC: every message is read from the CURRENT
 * ClubState (+ last NightResult). No backend, no RNG, no infinite generation, no
 * persistence, no relationship/loyalty/VIP/named-guest sim — same state in, same
 * inbox out. Actions are just navigation links (no booking/event pipeline in v1).
 */

import { crowdMix, topCrowd } from '@/domain/crowd';
import { venueStats } from '@/domain/furniture';
import { DEFAULT_POLICIES } from '@/domain/policies';
import type { ClubState, NightResult } from '@/domain/types';

export type PhoneCategory = 'crew' | 'guest' | 'booking' | 'supplier' | 'market' | 'warning';
export type PhoneRoute = '/staff' | '/day-prep' | '/venue' | '/shop' | '/goals' | '/results';

export interface PhoneMessage {
  id: string;
  category: PhoneCategory;
  sender: string;
  title: string;
  body: string;
  actionLabel?: string;
  route?: PhoneRoute;
}

export const CATEGORY_LABEL: Record<PhoneCategory, string> = {
  crew: 'Crew',
  guest: 'Guest',
  booking: 'Booking',
  supplier: 'Supplier',
  market: 'Lead',
  warning: 'Rumor',
};

const JOHN = 'bnc-john';
const CARAMEL = 'bnc-kareem';
const MAX_MESSAGES = 6;

// Selection order so the inbox always spans a few kinds, not six of one.
const CATEGORY_ORDER: PhoneCategory[] = ['crew', 'warning', 'guest', 'booking', 'supplier', 'market'];

/**
 * Build the inbox for the club's current state. Returns up to six messages,
 * ordered so the most decision-relevant (crew, rumors) lead and the kinds stay
 * varied. Deterministic; safe on old saves (every read tolerates missing optional
 * fields via defaults).
 */
export function buildInbox(club: ClubState, lastResult: NightResult | null): PhoneMessage[] {
  // A brand-new owner who hasn't run a night yet gets a quiet phone — no booking
  // leads or rumors before the club has even opened. The city starts talking
  // once you've actually had a night (#9).
  if (club.day <= 1 && !lastResult) return [];

  const out: PhoneMessage[] = [];
  const add = (m: PhoneMessage) => out.push(m);

  const hasJohn = club.staff.some((m) => m.id === JOHN);
  const hasCaramel = club.staff.some((m) => m.id === CARAMEL);
  const bartenders = club.staff.filter((m) => m.role === 'bartender').length;
  const bouncers = club.staff.filter((m) => m.role === 'bouncer').length;

  const pol = club.lastConfig.policies ?? DEFAULT_POLICIES;
  const v = venueStats(club.venue);
  const looksGood = v.style + v.doorAppeal >= 4;
  const top = topCrowd(crowdMix(club, club.lastConfig), 3);
  const dj = club.lastConfig.dj ?? 'house';

  const r = lastResult;
  const strained = !!r && r.serviceRatio < 0.85;
  const trouble = !!r && r.incidents > 0;
  const lowCash = club.cash < 1500;

  // --- Crew ------------------------------------------------------------------
  if (trouble && hasCaramel) {
    add({ id: 'crew-caramel', category: 'crew', sender: 'Caramel', title: 'About the door', body: 'Boss, the door felt weird tonight. We need better control.', actionLabel: 'View Crew', route: '/staff' });
  } else if (trouble && hasJohn) {
    add({ id: 'crew-john', category: 'crew', sender: 'John', title: 'Handled it', body: 'Handled the problem. People are dramatic.', actionLabel: 'View Crew', route: '/staff' });
  }
  if (strained) {
    add({ id: 'crew-bar', category: 'crew', sender: 'Bar', title: 'We got buried', body: 'Bar was stacked all night. Need another pair of hands.', actionLabel: 'View Crew', route: '/staff' });
  }

  // --- Warning / rumor -------------------------------------------------------
  if (trouble) {
    add({ id: 'warn-door', category: 'warning', sender: 'Word on the street', title: 'Door talk', body: 'People are talking about the door.', actionLabel: 'Plan Tonight', route: '/day-prep' });
  }
  if (strained) {
    add({ id: 'warn-bar', category: 'warning', sender: 'Regulars', title: 'They noticed', body: 'Regulars noticed the bar slowdown.', actionLabel: 'View Goals', route: '/goals' });
  }
  if (pol.idCheck === 'relaxed') {
    add({ id: 'warn-id', category: 'warning', sender: 'Word on the street', title: 'Heads up', body: 'There might be extra attention on IDs this week.', actionLabel: 'Plan Tonight', route: '/day-prep' });
  }

  // --- Guest -----------------------------------------------------------------
  if (strained) {
    add({ id: 'guest-bar', category: 'guest', sender: 'A guest', title: 'Good night, slow bar', body: 'Music was good. Bar was slow.' });
  }
  if (trouble) {
    add({ id: 'guest-door', category: 'guest', sender: 'A guest', title: 'Tense one', body: 'Door felt tense tonight.' });
  }
  if (looksGood && !strained && !trouble) {
    add({ id: 'guest-look', category: 'guest', sender: 'A guest', title: 'Looking sharp', body: 'This place is starting to look better.' });
  }

  // --- Booking (read-only leads → Plan Tonight) ------------------------------
  add({ id: 'book-birthday', category: 'booking', sender: 'Unknown number', title: 'Birthday night', body: 'Someone wants to book the room for a birthday night.', actionLabel: 'Plan Tonight', route: '/day-prep' });
  if (lowCash) {
    add({ id: 'book-private', category: 'booking', sender: 'Private group', title: 'Thursday?', body: 'A private group wants Thursday. Low risk, decent cash.', actionLabel: 'Plan Tonight', route: '/day-prep' });
  }
  if (top.includes('students')) {
    add({ id: 'book-students', category: 'booking', sender: 'Student crew', title: 'Cheap loud night', body: 'A student crew wants a cheap, loud night.', actionLabel: 'Plan Tonight', route: '/day-prep' });
  }

  // --- Supplier --------------------------------------------------------------
  if ((club.lastConfig.drinkPrep?.quality ?? 'house') === 'cheap' || lowCash) {
    add({ id: 'sup-cheap', category: 'supplier', sender: 'A supplier', title: 'Cheap bottles', body: 'Cheap bottles available. Good margin, risky if you overcharge.', actionLabel: 'Plan Tonight', route: '/day-prep' });
  } else {
    add({ id: 'sup-premium', category: 'supplier', sender: 'A supplier', title: 'Premium stock', body: 'Premium stock offer. Expensive, but the bar will look serious.', actionLabel: 'Plan Tonight', route: '/day-prep' });
  }

  // --- Market / hiring leads -------------------------------------------------
  if (bartenders < 3) {
    add({ id: 'mkt-bartender', category: 'market', sender: 'A bartender', title: 'Heard about your place', body: 'A bartender heard about your place and wants in.', actionLabel: 'View Crew', route: '/staff' });
  }
  if (bouncers < 2) {
    add({ id: 'mkt-bouncer', category: 'market', sender: 'A bouncer', title: 'Steady work?', body: 'A bouncer is looking for steady work.', actionLabel: 'View Crew', route: '/staff' });
  }
  if (dj === 'house') {
    add({ id: 'mkt-dj', category: 'market', sender: 'A local DJ', title: 'Want a slot', body: 'A local DJ wants a slot. Could lift the room.', actionLabel: 'Plan Tonight', route: '/day-prep' });
  }

  // Keep the inbox varied + short: round-robin across categories, cap at six.
  return pickVaried(out, MAX_MESSAGES);
}

/** Interleave by category (in CATEGORY_ORDER) so the top of the inbox spans kinds. */
function pickVaried(messages: PhoneMessage[], limit: number): PhoneMessage[] {
  const byCat = new Map<PhoneCategory, PhoneMessage[]>();
  for (const m of messages) {
    const list = byCat.get(m.category) ?? [];
    list.push(m);
    byCat.set(m.category, list);
  }
  const result: PhoneMessage[] = [];
  let added = true;
  while (added && result.length < limit) {
    added = false;
    for (const cat of CATEGORY_ORDER) {
      const list = byCat.get(cat);
      if (list && list.length > 0) {
        result.push(list.shift()!);
        added = true;
        if (result.length >= limit) break;
      }
    }
  }
  return result;
}

/** Count for the small "Phone: N" indicator (no read-state persistence in v1). */
export function inboxCount(club: ClubState, lastResult: NightResult | null): number {
  return buildInbox(club, lastResult).length;
}
