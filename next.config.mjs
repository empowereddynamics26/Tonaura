/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV !== "production";

const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data: https://fonts.gstatic.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      // Dev needs 'unsafe-eval' for React refresh; production does not.
      isDev
        ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
        : "script-src 'self' 'unsafe-inline'",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://buy.stripe.com",
      "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://buy.stripe.com",
      "upgrade-insecure-requests",
    ].join("; "),
  },
];

const nextConfig = {
  poweredByHeader: false,

  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },

  async redirects() {
    return [
      // Legal pages
      { source: "/terms.html",                destination: "/terms",                permanent: true },
      { source: "/privacy.html",              destination: "/privacy",              permanent: true },
      { source: "/cookies.html",              destination: "/cookies",              permanent: true },
      { source: "/dpa.html",                  destination: "/dpa",                  permanent: true },
      { source: "/billing.html",              destination: "/billing",              permanent: true },
      { source: "/wellness-disclaimer.html",  destination: "/wellness-disclaimer",  permanent: true },
      { source: "/acceptable-use.html",       destination: "/acceptable-use",       permanent: true },

      // Content pages
      { source: "/about.html",                destination: "/about",                permanent: true },
      { source: "/compare.html",              destination: "/compare",              permanent: true },
      { source: "/support.html",              destination: "/support",              permanent: true },
      { source: "/contact.html",              destination: "/contact",              permanent: true },
      { source: "/status.html",               destination: "/status",               permanent: true },

      // Homepage (old static file — legacy bookmark safety)
      { source: "/index.html",                destination: "/",                     permanent: true },
    ];
  },

  // No rewrites — app/(marketing)/page.js now serves "/"
};

export default nextConfig;