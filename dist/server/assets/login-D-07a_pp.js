import { Y as reactExports, P as jsxRuntimeExports } from "./server-nsipvdQg.js";
import { u as useNavigate, R as Route, t as toast, L as Link } from "./router-B47MwA7r.js";
import { c as checkSupabaseReachable, A as ArrowLeft, a as authErrorMessage, f as formatAuthCatchError } from "./arrow-left-BZW7jPy3.js";
import { e as ensureUserProfile } from "./profiles-C-MxE-0f.js";
import { s as supabase } from "./client-sAVGBfZu.js";
import { B as Button } from "./button-PSSGvzBv.js";
import { L as Label, I as Input } from "./label-1mBCzrcQ.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./createLucideIcon-BcDEq9vq.js";
import "./index-DdGN5IVl.js";
function Login() {
  const nav = useNavigate();
  const {
    email: emailFromUrl,
    signedup
  } = Route.useSearch();
  const [email, setEmail] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  const [connectionError, setConnectionError] = reactExports.useState(null);
  reactExports.useEffect(() => {
    if (emailFromUrl) setEmail(emailFromUrl);
  }, [emailFromUrl]);
  reactExports.useEffect(() => {
    checkSupabaseReachable().then((result) => {
      if (!result.ok) setConnectionError(result.message);
    });
  }, []);
  reactExports.useEffect(() => {
    if (signedup === "1") {
      toast.success("Signup successful! Sign in with your email and password.");
    }
  }, [signedup]);
  const onSubmit = async (e) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      toast.error("Please enter your email.");
      return;
    }
    setLoading(true);
    try {
      const {
        data,
        error
      } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password
      });
      if (error) {
        toast.error(authErrorMessage(error));
        return;
      }
      const user = data.user ?? data.session?.user;
      if (!data.session || !user) {
        toast.error("Sign in did not return a session. Confirm your email or check Supabase auth settings.");
        return;
      }
      const profile = await ensureUserProfile(user.id);
      if (!profile.ok) {
        toast.warning(`Signed in, but profile could not be saved: ${profile.error}`);
      } else {
        toast.success("Sign in successful! Welcome back.");
      }
      nav({
        to: "/dashboard"
      });
    } catch (err) {
      console.error("[Login]", err);
      toast.error(formatAuthCatchError(err));
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen surface-gradient px-6 py-8 max-w-md mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/", className: "inline-flex items-center gap-1 text-sm text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }),
      "Back"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-6 text-3xl font-bold text-primary", children: "Sign in" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-muted-foreground", children: "Access your PDMS dashboard." }),
    connectionError && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900", children: connectionError }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit, className: "mt-8 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "email", children: "Email" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "email", type: "email", required: true, value: email, onChange: (e) => setEmail(e.target.value), className: "mt-1" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "password", children: "Password" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "password", type: "password", required: true, value: password, onChange: (e) => setPassword(e.target.value), className: "mt-1" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: loading, className: "w-full h-12 text-base rounded-xl", children: loading ? "Signing in…" : "Sign in" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-6 text-sm text-muted-foreground text-center", children: [
      "Don't have an account? ",
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/signup", className: "text-primary font-medium", children: "Create one" })
    ] })
  ] });
}
export {
  Login as component
};
