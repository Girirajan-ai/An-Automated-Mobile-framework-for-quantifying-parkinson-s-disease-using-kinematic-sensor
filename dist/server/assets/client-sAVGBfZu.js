import { c as createClient } from "./index-DdGN5IVl.js";
function createSupabaseClient() {
  const SUPABASE_URL = "https://oypqvnjtpfrbjqxmncyf.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_pPQ5xK4TdVAI9iV67eTC6A_r_9eUrHA";
  return createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      storage: typeof window !== "undefined" ? localStorage : void 0,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: typeof window !== "undefined",
      flowType: "pkce"
    }
  });
}
let _supabase;
const supabase = new Proxy({}, {
  get(_, prop, receiver) {
    if (!_supabase) _supabase = createSupabaseClient();
    return Reflect.get(_supabase, prop, receiver);
  }
});
export {
  supabase as s
};
