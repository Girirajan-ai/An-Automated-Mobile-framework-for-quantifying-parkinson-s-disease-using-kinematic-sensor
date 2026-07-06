import { aa as useRouter, P as jsxRuntimeExports, O as Outlet } from "./server-nsipvdQg.js";
import { L as Link, t as toast } from "./router-B47MwA7r.js";
import { s as supabase } from "./client-sAVGBfZu.js";
import { A as Activity } from "./activity-DEXRwYW2.js";
import { c as createLucideIcon } from "./createLucideIcon-BcDEq9vq.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./index-DdGN5IVl.js";
const __iconNode$3 = [
  ["path", { d: "M3 3v16a2 2 0 0 0 2 2h16", key: "c24i48" }],
  ["path", { d: "M18 17V9", key: "2bz60n" }],
  ["path", { d: "M13 17V5", key: "1frdt8" }],
  ["path", { d: "M8 17v-3", key: "17ska0" }]
];
const ChartColumn = createLucideIcon("chart-column", __iconNode$3);
const __iconNode$2 = [
  ["path", { d: "M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8", key: "5wwlr5" }],
  [
    "path",
    {
      d: "M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
      key: "r6nss1"
    }
  ]
];
const House = createLucideIcon("house", __iconNode$2);
const __iconNode$1 = [
  ["path", { d: "m16 17 5-5-5-5", key: "1bji2h" }],
  ["path", { d: "M21 12H9", key: "dn1m92" }],
  ["path", { d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4", key: "1uf3rs" }]
];
const LogOut = createLucideIcon("log-out", __iconNode$1);
const __iconNode = [
  ["path", { d: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2", key: "975kel" }],
  ["circle", { cx: "12", cy: "7", r: "4", key: "17ys0d" }]
];
const User = createLucideIcon("user", __iconNode);
function AuthedLayout() {
  const router = useRouter();
  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    router.navigate({
      to: "/"
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen pb-24 surface-gradient", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "px-5 pt-5 pb-3 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/dashboard", className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid place-items-center h-9 w-9 rounded-xl bg-primary text-primary-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold tracking-tight", children: "PDMS" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: signOut, className: "p-2 text-muted-foreground", "aria-label": "Sign out", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "h-5 w-5" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "px-5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { className: "fixed bottom-0 inset-x-0 bg-card/95 backdrop-blur border-t border-border px-2 py-2 flex justify-around", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(NavItem, { to: "/dashboard", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(House, { className: "h-5 w-5" }), label: "Home" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(NavItem, { to: "/results", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ChartColumn, { className: "h-5 w-5" }), label: "Results" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(NavItem, { to: "/profile", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-5 w-5" }), label: "Profile" })
    ] })
  ] });
}
function NavItem({
  to,
  icon,
  label
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to, activeProps: {
    className: "text-primary"
  }, className: "flex-1 flex flex-col items-center gap-1 py-1 text-xs text-muted-foreground", children: [
    icon,
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: label })
  ] });
}
export {
  AuthedLayout as component
};
