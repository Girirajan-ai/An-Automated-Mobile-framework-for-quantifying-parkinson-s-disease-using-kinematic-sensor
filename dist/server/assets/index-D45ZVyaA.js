import { P as jsxRuntimeExports } from "./server-nsipvdQg.js";
import { L as Link } from "./router-B47MwA7r.js";
import { A as Activity } from "./activity-DEXRwYW2.js";
import { H as Hand } from "./hand-Bq-WlxxW.js";
import { S as Smartphone } from "./smartphone-DFupTOLK.js";
import { B as Brain } from "./brain-6cKktRni.js";
import { K as Keyboard } from "./keyboard-Cz9H5-iY.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./client-sAVGBfZu.js";
import "./index-DdGN5IVl.js";
import "./createLucideIcon-BcDEq9vq.js";
function Landing() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "surface-gradient min-h-screen", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "px-6 pt-6 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid place-items-center h-9 w-9 rounded-xl bg-primary text-primary-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold tracking-tight", children: "PDMS" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/login", className: "text-sm font-medium text-primary", children: "Sign in" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "px-6 pt-10 pb-16 max-w-md mx-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "mt-3 text-4xl font-bold leading-tight text-primary", children: [
        "Parkinson's",
        /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
        "Detection"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 grid grid-cols-1 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Feature, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Hand, { className: "h-5 w-5" }), title: "Bradykinesia", desc: "30-second finger-tapping test" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Feature, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Smartphone, { className: "h-5 w-5" }), title: "Tremor", desc: "Hold steady — gyroscope analysis" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Feature, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Brain, { className: "h-5 w-5" }), title: "Rigidity", desc: "Wrist & arm motion capture" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Feature, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Keyboard, { className: "h-5 w-5" }), title: "Typing", desc: "Typing speed & rhythm analysis" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-10 flex flex-col gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/signup", className: "rounded-2xl bg-primary text-primary-foreground text-center font-medium px-6 py-4 card-elev", children: "Create an account" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/login", className: "rounded-2xl border border-border text-center font-medium px-6 py-4", children: "I already have an account" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-8 text-xs text-muted-foreground", children: "Screening tool only — not a medical diagnosis. Always consult a qualified clinician." })
    ] })
  ] });
}
function Feature({
  icon,
  title,
  desc
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-card card-elev p-4 flex items-center gap-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid place-items-center h-10 w-10 rounded-xl bg-accent/15 text-accent", children: icon }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold leading-none", children: title }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: desc })
    ] })
  ] });
}
export {
  Landing as component
};
