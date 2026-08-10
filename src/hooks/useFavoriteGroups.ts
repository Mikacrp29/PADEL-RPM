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
    return [];
  }
}

/**
 * Remembers every group this browser has created or joined, so someone in
 * several groups can jump back into any of them from the home screen
 * without needing to re-type or re-find each invite code — the closest
 * thing to an account list we can offer without actual accounts.
 */
export function useFavoriteGroups() {
  const [groups, setGroups] = useState<FavoriteGroup[]>(() => readStored());

  const addGroup = useCallback((code: string, name: string) => {
    setGroups((prev) => {
      const next = [{ code, name }, ...prev.filter((g) => g.code !== code)].slice(
        0,
        MAX_GROUPS
      );
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const removeGroup = useCallback((code: string) => {
    setGroups((prev) => {
      const next = prev.filter((g) => g.code !== code);
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (code: string) => groups.some((g) => g.code === code),
    [groups]
  );

  return { groups, addGroup, removeGroup, isFavorite };
}
