import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "./supabase/server";
import { createAdminClient } from "./supabase/admin";

export async function getSessionUser(request) {
  const fromBearer = await getUserFromBearer(request);
  if (fromBearer) return fromBearer;
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user || null;
}

async function getUserFromBearer(request) {
  if (!request?.headers) return null;
  const header = request.headers.get("authorization") || request.headers.get("Authorization") || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) return null;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  const client = createClient(url, key, {
    global: { headers: { Authorization: `Bearer ${match[1]}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const {
    data: { user },
  } = await client.auth.getUser(match[1]);
  return user || null;
}

export function adminEmailSet() {
  return new Set(
    (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
  );
}

export async function getProfile(userId) {
  const admin = createAdminClient();
  const { data } = await admin.from("profiles").select("*").eq("id", userId).maybeSingle();
  return data;
}

const STAFF = new Set(["support", "admin", "super_admin"]);
const FULL = new Set(["admin", "super_admin"]);

export async function requireAdmin(request, { full = false } = {}) {
  const user = await getSessionUser(request);
  if (!user) return { user: null, profile: null, ok: false, role: null };
  const profile = await getProfile(user.id);
  const role = profile?.role || "user";
  const byEmail = user.email && adminEmailSet().has(user.email.toLowerCase());
  if (byEmail && profile && !FULL.has(role)) {
    const admin = createAdminClient();
    await admin.from("profiles").update({ role: "admin" }).eq("id", user.id);
    profile.role = "admin";
  }
  const effective = byEmail ? profile?.role || "admin" : role;
  const ok = full ? FULL.has(effective) || byEmail : STAFF.has(effective) || byEmail;
  return { user, profile, ok, role: effective };
}
