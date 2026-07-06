import { Y as reactExports, P as jsxRuntimeExports } from "./server-nsipvdQg.js";
import { u as useNavigate, t as toast } from "./router-B47MwA7r.js";
import { s as supabase } from "./client-sAVGBfZu.js";
import { e as ensureUserProfile } from "./profiles-C-MxE-0f.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./index-DdGN5IVl.js";
function AuthCallbackPage() {
  const navigate = useNavigate();
  const [message, setMessage] = reactExports.useState("Confirming your email…");
  reactExports.useEffect(() => {
    let cancelled = false;
    async function finish() {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      if (code) {
        const {
          error
        } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          if (!cancelled) {
            toast.error(error.message);
            setMessage("Confirmation failed.");
            setTimeout(() => navigate({
              to: "/login"
            }), 2e3);
          }
          return;
        }
      }
      const {
        data
      } = await supabase.auth.getSession();
      if (data.session?.user) {
        await ensureUserProfile(data.session.user.id);
        toast.success("Signup successful! Email confirmed — welcome!");
        navigate({
          to: "/dashboard"
        });
      } else {
        setMessage("Please sign in with your email and password.");
        setTimeout(() => navigate({
          to: "/login"
        }), 2e3);
      }
    }
    finish();
    return () => {
      cancelled = true;
    };
  }, [navigate]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center px-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: message }) });
}
export {
  AuthCallbackPage as component
};
