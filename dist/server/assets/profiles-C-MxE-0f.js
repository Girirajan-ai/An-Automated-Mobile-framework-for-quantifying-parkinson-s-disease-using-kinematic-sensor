import { s as supabase } from "./client-sAVGBfZu.js";
async function ensureUserProfile(userId, input = {}) {
  const meta = (await supabase.auth.getUser()).data.user?.user_metadata;
  const name = (input.name?.trim() || (typeof meta?.name === "string" ? meta.name : "") || "").trim();
  const age = input.age !== void 0 ? input.age : meta?.age != null && meta.age !== "" ? parseInt(String(meta.age), 10) : null;
  const gender = input.gender !== void 0 ? input.gender : typeof meta?.gender === "string" ? meta.gender : null;
  const row = {
    id: userId,
    name: name || "Patient",
    age: Number.isFinite(age) ? age : null,
    gender: gender || null
  };
  const { error } = await supabase.from("profiles").upsert(row, { onConflict: "id" });
  if (error) {
    console.error("[ensureUserProfile]", error);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}
export {
  ensureUserProfile as e
};
