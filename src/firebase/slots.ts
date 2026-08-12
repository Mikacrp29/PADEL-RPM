import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { db } from './config';
import type { Slot, Participant } from '../types';

function slotsCol(groupId: string) {
  return collection(db, 'groups', groupId, 'slots');
}

const PAST_WINDOW_DAYS = 60;

/**
 * Subscribes to a group's slots in real time, limited to a sliding window
 * (last 60 days onward). Without this, a group active for a year+ would
 * download and listen to its entire history on every visit — slower to
 * load and it eats into Firestore's daily read quota for no benefit, since
 * nothing in the UI shows slots that old anyway.
 */
export function subscribeToSlots(
  groupId: string,
  onChange: (slots: Slot[]) => void
): () => void {
  const windowStart = new Date();
  windowStart.setDate(windowStart.getDate() - PAST_WINDOW_DAYS);

  const q = query(
    slotsCol(groupId),
    where('start', '>=', Timestamp.fromDate(windowStart)),
    orderBy('start', 'asc')
  );
  return onSnapshot(q, (snapshot) => {
    const slots = snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Slot, 'id'>) }));
    onChange(slots);
  });
}

export async function createSlot(
  groupId: string,
  start: Date,
  end: Date,
  creatorName: string,
  club?: string
): Promise<string> {
  const firstParticipant: Participant = {
    name: creatorName.trim(),
    joinedAt: Timestamp.now(),
  };
  if (club && club.trim()) {
    firstParticipant.club = club.trim();
  }
  const ref = await addDoc(slotsCol(groupId), {
    groupId,
    start: Timestamp.fromDate(start),
    end: Timestamp.fromDate(end),
    createdBy: creatorName.trim(),
    createdAt: serverTimestamp(),
    participants: [firstParticipant],
  });
  return ref.id;
}

/**
 * Adds a nickname to a slot's participant list (no-op if already present,
 * enforced by caller). `club` is an optional free-text suggestion; Firestore
 * rejects `undefined` field values, so the key is only included when a
 * non-empty club was actually provided.
 */
export async function joinSlot(
  groupId: string,
  slotId: string,
  nickname: string,
  club?: string
): Promise<void> {
  const participant: Participant = { name: nickname.trim(), joinedAt: Timestamp.now() };
  if (club && club.trim()) {
    participant.club = club.trim();
  }
  await updateDoc(doc(db, 'groups', groupId, 'slots', slotId), {
    participants: arrayUnion(participant),
  });
}

/**
 * Firestore's arrayRemove needs an exact field match (joinedAt differs per entry),
 * so leaving a slot is done by resolving the current participant object first
 * (see useSlots hook) and passing it back here.
 */
export async function leaveSlot(
  groupId: string,
  slotId: string,
  participant: Participant
): Promise<void> {
  await updateDoc(doc(db, 'groups', groupId, 'slots', slotId), {
    participants: arrayRemove(participant),
  });
}

/**
 * Deletes a slot. Only allowed while it has zero participants — enforced
 * both here (UI never offers the button otherwise) and in firestore.rules
 * (so it can't be bypassed by calling the API directly).
 */
export async function deleteSlot(groupId: string, slotId: string): Promise<void> {
  await deleteDoc(doc(db, 'groups', groupId, 'slots', slotId));
}
