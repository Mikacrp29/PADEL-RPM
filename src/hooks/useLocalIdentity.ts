import { useCallback, useState } from 'react';

const NICKNAME_KEY = 'padel:nickname';
const LAST_GROUP_KEY = 'padel:lastGroupCode';

/**
 * Persists the player's nickname and last visited group in localStorage.
 * This is the entire "identity" system by design: no accounts, no auth.
 */
export function useLocalIdentity() {
  const [nickname, setNicknameState] = useState<string>(
    () => localStorage.getItem(NICKNAME_KEY) ?? ''
  );
  const [lastGroupCode, setLastGroupCodeState] = useState<string | null>(
    () => localStorage.getItem(LAST_GROUP_KEY)
  );

  const setNickname = useCallback((value: string) => {
    setNicknameState(value);
    localStorage.setItem(NICKNAME_KEY, value);
  }, []);

  const setLastGroupCode = useCallback((code: string) => {
    setLastGroupCodeState(code);
    localStorage.setItem(LAST_GROUP_KEY, code);
  }, []);

  return { nickname, setNickname, lastGroupCode, setLastGroupCode };
}
