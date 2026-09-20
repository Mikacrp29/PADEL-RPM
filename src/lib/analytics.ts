// Single entry point for all custom GA4 events, plus the consent gate that
// controls whether GA4 ever loads at all.
//
// Nothing here calls gtag('config', ...) except loadGA4() below, and that
// is only ever invoked by ConsentContext once the person has explicitly
// accepted statistics — never on page load, never speculatively.

const GA_MEASUREMENT_ID = 'G-0453BFQSMN';

type GtagFn = (...args: unknown[]) => void;

declare global {
  interface Window {
    gtag?: GtagFn;
    dataLayer?: unknown[];
  }
}

let ga4ScriptInjected = false;
let analyticsConsentGranted = false;

function loadGA4() {
  if (ga4ScriptInjected || typeof document === 'undefined') return;
  ga4ScriptInjected = true;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer!.push(args);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID);
}

function clearGA4Cookies() {
  if (typeof document === 'undefined') return;
  const names = document.cookie
    .split(';')
    .map((c) => c.trim().split('=')[0])
    .filter((name) => name === '_ga' || name.startsWith('_ga_'));

  const host = window.location.hostname;
  const expire = 'expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
  names.forEach((name) => {
    document.cookie = `${name}=; ${expire}`;
    document.cookie = `${name}=; ${expire}; domain=${host}`;
    document.cookie = `${name}=; ${expire}; domain=.${host}`;
  });
}

export function setAnalyticsEnabled(enabled: boolean): void {
  analyticsConsentGranted = enabled;
  if (enabled) {
    loadGA4();
  } else {
    clearGA4Cookies();
  }
}

export function trackEvent(
  name: string,
  params?: Record<string, string | number | boolean>
): void {
  if (!analyticsConsentGranted) return;
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  window.gtag('event', name, params);
}