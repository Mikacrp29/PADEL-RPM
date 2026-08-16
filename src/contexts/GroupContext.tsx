import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { getGroupByCode } from '../firebase/groups';
import { useLanguage } from './LanguageContext';
import type { Group } from '../types';

interface GroupContextValue {
  group: Group | null;
  loading: boolean;
  error: string | null;
  loadGroup: (code: string) => Promise<Group | null>;
  clearGroup: () => void;
}

const GroupContext = createContext<GroupContextValue | undefined>(undefined);

export function GroupProvider({ children }: { children: ReactNode }) {
  const { t } = useLanguage();
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadGroup = useCallback(
    async (code: string) => {
      setLoading(true);
      setError(null);
      try {
        const found = await getGroupByCode(code);
        if (!found) {
          setError(t('joinGroup.errorNotFound'));
          setGroup(null);
          return null;
        }
        setGroup(found);
        return found;
      } catch {
        setError(t('joinGroup.errorNetwork'));
        return null;
      } finally {
        setLoading(false);
      }
    },
    [t]
  );

  const clearGroup = useCallback(() => setGroup(null), []);

  return (
    <GroupContext.Provider value={{ group, loading, error, loadGroup, clearGroup }}>
      {children}
    </GroupContext.Provider>
  );
}

export function useGroup() {
  const ctx = useContext(GroupContext);
  if (!ctx) throw new Error('useGroup must be used within a GroupProvider');
  return ctx;
}
