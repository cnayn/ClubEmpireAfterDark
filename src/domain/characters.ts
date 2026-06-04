/**
 * Character foundation for CURRENT-ROLE staff only (Bartender, Bouncer).
 *
 * This is FLAVOR metadata, kept deliberately separate from the persisted
 * `StaffMember` (src/domain/types.ts) so it adds NO save-schema surface — the
 * saved roster shape is unchanged; cards look these profiles up by staff id.
 *
 * Scope guard: this module stores identity text only. It does NOT add mechanics.
 * - Mechanical traits stay in the existing `StaffTrait` enum on StaffMember.
 * - `hiddenTrait` / `hiddenTraitEffect` are recorded for the FUTURE hidden-trait
 *   discovery system but are NOT wired to any logic here, and the UI must not
 *   reveal them (show "locked / rumor" only) until that system exists.
 * - No future roles (DJ, Waiter, Host, …) appear here as active staff.
 */

import type { StaffRole } from './types';

export interface CharacterProfile {
  /** Stable staff id this profile enriches (matches StaffMember.id). */
  id: string;
  displayName: string;
  nickname?: string;
  role: StaffRole;
  /** Only 'current' roles are implemented; the field documents the intent. */
  roleStatus: 'current';
  archetype: string;
  oneSentence: string;
  /** Player-facing flavor name for the visible trait (mechanics live on StaffMember). */
  visibleTrait: string;
  visibleTraitEffect: string;
  /** FUTURE: concealed until a discovery system exists. Never shown un-redacted. */
  hiddenTrait: string;
  hiddenTraitEffect: string;
  goodTreatment: string;
  badTreatment: string;
  pressureBehavior: string;
  dialogueLines: string[];
  gameplayHook: string;
  visualNotes: string;
  implementationNotes: string;
}

