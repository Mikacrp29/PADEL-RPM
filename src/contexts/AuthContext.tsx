import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User } from 'firebase/auth';
import {
  subscribeToAuthChanges,
  signInWithGoogle,
  signUpWithEmail,
  signInWithEmail,
  sendResetPasswordEmail,
  signOutUser,
} from '../firebase/auth';
import { ensureUserProfile, updateUserNickname, type UserProfile } from '../firebase/users';

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signInGoogle: () => Promise<void>;
  signUp: (email: string, password: string, nickname: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  setNickname: (nickname: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(async (nextUser) => {
      setUser(nextUser);
      if (nextUser) {
        const p = await ensureUserProfile(
          nextUser.uid,
          nextUser.email,
          nextUser.displayName ?? ''
        );
        setProfile(p);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signInGoogle = useCallback(async () => {
    await signInWithGoogle();
  }, []);

  const signUp = useCallback(async (email: string, password: string, nickname: string) => {
    await signUpWithEmail(email, password, nickname);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    await signInWithEmail(email, password);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    await sendResetPasswordEmail(email);
  }, []);

  const signOut = useCallback(async () => {
    await signOutUser();
  }, []);

  const setNickname = useCallback(
    async (nickname: string) => {
      if (!user) return;
      await updateUserNickname(user.uid, nickname);
      setProfile((prev) => (prev ? { ...prev, nickname: nickname.trim() } : prev));
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, signInGoogle, signUp, signIn, resetPassword, signOut, setNickname }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
