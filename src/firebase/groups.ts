import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  increment,
  updateDoc,
} from 'firebase/firestore';
import { db } from './config';
import { trackEvent } from '../lib/analytics';
import type { Group } from '../types';

/**
 * Invite codes double as the Firestore document id for O(1) lookups when
 * someone pastes a code or opens a /join/:code link — no query needed.
 */
export function generateInviteCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no O/0/I/1 ambiguity
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `PADEL-${code}`;
}

export async function createGroup(name: string, creatorName: string): Promise<Group> {
  let inviteCode = generateInviteCode();

  // Extremely unlikely, but guard against a collision on the generated code.
  for (let attempt = 0; attempt < 5; attempt++) {
    const existing = await getDoc(doc(db, 'groups', inviteCode));
    if (!existing.exists()) break;
    inviteCode = generateInviteCode();
  }

  const groupRef = doc(db, 'groups', inviteCode);
  const groupData = {
    name: name.trim(),
    inviteCode,
    createdAt: serverTimestamp(),
    createdBy: creatorName.trim() || 'Anonyme',
    bookingUrl: '',
    memberCount: creatorName.trim() ? 1 : 0,
  };
  await setDoc(groupRef, groupData);

  trackEvent('create_group', { group_code: inviteCode, group_name: groupData.name });

  return {
    id: inviteCode,
    ...groupData,
    createdAt: null,
  };
}

export async function getGroupByCode(code: string): Promise<Group | null> {
  const normalized = code.trim().toUpperCase();
  const snap = await getDoc(doc(db, 'groups', normalized));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as Omit<Group, 'id'>) };
}

export async function touchGroupMemberCount(groupId: string): Promise<void> {
  await updateDoc(doc(db, 'groups', groupId), { memberCount: increment(1) });
}

export async function setBookingUrl(groupId: string, url: string): Promise<void> {
  await updateDoc(doc(db, 'groups', groupId), { bookingUrl: url });
}
