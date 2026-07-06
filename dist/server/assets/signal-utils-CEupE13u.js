function bradykinesiaScore(input) {
  const speedDeficit = clamp01((6 - input.tappingSpeed) / 5) * 40;
  const rtDeficit = clamp01((input.reactionTimeMs - 250) / 600) * 25;
  const varDeficit = clamp01(input.intervalConsistency / 400) * 20;
  const missDeficit = clamp01(input.missedTaps / 20) * 15;
  return Math.round(speedDeficit + rtDeficit + varDeficit + missDeficit);
}
function tremorScore(input) {
  const inBand = input.frequencyHz >= 3.5 && input.frequencyHz <= 7.5 ? 1 : 0.3;
  const ampDef = clamp01(input.amplitude / 1.5) * 60 * inBand;
  const varDef = clamp01(input.motionVariability / 1) * 40;
  return Math.round(Math.min(100, ampDef + varDef));
}
function rigidityScore(input) {
  const romDef = clamp01((3 - input.rangeOfMotion) / 3) * 45;
  const velDef = clamp01((2 - input.angularVelocity) / 2) * 25;
  const smoothDef = clamp01(1 - input.smoothness) * 30;
  return Math.round(romDef + velDef + smoothDef);
}
function typingScore(input) {
  const speedDef = clamp01((45 - input.wpm) / 40) * 35;
  const errorDef = clamp01(input.errorRate / 0.08) * 25;
  const varDef = clamp01(input.intervalConsistency / 300) * 25;
  const pauseDef = clamp01(input.pauseCount / 8) * 15;
  return Math.round(Math.min(100, speedDef + errorDef + varDef + pauseDef));
}
function clamp01(n) {
  return Math.max(0, Math.min(1, n));
}
function mean(arr) {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}
function stdDev(arr) {
  if (arr.length < 2) return 0;
  const m = mean(arr);
  return Math.sqrt(mean(arr.map((v) => (v - m) ** 2)));
}
function dominantFrequency(signal, sampleRate) {
  if (signal.length < 4 || sampleRate <= 0) return 0;
  const m = mean(signal);
  let crossings = 0;
  for (let i = 1; i < signal.length; i++) {
    const a = signal[i - 1] - m;
    const b = signal[i] - m;
    if (a < 0 && b >= 0 || a > 0 && b <= 0) crossings++;
  }
  const duration = signal.length / sampleRate;
  return crossings / (2 * duration);
}
function detrend(signal, window = 25) {
  const out = [];
  let sum = 0;
  const buf = [];
  for (let i = 0; i < signal.length; i++) {
    buf.push(signal[i]);
    sum += signal[i];
    if (buf.length > window) sum -= buf.shift();
    out.push(signal[i] - sum / buf.length);
  }
  return out;
}
function smoothness(signal) {
  if (signal.length < 3) return 1;
  let jerkSum = 0;
  for (let i = 2; i < signal.length; i++) {
    jerkSum += Math.abs(signal[i] - 2 * signal[i - 1] + signal[i - 2]);
  }
  const norm = jerkSum / signal.length;
  return Math.max(0, Math.min(1, 1 - norm / 2));
}
function magnitude(x, y, z) {
  return Math.sqrt(x * x + y * y + z * z);
}
export {
  dominantFrequency as a,
  bradykinesiaScore as b,
  mean as c,
  detrend as d,
  stdDev as e,
  typingScore as f,
  magnitude as m,
  rigidityScore as r,
  smoothness as s,
  tremorScore as t
};
