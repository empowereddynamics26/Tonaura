import "./globals.css";
import { PageReveal } from "@/components/PageReveal";

export const metadata = {
  title: "Tonaura",
  description: "Solfeggio tone mixer. One account on the website and in the app.",
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
      </head>
      <body>
        {children}
        <PageReveal />
      </body>
    </html>
  );
}
