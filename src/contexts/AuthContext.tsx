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
import {
  ensureUserProfile,
  updateUserNickname,
  updateNotificationPrefs,
  type UserProfile,
} from '../firebase/users';

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
  setNotifyByEmail: (value: boolean) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(async (nextUser) => {
      setUser(nextUser);
      try {
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
      } catch {
        // If fetching/creating the Firestore profile fails (network hiccup,
        // rules issue, etc.), the person is still authenticated — just
        // without a profile yet. Previously this rejected promise skipped
        // the setLoading(false) below entirely, leaving the whole app
        // stuck showing "loading" forever on any screen that gates on it
        // (e.g. the admin page never got to show its login button).
        setProfile(null);
      } finally {
        setLoading(false);
      }
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

  const setNotifyByEmail = useCallback(
    async (value: boolean) => {
      if (!user) return;
      await updateNotificationPrefs(user.uid, { notifyByEmail: value });
      setProfile((prev) => (prev ? { ...prev, notifyByEmail: value } : prev));
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signInGoogle,
        signUp,
        signIn,
        resetPassword,
        signOut,
        setNickname,
        setNotifyByEmail,
      }}
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