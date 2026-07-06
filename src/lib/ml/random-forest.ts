// Random Forest inference engine — runs entirely client/server-side in TS,
// no Python runtime required. Loads a forest exported from scikit-learn
// (see /ml-training/train_subscore_model.py) as plain JSON and walks each
// tree to average class probabilities, exactly like sklearn's
// RandomForestClassifier.predict_proba does internally.
//
// Model inputs are the SAME 4 subscores the app already computes via
// scoring.ts (bradykinesiaScore, tremorScore, rigidityScore, typingScore),
// so this is a drop-in replacement for combineSeverity()'s rule-based
// thresholds — no database or route changes needed.

import modelData from "./random-forest-model.json";

type TreeNode =
  | { leaf: true; probs: number[] }
  | { leaf: false; feature: number; threshold: number; left: number; right: number };

interface ForestModel {
  features: string[];
  classes: string[];
  trees: TreeNode[][];
}

const model = modelData as ForestModel;

export type MLSeverity = "Normal" | "Mild Parkinson's" | "Moderate Parkinson's" | "Severe Parkinson's";

export interface RfPredictionInput {
  bradykinesiaScore: number;
  tremorScore: number;
  rigidityScore: number;
  typingScore: number;
}

export interface RfPredictionResult {
  severity: MLSeverity;
  result: string;
  confidence: number; // 0-100
  classProbabilities: Record<string, number>;
}

function walkTree(tree: TreeNode[], features: number[]): number[] {
  let node = tree[0];
  let idx = 0;
  // Guard against malformed trees; sklearn trees are finite/acyclic so this
  // always terminates, but cap iterations defensively.
  for (let i = 0; i < tree.length; i++) {
    if (node.leaf) return node.probs;
    idx = features[node.feature] <= node.threshold ? node.left : node.right;
    node = tree[idx];
  }
  // Should be unreachable, but keep TypeScript happy and fail safe.
  return node.leaf ? node.probs : model.classes.map(() => 1 / model.classes.length);
}

const SEVERITY_LABEL_MAP: Record<string, MLSeverity> = {
  Normal: "Normal",
  Mild: "Mild Parkinson's",
  Moderate: "Moderate Parkinson's",
  Severe: "Severe Parkinson's",
};

/**
 * Predicts Parkinson's severity from the 4 subscores using the trained
 * Random Forest, mirroring the shape of scoring.ts's combineSeverity().
 */
export function predictSeverityRf(input: RfPredictionInput): RfPredictionResult {
  const featureVector = model.features.map((name) => {
    const value = (input as unknown as Record<string, number>)[name];
    if (typeof value !== "number" || Number.isNaN(value)) {
      throw new Error(`Missing or invalid feature "${name}" for RF prediction`);
    }
    return value;
  });

  const numClasses = model.classes.length;
  const summedProbs = new Array(numClasses).fill(0);

  for (const tree of model.trees) {
    const probs = walkTree(tree, featureVector);
    for (let c = 0; c < numClasses; c++) summedProbs[c] += probs[c];
  }

  const avgProbs = summedProbs.map((s) => s / model.trees.length);

  let bestIdx = 0;
  for (let c = 1; c < numClasses; c++) {
    if (avgProbs[c] > avgProbs[bestIdx]) bestIdx = c;
  }

  const rawLabel = model.classes[bestIdx];
  const severity = SEVERITY_LABEL_MAP[rawLabel] ?? "Normal";
  const confidence = Math.round(avgProbs[bestIdx] * 100);
  const result = severity === "Normal" ? "No indicators detected" : `Indicators of ${severity}`;

  const classProbabilities: Record<string, number> = {};
  model.classes.forEach((cls, i) => {
    classProbabilities[SEVERITY_LABEL_MAP[cls] ?? cls] = Math.round(avgProbs[i] * 1000) / 10;
  });

  return { severity, result, confidence, classProbabilities };
}
