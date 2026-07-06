import { Y as reactExports, P as jsxRuntimeExports } from "./server-nsipvdQg.js";
import { L as Link } from "./router-B47MwA7r.js";
import { s as supabase } from "./client-sAVGBfZu.js";
import { i as isMissingTableError } from "./supabase-errors-CnmSesIE.js";
import { H as Hand } from "./hand-Bq-WlxxW.js";
import { S as Smartphone } from "./smartphone-DFupTOLK.js";
import { B as Brain } from "./brain-6cKktRni.js";
import { K as Keyboard } from "./keyboard-Cz9H5-iY.js";
import { c as createLucideIcon } from "./createLucideIcon-BcDEq9vq.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./index-DdGN5IVl.js";
const __iconNode$1 = [["path", { d: "m9 18 6-6-6-6", key: "mthhwq" }]];
const ChevronRight = createLucideIcon("chevron-right", __iconNode$1);
const __iconNode = [
  [
    "path",
    {
      d: "M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",
      key: "1oefj6"
    }
  ],
  ["path", { d: "M14 2v5a1 1 0 0 0 1 1h5", key: "wfsgrz" }],
  ["path", { d: "M10 9H8", key: "b1mrlr" }],
  ["path", { d: "M16 13H8", key: "t4e002" }],
  ["path", { d: "M16 17H8", key: "z1uh3a" }]
];
const FileText = createLucideIcon("file-text", __iconNode);
function Dashboard() {
  const [latest, setLatest] = reactExports.useState({
    brady: null,
    tremor: null,
    rigidity: null,
    typing: null,
    prediction: null,
    name: ""
  });
  const [schemaError, setSchemaError] = reactExports.useState(null);
  reactExports.useEffect(() => {
    (async () => {
      const {
        data: u
      } = await supabase.auth.getUser();
      if (!u.user) return;
      const [p, b, t, r, ty, pred] = await Promise.all([supabase.from("profiles").select("name").eq("id", u.user.id).single(), supabase.from("bradykinesia_data").select("score").eq("patient_id", u.user.id).order("created_at", {
        ascending: false
      }).limit(1).maybeSingle(), supabase.from("tremor_data").select("score").eq("patient_id", u.user.id).order("created_at", {
        ascending: false
      }).limit(1).maybeSingle(), supabase.from("rigidity_data").select("score").eq("patient_id", u.user.id).order("created_at", {
        ascending: false
      }).limit(1).maybeSingle(), supabase.from("typing_data").select("score").eq("patient_id", u.user.id).order("created_at", {
        ascending: false
      }).limit(1).maybeSingle(), supabase.from("prediction_data").select("severity,prediction_result,confidence_percentage").eq("patient_id", u.user.id).order("created_at", {
        ascending: false
      }).limit(1).maybeSingle()]);
      const missing = [b, t, r, ty, pred].find((res) => isMissingTableError(res.error));
      if (missing?.error) {
        setSchemaError("Database tables are missing. In Supabase open SQL Editor, run the file supabase-fix-missing-tables.sql from this project, then refresh.");
      }
      setLatest({
        name: p.data?.name || "",
        brady: b.error ? null : b.data?.score ?? null,
        tremor: t.error ? null : t.data?.score ?? null,
        rigidity: r.error ? null : r.data?.score ?? null,
        typing: ty.error ? null : ty.data?.score ?? null,
        prediction: pred.error || !pred.data ? null : {
          severity: pred.data.severity,
          result: pred.data.prediction_result,
          confidence: Number(pred.data.confidence_percentage)
        }
      });
    })();
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pb-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
      "Hello",
      latest.name ? `, ${latest.name.split(" ")[0]}` : "",
      " 👋"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-1 text-2xl font-bold text-primary", children: "Your assessments" }),
    schemaError && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900", children: schemaError }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 grid grid-cols-2 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ScoreCard, { label: "Bradykinesia", value: latest.brady }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ScoreCard, { label: "Tremor", value: latest.tremor }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ScoreCard, { label: "Rigidity", value: latest.rigidity }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ScoreCard, { label: "Typing", value: latest.typing })
    ] }),
    latest.prediction && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 rounded-2xl bg-primary text-primary-foreground p-5 card-elev", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase tracking-widest opacity-70", children: "Latest prediction" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-xl font-semibold", children: latest.prediction.severity }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm opacity-80", children: [
        latest.prediction.result,
        " · ",
        latest.prediction.confidence,
        "% confidence"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-6 text-sm font-semibold uppercase tracking-wider text-muted-foreground", children: "Tests" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TestLink, { to: "/bradykinesia", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Hand, { className: "h-5 w-5" }), title: "Bradykinesia", desc: "Finger-tapping test · 30s" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TestLink, { to: "/tremor", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Smartphone, { className: "h-5 w-5" }), title: "Tremor", desc: "Hold steady · 30s" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TestLink, { to: "/rigidity", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Brain, { className: "h-5 w-5" }), title: "Rigidity", desc: "Wrist & arm motion · 20s" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TestLink, { to: "/typing", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Keyboard, { className: "h-5 w-5" }), title: "Typing", desc: "Type a sentence · rhythm & speed" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/results", className: "mt-5 rounded-2xl bg-card card-elev p-4 flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid place-items-center h-10 w-10 rounded-xl bg-accent/15 text-accent", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: "Results & history" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Run prediction · export PDF" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "text-muted-foreground" })
    ] })
  ] });
}
function ScoreCard({
  label,
  value
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-card card-elev p-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-2xl font-bold text-primary", children: value ?? "—" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground", children: "/ 100" })
  ] });
}
function TestLink({
  to,
  icon,
  title,
  desc
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to, className: "rounded-2xl bg-card card-elev p-4 flex items-center gap-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid place-items-center h-10 w-10 rounded-xl bg-primary/10 text-primary", children: icon }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: title }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: desc })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "text-muted-foreground" })
  ] });
}
export {
  Dashboard as component
};
