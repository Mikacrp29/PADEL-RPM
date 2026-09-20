import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import { setAnalyticsEnabled } from '../lib/analytics';

const KEY = 'padel:cookieConsent';

interface ConsentState {
  necessary: true;
  analytics: boolean;
  timestamp: number;
}

function readStoredConsent(): ConsentState | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.analytics !== 'boolean') return null;
    return {
      necessary: true,
      analytics: parsed.analytics,
      timestamp: typeof parsed.timestamp === 'number' ? parsed.timestamp : Date.now(),
    };
  } catch {
    return null;
  }
}

interface ConsentContextValue {
  consent: ConsentState | null;
  bannerOpen: boolean;
  openBanner: () => void;
  closeBanner: () => void;
  setConsent: (analytics: boolean) => void;
}

const ConsentContext = createContext<ConsentContextValue | undefined>(undefined);

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsentState] = useState<ConsentState | null>(() => readStoredConsent());
  const [bannerOpen, setBannerOpen] = useState<boolean>(() => readStoredConsent() === null);

  useEffect(() => {
    setAnalyticsEnabled(consent?.analytics ?? false);
  }, [consent]);

  const setConsent = useCallback((analytics: boolean) => {
    const next: ConsentState = { necessary: true, analytics, timestamp: Date.now() };
    setConsentState(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      // Non-fatal: the choice just won't survive a reload this time.
    }
    setBannerOpen(false);
  }, []);

  const openBanner = useCallback(() => setBannerOpen(true), []);
  const closeBanner = useCallback(() => setBannerOpen(false), []);

  return (
    <ConsentContext.Provider value={{ consent, bannerOpen, openBanner, closeBanner, setConsent }}>
      {children}
    </ConsentContext.Provider>
  );
}

export function useConsent() {
  const ctx = useContext(ConsentContext);
  if (!ctx) throw new Error('useConsent must be used within ConsentProvider');
  return ctx;
}