import { Y as reactExports, P as jsxRuntimeExports } from "./server-nsipvdQg.js";
import { u as useNavigate, t as toast } from "./router-B47MwA7r.js";
import { s as supabase } from "./client-sAVGBfZu.js";
import { B as Button } from "./button-PSSGvzBv.js";
import { e as stdDev, f as typingScore } from "./signal-utils-CEupE13u.js";
import { s as supabaseErrorMessage } from "./supabase-errors-CnmSesIE.js";
import { K as Keyboard } from "./keyboard-Cz9H5-iY.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./index-DdGN5IVl.js";
import "./createLucideIcon-BcDEq9vq.js";
const PASSAGE = "nature is beautiful";
function charsMatch(typed, expected) {
  if (typed === expected) return true;
  if (expected === " ") return false;
  return typed.toLowerCase() === expected.toLowerCase();
}
function TypingTest() {
  const nav = useNavigate();
  const inputRef = reactExports.useRef(null);
  const cursorRef = reactExports.useRef(null);
  const positionRef = reactExports.useRef(0);
  const errorsRef = reactExports.useRef(0);
  const startRef = reactExports.useRef(0);
  const keyTimesRef = reactExports.useRef([]);
  const pauseCountRef = reactExports.useRef(0);
  const [state, setState] = reactExports.useState("idle");
  const [position, setPosition] = reactExports.useState(0);
  const [errors, setErrors] = reactExports.useState(0);
  const [elapsedMs, setElapsedMs] = reactExports.useState(0);
  reactExports.useEffect(() => {
    if (state !== "running") return;
    const id = setInterval(() => {
      setElapsedMs(Date.now() - startRef.current);
    }, 100);
    return () => clearInterval(id);
  }, [state]);
  reactExports.useEffect(() => {
    if (state === "running") {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [state]);
  reactExports.useEffect(() => {
    if (state === "running" && cursorRef.current) {
      cursorRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest"
      });
    }
  }, [position, state]);
  reactExports.useEffect(() => {
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
  const finish = async (completionMs) => {
    setState("done");
    inputRef.current?.blur();
    const intervals = [];
    for (let i = 1; i < keyTimesRef.current.length; i++) {
      intervals.push(keyTimesRef.current[i] - keyTimesRef.current[i - 1]);
    }
    const intervalConsistency = stdDev(intervals);
    const minutes = completionMs / 6e4;
    const wpm = minutes > 0 ? PASSAGE.length / 5 / minutes : 0;
    const errorRate = PASSAGE.length > 0 ? errorsRef.current / PASSAGE.length : 0;
    const score = typingScore({
      wpm,
      errorRate,
      intervalConsistency,
      pauseCount: pauseCountRef.current
    });
    const {
      data: u
    } = await supabase.auth.getUser();
    if (!u.user) return;
    const {
      error
    } = await supabase.from("typing_data").insert({
      patient_id: u.user.id,
      wpm,
      error_count: errorsRef.current,
      error_rate: errorRate,
      interval_consistency: intervalConsistency,
      pause_count: pauseCountRef.current,
      completion_time_ms: completionMs,
      score
    });
    if (error) toast.error(supabaseErrorMessage(error, "typing_data"));
    else toast.success(`Done — score ${score}/100 · ${wpm.toFixed(0)} WPM`);
  };
  const processChar = (char) => {
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
  const onBeforeInput = (e) => {
    if (state !== "running") return;
    const inputEvent = e.nativeEvent;
    if (!inputEvent.data || inputEvent.isComposing) return;
    e.preventDefault();
    processChar(inputEvent.data);
  };
  const onKeyDown = (e) => {
    if (state !== "running") return;
    if (e.key.length !== 1 || e.ctrlKey || e.metaKey || e.altKey) return;
    e.preventDefault();
    processChar(e.key);
  };
  const wpmLive = state === "running" && elapsedMs > 0 ? position / 5 / (elapsedMs / 6e4) : 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pb-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold text-primary", children: "Typing" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm mt-1", children: "Type the sentence below. The highlight moves forward with each correct letter." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 rounded-2xl bg-card card-elev p-4 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Progress", value: `${position}/${PASSAGE.length}` }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Errors", value: errors }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "WPM", value: state === "running" ? wpmLive.toFixed(0) : "—" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 rounded-3xl bg-card card-elev p-6", onClick: focusInput, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid place-items-center h-16 w-16 rounded-full bg-primary/10 text-primary mx-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Keyboard, { className: "h-8 w-8" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-5 text-xl leading-relaxed font-mono break-words select-none", children: PASSAGE.split("").map((char, i) => {
        const isDone = i < position;
        const isCurrent = i === position && state === "running";
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { ref: isCurrent ? cursorRef : void 0, className: isDone ? "text-primary font-semibold" : isCurrent ? "relative text-primary bg-primary/20 rounded px-0.5 ring-2 ring-primary/40" : "text-muted-foreground/60", children: [
          char === " " ? " " : char,
          isCurrent && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -bottom-0.5 left-0 right-0 h-0.5 bg-primary animate-pulse" })
        ] }, i);
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { ref: inputRef, type: "text", inputMode: "text", autoComplete: "off", autoCorrect: "off", autoCapitalize: "none", spellCheck: false, "aria-label": "Type the sentence here", value: typedSoFar, placeholder: state === "running" && position === 0 ? "Tap here and type…" : "", disabled: state !== "running", className: "mt-5 w-full rounded-xl border border-border bg-background px-4 py-3 text-base font-medium text-primary outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50", onBeforeInput, onKeyDown, onPaste: (e) => e.preventDefault(), onChange: () => {
      } }),
      state === "idle" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-center text-sm text-muted-foreground", children: "Tap Start, then type in the box above." }),
      state === "running" && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-3 text-center text-sm text-muted-foreground", children: [
        (elapsedMs / 1e3).toFixed(1),
        "s elapsed · type letter by letter"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6", children: [
      state === "idle" && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "w-full h-12 rounded-xl", onClick: start, children: "Start test" }),
      state === "running" && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "secondary", className: "w-full h-12 rounded-xl", onClick: () => finish(elapsedMs || Date.now() - startRef.current), children: "Stop early" }),
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
  TypingTest as component
};
