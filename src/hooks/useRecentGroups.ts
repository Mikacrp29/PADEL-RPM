import { useState, useCallback } from 'react';

const KEY = 'padel:recentGroups';
const MAX_RECENT = 5;

export interface RecentGroup {
  code: string;
  name: string;
}

function readStored(): RecentGroup[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStored(groups: RecentGroup[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(groups));
  } catch {
    // Non-fatal — just won't persist for the next visit.
  }
}

/**
 * Automatically tracks the last 5 groups this browser has opened — unlike
 * favorites (opt-in, via the star button), this list updates itself on
 * every visit. It's the safety net for someone who forgot to star a group
 * or lost the original invite link: as long as they visited it once from
 * this browser, it stays findable here for a while.
 */
export function useRecentGroups() {
  const [recents, setRecents] = useState<RecentGroup[]>(() => readStored());

  const addRecent = useCallback((code: string, name: string) => {
    setRecents((prev) => {
      const next = [{ code, name }, ...prev.filter((g) => g.code !== code)].slice(
        0,
        MAX_RECENT
      );
      writeStored(next);
      return next;
    });
  }, []);

  return { recents, addRecent };
}
