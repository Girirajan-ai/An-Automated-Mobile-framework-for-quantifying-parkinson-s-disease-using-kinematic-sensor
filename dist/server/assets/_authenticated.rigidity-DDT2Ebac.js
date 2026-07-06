import { Y as reactExports, P as jsxRuntimeExports } from "./server-nsipvdQg.js";
import { u as useNavigate, t as toast } from "./router-B47MwA7r.js";
import { s as supabase } from "./client-sAVGBfZu.js";
import { B as Button } from "./button-PSSGvzBv.js";
import { g as getMotionSupport, m as motionUnavailableMessage } from "./motion-CIKsuqz2.js";
import { m as magnitude, c as mean, s as smoothness, e as stdDev, r as rigidityScore } from "./signal-utils-CEupE13u.js";
import { B as Brain } from "./brain-6cKktRni.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./index-DdGN5IVl.js";
import "./createLucideIcon-BcDEq9vq.js";
const STEPS = ["Rotate your wrist back and forth", "Raise your arm up and down", "Bend your elbow in and out", "Open and close your hand"];
const PER_STEP = 5;
const TOTAL = STEPS.length * PER_STEP;
function RigidityTest() {
  const nav = useNavigate();
  const [state, setState] = reactExports.useState("idle");
  const [elapsed, setElapsed] = reactExports.useState(0);
  const [needsPermission, setNeedsPermission] = reactExports.useState(false);
  const [supportMessage, setSupportMessage] = reactExports.useState(null);
  const x = reactExports.useRef([]);
  const y = reactExports.useRef([]);
  const z = reactExports.useRef([]);
  reactExports.useEffect(() => {
    const support = getMotionSupport();
    if (support.requiresPermission) setNeedsPermission(true);
    if (!support.secureContext && !support.isLocalHost) setSupportMessage(motionUnavailableMessage());
  }, []);
  const handler = (e) => {
    const r = e.rotationRate;
    if (!r) return;
    x.current.push(r.alpha ?? 0);
    y.current.push(r.beta ?? 0);
    z.current.push(r.gamma ?? 0);
  };
  const askPermission = async () => {
    try {
      const support = getMotionSupport();
      if (!support.secureContext && !support.isLocalHost) {
        const message = motionUnavailableMessage();
        setSupportMessage(message);
        toast.error(message);
        return;
      }
      const res = await DeviceMotionEvent.requestPermission();
      if (res !== "granted") {
        toast.error("Motion permission denied");
        return;
      }
      setNeedsPermission(false);
      start();
    } catch {
      toast.error("Could not access motion sensors");
    }
  };
  const start = () => {
    x.current = [];
    y.current = [];
    z.current = [];
    setElapsed(0);
    setState("running");
    window.addEventListener("devicemotion", handler);
    const t0 = Date.now();
    const id = setInterval(() => {
      const e = (Date.now() - t0) / 1e3;
      setElapsed(e);
      if (e >= TOTAL) {
        clearInterval(id);
        finish();
      }
    }, 100);
  };
  const finish = async () => {
    window.removeEventListener("devicemotion", handler);
    setState("done");
    if (x.current.length < 10) {
      toast.error(supportMessage ?? motionUnavailableMessage());
      return;
    }
    const mags = x.current.map((_, i) => magnitude(x.current[i], y.current[i], z.current[i]));
    const range = Math.max(...mags) - Math.min(...mags);
    const angVel = mean(mags);
    const smooth = smoothness(mags);
    const variability = stdDev(mags);
    const score = rigidityScore({
      rangeOfMotion: range,
      angularVelocity: angVel,
      smoothness: smooth
    });
    const {
      data: u
    } = await supabase.auth.getUser();
    if (!u.user) return;
    const {
      error
    } = await supabase.from("rigidity_data").insert({
      patient_id: u.user.id,
      movement_score: variability,
      range_of_motion: range,
      angular_velocity: angVel,
      smoothness: smooth,
      score
    });
    if (error) toast.error(error.message);
    else toast.success(`Done — score ${score}/100`);
  };
  const stepIdx = Math.min(STEPS.length - 1, Math.floor(elapsed / PER_STEP));
  const stepRemaining = Math.max(0, PER_STEP - (elapsed - stepIdx * PER_STEP));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pb-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold text-primary", children: "Rigidity" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm mt-1", children: "Hold the phone in your hand and perform each movement in turn (5s each, ~20s total)." }),
    supportMessage && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900", children: supportMessage }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 rounded-3xl bg-card card-elev p-6 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid place-items-center h-24 w-24 rounded-full bg-primary/10 text-primary mx-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Brain, { className: "h-10 w-10" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-4 text-xs uppercase tracking-widest text-muted-foreground", children: [
        "Step ",
        Math.min(stepIdx + 1, STEPS.length),
        " / ",
        STEPS.length
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xl font-semibold text-primary", children: state === "running" ? STEPS[stepIdx] : "Ready when you are" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-3xl font-bold text-primary", children: state === "running" ? `${stepRemaining.toFixed(1)}s` : `${TOTAL}s` })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6", children: [
      state === "idle" && (needsPermission ? /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "w-full h-12 rounded-xl", onClick: askPermission, children: "Enable motion & start" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "w-full h-12 rounded-xl", onClick: start, children: "Start test" })),
      state === "running" && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "secondary", className: "w-full h-12 rounded-xl", onClick: finish, children: "Stop early" }),
      state === "done" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "w-full h-12 rounded-xl", onClick: start, children: "Run again" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "secondary", className: "w-full h-12 rounded-xl", onClick: () => nav({
          to: "/dashboard"
        }), children: "Back to dashboard" })
      ] })
    ] })
  ] });
}
export {
  RigidityTest as component
};
