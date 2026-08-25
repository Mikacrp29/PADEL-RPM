import type { Timestamp } from 'firebase/firestore';
import type { TranslationKey } from '../i18n/translations';

/** A private friend group. Stored at /groups/{groupId} */
export interface Group {
  id: string;
  name: string;
  inviteCode: string; // e.g. PADEL-7XQ9M, also used as document id for fast lookup
  createdAt: Timestamp | null;
  createdBy: string; // creator display name, optional
  bookingUrl?: string; // configurable "Réserver le terrain" URL
  memberCount: number; // distinct nicknames seen in the group (best-effort counter)
}

/**
 * A single player entry on a slot.
 * `club` is a free-text suggestion for now (typed manually). It's kept as
 * plain text so a future "partner clubs" dropdown can populate the exact
 * same field without any data migration — the dropdown would just replace
 * the input, not the storage shape.
 * `uid` is set only when the person was signed in at the moment they
 * joined — it's how the notification Cloud Function knows which account
 * (if any) to notify when the slot fills up. Note: since slots are
 * publicly readable via the invite link (no accounts required), this uid
 * is visible to anyone in the group — it's an opaque Firebase id, not an
 * email or name, but worth knowing it isn't private.
 */
export interface Participant {
  name: string;
  joinedAt: Timestamp | null;
  club?: string;
  uid?: string;
}

/** A padel slot on the shared calendar. Stored at /groups/{groupId}/slots/{slotId} */
export interface Slot {
  id: string;
  groupId: string;
  start: Timestamp;
  end: Timestamp;
  createdBy: string;
  createdAt: Timestamp | null;
  participants: Participant[];
}

/** Local identity remembered per browser (no accounts). */
export interface LocalIdentity {
  nickname: string;
  lastGroupCode: string | null;
}

export type SlotStatus = 'empty' | 'low' | 'mid' | 'ready';

export function getSlotStatus(count: number): SlotStatus {
  if (count <= 0) return 'empty';
  if (count <= 2) return 'low';
  if (count === 3) return 'mid';
  return 'ready';
}

export const SLOT_STATUS_LABEL_KEY: Record<SlotStatus, TranslationKey> = {
  empty: 'status.empty',
  low: 'status.low',
  mid: 'status.mid',
  ready: 'status.ready',
};

/** CSS custom properties — used anywhere a plain CSS color value is fine
 * (e.g. the status dot in StatusBadge), which follows the app's dark theme
 * automatically since these are defined once in index.css. */
export const SLOT_STATUS_COLOR: Record<SlotStatus, string> = {
  empty: 'var(--color-slot-empty)',
  low: 'var(--color-slot-low)',
  mid: 'var(--color-slot-mid)',
  ready: 'var(--color-slot-ready)',
};

/**
 * Plain hex mirror of the same colors above, for the one place (the
 * calendar's event rendering) that needs to do JS math on the color — e.g.
 * lightening it based on participant count. Keep in sync with the
 * `--color-slot-*` custom properties in index.css if either ever changes.
 */
export const SLOT_STATUS_HEX: Record<SlotStatus, string> = {
  empty: '#3a4d4f',
  low: '#3d7ac9',
  mid: '#d68a3a',
  ready: '#4fbf6b',
};

/**
 * The range of participant counts each status covers. Used to compute how
 * "far into" its status a slot is (e.g. 1 vs 2 players are both "low", but
 * 2 is further along) — currently only `low` spans more than one value, so
 * it's the only status where the calendar shows a shade difference, but
 * this stays generic in case the 4-player cap or bucket sizes ever change.
 */
export const SLOT_STATUS_RANGE: Record<SlotStatus, { min: number; max: number }> = {
  empty: { min: 0, max: 0 },
  low: { min: 1, max: 2 },
  mid: { min: 3, max: 3 },
  ready: { min: 4, max: 4 },
};