import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { getMotionSupport, motionUnavailableMessage } from "@/lib/motion";
import { tremorScore } from "@/lib/scoring";
import { detrend, dominantFrequency, magnitude, mean, stdDev } from "@/lib/signal-utils";
import { toast } from "sonner";
import { Smartphone } from "lucide-react";
import { ChartContainer } from "@/components/chart";
import { LineChart, Line, XAxis, YAxis } from "recharts";

export const Route = createFileRoute("/_authenticated/tremor")({
  head: () => ({ meta: [{ title: "Tremor test — PDMS" }, { name: "description", content: "Hold-still tremor test." }] }),
  component: TremorTest,
});

const DURATION = 30;
const GRAPH_WINDOW_SEC = 10;
const INTENSITY_SCALE = 250; // maps rad/s magnitude → 0–1000 display range
const TREMOR_RED = "#ef4444";
const AXIS_GRAY = "#9ca3af";

function TremorTest() {
  const nav = useNavigate();
  const [state, setState] = useState<"idle" | "permission" | "running" | "done">("idle");
  const [remaining, setRemaining] = useState(DURATION);
  const [needsPermission, setNeedsPermission] = useState(false);
  const [supportMessage, setSupportMessage] = useState<string | null>(null);
  const [graphData, setGraphData] = useState<Array<{ time: number; intensity: number }>>([]);

  const x = useRef<number[]>([]);
  const y = useRef<number[]>([]);
  const z = useRef<number[]>([]);
  const ts = useRef<number[]>([]);
  const testStartRef = useRef<number>(0);
  const lastGraphUpdateRef = useRef<number>(0);
  const graphPointsRef = useRef<Array<{ absTime: number; intensity: number }>>([]);

  useEffect(() => {
    const support = getMotionSupport();
    if (support.requiresPermission) setNeedsPermission(true);
    if (!support.secureContext && !support.isLocalHost) setSupportMessage(motionUnavailableMessage());
  }, []);

  const handler = (e: DeviceMotionEvent) => {
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
      const intensity = Math.min(1000, Math.round(rawMag * INTENSITY_SCALE));
      const elapsedSec = (now - testStartRef.current) / 1000;
      const windowStart = Math.max(0, elapsedSec - GRAPH_WINDOW_SEC);

      graphPointsRef.current.push({ absTime: elapsedSec, intensity });
      const visible = graphPointsRef.current.filter((p) => p.absTime >= windowStart);
      graphPointsRef.current = visible;

      setGraphData(
        visible.map((p) => ({
          time: parseFloat((p.absTime - windowStart).toFixed(1)),
          intensity: p.intensity,
        })),
      );
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

    const DM: any = DeviceMotionEvent;
    try {
      const res = await DM.requestPermission();
      if (res !== "granted") { toast.error("Motion permission denied"); return; }
      setNeedsPermission(false);
      start();
    } catch {
      toast.error("Could not access motion sensors");
    }
  };

  const start = () => {
    x.current = []; y.current = []; z.current = []; ts.current = [];
    setGraphData([]);
    graphPointsRef.current = [];
    testStartRef.current = performance.now();
    lastGraphUpdateRef.current = 0;
    setRemaining(DURATION);
    setState("running");
    window.addEventListener("devicemotion", handler);
    const startTime = Date.now();
    const id = setInterval(() => {
      const rem = Math.max(0, DURATION - (Date.now() - startTime) / 1000);
      setRemaining(rem);
      if (rem <= 0) { clearInterval(id); finish(); }
    }, 100);
  };

  const finish = async () => {
    window.removeEventListener("devicemotion", handler);
    setState("done");
    if (x.current.length < 10) { toast.error(supportMessage ?? motionUnavailableMessage()); return; }

    // Approximate sampling rate from timestamps
    const dt = (ts.current[ts.current.length - 1] - ts.current[0]) / (ts.current.length - 1) / 1000;
    const sampleRate = 1 / Math.max(dt, 0.005);

    const mags = x.current.map((_, i) => magnitude(x.current[i], y.current[i], z.current[i]));
    const cleaned = detrend(mags, 20);
    const amplitude = mean(cleaned.map(Math.abs));
    const motionVariability = stdDev(cleaned);
    const freq = dominantFrequency(cleaned, sampleRate);
    const score = tremorScore({ frequencyHz: freq, amplitude, motionVariability });

    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { error } = await supabase.from("tremor_data").insert({
      patient_id: u.user.id,
      tremor_frequency: freq,
      tremor_amplitude: amplitude,
      angular_velocity_x: mean(x.current.map(Math.abs)),
      angular_velocity_y: mean(y.current.map(Math.abs)),
      angular_velocity_z: mean(z.current.map(Math.abs)),
      motion_variability: motionVariability,
      score,
    });
    if (error) toast.error(error.message);
    else toast.success(`Done — score ${score}/100 · ${freq.toFixed(2)} Hz`);
  };

  return (
    <div className="pb-6">
      <h1 className="text-2xl font-bold text-primary">Tremor</h1>
      <p className="text-muted-foreground text-sm mt-1">Hold the phone as still as possible for 30 seconds in a comfortable position (e.g. resting your hand on a table).</p>
      {supportMessage && (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {supportMessage}
        </div>
      )}

      <div className="mt-6 rounded-3xl bg-card card-elev p-8 grid place-items-center">
        <div className={`grid place-items-center h-32 w-32 rounded-full transition-colors ${state === "running" ? "bg-primary text-primary-foreground animate-pulse" : "bg-secondary text-primary"}`}>
          <Smartphone className="h-14 w-14" />
        </div>
        <p className="mt-5 text-3xl font-bold text-primary">{remaining.toFixed(1)}s</p>
        <p className="text-sm text-muted-foreground">{state === "running" ? "Stay still…" : "Ready"}</p>
      </div>

      {state === "running" && (
        <div className="mt-6 rounded-2xl bg-white card-elev p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Shaking Intensity</p>
          <ChartContainer
            config={{ intensity: { label: "Intensity", color: TREMOR_RED } }}
            className="h-64 w-full bg-white [&_.recharts-cartesian-axis-tick_text]:fill-[#9ca3af] [&_.recharts-cartesian-axis-line]:stroke-[#9ca3af] [&_.recharts-cartesian-axis-tick-line]:stroke-[#9ca3af]"
          >
            <LineChart data={graphData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
              <XAxis
                dataKey="time"
                type="number"
                domain={[0, GRAPH_WINDOW_SEC]}
                ticks={[0, 2, 4, 6, 8, 10]}
                tick={{ fill: AXIS_GRAY, fontSize: 12 }}
                axisLine={{ stroke: AXIS_GRAY }}
                tickLine={{ stroke: AXIS_GRAY }}
              />
              <YAxis
                domain={[0, 1000]}
                ticks={[0, 200, 400, 600, 800, 1000]}
                tick={{ fill: AXIS_GRAY, fontSize: 12 }}
                axisLine={{ stroke: AXIS_GRAY }}
                tickLine={{ stroke: AXIS_GRAY }}
                width={40}
              />
              <Line
                type="linear"
                dataKey="intensity"
                stroke={TREMOR_RED}
                strokeWidth={2.5}
                dot={{ fill: TREMOR_RED, r: 3, strokeWidth: 0 }}
                activeDot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ChartContainer>
        </div>
      )}

      <div className="mt-6">
        {state === "idle" && (
          needsPermission
            ? <Button className="w-full h-12 rounded-xl" onClick={askPermission}>Enable motion & start</Button>
            : <Button className="w-full h-12 rounded-xl" onClick={start}>Start test</Button>
        )}
        {state === "running" && <Button variant="secondary" className="w-full h-12 rounded-xl" onClick={finish}>Stop early</Button>}
        {state === "done" && (
          <div className="space-y-3">
            <Button className="w-full h-12 rounded-xl" onClick={start}>Run again</Button>
            <Button variant="secondary" className="w-full h-12 rounded-xl" onClick={() => nav({ to: "/dashboard" })}>Back to dashboard</Button>
          </div>
        )}
      </div>
    </div>
  );
}
