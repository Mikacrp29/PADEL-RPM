import { doc, getDoc, setDoc, serverTimestamp, type Timestamp } from 'firebase/firestore';
import { db } from './config';
import type { FavoriteGroup } from '../types';

export interface UserProfile {
  uid: string;
  email: string | null;
  nickname: string;
  createdAt: Timestamp | null;
  notifyByEmail: boolean;
  notifyByPush: boolean;
  favorites: FavoriteGroup[];
}

function profileRef(uid: string) {
  return doc(db, 'users', uid);
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(profileRef(uid));
  if (!snap.exists()) return null;
  const data = snap.data() as UserProfile;
  // Defensive default for profiles created before `favorites` existed.
  return { ...data, favorites: data.favorites ?? [] };
}

/**
 * Creates the profile document on first sign-in, or returns the existing
 * one untouched. Called right after a successful sign-in/sign-up so every
 * authenticated user always has a matching Firestore profile.
 */
export async function ensureUserProfile(
  uid: string,
  email: string | null,
  defaultNickname: string
): Promise<UserProfile> {
  const existing = await getUserProfile(uid);
  if (existing) return existing;

  const profile = {
    uid,
    email,
    nickname: defaultNickname.trim() || (email ? email.split('@')[0] : 'Joueur'),
    createdAt: serverTimestamp(),
    notifyByEmail: false,
    notifyByPush: false,
    favorites: [] as FavoriteGroup[],
  };
  await setDoc(profileRef(uid), profile);
  return { ...profile, createdAt: null };
}

export async function updateUserNickname(uid: string, nickname: string): Promise<void> {
  await setDoc(profileRef(uid), { nickname: nickname.trim() }, { merge: true });
}

export async function updateNotificationPrefs(
  uid: string,
  prefs: Partial<Pick<UserProfile, 'notifyByEmail' | 'notifyByPush'>>
): Promise<void> {
  await setDoc(profileRef(uid), prefs, { merge: true });
}

/** Overwrites the account's favorite groups list with the given array. */
export async function updateUserFavorites(uid: string, favorites: FavoriteGroup[]): Promise<void> {
  await setDoc(profileRef(uid), { favorites }, { merge: true });
}