export function PadelIcon({ size = 40, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <ellipse cx="9.5" cy="9.5" rx="6.5" ry="6.5" />
      <path d="M9.5 4.2v10.6M5.4 6.4l8.2 6.2M13.6 6.4l-8.2 6.2" opacity="0.5" />
      <path d="M13.9 13.9L19 19" />
      <path d="M17.6 17.6l2.2 2.2a1.3 1.3 0 0 1-1.8 1.8l-2.2-2.2" />
      <circle cx="18.5" cy="6.5" r="2.5" />
    </svg>
  );
}