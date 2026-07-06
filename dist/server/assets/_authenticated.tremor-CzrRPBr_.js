import { Y as reactExports, P as jsxRuntimeExports } from "./server-nsipvdQg.js";
import { u as useNavigate, t as toast } from "./router-B47MwA7r.js";
import { s as supabase } from "./client-sAVGBfZu.js";
import { a as cn, B as Button } from "./button-PSSGvzBv.js";
import { g as getMotionSupport, m as motionUnavailableMessage } from "./motion-CIKsuqz2.js";
import { m as magnitude, d as detrend, c as mean, e as stdDev, a as dominantFrequency, t as tremorScore } from "./signal-utils-CEupE13u.js";
import { R as ResponsiveContainer, b as LineChart, X as XAxis, Y as YAxis, a as Line } from "./LineChart-DLvYG9-W.js";
import { S as Smartphone } from "./smartphone-DFupTOLK.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./index-DdGN5IVl.js";
import "./createLucideIcon-BcDEq9vq.js";
const THEMES = { light: "", dark: ".dark" };
const ChartContext = reactExports.createContext(null);
function useChart() {
  const context = reactExports.useContext(ChartContext);
  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }
  return context;
}
const ChartContainer = reactExports.forwardRef(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = reactExports.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ChartContext.Provider, { value: { config }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      "data-chart": chartId,
      ref,
      className: cn(
        "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
        className
      ),
      ...props,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChartStyle, { id: chartId, config }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { children })
      ]
    }
  ) });
});
ChartContainer.displayName = "Chart";
const ChartStyle = ({ id, config }) => {
  const colorConfig = Object.entries(config).filter(([, config2]) => config2.theme || config2.color);
  if (!colorConfig.length) {
    return null;
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "style",
    {
      dangerouslySetInnerHTML: {
        __html: Object.entries(THEMES).map(
          ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig.map(([key, itemConfig]) => {
            const color = itemConfig.theme?.[theme] || itemConfig.color;
            return color ? `  --color-${key}: ${color};` : null;
          }).join("\n")}
}
`
        ).join("\n")
      }
    }
  );
};
const ChartTooltipContent = reactExports.forwardRef(
  ({
    active,
    payload,
    className,
    indicator = "dot",
    hideLabel = false,
    hideIndicator = false,
    label,
    labelFormatter,
    labelClassName,
    formatter,
    color,
    nameKey,
    labelKey
  }, ref) => {
    const { config } = useChart();
    const tooltipLabel = reactExports.useMemo(() => {
      if (hideLabel || !payload?.length) {
        return null;
      }
      const [item] = payload;
      const key = `${labelKey || item?.dataKey || item?.name || "value"}`;
      const itemConfig = getPayloadConfigFromPayload(config, item, key);
      const value = !labelKey && typeof label === "string" ? config[label]?.label || label : itemConfig?.label;
      if (labelFormatter) {
        return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("font-medium", labelClassName), children: labelFormatter(value, payload) });
      }
      if (!value) {
        return null;
      }
      return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("font-medium", labelClassName), children: value });
    }, [label, labelFormatter, payload, hideLabel, labelClassName, config, labelKey]);
    if (!active || !payload?.length) {
      return null;
    }
    const nestLabel = payload.length === 1 && indicator !== "dot";
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        ref,
        className: cn(
          "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
          className
        ),
        children: [
          !nestLabel ? tooltipLabel : null,
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-1.5", children: payload.filter((item) => item.type !== "none").map((item, index) => {
            const key = `${nameKey || item.name || item.dataKey || "value"}`;
            const itemConfig = getPayloadConfigFromPayload(config, item, key);
            const indicatorColor = color || item.payload.fill || item.color;
            return /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: cn(
                  "flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground",
                  indicator === "dot" && "items-center"
                ),
                children: formatter && item?.value !== void 0 && item.name ? formatter(item.value, item.name, item, index, item.payload) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  itemConfig?.icon ? /* @__PURE__ */ jsxRuntimeExports.jsx(itemConfig.icon, {}) : !hideIndicator && /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    {
                      className: cn(
                        "shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)",
                        {
                          "h-2.5 w-2.5": indicator === "dot",
                          "w-1": indicator === "line",
                          "w-0 border-[1.5px] border-dashed bg-transparent": indicator === "dashed",
                          "my-0.5": nestLabel && indicator === "dashed"
                        }
                      ),
                      style: {
                        "--color-bg": indicatorColor,
                        "--color-border": indicatorColor
                      }
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "div",
                    {
                      className: cn(
                        "flex flex-1 justify-between leading-none",
                        nestLabel ? "items-end" : "items-center"
                      ),
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
                          nestLabel ? tooltipLabel : null,
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: itemConfig?.label || item.name })
                        ] }),
                        item.value && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono font-medium tabular-nums text-foreground", children: item.value.toLocaleString() })
                      ]
                    }
                  )
                ] })
              },
              item.dataKey
            );
          }) })
        ]
      }
    );
  }
);
ChartTooltipContent.displayName = "ChartTooltip";
const ChartLegendContent = reactExports.forwardRef(({ className, hideIcon = false, payload, verticalAlign = "bottom", nameKey }, ref) => {
  const { config } = useChart();
  if (!payload?.length) {
    return null;
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      ref,
      className: cn(
        "flex items-center justify-center gap-4",
        verticalAlign === "top" ? "pb-3" : "pt-3",
        className
      ),
      children: payload.filter((item) => item.type !== "none").map((item) => {
        const key = `${nameKey || item.dataKey || "value"}`;
        const itemConfig = getPayloadConfigFromPayload(config, item, key);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: cn(
              "flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground"
            ),
            children: [
              itemConfig?.icon && !hideIcon ? /* @__PURE__ */ jsxRuntimeExports.jsx(itemConfig.icon, {}) : /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: "h-2 w-2 shrink-0 rounded-[2px]",
                  style: {
                    backgroundColor: item.color
                  }
                }
              ),
              itemConfig?.label
            ]
          },
          item.value
        );
      })
    }
  );
});
ChartLegendContent.displayName = "ChartLegend";
function getPayloadConfigFromPayload(config, payload, key) {
  if (typeof payload !== "object" || payload === null) {
    return void 0;
  }
  const payloadPayload = "payload" in payload && typeof payload.payload === "object" && payload.payload !== null ? payload.payload : void 0;
  let configLabelKey = key;
  if (key in payload && typeof payload[key] === "string") {
    configLabelKey = payload[key];
  } else if (payloadPayload && key in payloadPayload && typeof payloadPayload[key] === "string") {
    configLabelKey = payloadPayload[key];
  }
  return configLabelKey in config ? config[configLabelKey] : config[key];
}
const DURATION = 30;
const GRAPH_WINDOW_SEC = 10;
const INTENSITY_SCALE = 250;
const TREMOR_RED = "#ef4444";
const AXIS_GRAY = "#9ca3af";
function TremorTest() {
  const nav = useNavigate();
  const [state, setState] = reactExports.useState("idle");
  const [remaining, setRemaining] = reactExports.useState(DURATION);
  const [needsPermission, setNeedsPermission] = reactExports.useState(false);
  const [supportMessage, setSupportMessage] = reactExports.useState(null);
  const [graphData, setGraphData] = reactExports.useState([]);
  const x = reactExports.useRef([]);
  const y = reactExports.useRef([]);
  const z = reactExports.useRef([]);
  const ts = reactExports.useRef([]);
  const testStartRef = reactExports.useRef(0);
  const lastGraphUpdateRef = reactExports.useRef(0);
  const graphPointsRef = reactExports.useRef([]);
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
    ts.current.push(performance.now());
    const now = performance.now();
    if (now - lastGraphUpdateRef.current > 100) {
      lastGraphUpdateRef.current = now;
      const rawMag = magnitude(r.alpha ?? 0, r.beta ?? 0, r.gamma ?? 0);
      const intensity = Math.min(1e3, Math.round(rawMag * INTENSITY_SCALE));
      const elapsedSec = (now - testStartRef.current) / 1e3;
      const windowStart = Math.max(0, elapsedSec - GRAPH_WINDOW_SEC);
      graphPointsRef.current.push({
        absTime: elapsedSec,
        intensity
      });
      const visible = graphPointsRef.current.filter((p) => p.absTime >= windowStart);
      graphPointsRef.current = visible;
      setGraphData(visible.map((p) => ({
        time: parseFloat((p.absTime - windowStart).toFixed(1)),
        intensity: p.intensity
      })));
    }
  };
  const askPermission = async () => {
    const support = getMotionSupport();
    if (!support.secureContext && !support.isLocalHost) {
      const message = motionUnavailableMessage();
      setSupportMessage(message);
      toast.error(message);
      return;
    }
    const DM = DeviceMotionEvent;
    try {
      const res = await DM.requestPermission();
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
    ts.current = [];
    setGraphData([]);
    graphPointsRef.current = [];
    testStartRef.current = performance.now();
    lastGraphUpdateRef.current = 0;
    setRemaining(DURATION);
    setState("running");
    window.addEventListener("devicemotion", handler);
    const startTime = Date.now();
    const id = setInterval(() => {
      const rem = Math.max(0, DURATION - (Date.now() - startTime) / 1e3);
      setRemaining(rem);
      if (rem <= 0) {
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
    const dt = (ts.current[ts.current.length - 1] - ts.current[0]) / (ts.current.length - 1) / 1e3;
    const sampleRate = 1 / Math.max(dt, 5e-3);
    const mags = x.current.map((_, i) => magnitude(x.current[i], y.current[i], z.current[i]));
    const cleaned = detrend(mags, 20);
    const amplitude = mean(cleaned.map(Math.abs));
    const motionVariability = stdDev(cleaned);
    const freq = dominantFrequency(cleaned, sampleRate);
    const score = tremorScore({
      frequencyHz: freq,
      amplitude,
      motionVariability
    });
    const {
      data: u
    } = await supabase.auth.getUser();
    if (!u.user) return;
    const {
      error
    } = await supabase.from("tremor_data").insert({
      patient_id: u.user.id,
      tremor_frequency: freq,
      tremor_amplitude: amplitude,
      angular_velocity_x: mean(x.current.map(Math.abs)),
      angular_velocity_y: mean(y.current.map(Math.abs)),
      angular_velocity_z: mean(z.current.map(Math.abs)),
      motion_variability: motionVariability,
      score
    });
    if (error) toast.error(error.message);
    else toast.success(`Done — score ${score}/100 · ${freq.toFixed(2)} Hz`);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pb-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold text-primary", children: "Tremor" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm mt-1", children: "Hold the phone as still as possible for 30 seconds in a comfortable position (e.g. resting your hand on a table)." }),
    supportMessage && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900", children: supportMessage }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 rounded-3xl bg-card card-elev p-8 grid place-items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `grid place-items-center h-32 w-32 rounded-full transition-colors ${state === "running" ? "bg-primary text-primary-foreground animate-pulse" : "bg-secondary text-primary"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Smartphone, { className: "h-14 w-14" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-5 text-3xl font-bold text-primary", children: [
        remaining.toFixed(1),
        "s"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: state === "running" ? "Stay still…" : "Ready" })
    ] }),
    state === "running" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 rounded-2xl bg-white card-elev p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase tracking-wider text-muted-foreground mb-3", children: "Shaking Intensity" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChartContainer, { config: {
        intensity: {
          label: "Intensity",
          color: TREMOR_RED
        }
      }, className: "h-64 w-full bg-white [&_.recharts-cartesian-axis-tick_text]:fill-[#9ca3af] [&_.recharts-cartesian-axis-line]:stroke-[#9ca3af] [&_.recharts-cartesian-axis-tick-line]:stroke-[#9ca3af]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(LineChart, { data: graphData, margin: {
        top: 10,
        right: 16,
        left: 0,
        bottom: 0
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "time", type: "number", domain: [0, GRAPH_WINDOW_SEC], ticks: [0, 2, 4, 6, 8, 10], tick: {
          fill: AXIS_GRAY,
          fontSize: 12
        }, axisLine: {
          stroke: AXIS_GRAY
        }, tickLine: {
          stroke: AXIS_GRAY
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { domain: [0, 1e3], ticks: [0, 200, 400, 600, 800, 1e3], tick: {
          fill: AXIS_GRAY,
          fontSize: 12
        }, axisLine: {
          stroke: AXIS_GRAY
        }, tickLine: {
          stroke: AXIS_GRAY
        }, width: 40 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { type: "linear", dataKey: "intensity", stroke: TREMOR_RED, strokeWidth: 2.5, dot: {
          fill: TREMOR_RED,
          r: 3,
          strokeWidth: 0
        }, activeDot: false, isAnimationActive: false })
      ] }) })
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
  TremorTest as component
};
