import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { bradykinesiaScore } from "@/lib/scoring";
import { stdDev } from "@/lib/signal-utils";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/bradykinesia")({
  head: () => ({ meta: [{ title: "Bradykinesia test — PDMS" }, { name: "description", content: "Finger-tapping test." }] }),
  component: BradykinesiaTest,
});

const DURATION = 30; // seconds

function BradykinesiaTest() {
  const nav = useNavigate();
  const [state, setState] = useState<"idle" | "running" | "done">("idle");
  const [remaining, setRemaining] = useState(DURATION);
  const [taps, setTaps] = useState(0);
  const [missed, setMissed] = useState(0);
  const [expected, setExpected] = useState<"left" | "right">("left");
  const tapTimes = useRef<number[]>([]);
  const startRef = useRef<number>(0);
  const firstTapRef = useRef<number | null>(null);

  useEffect(() => {
    if (state !== "running") return;
    const id = setInterval(() => {
      const rem = Math.max(0, DURATION - (Date.now() - startRef.current) / 1000);
      setRemaining(rem);
      if (rem <= 0) { clearInterval(id); finish(); }
    }, 100);
    return () => clearInterval(id);
  }, [state]);

  const start = () => {
    setTaps(0); setMissed(0); setRemaining(DURATION);
    tapTimes.current = []; firstTapRef.current = null;
    startRef.current = Date.now();
    setExpected("left");
    setState("running");
  };

  const tap = (side: "left" | "right") => {
    if (state !== "running") return;
    if (side !== expected) { setMissed((m) => m + 1); return; }
    if (firstTapRef.current == null) firstTapRef.current = Date.now() - startRef.current;
    tapTimes.current.push(Date.now() - startRef.current);
    setTaps((t) => t + 1);
    setExpected(side === "left" ? "right" : "left");
  };

  const finish = async () => {
    setState("done");
    const intervals: number[] = [];
    for (let i = 1; i < tapTimes.current.length; i++) intervals.push(tapTimes.current[i] - tapTimes.current[i - 1]);
    const intervalConsistency = stdDev(intervals);
    const tappingSpeed = taps / DURATION;
    const reactionTimeMs = firstTapRef.current ?? 0;
    const score = bradykinesiaScore({ tapCount: taps, reactionTimeMs, tappingSpeed, intervalConsistency, missedTaps: missed });

    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { error } = await supabase.from("bradykinesia_data").insert({
      patient_id: u.user.id,
      tap_count: taps,
      reaction_time: reactionTimeMs,
      tapping_speed: tappingSpeed,
      interval_consistency: intervalConsistency,
      missed_taps: missed,
      score,
    });
    if (error) toast.error(error.message);
    else toast.success(`Done — score ${score}/100`);
  };

  return (
    <div className="pb-6">
      <h1 className="text-2xl font-bold text-primary">Bradykinesia</h1>
      <p className="text-muted-foreground text-sm mt-1">Tap the highlighted button as quickly as possible, alternating left and right for 30 seconds.</p>

      <div className="mt-5 rounded-2xl bg-card card-elev p-4 flex items-center justify-between">
        <Stat label="Taps" value={taps} />
        <Stat label="Missed" value={missed} />
        <Stat label="Time" value={`${remaining.toFixed(1)}s`} />
      </div>

      <div className="mt-6 flex items-center justify-center">
        <button
          onTouchStart={(e) => { e.preventDefault(); tap(expected); }}
          onMouseDown={() => tap(expected)}
          className={`w-64 h-64 rounded-full text-2xl font-bold select-none transition-all active:scale-95 flex items-center justify-center ${
            state === "running" ? "bg-primary text-primary-foreground card-elev" : "bg-secondary text-muted-foreground"
          }`}
        >
          Tap the button
        </button>
      </div>

      <div className="mt-6">
        {state === "idle" && <Button className="w-full h-12 rounded-xl" onClick={start}>Start test</Button>}
        {state === "running" && <Button variant="secondary" className="w-full h-12 rounded-xl" onClick={() => finish()}>Stop early</Button>}
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

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="text-center">
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="font-bold text-lg text-primary">{value}</p>
    </div>
  );
}
