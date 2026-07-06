import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { getMotionSupport, motionUnavailableMessage } from "@/lib/motion";
import { rigidityScore } from "@/lib/scoring";
import { magnitude, mean, smoothness, stdDev } from "@/lib/signal-utils";
import { toast } from "sonner";
import { Brain } from "lucide-react";

export const Route = createFileRoute("/_authenticated/rigidity")({
  head: () => ({ meta: [{ title: "Rigidity test — PDMS" }, { name: "description", content: "Wrist and arm movement test." }] }),
  component: RigidityTest,
});

const STEPS = [
  "Rotate your wrist back and forth",
  "Raise your arm up and down",
  "Bend your elbow in and out",
  "Open and close your hand",
];
const PER_STEP = 5; // seconds
const TOTAL = STEPS.length * PER_STEP;

function RigidityTest() {
  const nav = useNavigate();
  const [state, setState] = useState<"idle" | "running" | "done">("idle");
  const [elapsed, setElapsed] = useState(0);
  const [needsPermission, setNeedsPermission] = useState(false);
  const [supportMessage, setSupportMessage] = useState<string | null>(null);

  const x = useRef<number[]>([]);
  const y = useRef<number[]>([]);
  const z = useRef<number[]>([]);

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
      const res = await (DeviceMotionEvent as any).requestPermission();
      if (res !== "granted") { toast.error("Motion permission denied"); return; }
      setNeedsPermission(false);
      start();
    } catch { toast.error("Could not access motion sensors"); }
  };

  const start = () => {
    x.current = []; y.current = []; z.current = [];
    setElapsed(0); setState("running");
    window.addEventListener("devicemotion", handler);
    const t0 = Date.now();
    const id = setInterval(() => {
      const e = (Date.now() - t0) / 1000;
      setElapsed(e);
      if (e >= TOTAL) { clearInterval(id); finish(); }
    }, 100);
  };

  const finish = async () => {
    window.removeEventListener("devicemotion", handler);
    setState("done");
    if (x.current.length < 10) { toast.error(supportMessage ?? motionUnavailableMessage()); return; }

    const mags = x.current.map((_, i) => magnitude(x.current[i], y.current[i], z.current[i]));
    const range = (Math.max(...mags) - Math.min(...mags));
    const angVel = mean(mags);
    const smooth = smoothness(mags);
    const variability = stdDev(mags);
    const score = rigidityScore({ rangeOfMotion: range, angularVelocity: angVel, smoothness: smooth });

    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { error } = await supabase.from("rigidity_data").insert({
      patient_id: u.user.id,
      movement_score: variability,
      range_of_motion: range,
      angular_velocity: angVel,
      smoothness: smooth,
      score,
    });
    if (error) toast.error(error.message);
    else toast.success(`Done — score ${score}/100`);
  };

  const stepIdx = Math.min(STEPS.length - 1, Math.floor(elapsed / PER_STEP));
  const stepRemaining = Math.max(0, PER_STEP - (elapsed - stepIdx * PER_STEP));

  return (
    <div className="pb-6">
      <h1 className="text-2xl font-bold text-primary">Rigidity</h1>
      <p className="text-muted-foreground text-sm mt-1">Hold the phone in your hand and perform each movement in turn (5s each, ~20s total).</p>
      {supportMessage && (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {supportMessage}
        </div>
      )}

      <div className="mt-6 rounded-3xl bg-card card-elev p-6 text-center">
        <div className="grid place-items-center h-24 w-24 rounded-full bg-primary/10 text-primary mx-auto">
          <Brain className="h-10 w-10" />
        </div>
        <p className="mt-4 text-xs uppercase tracking-widest text-muted-foreground">Step {Math.min(stepIdx + 1, STEPS.length)} / {STEPS.length}</p>
        <p className="mt-1 text-xl font-semibold text-primary">{state === "running" ? STEPS[stepIdx] : "Ready when you are"}</p>
        <p className="mt-3 text-3xl font-bold text-primary">{state === "running" ? `${stepRemaining.toFixed(1)}s` : `${TOTAL}s`}</p>
      </div>

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
