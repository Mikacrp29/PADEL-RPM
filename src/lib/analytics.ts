// Single entry point for all custom GA4 events. Reuses the `gtag` function
// already loaded by the <script> tag in index.html (see the "Google tag
// (gtag.js)" block) — this file never calls gtag('config', ...) again, so
// there is no risk of a second/duplicate GA4 initialization.

type GtagFn = (
  command: 'event',
  eventName: string,
  params?: Record<string, string | number | boolean>
) => void;

declare global {
  interface Window {
    gtag?: GtagFn;
  }
}

export function trackEvent(
  name: string,
  params?: Record<string, string | number | boolean>
): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  window.gtag('event', name, params);
}

/** Formats a Date as the compact date/time params used across events. */
export function eventDateParams(date: Date): { date: string; time: string } {
  const pad = (n: number) => String(n).padStart(2, '0');
  return {
    date: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    time: `${pad(date.getHours())}:${pad(date.getMinutes())}`,
  };
}
