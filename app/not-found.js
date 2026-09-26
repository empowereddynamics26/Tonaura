import Link from "next/link";

export default function RootNotFound() {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#050507",
          color: "#f2ead9",
          fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
          textAlign: "center",
          padding: "24px",
        }}
      >
        <div style={{ maxWidth: 400 }}>
          <span
            aria-hidden="true"
            style={{
              display: "block",
              width: 9,
              height: 9,
              background: "#d4a95e",
              transform: "rotate(45deg)",
              margin: "0 auto 32px",
              boxShadow: "0 0 12px rgba(212,169,94,0.55), 0 0 24px rgba(212,169,94,0.25)",
            }}
          />
          <h1
            style={{
              fontFamily: "'Instrument Serif', Georgia, serif",
              fontSize: "clamp(32px, 5vw, 44px)",
              fontWeight: 400,
              letterSpacing: "-0.02em",
              lineHeight: 1.15,
              margin: "0 0 20px",
              color: "#f2ead9",
            }}
          >
            This page has drifted.
          </h1>
          <p
            style={{
              fontSize: 15,
              lineHeight: 1.6,
              color: "#a8a4b0",
              margin: "0 0 32px",
            }}
          >
            The link you followed doesn&rsquo;t lead anywhere.
          </p>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "14px 28px",
              background:
                "linear-gradient(180deg, #f0c878 0%, #d4a95e 55%, #a67c3a 100%)",
              color: "#1a1408",
              borderRadius: 999,
              fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
              fontSize: 14,
              fontWeight: 600,
              textDecoration: "none",
              letterSpacing: "0.01em",
            }}
          >
            Return home
          </Link>
        </div>
      </body>
    </html>
  );
}