import { Y as reactExports, P as jsxRuntimeExports } from "./server-nsipvdQg.js";
import { u as useNavigate, L as Link, t as toast } from "./router-B47MwA7r.js";
import { s as supabase } from "./client-sAVGBfZu.js";
import { B as Button } from "./button-PSSGvzBv.js";
import { L as Label, I as Input } from "./label-1mBCzrcQ.js";
import { c as checkSupabaseReachable, A as ArrowLeft, g as getAuthRedirectUrl, a as authErrorMessage, f as formatAuthCatchError } from "./arrow-left-BZW7jPy3.js";
import { e as ensureUserProfile } from "./profiles-C-MxE-0f.js";
import { c as createLucideIcon } from "./createLucideIcon-BcDEq9vq.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./index-DdGN5IVl.js";
const __iconNode = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "m9 12 2 2 4-4", key: "dzmm74" }]
];
const CircleCheck = createLucideIcon("circle-check", __iconNode);
function Signup() {
  const nav = useNavigate();
  const [form, setForm] = reactExports.useState({
    name: "",
    age: "",
    gender: "",
    email: "",
    password: ""
  });
  const [loading, setLoading] = reactExports.useState(false);
  const [success, setSuccess] = reactExports.useState(null);
  const [connectionError, setConnectionError] = reactExports.useState(null);
  reactExports.useEffect(() => {
    checkSupabaseReachable().then((result) => {
      if (!result.ok) setConnectionError(result.message);
    });
  }, []);
  const update = (k) => (e) => setForm((f) => ({
    ...f,
    [k]: e.target.value
  }));
  const onSubmit = async (e) => {
    e.preventDefault();
    const trimmedEmail = form.email.trim();
    if (!trimmedEmail) {
      toast.error("Please enter your email.");
      return;
    }
    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (!form.name.trim()) {
      toast.error("Please enter your full name.");
      return;
    }
    setLoading(true);
    setSuccess(null);
    try {
      const {
        data,
        error
      } = await supabase.auth.signUp({
        email: trimmedEmail,
        password: form.password,
        options: {
          emailRedirectTo: getAuthRedirectUrl(),
          data: {
            name: form.name.trim(),
            age: form.age,
            gender: form.gender
          }
        }
      });
      if (error) {
        toast.error(authErrorMessage(error));
        return;
      }
      if (!data.user) {
        toast.error("Sign up failed. Please try again.");
        return;
      }
      const profileInput = {
        name: form.name.trim(),
        age: form.age ? parseInt(form.age, 10) : null,
        gender: form.gender || null
      };
      if (data.session) {
        const profile = await ensureUserProfile(data.user.id, profileInput);
        if (!profile.ok) {
          toast.error(`Signup successful, but profile save failed: ${profile.error}. Run supabase-setup-all.sql in Supabase.`);
        } else {
          toast.success("Signup successful! Your patient profile was created.");
        }
        setSuccess({
          email: trimmedEmail,
          needsConfirm: false
        });
        setTimeout(() => nav({
          to: "/dashboard"
        }), 1500);
        return;
      }
      setSuccess({
        email: trimmedEmail,
        needsConfirm: true
      });
      toast.success("Signup successful! You can sign in after confirming your email.", {
        duration: 8e3
      });
    } catch (err) {
      console.error("[Signup]", err);
      toast.error(formatAuthCatchError(err));
    } finally {
      setLoading(false);
    }
  };
  if (success) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen surface-gradient px-6 py-8 max-w-md mx-auto text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "mx-auto h-16 w-16 text-green-600", "aria-hidden": true }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-4 text-2xl font-bold text-primary", children: "Signup successful" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-muted-foreground", children: success.needsConfirm ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        "Account created for ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: success.email }),
        ". Check your email to confirm, then sign in.",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block mt-2 text-xs", children: "For testing: Supabase → Authentication → Providers → Email → turn off “Confirm email”." })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: "Welcome! Redirecting to your dashboard…" }) }),
      success.needsConfirm && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "mt-8 w-full h-12 rounded-xl", onClick: () => nav({
        to: "/login",
        search: {
          email: success.email
        }
      }), children: "Go to sign in" })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen surface-gradient px-6 py-8 max-w-md mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/", className: "inline-flex items-center gap-1 text-sm text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }),
      "Back"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-6 text-3xl font-bold text-primary", children: "Create account" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-muted-foreground", children: "We'll create your patient profile." }),
    connectionError && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900", children: connectionError }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit, className: "mt-8 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "name", children: "Full name" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "name", required: true, value: form.name, onChange: update("name"), className: "mt-1" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "age", children: "Age" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "age", type: "number", min: 1, max: 120, value: form.age, onChange: update("age"), className: "mt-1" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "gender", children: "Gender" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { id: "gender", value: form.gender, onChange: update("gender"), className: "mt-1 w-full h-10 rounded-md border bg-background px-3 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select…" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "female", children: "Female" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "male", children: "Male" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "other", children: "Other" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "email", children: "Email" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "email", type: "email", required: true, value: form.email, onChange: update("email"), className: "mt-1" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "password", children: "Password" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "password", type: "password", required: true, minLength: 8, value: form.password, onChange: update("password"), className: "mt-1" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "At least 8 characters" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: loading, className: "w-full h-12 text-base rounded-xl", children: loading ? "Creating…" : "Create account" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-6 text-sm text-muted-foreground text-center", children: [
      "Have an account? ",
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/login", className: "text-primary font-medium", children: "Sign in" })
    ] })
  ] });
}
export {
  Signup as component
};
