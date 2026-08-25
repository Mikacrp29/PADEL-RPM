/**
 * Blends a hex color toward white by `amount` (0 = unchanged, 1 = white).
 * Used to derive a slightly lighter shade of a status color based on how
 * many players have joined within that status's range — e.g. a slot with
 * 2/4 players reads as a marginally lighter blue than one with 1/4, so two
 * same-status slots overlapping on the calendar stay visually distinct.
 */
export function lighten(hex: string, amount: number): string {
  const clamped = Math.max(0, Math.min(1, amount));
  const num = parseInt(hex.replace('#', ''), 16);
  const r = (num >> 16) & 0xff;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;

  const mix = (channel: number) => Math.round(channel + (255 - channel) * clamped);

  const toHex = (channel: number) => channel.toString(16).padStart(2, '0');

  return `#${toHex(mix(r))}${toHex(mix(g))}${toHex(mix(b))}`;
}