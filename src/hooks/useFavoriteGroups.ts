import { useCallback, useEffect, useRef, useState } from 'react';
import { trackEvent } from '../lib/analytics';
import { useAuth } from '../contexts/AuthContext';
import type { FavoriteGroup } from '../types';

const KEY = 'padel:favoriteGroups';
const MAX_GROUPS = 20;

function readStored(): FavoriteGroup[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStored(groups: FavoriteGroup[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(groups));
  } catch {
    // Private browsing (Safari) or quota exceeded: silently ignored, not
    // worth interrupting the user over — see mergeLists() for why this
    // matters less once an account is involved anyway.
  }
}

function mergeLists(a: FavoriteGroup[], b: FavoriteGroup[]): FavoriteGroup[] {
  const merged = [...a];
  for (const group of b) {
    if (!merged.some((g) => g.code === group.code)) merged.push(group);
  }
  return merged.slice(0, MAX_GROUPS);
}

/**
 * Remembers every group this browser (or account) has explicitly starred
 * as a favorite.
 *
 * - Logged out: plain localStorage, scoped to "this browser on this
 *   device" — the only thing possible without an account.
 * - Logged in: the account's Firestore profile (`users/{uid}.favorites`)
 *   becomes the source of truth instead, so favorites follow the person
 *   across any browser or device they sign into.
 * - The moment someone signs in, any favorites they'd already starred
 *   locally (before having an account, or on a browser they hadn't linked
 *   yet) are merged into their account once, so nothing gets silently
 *   dropped by creating an account later.
 */
export function useFavoriteGroups() {
  const { user, profile, setFavorites } = useAuth();
  const [localGroups, setLocalGroups] = useState<FavoriteGroup[]>(() => readStored());
  const mergedForUid = useRef<string | null>(null);

  const loggedIn = !!user && !!profile;
  const groups = loggedIn ? (profile!.favorites ?? []) : localGroups;

  // One-time merge of any locally-starred groups into the account, right
  // after sign-in. Guarded by mergedForUid so it only ever runs once per
  // session per account, not on every profile update afterwards.
  useEffect(() => {
    if (!loggedIn || mergedForUid.current === user!.uid) return;
    mergedForUid.current = user!.uid;

    const local = readStored();
    if (local.length === 0) return;

    const merged = mergeLists(profile!.favorites ?? [], local);
    if (merged.length !== (profile!.favorites?.length ?? 0)) {
      setFavorites(merged);
    }
    // The account is now the source of truth — clear the local copy so a
    // later sign-out doesn't resurrect a stale pre-account list.
    writeStored([]);
    setLocalGroups([]);
  }, [loggedIn, user, profile, setFavorites]);

  const addGroup = useCallback(
    (code: string, name: string) => {
      if (loggedIn) {
        const next = [{ code, name }, ...(profile!.favorites ?? []).filter((g) => g.code !== code)].slice(
          0,
          MAX_GROUPS
        );
        setFavorites(next);
      } else {
        setLocalGroups((prev) => {
          const next = [{ code, name }, ...prev.filter((g) => g.code !== code)].slice(0, MAX_GROUPS);
          writeStored(next);
          return next;
        });
      }
      trackEvent('favorite_group', { group_code: code });
    },
    [loggedIn, profile, setFavorites]
  );

  const removeGroup = useCallback(
    (code: string) => {
      if (loggedIn) {
        setFavorites((profile!.favorites ?? []).filter((g) => g.code !== code));
      } else {
        setLocalGroups((prev) => {
          const next = prev.filter((g) => g.code !== code);
          writeStored(next);
          return next;
        });
      }
    },
    [loggedIn, profile, setFavorites]
  );

  const isFavorite = useCallback((code: string) => groups.some((g) => g.code === code), [groups]);

  return { groups, addGroup, removeGroup, isFavorite };
}