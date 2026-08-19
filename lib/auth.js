import { createClient } from "./supabase/server";
import { createAdminClient } from "./supabase/admin";

export async function getSessionUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
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

export async function requireAdmin() {
  const user = await getSessionUser();
  if (!user) return { user: null, profile: null, ok: false };
  const profile = await getProfile(user.id);
  const byRole = profile?.role === "admin";
  const byEmail = user.email && adminEmailSet().has(user.email.toLowerCase());
  if (byEmail && profile && profile.role !== "admin") {
    const admin = createAdminClient();
    await admin.from("profiles").update({ role: "admin" }).eq("id", user.id);
    profile.role = "admin";
  }
  return { user, profile, ok: byRole || byEmail };
}
