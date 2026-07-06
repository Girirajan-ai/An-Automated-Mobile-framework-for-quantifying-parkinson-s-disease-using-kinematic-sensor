// Random Forest models for PDMS's four motor tests, plus a meta model that
// turns the four subscores into an overall severity call.
//
// Each *.json file under ./models is a real, trained sklearn
// RandomForestClassifier exported to a plain-JS tree format (see
// ./train_models.py for the training script and ../rf-README.md for the
// data-provenance disclosure). Inference below is pure JS tree traversal —
// no native/ML runtime dependency, safe for edge/serverless execution.

import { predictProbaBinary, predictProbaMulti, argmax } from "./infer";
import type { BinaryForest, MultiForest } from "./types";

import bradykinesiaForest from "./models/bradykinesia.json";
import tremorForest from "./models/tremor.json";
import rigidityForest from "./models/rigidity.json";
import typingForest from "./models/typing.json";
import metaForest from "./models/meta.json";

/** PD-probability (0..1) from the bradykinesia (finger-tapping) forest. */
export function rfBradykinesiaProba(input: {
  tapCount: number;
  reactionTimeMs: number;
  tappingSpeed: number;
  intervalConsistency: number;
  missedTaps: number;
}): number {
  return predictProbaBinary(bradykinesiaForest as BinaryForest, input);
}

/** PD-probability (0..1) from the tremor (hold-still gyroscope) forest. */
export function rfTremorProba(input: {
  frequencyHz: number;
  amplitude: number;
  motionVariability: number;
}): number {
  return predictProbaBinary(tremorForest as BinaryForest, input);
}

/** PD-probability (0..1) from the rigidity (range-of-motion) forest. */
export function rfRigidityProba(input: {
  rangeOfMotion: number;
  angularVelocity: number;
  smoothness: number;
}): number {
  return predictProbaBinary(rigidityForest as BinaryForest, input);
}

/** PD-probability (0..1) from the typing (keystroke dynamics) forest. */
export function rfTypingProba(input: {
  wpm: number;
  errorRate: number;
  intervalConsistency: number;
  pauseCount: number;
}): number {
  return predictProbaBinary(typingForest as BinaryForest, input);
}

export interface MetaResult {
  severityIndex: number; // 0=Normal 1=Mild 2=Moderate 3=Severe
  severityLabel: string; // "Normal" | "Mild" | "Moderate" | "Severe"
  proba: number[]; // per-class probability, same order as classes
  classes: string[];
}

/** Combines the four 0-100 subscores into an overall severity classification. */
export function rfCombineSeverity(input: {
  bradykinesiaScore: number;
  tremorScore: number;
  rigidityScore: number;
  typingScore: number;
}): MetaResult {
  const { classes, proba } = predictProbaMulti(metaForest as MultiForest, input);
  const severityIndex = argmax(proba);
  return { severityIndex, severityLabel: classes[severityIndex], proba, classes };
}

export { bradykinesiaForest, tremorForest, rigidityForest, typingForest, metaForest };
