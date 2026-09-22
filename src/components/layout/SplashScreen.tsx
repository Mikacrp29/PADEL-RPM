import { useEffect, useState } from 'react';

const SESSION_KEY = 'padel:splashShown';

function alreadyShown(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1';
  } catch {
    return true;
  }
}

function markShown() {
  try {
    sessionStorage.setItem(SESSION_KEY, '1');
  } catch {
    // Non-fatal — worst case the splash reappears next load.
  }
}

const FADE_MS = 400;

export function SplashScreen() {
  const [visible, setVisible] = useState(() => !alreadyShown());
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    if (!visible) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const holdDuration = reducedMotion ? 600 : 1500;

    const fadeTimer = window.setTimeout(() => setFadingOut(true), holdDuration);
    const hideTimer = window.setTimeout(() => {
      setVisible(false);
      markShown();
    }, holdDuration + FADE_MS);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(hideTimer);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[200] flex items-center justify-center bg-court-950 transition-opacity duration-[400ms] ${
        fadingOut ? 'opacity-0' : 'opacity-100'
      }`}
      aria-hidden
    >
      <img src="/logo.webp" alt="" className="splash-logo h-24 w-24 rounded-2xl" />
    </div>
  );
}