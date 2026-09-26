import Link from "next/link";
import "./auth.css";

/**
 * AuthShell — layout wrapper for the auth pages.
 * Renders a minimal top nav (logo + back to home) and a centered
 * ambient background. No footer, no full site nav.
 */
export function AuthShell({ children }) {
  return (
    <div className="auth-shell">
      <div className="auth-shell-glow" aria-hidden="true" />
      <div className="auth-shell-glow auth-shell-glow--teal" aria-hidden="true" />

      <nav className="auth-nav">
        <Link href="/" className="auth-nav-brand" aria-label="Tonaura home">
          <img
            src="/images/brand/lockup.png"
            width="160"
            height="52"
            alt="Tonaura"
          />
        </Link>
        <Link className="auth-nav-back" href="/">
          <span aria-hidden="true">←</span> Back to home
        </Link>
      </nav>

      <main className="auth-main">{children}</main>
    </div>
  );
}