import { useCallback, useState } from 'react';

const KEY = 'padel:favoriteGroups';
const MAX_GROUPS = 20;

export interface FavoriteGroup {
  code: string;
  name: string;
}

function readStored(): FavoriteGroup[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // Corrupted JSON or localStorage unavailable — start from an empty list
    // rather than throwing and breaking the home page.
    return [];
  }
}

function writeStored(groups: FavoriteGroup[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(groups));
  } catch {
    // Private browsing (Safari) or quota exceeded: the in-memory React
    // state above still updates so the UI stays responsive for this
    // session, it just won't survive a reload. Silently ignored on
    // purpose — this is not worth interrupting the user over.
  }
}

/**
 * Remembers every group this browser has explicitly starred as a favorite,
 * so someone in several groups can jump back into any of them from the home
 * screen without needing to re-type or re-find each invite code.
 *
 * Storage: plain localStorage, scoped to "this browser on this device" —
 * which already matches the app's stated limitation (same browser = same
 * favorites, no cross-device sync without a real account). No Firebase
 * involved: introducing it here would add reads/writes and complexity for
 * a scope localStorage already provides for free.
 */
export function useFavoriteGroups() {
  const [groups, setGroups] = useState<FavoriteGroup[]>(() => readStored());

  const addGroup = useCallback((code: string, name: string) => {
    setGroups((prev) => {
      const next = [{ code, name }, ...prev.filter((g) => g.code !== code)].slice(
        0,
        MAX_GROUPS
      );
      writeStored(next);
      return next;
    });
  }, []);

  const removeGroup = useCallback((code: string) => {
    setGroups((prev) => {
      const next = prev.filter((g) => g.code !== code);
      writeStored(next);
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (code: string) => groups.some((g) => g.code === code),
    [groups]
  );

  return { groups, addGroup, removeGroup, isFavorite };
}
