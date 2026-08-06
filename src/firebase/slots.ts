import {
  collection,
  doc,
  addDoc,
  updateDoc,
  onSnapshot,
  query,
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

/**
 * Subscribes to every slot of a group in real time. Any create/join/leave
 * anywhere is reflected to every connected member within the callback.
 */
export function subscribeToSlots(
  groupId: string,
  onChange: (slots: Slot[]) => void
): () => void {
  const q = query(slotsCol(groupId), orderBy('start', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const slots = snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Slot, 'id'>) }));
    onChange(slots);
  });
}

export async function createSlot(
  groupId: string,
  start: Date,
  end: Date,
  creatorName: string
): Promise<string> {
  const firstParticipant: Participant = {
    name: creatorName.trim(),
    joinedAt: Timestamp.now(),
  };
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

/** Adds a nickname to a slot's participant list (no-op if already present, enforced by caller). */
export async function joinSlot(groupId: string, slotId: string, nickname: string): Promise<void> {
  const participant: Participant = { name: nickname.trim(), joinedAt: Timestamp.now() };
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
