import { supabase } from "@/integrations/supabase/client";

export type ProfileInput = {
  name?: string;
  age?: number | null;
  gender?: string | null;
};

/** Create or update the signed-in user's profile row. */
export async function ensureUserProfile(
  userId: string,
  input: ProfileInput = {},
): Promise<{ ok: boolean; error?: string }> {
  const meta = (await supabase.auth.getUser()).data.user?.user_metadata as
    | Record<string, unknown>
    | undefined;

  const name =
    (input.name?.trim() || (typeof meta?.name === "string" ? meta.name : "") || "").trim();
  const age =
    input.age !== undefined
      ? input.age
      : meta?.age != null && meta.age !== ""
        ? parseInt(String(meta.age), 10)
        : null;
  const gender =
    input.gender !== undefined
      ? input.gender
      : typeof meta?.gender === "string"
        ? meta.gender
        : null;

  const row = {
    id: userId,
    name: name || "Patient",
    age: Number.isFinite(age as number) ? (age as number) : null,
    gender: gender || null,
  };

  const { error } = await supabase.from("profiles").upsert(row, { onConflict: "id" });

  if (error) {
    console.error("[ensureUserProfile]", error);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}
