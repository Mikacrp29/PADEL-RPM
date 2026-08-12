const KEY = 'padel:anonymousUserId';

function generateId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID (older Safari).
  return `anon-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/**
 * Returns a stable, anonymous, per-browser identifier. Nothing personal is
 * ever attached to it, and it is never shown to the user.
 *
 * It is not currently used to key anything in Firestore — favorites already
 * live in localStorage, which is inherently scoped to "this browser on this
 * device", the same scope this id would give us. It's kept available for a
 * future feature that would genuinely need a stable per-device identity
 * (e.g. syncing something through Firestore) without having to introduce it
 * later as a breaking change.
 */
export function getAnonymousId(): string {
  try {
    const existing = localStorage.getItem(KEY);
    if (existing) return existing;
    const fresh = generateId();
    localStorage.setItem(KEY, fresh);
    return fresh;
  } catch {
    // localStorage unavailable (private browsing, quota, etc.) — fall back
    // to a per-session id so callers still get a valid string.
    return generateId();
  }
}
