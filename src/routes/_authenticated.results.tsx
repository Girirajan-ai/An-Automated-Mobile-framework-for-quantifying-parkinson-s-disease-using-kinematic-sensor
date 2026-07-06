import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { predictSeverityRf } from "@/lib/ml/random-forest";
import { isMissingTableError, supabaseErrorMessage } from "@/lib/supabase-errors";
import { generatePredictionSummary } from "@/lib/prediction.functions";
import { generatePdf } from "@/lib/pdf-report";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { FileDown, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_authenticated/results")({
  head: () => ({ meta: [{ title: "Results — PDMS" }, { name: "description", content: "Prediction, trends, and PDF report." }] }),
  component: Results,
});

interface Row { created_at: string; score: number }
interface Prediction {
  id: string;
  bradykinesia_score: number; tremor_score: number; rigidity_score: number; typing_score: number;
  prediction_result: string; severity: string; confidence_percentage: number;
  summary: string | null; created_at: string;
}

function Results() {
  const [brady, setBrady] = useState<Row[]>([]);
  const [tremor, setTremor] = useState<Row[]>([]);
  const [rigid, setRigid] = useState<Row[]>([]);
  const [typing, setTyping] = useState<Row[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [profile, setProfile] = useState<{ name: string; age: number | null; gender: string | null } | null>(null);
  const [running, setRunning] = useState(false);
  const [schemaError, setSchemaError] = useState<string | null>(null);

  const fetchPrediction = useServerFn(generatePredictionSummary);

  const load = async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const [b, t, r, ty, p, prof] = await Promise.all([
      supabase.from("bradykinesia_data").select("score,created_at").eq("patient_id", u.user.id).order("created_at"),
      supabase.from("tremor_data").select("score,created_at").eq("patient_id", u.user.id).order("created_at"),
      supabase.from("rigidity_data").select("score,created_at").eq("patient_id", u.user.id).order("created_at"),
      supabase.from("typing_data").select("score,created_at").eq("patient_id", u.user.id).order("created_at"),
      supabase.from("prediction_data").select("*").eq("patient_id", u.user.id).order("created_at", { ascending: false }),
      supabase.from("profiles").select("name,age,gender").eq("id", u.user.id).single(),
    ]);
    setBrady((b.data ?? []).map((r) => ({ created_at: r.created_at, score: Number(r.score) })));
    setTremor((t.data ?? []).map((r) => ({ created_at: r.created_at, score: Number(r.score) })));
    setRigid((r.data ?? []).map((r) => ({ created_at: r.created_at, score: Number(r.score) })));
    setTyping((ty.data ?? []).map((r) => ({ created_at: r.created_at, score: Number(r.score) })));
    setPredictions(((p.data ?? []) as any) as Prediction[]);
    setProfile(prof.data as any);

    const missing = [b, t, r, ty, p].find((res) => isMissingTableError(res.error));
    setSchemaError(
      missing?.error
        ? 'Database tables are missing. In Supabase open SQL Editor, run supabase-fix-missing-tables.sql, then refresh.'
        : null,
    );
  };

  useEffect(() => { load(); }, []);

  const latest = predictions[0];
  const latestBrady = brady.at(-1)?.score ?? null;
  const latestTremor = tremor.at(-1)?.score ?? null;
  const latestRigid = rigid.at(-1)?.score ?? null;
  const latestTyping = typing.at(-1)?.score ?? null;

  const canPredict = latestBrady != null && latestTremor != null && latestRigid != null && latestTyping != null;

  const runPrediction = async () => {
    if (!canPredict) { toast.error("Run all four tests first"); return; }
    setRunning(true);
    try {
      const combined = predictSeverityRf({
        bradykinesiaScore: latestBrady!,
        tremorScore: latestTremor!,
        rigidityScore: latestRigid!,
        typingScore: latestTyping!,
      });
      await fetchPrediction({
        data: {
          bradykinesiaScore: latestBrady!,
          tremorScore: latestTremor!,
          rigidityScore: latestRigid!,
          typingScore: latestTyping!,
          severity: combined.severity,
          result: combined.result,
          confidence: combined.confidence,
        },
      });
      toast.success("Prediction generated");
      await load();
    } catch (e: any) {
      toast.error(isMissingTableError(e) ? supabaseErrorMessage(e) : (e?.message ?? "Prediction failed"));
    } finally {
      setRunning(false);
    }
  };

  const exportPdf = () => {
    if (!latest || !profile) { toast.error("Run a prediction first"); return; }
    generatePdf({
      patientName: profile.name,
      patientAge: profile.age,
      patientGender: profile.gender,
      date: new Date(latest.created_at).toLocaleDateString(),
      bradykinesiaScore: Number(latest.bradykinesia_score),
      tremorScore: Number(latest.tremor_score),
      rigidityScore: Number(latest.rigidity_score),
      typingScore: Number(latest.typing_score),
      result: latest.prediction_result,
      severity: latest.severity,
      confidence: Number(latest.confidence_percentage),
      summary: latest.summary,
    });
  };

  const chartData = mergeSeries(brady, tremor, rigid, typing);

  return (
    <div className="pb-6">
      <h1 className="text-2xl font-bold text-primary">Results</h1>
      <p className="text-muted-foreground text-sm mt-1">Combine your latest scores into a prediction.</p>

      {schemaError && (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {schemaError}
        </div>
      )}

      {latest ? (
        <div className="mt-4 rounded-2xl bg-primary text-primary-foreground p-5 card-elev">
          <p className="text-xs uppercase tracking-widest opacity-70">Latest prediction</p>
          <p className="mt-2 text-2xl font-bold">{latest.severity}</p>
          <p className="text-sm opacity-80">{latest.prediction_result} · {Number(latest.confidence_percentage)}% confidence</p>
          {latest.summary && <p className="mt-3 text-sm opacity-90 whitespace-pre-wrap">{latest.summary}</p>}
          <p className="mt-3 text-xs opacity-60">{new Date(latest.created_at).toLocaleString()}</p>
        </div>
      ) : (
        <div className="mt-4 rounded-2xl bg-card card-elev p-5 text-sm text-muted-foreground">
          No prediction yet. Run all four tests then tap "Run prediction".
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Button onClick={runPrediction} disabled={!canPredict || running} className="h-12 rounded-xl">
          <Sparkles className="h-4 w-4 mr-2"/>{running ? "Analyzing…" : "Run prediction"}
        </Button>
        <Button variant="secondary" onClick={exportPdf} disabled={!latest} className="h-12 rounded-xl">
          <FileDown className="h-4 w-4 mr-2"/>Export PDF
        </Button>
      </div>

      <h2 className="mt-6 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Trends</h2>
      <div className="mt-3 rounded-2xl bg-card card-elev p-3 h-64">
        {chartData.length === 0 ? (
          <div className="h-full grid place-items-center text-sm text-muted-foreground">No test data yet</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.015 230)" />
              <XAxis dataKey="label" fontSize={10} stroke="oklch(0.5 0.03 250)" />
              <YAxis fontSize={10} stroke="oklch(0.5 0.03 250)" domain={[0, 100]} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="bradykinesia" stroke="var(--color-chart-1)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="tremor" stroke="var(--color-chart-2)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="rigidity" stroke="var(--color-chart-3)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="typing" stroke="var(--color-chart-4)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <h2 className="mt-6 text-sm font-semibold uppercase tracking-wider text-muted-foreground">History</h2>
      <div className="mt-3 space-y-2">
        {predictions.length === 0 && <p className="text-sm text-muted-foreground">No predictions saved yet.</p>}
        {predictions.map((p) => (
          <div key={p.id} className="rounded-xl bg-card card-elev p-3 flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm">{p.severity}</p>
              <p className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleString()}</p>
            </div>
            <p className="text-xs text-accent font-medium">{Number(p.confidence_percentage)}%</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function mergeSeries(b: Row[], t: Row[], r: Row[], ty: Row[]) {
  const n = Math.max(b.length, t.length, r.length, ty.length);
  const out = [];
  for (let i = 0; i < n; i++) {
    out.push({
      label: `#${i + 1}`,
      bradykinesia: b[i]?.score ?? null,
      tremor: t[i]?.score ?? null,
      rigidity: r[i]?.score ?? null,
      typing: ty[i]?.score ?? null,
    });
  }
  return out;
}
