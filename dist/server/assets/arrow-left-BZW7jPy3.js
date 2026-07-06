import { c as createLucideIcon } from "./createLucideIcon-BcDEq9vq.js";
function getAuthRedirectUrl() {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/auth/callback`;
  }
  const fallbackOrigin = process.env.VITE_APP_ORIGIN ?? process.env.VITE_PUBLIC_APP_ORIGIN ?? process.env.APP_ORIGIN ?? process.env.PUBLIC_APP_URL ?? "http://localhost:8080";
  return `${fallbackOrigin.replace(/\/$/, "")}/auth/callback`;
}
function formatAuthCatchError(err) {
  const msg = err instanceof Error ? err.message : String(err);
  const lower = msg.toLowerCase();
  if (msg.includes("Missing Supabase")) {
    return "Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to .env, then restart npm run dev.";
  }
  if (lower === "load failed" || lower.includes("failed to fetch") || lower.includes("networkerror") || lower.includes("network request failed")) {
    const url = "https://oypqvnjtpfrbjqxmncyf.supabase.co";
    return `Cannot reach Supabase (${url}). Check that the project still exists in your Supabase dashboard, your phone has internet, and .env has the correct URL and key.`;
  }
  return msg;
}
async function checkSupabaseReachable() {
  const url = "https://oypqvnjtpfrbjqxmncyf.supabase.co";
  const key = "sb_publishable_pPQ5xK4TdVAI9iV67eTC6A_r_9eUrHA";
  try {
    const res = await fetch(`${url.replace(/\/$/, "")}/auth/v1/health`, {
      headers: { apikey: key }
    });
    if (!res.ok) {
      return { ok: false, message: `Supabase returned ${res.status}. Verify your project URL and API key in .env.` };
    }
    return { ok: true };
  } catch {
    return {
      ok: false,
      message: `Cannot reach Supabase at ${url}. The project may be paused, deleted, or the URL in .env is wrong. Open supabase.com/dashboard and confirm the project is active.`
    };
  }
}
function authErrorMessage(error) {
  const code = error.code ?? "";
  const msg = error.message.toLowerCase();
  if (code === "weak_password") {
    return "Password is too weak. Use at least 8 characters with letters and numbers.";
  }
  if (code === "over_email_send_rate_limit") {
    return "Too many sign-up attempts. Wait a few minutes and try again.";
  }
  if (code === "user_already_exists") {
    return "This email is already registered. Try logging in instead.";
  }
  if (code === "email_address_invalid") {
    return "That email address is not valid.";
  }
  if (code === "email_not_confirmed" || msg.includes("email not confirmed")) {
    return "Please confirm your email first (check inbox/spam), or turn off “Confirm email” in Supabase → Authentication → Providers → Email.";
  }
  if (msg.includes("invalid login credentials") || code === "invalid_credentials") {
    return "Wrong email or password. If you just signed up, confirm your email first or use the exact password from signup.";
  }
  if (code === "email_provider_disabled" || msg.includes("email signups are disabled")) {
    return "Email sign-in is turned OFF in Supabase. Go to Authentication → Providers → Email and enable it.";
  }
  return error.message;
}
const __iconNode = [
  ["path", { d: "m12 19-7-7 7-7", key: "1l729n" }],
  ["path", { d: "M19 12H5", key: "x3x0zl" }]
];
const ArrowLeft = createLucideIcon("arrow-left", __iconNode);
export {
  ArrowLeft as A,
  authErrorMessage as a,
  checkSupabaseReachable as c,
  formatAuthCatchError as f,
  getAuthRedirectUrl as g
};
