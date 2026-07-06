import { Y as reactExports, P as jsxRuntimeExports } from "./server-nsipvdQg.js";
import { u as useNavigate, t as toast } from "./router-B47MwA7r.js";
import { s as supabase } from "./client-sAVGBfZu.js";
import { B as Button } from "./button-PSSGvzBv.js";
import { e as stdDev, b as bradykinesiaScore } from "./signal-utils-CEupE13u.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./index-DdGN5IVl.js";
const DURATION = 30;
function BradykinesiaTest() {
  const nav = useNavigate();
  const [state, setState] = reactExports.useState("idle");
  const [remaining, setRemaining] = reactExports.useState(DURATION);
  const [taps, setTaps] = reactExports.useState(0);
  const [missed, setMissed] = reactExports.useState(0);
  const [expected, setExpected] = reactExports.useState("left");
  const tapTimes = reactExports.useRef([]);
  const startRef = reactExports.useRef(0);
  const firstTapRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    if (state !== "running") return;
    const id = setInterval(() => {
      const rem = Math.max(0, DURATION - (Date.now() - startRef.current) / 1e3);
      setRemaining(rem);
      if (rem <= 0) {
        clearInterval(id);
        finish();
      }
    }, 100);
    return () => clearInterval(id);
  }, [state]);
  const start = () => {
    setTaps(0);
    setMissed(0);
    setRemaining(DURATION);
    tapTimes.current = [];
    firstTapRef.current = null;
    startRef.current = Date.now();
    setExpected("left");
    setState("running");
  };
  const tap = (side) => {
    if (state !== "running") return;
    if (side !== expected) {
      setMissed((m) => m + 1);
      return;
    }
    if (firstTapRef.current == null) firstTapRef.current = Date.now() - startRef.current;
    tapTimes.current.push(Date.now() - startRef.current);
    setTaps((t) => t + 1);
    setExpected(side === "left" ? "right" : "left");
  };
  const finish = async () => {
    setState("done");
    const intervals = [];
    for (let i = 1; i < tapTimes.current.length; i++) intervals.push(tapTimes.current[i] - tapTimes.current[i - 1]);
    const intervalConsistency = stdDev(intervals);
    const tappingSpeed = taps / DURATION;
    const reactionTimeMs = firstTapRef.current ?? 0;
    const score = bradykinesiaScore({
      reactionTimeMs,
      tappingSpeed,
      intervalConsistency,
      missedTaps: missed
    });
    const {
      data: u
    } = await supabase.auth.getUser();
    if (!u.user) return;
    const {
      error
    } = await supabase.from("bradykinesia_data").insert({
      patient_id: u.user.id,
      tap_count: taps,
      reaction_time: reactionTimeMs,
      tapping_speed: tappingSpeed,
      interval_consistency: intervalConsistency,
      missed_taps: missed,
      score
    });
    if (error) toast.error(error.message);
    else toast.success(`Done — score ${score}/100`);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pb-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold text-primary", children: "Bradykinesia" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm mt-1", children: "Tap the highlighted button as quickly as possible, alternating left and right for 30 seconds." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 rounded-2xl bg-card card-elev p-4 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Taps", value: taps }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Missed", value: missed }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Time", value: `${remaining.toFixed(1)}s` })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onTouchStart: (e) => {
      e.preventDefault();
      tap(expected);
    }, onMouseDown: () => tap(expected), className: `w-64 h-64 rounded-full text-2xl font-bold select-none transition-all active:scale-95 flex items-center justify-center ${state === "running" ? "bg-primary text-primary-foreground card-elev" : "bg-secondary text-muted-foreground"}`, children: "Tap the button" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6", children: [
      state === "idle" && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "w-full h-12 rounded-xl", onClick: start, children: "Start test" }),
      state === "running" && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "secondary", className: "w-full h-12 rounded-xl", onClick: () => finish(), children: "Stop early" }),
      state === "done" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "w-full h-12 rounded-xl", onClick: start, children: "Run again" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "secondary", className: "w-full h-12 rounded-xl", onClick: () => nav({
          to: "/dashboard"
        }), children: "Back to dashboard" })
      ] })
    ] })
  ] });
}
function Stat({
  label,
  value
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] uppercase tracking-wider text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold text-lg text-primary", children: value })
  ] });
}
export {
  BradykinesiaTest as component
};