const PROFILES: CharacterProfile[] = [
  // --- Starting roster (Bartenders) -----------------------------------------
  {
    id: 'bar-rosa',
    displayName: 'Rosa',
    role: 'bartender',
    roleStatus: 'current',
    archetype: "The Regulars' Favorite",
    oneSentence: 'Knows every regular by name and remembers their usual.',
    visibleTrait: 'Warm Pour',
    visibleTraitEffect: 'Keeps the bar welcoming; steady, dependable service.',
    hiddenTrait: 'None known',
    hiddenTraitEffect: '—',
    goodTreatment: 'Thrives when the regulars are looked after.',
    badTreatment: 'Quietly disappointed if the room turns cold and transactional.',
    pressureBehavior: 'Stays calm in a rush and talks the queue down.',
    dialogueLines: ['“Your usual, or feeling brave tonight?”', '“I’ve got the bar — go work the room.”'],
    gameplayHook: 'Reliable baseline bartender; the dependable core of the bar.',
    visualNotes: 'Approachable, easy smile, sleeves rolled.',
    implementationNotes: 'Identity-neutral starter (skill 50, honest, reliable).',
  },
  {
    id: 'bar-milo',
    displayName: 'Milo',
    role: 'bartender',
    roleStatus: 'current',
    archetype: 'The Steady Hand',
    oneSentence: 'Never rattled by a rush — the pour stays even at 2am.',
    visibleTrait: 'Unshakeable',
    visibleTraitEffect: 'Holds service quality when the floor gets busy.',
    hiddenTrait: 'None known',
    hiddenTraitEffect: '—',
    goodTreatment: 'Happy with a clear plan and a fair rota.',
    badTreatment: 'Goes quiet and clock-watches if messed around.',
    pressureBehavior: 'Heads down, works the rail, clears the backlog.',
    dialogueLines: ['“Three deep at the bar? Watch this.”', '“Same as always. We’re fine.”'],
    gameplayHook: 'Second reliable bartender; pairs with Rosa for a smooth bar.',
    visualNotes: 'Quiet focus, tidy station, economical movements.',
    implementationNotes: 'Identity-neutral starter (skill 50, honest, reliable).',
  },
  // --- Starting roster (Bouncer) --------------------------------------------
  {
    id: 'bnc-dimitri',
    displayName: 'Dimitri',
    role: 'bouncer',
    roleStatus: 'current',
    archetype: 'The Calm Wall',
    oneSentence: 'A calm presence on the door that most trouble simply avoids.',
    visibleTrait: 'Steady Door',
    visibleTraitEffect: 'Baseline security; keeps the entrance orderly.',
    hiddenTrait: 'None known',
    hiddenTraitEffect: '—',
    goodTreatment: 'Content with respect and a predictable shift.',
    badTreatment: 'Withdraws effort if treated like furniture.',
    pressureBehavior: 'Plants himself and lets the crowd settle around him.',
    dialogueLines: ['“Not tonight, friend.”', '“Door’s calm. You’d know if it wasn’t.”'],
    gameplayHook: 'Starting bouncer; the security baseline (1 unit).',
    visualNotes: 'Broad, unhurried, hands folded.',
    implementationNotes: 'Identity-neutral starter (skill 50, honest, reliable).',
  },

  // --- Candidate pool (Bartenders) ------------------------------------------
  {
    id: 'bar-vince',
    displayName: 'Vince',
    role: 'bartender',
    roleStatus: 'current',
    archetype: 'The Showman',
    oneSentence: 'Lightning behind the bar — bottles spin, tabs fly.',
    visibleTrait: 'Fast Pour',
    visibleTraitEffect: 'Moves drinks fast; lifts bar throughput.',
    hiddenTrait: 'Sticky Fingers',
    hiddenTraitEffect: 'The till sometimes comes up short. (Locked until discovered.)',
    goodTreatment: 'Loves the spotlight and a busy, showy night.',
    badTreatment: 'Sulks and cuts corners if upstaged or ignored.',
    pressureBehavior: 'Speeds up and shows off — quality holds, the count may not.',
    dialogueLines: ['“Watch the hands, not the till.”', '“Busy night? Perfect. That’s when I shine.”'],
    gameplayHook: 'High-throughput bartender with a concealed shrinkage risk.',
    visualNotes: 'Flashy, quick, always performing for the rail.',
    implementationNotes: 'Existing candidate; mechanics unchanged (fast-pour + hidden sticky-fingers).',
  },
  {
    id: 'bar-jin',
    displayName: 'Jin',
    role: 'bartender',
    roleStatus: 'current',
    archetype: 'The Dependable Cheap Hire',
    oneSentence: 'Unflashy, dependable, and easy on the wage bill.',
    visibleTrait: 'Steady',
    visibleTraitEffect: 'Reliably turns up and keeps a clean station.',
    hiddenTrait: 'None known',
    hiddenTraitEffect: '—',
    goodTreatment: 'Just wants steady hours and to be left to work.',
    badTreatment: 'Rarely complains, but a bad rota wears the goodwill thin.',
    pressureBehavior: 'Methodical — slower than a star, but never breaks.',
    dialogueLines: ['“I’ll be here. I’m always here.”', '“No tricks. Just drinks.”'],
    gameplayHook: 'Budget bartender; cheap, reliable, modest skill.',
    visualNotes: 'Plain, neat, unbothered.',
    implementationNotes: 'Existing candidate; mechanics unchanged (steady, low salary).',
  },

  // --- Candidate pool (Bouncers) --------------------------------------------
  {
    id: 'bnc-marcus',
    displayName: 'Marcus',
    role: 'bouncer',
    roleStatus: 'current',
    archetype: 'The Enforcer',
    oneSentence: 'One look and the queue behaves.',
    visibleTrait: 'Intimidating',
    visibleTraitEffect: 'Strong deterrent; fewer incidents at the door.',
    hiddenTrait: 'None known',
    hiddenTraitEffect: '—',
    goodTreatment: 'Respects a boss who backs his calls.',
    badTreatment: 'Bristles if second-guessed in front of a crowd.',
    pressureBehavior: 'Steps forward early and ends it before it starts.',
    dialogueLines: ['“We’re done here.”', '“They behave for me. Always have.”'],
    gameplayHook: 'Premium bouncer; reliable incident reduction.',
    visualNotes: 'Square stance, flat stare, immovable.',
    implementationNotes: 'Existing candidate; mechanics unchanged (intimidating).',
  },
  {
    id: 'bnc-pavel',
    displayName: 'Pavel',
    role: 'bouncer',
    roleStatus: 'current',
    archetype: 'The Heavy Hitter',
    oneSentence: 'Huge when he shows up — the catch is the “when.”',
    visibleTrait: 'Solid',
    visibleTraitEffect: 'Cheap muscle with real presence on a good night.',
    hiddenTrait: 'Flaky',
    hiddenTraitEffect: 'Sometimes simply does not turn up. (Locked until discovered.)',
    goodTreatment: 'Loyal to anyone who gives him a chance.',
    badTreatment: 'Ghosts a shift if he feels disrespected.',
    pressureBehavior: 'Dominant when present; absent when you needed him most.',
    dialogueLines: ['“I’m here, I’m here. Mostly.”', '“Big crowd? Big me.”'],
    gameplayHook: 'Cheap bouncer with a concealed reliability risk.',
    visualNotes: 'Enormous, easygoing, a little unreliable in the eyes.',
    implementationNotes: 'Existing candidate; mechanics unchanged (hidden flaky).',
  },
  {
    id: 'bnc-grace',
    displayName: 'Grace',
    role: 'bouncer',
    roleStatus: 'current',
    archetype: 'The Rulebook',
    oneSentence: 'Runs a tight, compliant door — inspectors love her.',
    visibleTrait: 'By the Book',
    visibleTraitEffect: 'Lowers the chance of a compliance fine.',
    hiddenTrait: 'None known',
    hiddenTraitEffect: '—',
    goodTreatment: 'Wants clear rules and to be trusted to enforce them.',
    badTreatment: 'Frustrated by orders to look the other way.',
    pressureBehavior: 'Calm, procedural, documents everything.',
    dialogueLines: ['“IDs out, please. All of them.”', '“We do this properly or not at all.”'],
    gameplayHook: 'Compliance-focused bouncer; safer relaxed-policy nights.',
    visualNotes: 'Crisp, alert, clipboard energy.',
    implementationNotes: 'Existing candidate; mechanics unchanged (by-the-book).',
  },

  // --- New current-role bouncers from the character bible --------------------
  {
    id: 'bnc-john',
    displayName: 'John',
    nickname: 'The Pitbull',
    role: 'bouncer',
    roleStatus: 'current',
    archetype: 'The Fearless Enforcer',
    oneSentence: 'Walks into anything — nothing on two legs makes him blink.',
    visibleTrait: 'Fearless',
    visibleTraitEffect: 'Shuts down trouble fast; strong incident prevention.',
    hiddenTrait: 'Chip On His Shoulder',
    hiddenTraitEffect:
      'Can be heavy-handed; may draw complaints on stylish / VIP / high-energy nights later. (Locked — future system.)',
    goodTreatment: 'Loyal to a boss who has his back in a scrap.',
    badTreatment: 'Gets rougher and more reckless if disrespected.',
    pressureBehavior: 'Runs toward the problem — decisive, sometimes too much.',
    dialogueLines: ['“You really want to do this? Didn’t think so.”', '“Nobody gets past me. Nobody.”'],
    gameplayHook:
      'Prevents incidents now; the rough edge (complaints on classy nights) is reserved for a future system, not active.',
    visualNotes: 'Compact, coiled, knuckles and a flat cap.',
    implementationNotes:
      'Active as a normal bouncer using existing trait vocab (intimidating). Hidden "Chip On His Shoulder" is metadata only — no mechanic implemented this pass.',
  },
  {
    id: 'bnc-kareem',
    displayName: 'Kareem',
    nickname: 'Caramel',
    role: 'bouncer',
    roleStatus: 'current',
    archetype: 'Gym Bro Protector / Future Lieutenant',
    oneSentence:
      'A motorcycle-riding gym fanatic who talks like a bro, stands like a wall, and can become the owner’s most loyal right hand if treated with respect.',
    visibleTrait: 'Intimidating Presence',
    visibleTraitEffect: 'Reduces incidents, improves staff confidence, and makes risky guests think twice.',
    hiddenTrait: 'Ride or Die',
    hiddenTraitEffect:
      'If respected over time, Caramel becomes extremely loyal — warns the owner about staff problems, protects the club’s reputation, covers weak points, and can eventually train new security staff. (Locked — future system, not active.)',
    goodTreatment:
      'If respected, covers shifts when the club is short, defends the club’s reputation, warns the owner about bad staff behavior, helps train new bouncers, becomes the trusted security voice, and starts thinking like management, not just muscle.',
    badTreatment:
      'If disrespected, becomes distant — stops giving warnings, does only the job and nothing extra, refuses to help train weaker staff, and eventually leaves quietly instead of causing drama.',
    pressureBehavior:
      'Holds the door and keeps control without losing his head — loves a big night, but never at the cost of surviving tomorrow.',
    dialogueLines: [
      '“Bro, I love the madness too, but we still need to survive tomorrow.”',
      '“Boss, this one smells like trouble.”',
      '“I got the door. You fix the inside.”',
      '“Big night is good bro, but we need control.”',
      '“No bro, trust me.”',
      '“Bro listen.”',
      '“Bro.”',
    ],
    gameplayHook:
      'A long-term investment. Early game: strong Senior Bouncer. Mid game: staff protector. Late game: potential Security Lead / Operations Right Hand. Useful immediately, but his real value appears if the player treats him with respect. (Progression reserved for a future system — not active.)',
    visualNotes:
      'Broad shoulders, gym physique, confident relaxed lean; motorcycle jacket off duty, arms loose (not stiff). Idle: neck crack, door scan, nod to staff, checks the line. FUTURE: when loyalty is high he should stand nearer the owner’s office / staff area, not just the door.',
    implementationNotes:
      'Current role: Senior Bouncer — mechanically a standard bouncer using existing trait vocab (intimidating); StaffMember stats unchanged. Future role potential: Security Lead / Operations Right Hand (NOT implemented). Owner relationship (flavor): the bridge between Ayan-chaos and Kerem-discipline — respects structure, not the angel on your shoulder. Personality reference (1–10 narrative scale, NOT the mechanical 0–100 stats): Skill 8, Reliability 9, Discipline 8, Temper 6, Charisma 8, Ambition 8, Loyalty Potential 10, Drama Risk 3. Hidden "Ride or Die" is inactive metadata only — loyalty, staff warnings, training bouncers, the security-lead/ops arc, and hidden-trait reveal are NOT implemented this pass. FUTURE SYSTEM (banked, not active): Friendship / Affinity should later track staff relationships and chemistry, kept separate from romance and from simple loyalty.',
  },
];

const BY_ID: Record<string, CharacterProfile> = Object.fromEntries(PROFILES.map((p) => [p.id, p]));

/** Character flavor for a staff id, or undefined (e.g. migrated generic crew). */
export function getCharacter(id: string): CharacterProfile | undefined {
  return BY_ID[id];
}

/** Whether a profile records a concealed trait (UI shows this as locked, never named). */
export function hasHiddenTrait(profile: CharacterProfile | undefined): boolean {
  return !!profile && profile.hiddenTrait.toLowerCase() !== 'none known' && profile.hiddenTrait !== '—';
}
