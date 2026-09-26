"use client";

import { useEffect, useState } from "react";
import "./WelcomeTransition.css";

/**
 * WelcomeTransition — the branded arrival moment on /account.
 *
 * Shows a brief overlay (mark + breath + ring emission + greeting) when a
 * signed-in user lands on the account page, then fades to reveal the content.
 *
 * Plays once per session. Respects prefers-reduced-motion.
 */
export function WelcomeTransition({ ready, user }) {
  // Compute the initial phase synchronously so the overlay paints on
  // the same frame the page renders — no gap, no flicker.
  const [phase, setPhase] = useState(() => {
    if (typeof window === "undefined") return "done";
    if (!user) return "done";
    if (sessionStorage.getItem("tonaura_welcomed")) return "done";
    return "showing";
  });

  useEffect(() => {
    if (phase !== "showing") return;
    if (!ready) return;

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduce) {
      sessionStorage.setItem("tonaura_welcomed", "1");
      setPhase("done");
      return;
    }

    const t1 = setTimeout(() => setPhase("leaving"), 2400);
    const t2 = setTimeout(() => {
      sessionStorage.setItem("tonaura_welcomed", "1");
      setPhase("done");
    }, 3200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [phase, ready]);

  if (phase === "done" || phase === "idle") return null;

  const greeting = user?.user_metadata?.full_name
    ? `Welcome back, ${user.user_metadata.full_name.split(" ")[0]}`
    : "Welcome back";

  return (
    <div
      className={`welcome-overlay${phase === "leaving" ? " is-leaving" : ""}`}
      aria-hidden="true"
    >
      <div className="welcome-inner">
        <div className="welcome-mark-wrap">
          <img
            src="/images/brand/mark.png"
            alt=""
            className="welcome-mark"
            width="64"
            height="64"
          />
          <span className="welcome-ring" />
        </div>
        <p className="welcome-line">{greeting}</p>
        <p className="welcome-sub">Preparing your space</p>
      </div>
    </div>
  );
}