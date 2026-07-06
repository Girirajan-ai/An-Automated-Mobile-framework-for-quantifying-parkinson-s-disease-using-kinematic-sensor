import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, Brain, Hand, Smartphone, Keyboard } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PDMS — Parkinson's Detection" },
      { name: "description", content: "Screen for Parkinson's symptoms in minutes using only your smartphone." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="surface-gradient min-h-screen">
      <header className="px-6 pt-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="grid place-items-center h-9 w-9 rounded-xl bg-primary text-primary-foreground">
            <Activity className="h-5 w-5" />
          </div>
          <span className="font-semibold tracking-tight">PDMS</span>
        </div>
        <Link to="/login" className="text-sm font-medium text-primary">Sign in</Link>
      </header>

      <main className="px-6 pt-10 pb-16 max-w-md mx-auto">
        <h1 className="mt-3 text-4xl font-bold leading-tight text-primary">
          Parkinson's<br/>Detection
        </h1>

        <div className="mt-8 grid grid-cols-1 gap-3">
          <Feature icon={<Hand className="h-5 w-5"/>} title="Bradykinesia" desc="30-second finger-tapping test"/>
          <Feature icon={<Smartphone className="h-5 w-5"/>} title="Tremor" desc="Hold steady — gyroscope analysis"/>
          <Feature icon={<Brain className="h-5 w-5"/>} title="Rigidity" desc="Wrist & arm motion capture"/>
          <Feature icon={<Keyboard className="h-5 w-5"/>} title="Typing" desc="Typing speed & rhythm analysis"/>
        </div>

        <div className="mt-10 flex flex-col gap-3">
          <Link to="/signup" className="rounded-2xl bg-primary text-primary-foreground text-center font-medium px-6 py-4 card-elev">
            Create an account
          </Link>
          <Link to="/login" className="rounded-2xl border border-border text-center font-medium px-6 py-4">
            I already have an account
          </Link>
        </div>

        <p className="mt-8 text-xs text-muted-foreground">
          Screening tool only — not a medical diagnosis. Always consult a qualified clinician.
        </p>
      </main>
    </div>
  );
}

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="rounded-2xl bg-card card-elev p-4 flex items-center gap-3">
      <div className="grid place-items-center h-10 w-10 rounded-xl bg-accent/15 text-accent">{icon}</div>
      <div>
        <p className="font-semibold leading-none">{title}</p>
        <p className="text-sm text-muted-foreground mt-1">{desc}</p>
      </div>
    </div>
  );
}
