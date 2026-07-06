import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { isMissingTableError } from "@/lib/supabase-errors";
import { Hand, Smartphone, Brain, Keyboard, FileText, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — PDMS" }, { name: "description", content: "Run tests and review your screening results." }] }),
  component: Dashboard,
});

interface Latest {
  brady: number | null;
  tremor: number | null;
  rigidity: number | null;
  typing: number | null;
  prediction: { severity: string; result: string; confidence: number } | null;
  name: string;
}

function Dashboard() {
  const [latest, setLatest] = useState<Latest>({ brady: null, tremor: null, rigidity: null, typing: null, prediction: null, name: "" });
  const [schemaError, setSchemaError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const [p, b, t, r, ty, pred] = await Promise.all([
        supabase.from("profiles").select("name").eq("id", u.user.id).single(),
        supabase.from("bradykinesia_data").select("score").eq("patient_id", u.user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("tremor_data").select("score").eq("patient_id", u.user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("rigidity_data").select("score").eq("patient_id", u.user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("typing_data").select("score").eq("patient_id", u.user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("prediction_data").select("severity,prediction_result,confidence_percentage").eq("patient_id", u.user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
      ]);

      const missing = [b, t, r, ty, pred].find((res) => isMissingTableError(res.error));
      if (missing?.error) {
        setSchemaError(
          'Database tables are missing. In Supabase open SQL Editor, run the file supabase-fix-missing-tables.sql from this project, then refresh.',
        );
      }

      setLatest({
        name: p.data?.name || "",
        brady: b.error ? null : (b.data?.score ?? null),
        tremor: t.error ? null : (t.data?.score ?? null),
        rigidity: r.error ? null : (r.data?.score ?? null),
        typing: ty.error ? null : (ty.data?.score ?? null),
        prediction: pred.error || !pred.data ? null : { severity: pred.data.severity, result: pred.data.prediction_result, confidence: Number(pred.data.confidence_percentage) },
      });
    })();
  }, []);

  return (
    <div className="pb-6">
      <p className="text-sm text-muted-foreground">Hello{latest.name ? `, ${latest.name.split(" ")[0]}` : ""} 👋</p>
      <h1 className="mt-1 text-2xl font-bold text-primary">Your assessments</h1>

      {schemaError && (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {schemaError}
        </div>
      )}

      <div className="mt-5 grid grid-cols-2 gap-3">
        <ScoreCard label="Bradykinesia" value={latest.brady} />
        <ScoreCard label="Tremor" value={latest.tremor} />
        <ScoreCard label="Rigidity" value={latest.rigidity} />
        <ScoreCard label="Typing" value={latest.typing} />
      </div>

      {latest.prediction && (
        <div className="mt-4 rounded-2xl bg-primary text-primary-foreground p-5 card-elev">
          <p className="text-xs uppercase tracking-widest opacity-70">Latest prediction</p>
          <p className="mt-2 text-xl font-semibold">{latest.prediction.severity}</p>
          <p className="text-sm opacity-80">{latest.prediction.result} · {latest.prediction.confidence}% confidence</p>
        </div>
      )}

      <h2 className="mt-6 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Tests</h2>
      <div className="mt-3 space-y-3">
        <TestLink to="/bradykinesia" icon={<Hand className="h-5 w-5"/>} title="Bradykinesia" desc="Finger-tapping test · 30s" />
        <TestLink to="/tremor" icon={<Smartphone className="h-5 w-5"/>} title="Tremor" desc="Hold steady · 30s" />
        <TestLink to="/rigidity" icon={<Brain className="h-5 w-5"/>} title="Rigidity" desc="Wrist & arm motion · 20s" />
        <TestLink to="/typing" icon={<Keyboard className="h-5 w-5"/>} title="Typing" desc="Type a sentence · rhythm & speed" />
      </div>

      <Link to="/results" className="mt-5 rounded-2xl bg-card card-elev p-4 flex items-center gap-3">
        <div className="grid place-items-center h-10 w-10 rounded-xl bg-accent/15 text-accent"><FileText className="h-5 w-5"/></div>
        <div className="flex-1">
          <p className="font-semibold">Results & history</p>
          <p className="text-sm text-muted-foreground">Run prediction · export PDF</p>
        </div>
        <ChevronRight className="text-muted-foreground"/>
      </Link>
    </div>
  );
}

function ScoreCard({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="rounded-2xl bg-card card-elev p-3">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold text-primary">{value ?? "—"}</p>
      <p className="text-[10px] text-muted-foreground">/ 100</p>
    </div>
  );
}

function TestLink({ to, icon, title, desc }: { to: string; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <Link to={to} className="rounded-2xl bg-card card-elev p-4 flex items-center gap-3">
      <div className="grid place-items-center h-10 w-10 rounded-xl bg-primary/10 text-primary">{icon}</div>
      <div className="flex-1">
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-muted-foreground">{desc}</p>
      </div>
      <ChevronRight className="text-muted-foreground"/>
    </Link>
  );
}
