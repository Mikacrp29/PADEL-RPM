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
 */
export interface Participant {
  name: string;
  joinedAt: Timestamp | null;
  club?: string;
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

export const SLOT_STATUS_COLOR: Record<SlotStatus, string> = {
  empty: 'var(--color-slot-empty)',
  low: 'var(--color-slot-low)',
  mid: 'var(--color-slot-mid)',
  ready: 'var(--color-slot-ready)',
};