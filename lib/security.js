/** Shared security helpers for the Tonaura website. */

/** Same-origin relative path only — blocks //evil.com and /\evil. */
export function safeRedirectPath(next, fallback = "/account") {
  if (typeof next !== "string" || !next) return fallback;
  const path = next.trim();
  if (!path.startsWith("/")) return fallback;
  if (path.startsWith("//") || path.startsWith("/\\")) return fallback;
  if (path.includes("://") || path.includes("\\")) return fallback;
  if (/[\x00-\x1f]/.test(path)) return fallback;
  return path;
}

export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function sanitizeEmailSubject(value) {
  return String(value ?? "")
    .replace(/[\r\n]+/g, " ")
    .trim()
    .slice(0, 200);
}

/** Simple in-memory rate limit (per serverless isolate). Good enough for light abuse. */
const buckets = new Map();

export function rateLimit({ key, limit = 8, windowMs = 60_000 }) {
  const now = Date.now();
  let entry = buckets.get(key);
  if (!entry || now - entry.start >= windowMs) {
    entry = { start: now, count: 0 };
    buckets.set(key, entry);
  }
  entry.count += 1;
  if (buckets.size > 2000) {
    for (const [k, v] of buckets) {
      if (now - v.start > windowMs * 2) buckets.delete(k);
    }
  }
  return entry.count <= limit;
}

export function clientIp(request) {
  const fwd = request.headers.get("x-forwarded-for") || "";
  return fwd.split(",")[0].trim() || request.headers.get("x-real-ip") || "local";
}
