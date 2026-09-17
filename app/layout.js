import "./globals.css";
import { PageReveal } from "@/components/PageReveal";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://tonaura.com").replace(/\/$/, "");
const description =
  "Solfeggio tone mixer for calm practice. One account on the website and in the Tonaura app.";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Tonaura — Solfeggio Tone Therapy",
    template: "%s · Tonaura",
  },
  description,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Tonaura",
    title: "Tonaura — Solfeggio Tone Therapy",
    description,
    images: [
      {
        url: "/images/brand/lockup.png",
        alt: "Tonaura",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tonaura — Solfeggio Tone Therapy",
    description,
    images: ["/images/brand/lockup.png"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: "Tonaura",
      url: "https://tonaura.com",
      logo: "https://tonaura.com/images/brand/mark.png",
      parentOrganization: {
        "@type": "Organization",
        name: "Empowered Dynamics FZ-LLC",
        url: "https://empowerdynamics.co",
      },
      sameAs: [
        "https://www.linkedin.com/company/empowered-dynamics/about",
        "https://x.com/PoweredDynamics",
        "https://www.instagram.com/empowereddynamics/",
      ],
    },
    {
      "@type": "WebSite",
      name: "Tonaura",
      url: "https://tonaura.com",
      description,
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        {children}
        <PageReveal />
      </body>
    </html>
  );
}
