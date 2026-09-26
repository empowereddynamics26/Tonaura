/**
 * TrustStrip — the "No ads / No account required / Works fully offline"
 * band at the bottom of legal pages.
 */
export function TrustStrip() {
  return (
    <div className="trust-strip">
      <div className="trust-item">
        <div className="trust-dot" />
        <span>No ads</span>
      </div>
      <div className="trust-item">
        <div className="trust-dot" />
        <span>No account required</span>
      </div>
      <div className="trust-item">
        <div className="trust-dot" />
        <span>Works fully offline</span>
      </div>
    </div>
  );
}