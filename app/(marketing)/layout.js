import "./marketing.css";
import { SiteNav } from "@/components/marketing/SiteNav";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { CookieModal } from "@/components/marketing/CookieModal";
import { ScrollToTop } from "@/components/marketing/ScrollToTop";
import { AmbientRipple } from "@/components/marketing/AmbientRipple";

export default function MarketingLayout({ children }) {
  return (
    <>
      <AmbientRipple />
      <SiteNav />
      <main id="main-content" className="marketing-main">
        {children}
      </main>
      <SiteFooter />
      <CookieModal />
      <ScrollToTop />
    </>
  );
}