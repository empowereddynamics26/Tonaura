import "./globals.css";
import "./ambient.css";
import { Instrument_Serif, Plus_Jakarta_Sans } from "next/font/google";
import { PageReveal } from "@/components/marketing/PageReveal";
import { AmbientField } from "@/components/marketing/AmbientField";
import { MouseGlow } from "@/components/marketing/MouseGlow";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-instrument-serif",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-plus-jakarta",
});

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
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${plusJakarta.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <AmbientField />
        <MouseGlow />
        {children}
        <PageReveal />
      </body>
    </html>
  );
}