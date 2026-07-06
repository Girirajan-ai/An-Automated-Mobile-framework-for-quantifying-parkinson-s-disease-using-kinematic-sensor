import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { typingScore } from "@/lib/scoring";
import { stdDev } from "@/lib/signal-utils";
import { supabaseErrorMessage } from "@/lib/supabase-errors";
import { toast } from "sonner";
import { Keyboard } from "lucide-react";

export const Route = createFileRoute("/_authenticated/typing")({
  head: () => ({ meta: [{ title: "Typing test — PDMS" }, { name: "description", content: "Typing speed and rhythm test." }] }),
  component: TypingTest,
});

const PASSAGE = "nature is beautiful";

function charsMatch(typed: string, expected: string): boolean {
  if (typed === expected) return true;
  if (expected === " ") return false;
  return typed.toLowerCase() === expected.toLowerCase();
}

function TypingTest() {
  const nav = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const positionRef = useRef(0);
  const errorsRef = useRef(0);
  const startRef = useRef<number>(0);
  const keyTimesRef = useRef<number[]>([]);
  const pauseCountRef = useRef(0);

  const [state, setState] = useState<"idle" | "running" | "done">("idle");
  const [position, setPosition] = useState(0);
  const [errors, setErrors] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    if (state !== "running") return;
    const id = setInterval(() => {
      setElapsedMs(Date.now() - startRef.current);
    }, 100);
    return () => clearInterval(id);
  }, [state]);

  useEffect(() => {
    if (state === "running") {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [state]);

  useEffect(() => {
    if (state === "running" && cursorRef.current) {
      cursorRef.current.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
    }
  }, [position, state]);

  useEffect(() => {
    const el = inputRef.current;
    if (!el || state !== "running") return;
    const len = PASSAGE.slice(0, position).length;
    el.setSelectionRange(len, len);
  }, [position, state]);

  const typedSoFar = PASSAGE.slice(0, position);

  const focusInput = () => {
    if (state === "running") inputRef.current?.focus();
  };

  const start = () => {
    positionRef.current = 0;
    errorsRef.current = 0;
    keyTimesRef.current = [];
    pauseCountRef.current = 0;
    startRef.current = Date.now();
    setPosition(0);
    setErrors(0);
    setElapsedMs(0);
    setState("running");
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const finish = async (completionMs: number) => {
    setState("done");
    inputRef.current?.blur();

    const intervals: number[] = [];
    for (let i = 1; i < keyTimesRef.current.length; i++) {
      intervals.push(keyTimesRef.current[i] - keyTimesRef.current[i - 1]);
    }
    const intervalConsistency = stdDev(intervals);
    const minutes = completionMs / 60000;
    const wpm = minutes > 0 ? (PASSAGE.length / 5) / minutes : 0;
    const errorRate = PASSAGE.length > 0 ? errorsRef.current / PASSAGE.length : 0;
    const score = typingScore({
      wpm,
      errorRate,
      intervalConsistency,
      pauseCount: pauseCountRef.current,
    });

    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { error } = await supabase.from("typing_data").insert({
      patient_id: u.user.id,
      wpm,
      error_count: errorsRef.current,
      error_rate: errorRate,
      interval_consistency: intervalConsistency,
      pause_count: pauseCountRef.current,
      completion_time_ms: completionMs,
      score,
    });
    if (error) toast.error(supabaseErrorMessage(error, "typing_data"));
    else toast.success(`Done — score ${score}/100 · ${wpm.toFixed(0)} WPM`);
  };

  const processChar = (char: string) => {
    if (state !== "running" || !char || char.length !== 1) return;

    const pos = positionRef.current;
    const expected = PASSAGE[pos];
    if (!expected) return;

    const now = Date.now() - startRef.current;
    const last = keyTimesRef.current.at(-1);
    if (last != null && now - last > 500) pauseCountRef.current += 1;

    if (charsMatch(char, expected)) {
      keyTimesRef.current.push(now);
      const next = pos + 1;
      positionRef.current = next;
      setPosition(next);
      if (next >= PASSAGE.length) finish(now);
    } else {
      errorsRef.current += 1;
      setErrors(errorsRef.current);
    }
  };

  const onBeforeInput = (e: React.FormEvent<HTMLInputElement>) => {
    if (state !== "running") return;
    const inputEvent = e.nativeEvent as InputEvent;
    if (!inputEvent.data || inputEvent.isComposing) return;
    e.preventDefault();
    processChar(inputEvent.data);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (state !== "running") return;
    if (e.key.length !== 1 || e.ctrlKey || e.metaKey || e.altKey) return;
    e.preventDefault();
    processChar(e.key);
  };

  const wpmLive =
    state === "running" && elapsedMs > 0
      ? (position / 5) / (elapsedMs / 60000)
      : 0;

  return (
    <div className="pb-6">
      <h1 className="text-2xl font-bold text-primary">Typing</h1>
      <p className="text-muted-foreground text-sm mt-1">
        Type the sentence below. The highlight moves forward with each correct letter.
      </p>

      <div className="mt-5 rounded-2xl bg-card card-elev p-4 flex items-center justify-between">
        <Stat label="Progress" value={`${position}/${PASSAGE.length}`} />
        <Stat label="Errors" value={errors} />
        <Stat label="WPM" value={state === "running" ? wpmLive.toFixed(0) : "—"} />
      </div>

      <div className="mt-6 rounded-3xl bg-card card-elev p-6" onClick={focusInput}>
        <div className="grid place-items-center h-16 w-16 rounded-full bg-primary/10 text-primary mx-auto">
          <Keyboard className="h-8 w-8" />
        </div>
        <p className="mt-5 text-xl leading-relaxed font-mono break-words select-none">
          {PASSAGE.split("").map((char, i) => {
            const isDone = i < position;
            const isCurrent = i === position && state === "running";
            return (
              <span
                key={i}
                ref={isCurrent ? cursorRef : undefined}
                className={
                  isDone
                    ? "text-primary font-semibold"
                    : isCurrent
                      ? "relative text-primary bg-primary/20 rounded px-0.5 ring-2 ring-primary/40"
                      : "text-muted-foreground/60"
                }
              >
                {char === " " ? "\u00a0" : char}
                {isCurrent && (
                  <span className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-primary animate-pulse" />
                )}
              </span>
            );
          })}
        </p>

        <input
          ref={inputRef}
          type="text"
          inputMode="text"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
          aria-label="Type the sentence here"
          value={typedSoFar}
          placeholder={state === "running" && position === 0 ? "Tap here and type…" : ""}
          disabled={state !== "running"}
          className="mt-5 w-full rounded-xl border border-border bg-background px-4 py-3 text-base font-medium text-primary outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
          onBeforeInput={onBeforeInput}
          onKeyDown={onKeyDown}
          onPaste={(e) => e.preventDefault()}
          onChange={() => {}}
        />

        {state === "idle" && (
          <p className="mt-3 text-center text-sm text-muted-foreground">Tap Start, then type in the box above.</p>
        )}
        {state === "running" && (
          <p className="mt-3 text-center text-sm text-muted-foreground">
            {(elapsedMs / 1000).toFixed(1)}s elapsed · type letter by letter
          </p>
        )}
      </div>

      <div className="mt-6">
        {state === "idle" && <Button className="w-full h-12 rounded-xl" onClick={start}>Start test</Button>}
        {state === "running" && (
          <Button
            variant="secondary"
            className="w-full h-12 rounded-xl"
            onClick={() => finish(elapsedMs || Date.now() - startRef.current)}
          >
            Stop early
          </Button>
        )}
        {state === "done" && (
          <div className="space-y-3">
            <Button className="w-full h-12 rounded-xl" onClick={start}>Run again</Button>
            <Button variant="secondary" className="w-full h-12 rounded-xl" onClick={() => nav({ to: "/dashboard" })}>
              Back to dashboard
            </Button>
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
