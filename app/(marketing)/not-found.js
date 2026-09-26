import Link from "next/link";

export default function NotFound() {
  return (
    <section className="notfound">
      <div className="notfound-inner">
        <span className="notfound-diamond" aria-hidden="true" />

        <p className="notfound-eyebrow">Off the field</p>

        <h1 className="notfound-headline">
          This page has drifted.
        </h1>

        <p className="notfound-body">
          The link you followed doesn&rsquo;t lead anywhere.
          The tones are still here — let&rsquo;s return you somewhere calmer.
        </p>

        <div className="notfound-actions">
          <Link className="btn btn--primary btn--large" href="/">
            Return home
          </Link>
          <Link className="btn btn--ghost btn--large" href="/contact">
            <span className="btn-dot" />
            Contact support
          </Link>
        </div>

        <nav className="notfound-links" aria-label="Helpful destinations">
          <Link href="/about">About</Link>
          <Link href="/compare">Compare</Link>
          <Link href="/support">Support</Link>
          <Link href="/status">Status</Link>
        </nav>
      </div>
    </section>
  );
}