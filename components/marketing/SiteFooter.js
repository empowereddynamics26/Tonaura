"use client";

import Link from "next/link";

/**
 * SiteFooter — the single footer for every public-facing page.
 *
 * Three tiers:
 *   1. Sign-off — diamond ornament, tagline in serif, gold hairline
 *   2. Content — 4 columns (brand + 3 link groups)
 *   3. Closing — copyright + cookie preferences
 */
export function SiteFooter() {
  function openCookiePrefs(e) {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent("tonaura:open-cookie-prefs"));
  }

  return (
    <footer className="site-footer">
      {/* Tier 1 — Sign-off */}
      <div className="footer-signoff">
        <span className="footer-diamond" aria-hidden="true" />
        <p className="footer-signoff-line">
          Nine solfeggio tones.
          <br />
          One place to be still.
        </p>
        <span className="footer-signoff-rule" aria-hidden="true" />
      </div>

      {/* Tier 2 — Content */}
      <div className="footer-inner">
        <div className="footer-brand-col">
          <img
            className="footer-lockup"
            src="/images/brand/lockup.png"
            alt="Tonaura — Solfeggio Tone Therapy"
          />
          <p className="footer-tagline">
            A calm solfeggio mixer for practice, presets, and living Theme Packs.
          </p>
          <div className="footer-social">
            <a
              href="https://www.linkedin.com/company/empowered-dynamics/about"
              target="_blank"
              rel="noopener noreferrer"
              className="social-linkedin"
              aria-label="LinkedIn"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M4.5 9h3v11h-3V9Zm1.5-5a1.7 1.7 0 1 1 0 3.4A1.7 1.7 0 0 1 6 4ZM10.5 9h2.9v1.6h.04c.4-.8 1.5-1.7 3-1.7 3.2 0 3.8 2.1 3.8 4.9V20h-3v-5.7c0-1.3 0-3-1.9-3s-2.1 1.4-2.1 2.9V20h-3V9Z" />
              </svg>
            </a>
            <a
              href="https://x.com/PoweredDynamics"
              target="_blank"
              rel="noopener noreferrer"
              className="social-x"
              aria-label="X"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M13.3 10.4 20.1 3h-1.9l-5.9 6.4L7.6 3H2l7.2 10.2L2 21h1.9l6.2-6.7L15.6 21H21l-7.7-10.6Zm-2.2 2.4-.7-1L4.6 4.4h2l4.6 6.5.7 1 6 8.4h-2l-4.8-6.9Z" />
              </svg>
            </a>
            <a
              href="https://www.instagram.com/empowereddynamics/"
              target="_blank"
              rel="noopener noreferrer"
              className="social-instagram"
              aria-label="Instagram"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
              </svg>
            </a>
            <a
              href="https://www.youtube.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="social-youtube"
              aria-label="YouTube"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M22 8.4s-.2-1.5-.8-2.2c-.8-.8-1.6-.8-2-.9C16.5 5 12 5 12 5h0s-4.5 0-7.2.3c-.4 0-1.2.1-2 .9-.6.7-.8 2.2-.8 2.2S2 10.2 2 12v1.6c0 1.8.2 3.6.2 3.6s.2 1.5.8 2.2c.8.8 1.8.8 2.3.9 1.7.1 7 .3 7 .3s4.5 0 7.2-.3c.4 0 1.2-.1 2-.9.6-.7.8-2.2.8-2.2s.2-1.8.2-3.6V12c0-1.8-.2-3.6-.2-3.6ZM10 15.2V8.9l5.7 3.2-5.7 3.1Z" />
              </svg>
            </a>
            <a
              href="https://www.tiktok.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="social-tiktok"
              aria-label="TikTok"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M16.5 3c.3 2.1 1.7 3.8 3.8 4.1v2.8c-1.4 0-2.7-.4-3.8-1.2v6.6c0 3.3-2.7 5.7-5.8 5.7-3.2 0-5.8-2.6-5.8-5.8s2.6-5.8 5.8-5.8c.3 0 .6 0 .9.1v2.9a2.9 2.9 0 1 0 2 2.8V3h2.9Z" />
              </svg>
            </a>
          </div>
        </div>

        <div className="footer-col">
          <h4 className="footer-col-heading">Legal</h4>
          <Link href="/acceptable-use">Acceptable Use Policy</Link>
          <Link href="/billing">Subscription &amp; Billing</Link>
          <Link href="/wellness-disclaimer">Health &amp; Wellness Disclaimer</Link>
          <Link href="/dpa">Data Processing Addendum</Link>
        </div>

        <div className="footer-col">
          <h4 className="footer-col-heading">Company</h4>
          <Link href="/about">About</Link>
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms of Service</Link>
          <Link href="/cookies">Cookie Policy</Link>
        </div>

        <div className="footer-col">
          <h4 className="footer-col-heading">Support</h4>
          <Link href="/support">Help Centre</Link>
          <Link href="/contact">Contact Us</Link>
          <Link href="/status">Service Status</Link>
        </div>
      </div>

      {/* Tier 3 — Closing */}
      <div className="footer-bottom">
        <span className="footer-copyright">
          © 2026 Tonaura · Owned by{" "}
          <a href="https://empowerdynamics.co" target="_blank" rel="noopener">
            Empowered Dynamics FZ-LLC
          </a>
        </span>
        <button
          type="button"
          className="cookie-prefs"
          onClick={openCookiePrefs}
        >
          Cookie Preferences
        </button>
      </div>
    </footer>
  );
}