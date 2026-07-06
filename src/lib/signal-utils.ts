// Lightweight signal-processing helpers for sensor analysis.

export function mean(arr: number[]): number {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

export function stdDev(arr: number[]): number {
  if (arr.length < 2) return 0;
  const m = mean(arr);
  return Math.sqrt(mean(arr.map((v) => (v - m) ** 2)));
}

// Naive dominant-frequency estimator via zero-crossing rate.
// Returns Hz given the signal and sampling rate (Hz).
export function dominantFrequency(signal: number[], sampleRate: number): number {
  if (signal.length < 4 || sampleRate <= 0) return 0;
  const m = mean(signal);
  let crossings = 0;
  for (let i = 1; i < signal.length; i++) {
    const a = signal[i - 1] - m;
    const b = signal[i] - m;
    if ((a < 0 && b >= 0) || (a > 0 && b <= 0)) crossings++;
  }
  const duration = signal.length / sampleRate;
  return crossings / (2 * duration);
}

// Simple high-pass via running-mean subtraction (removes DC / gravity bias).
export function detrend(signal: number[], window = 25): number[] {
  const out: number[] = [];
  let sum = 0;
  const buf: number[] = [];
  for (let i = 0; i < signal.length; i++) {
    buf.push(signal[i]);
    sum += signal[i];
    if (buf.length > window) sum -= buf.shift()!;
    out.push(signal[i] - sum / buf.length);
  }
  return out;
}

// Smoothness as 1 - normalized jerk (very rough proxy).
export function smoothness(signal: number[]): number {
  if (signal.length < 3) return 1;
  let jerkSum = 0;
  for (let i = 2; i < signal.length; i++) {
    jerkSum += Math.abs(signal[i] - 2 * signal[i - 1] + signal[i - 2]);
  }
  const norm = jerkSum / signal.length;
  return Math.max(0, Math.min(1, 1 - norm / 2));
}

export function magnitude(x: number, y: number, z: number): number {
  return Math.sqrt(x * x + y * y + z * z);
}
