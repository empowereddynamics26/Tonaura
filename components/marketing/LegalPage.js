import { LegalToc } from "./LegalToc";
import { WordReveal } from "./WordReveal";
import { TrustStrip } from "./TrustStrip";

export function LegalPage({
  eyebrow = "Legal",
  title,
  lead,
  meta,
  tocSections,
  children,
}) {
  return (
    <>
      <section className="legal-hero">
        <img
          className="legal-hero-mark"
          src="/images/brand/mark.png"
          alt=""
          width="64"
          height="64"
        />
        <span className="eyebrow-badge">{eyebrow}</span>
        <WordReveal>{title}</WordReveal>
        {lead ? <p className="lead">{lead}</p> : null}
        {meta ? <div className="legal-meta">{meta}</div> : null}
        <span className="legal-hero-rule" aria-hidden="true" />
      </section>

      <div className="legal-layout">
        {tocSections && tocSections.length > 0 ? (
          <LegalToc sections={tocSections} />
        ) : null}
        <div className="legal-content">{children}</div>
      </div>

      <TrustStrip />
    </>
  );
}