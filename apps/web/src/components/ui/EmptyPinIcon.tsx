/**
 * On-brand glyph for empty states: a pin lifted from the board, leaving a
 * faint dashed hole behind. Reads as "nothing pinned here yet" rather than
 * a generic empty-box icon. Uses currentColor so callers tint it (e.g.
 * `text-pin/40`) to match the muted, on-brand treatment.
 */
export function EmptyPinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" aria-hidden="true" className={className}>
      <circle cx="20" cy="21" r="15" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2.5 4" opacity="0.5" />
      <path
        d="M20 11c-2.49 0-4.5 2.01-4.5 4.5 0 2.01 1.32 3.71 3.14 4.29L18 24h4l-.64-4.21c1.82-.58 3.14-2.28 3.14-4.29 0-2.49-2.01-4.5-4.5-4.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <line x1="20" y1="24" x2="20" y2="28.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
