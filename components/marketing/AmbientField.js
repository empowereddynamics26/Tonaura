/**
 * AmbientField — the global atmospheric background.
 *
 * Two soft gradient blobs (gold + teal) drifting slowly.
 * Mounted once in app/layout.js — appears on every page.
 *
 * The small periodic ripple is NOT here. It lives in AmbientRipple
 * and is mounted in the marketing layout (excluded from the homepage).
 */
export function AmbientField() {
  return (
    <div className="ambient-field" aria-hidden="true">
      <div className="ambient-blob ambient-blob--gold" />
      <div className="ambient-blob ambient-blob--teal" />
    </div>
  );
}