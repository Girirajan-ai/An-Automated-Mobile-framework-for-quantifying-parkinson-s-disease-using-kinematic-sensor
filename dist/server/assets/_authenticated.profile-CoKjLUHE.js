import { Y as reactExports, P as jsxRuntimeExports } from "./server-nsipvdQg.js";
import { s as supabase } from "./client-sAVGBfZu.js";
import { B as Button } from "./button-PSSGvzBv.js";
import { L as Label, I as Input } from "./label-1mBCzrcQ.js";
import { t as toast } from "./router-B47MwA7r.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./index-DdGN5IVl.js";
function Profile() {
  const [loading, setLoading] = reactExports.useState(true);
  const [saving, setSaving] = reactExports.useState(false);
  const [form, setForm] = reactExports.useState({
    name: "",
    age: "",
    gender: "",
    patientId: "",
    email: "",
    createdAt: ""
  });
  reactExports.useEffect(() => {
    (async () => {
      const {
        data: u
      } = await supabase.auth.getUser();
      if (!u.user) return;
      const {
        data: p
      } = await supabase.from("profiles").select("*").eq("id", u.user.id).single();
      setForm({
        name: p?.name ?? "",
        age: p?.age?.toString() ?? "",
        gender: p?.gender ?? "",
        patientId: u.user.id,
        email: u.user.email ?? "",
        createdAt: p?.created_at ? new Date(p.created_at).toLocaleDateString() : ""
      });
      setLoading(false);
    })();
  }, []);
  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    const {
      data: u
    } = await supabase.auth.getUser();
    if (!u.user) return;
    const {
      error
    } = await supabase.from("profiles").update({
      name: form.name,
      age: form.age ? parseInt(form.age, 10) : null,
      gender: form.gender || null
    }).eq("id", u.user.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Profile saved");
  };
  if (loading) return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mt-8", children: "Loading…" });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pb-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold text-primary", children: "Patient profile" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 rounded-2xl bg-card card-elev p-4 text-sm space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Patient ID:" }),
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono text-xs", children: [
          form.patientId.slice(0, 8),
          "…"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Email:" }),
        " ",
        form.email
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Registered:" }),
        " ",
        form.createdAt
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: save, className: "mt-5 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "name", children: "Full name" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "name", value: form.name, onChange: (e) => setForm({
          ...form,
          name: e.target.value
        }), className: "mt-1" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "age", children: "Age" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "age", type: "number", min: 1, max: 120, value: form.age, onChange: (e) => setForm({
            ...form,
            age: e.target.value
          }), className: "mt-1" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "gender", children: "Gender" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { id: "gender", value: form.gender, onChange: (e) => setForm({
            ...form,
            gender: e.target.value
          }), className: "mt-1 w-full h-10 rounded-md border bg-background px-3 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select…" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "female", children: "Female" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "male", children: "Male" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "other", children: "Other" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: saving, className: "w-full h-12 rounded-xl", children: saving ? "Saving…" : "Save profile" })
    ] })
  ] });
}
export {
  Profile as component
};
