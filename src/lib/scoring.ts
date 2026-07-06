// Clinically-inspired rule-based scoring for PDMS.
// Each subscore is 0-100 (higher = more abnormal / more PD-like).

export type Severity = "Normal" | "Mild Parkinson's" | "Moderate Parkinson's" | "Severe Parkinson's";

export function bradykinesiaScore(input: {
  tapCount: number;
  reactionTimeMs: number;
  tappingSpeed: number; // taps/sec
  intervalConsistency: number; // std-dev in ms (lower = more consistent)
  missedTaps: number;
}): number {
  // Healthy reference: ~5-6 taps/sec over 30s, low variability.
  const speedDeficit = clamp01((6 - input.tappingSpeed) / 5) * 40;
  const rtDeficit = clamp01((input.reactionTimeMs - 250) / 600) * 25;
  const varDeficit = clamp01(input.intervalConsistency / 400) * 20;
  const missDeficit = clamp01(input.missedTaps / 20) * 15;
  return Math.round(speedDeficit + rtDeficit + varDeficit + missDeficit);
}

export function tremorScore(input: {
  frequencyHz: number; // dominant frequency in PD-relevant band
  amplitude: number; // mean magnitude of rotation, rad/s
  motionVariability: number;
}): number {
  // PD resting tremor is typically 4-6 Hz with elevated amplitude.
  const inBand = input.frequencyHz >= 3.5 && input.frequencyHz <= 7.5 ? 1 : 0.3;
  const ampDef = clamp01(input.amplitude / 1.5) * 60 * inBand;
  const varDef = clamp01(input.motionVariability / 1.0) * 40;
  return Math.round(Math.min(100, ampDef + varDef));
}

export function rigidityScore(input: {
  rangeOfMotion: number; // radians
  angularVelocity: number; // mean rad/s
  smoothness: number; // 0..1, higher = smoother
}): number {
  const romDef = clamp01((3.0 - input.rangeOfMotion) / 3.0) * 45;
  const velDef = clamp01((2.0 - input.angularVelocity) / 2.0) * 25;
  const smoothDef = clamp01(1 - input.smoothness) * 30;
  return Math.round(romDef + velDef + smoothDef);
}

export function typingScore(input: {
  wpm: number;
  errorRate: number; // errors / passage length
  intervalConsistency: number; // std-dev of inter-key intervals in ms
  pauseCount: number; // pauses longer than 500ms
}): number {
  const speedDef = clamp01((45 - input.wpm) / 40) * 35;
  const errorDef = clamp01(input.errorRate / 0.08) * 25;
  const varDef = clamp01(input.intervalConsistency / 300) * 25;
  const pauseDef = clamp01(input.pauseCount / 8) * 15;
  return Math.round(Math.min(100, speedDef + errorDef + varDef + pauseDef));
}

export function combineSeverity(b: number, t: number, r: number, typing: number): {
  severity: Severity;
  result: string;
  confidence: number;
} {
  const composite = b * 0.30 + t * 0.25 + r * 0.20 + typing * 0.25;
  let severity: Severity;
  if (composite < 18) severity = "Normal";
  else if (composite < 38) severity = "Mild Parkinson's";
  else if (composite < 62) severity = "Moderate Parkinson's";
  else severity = "Severe Parkinson's";

  const result = severity === "Normal" ? "No indicators detected" : `Indicators of ${severity}`;
  // Confidence reflects how far the composite is from a decision boundary.
  const boundaries = [18, 38, 62];
  const nearest = Math.min(...boundaries.map((x) => Math.abs(composite - x)));
  const confidence = Math.round(Math.min(99, 60 + nearest * 1.2));
  return { severity, result, confidence };
}

function clamp01(n: number) { return Math.max(0, Math.min(1, n)); }

export function severityColor(s: Severity): string {
  switch (s) {
    case "Normal": return "var(--color-success)";
    case "Mild Parkinson's": return "var(--color-warning)";
    case "Moderate Parkinson's": return "oklch(0.7 0.18 50)";
    case "Severe Parkinson's": return "var(--color-destructive)";
  }
}
