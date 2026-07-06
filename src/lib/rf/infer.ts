import type { BinaryForest, MultiForest } from "./types";

function featuresFromMap(names: string[], featureMap: Record<string, number>): number[] {
  return names.map((n) => {
    const v = featureMap[n];
    return typeof v === "number" && Number.isFinite(v) ? v : 0;
  });
}

/** Walk a single binary-classification tree to its leaf and return P(PD). */
function traverseBinary(tree: BinaryForest["trees"][number], features: number[]): number {
  let idx = 0;
  // Safety cap in case of malformed tree data — avoids infinite loops.
  for (let hops = 0; hops < 10_000; hops++) {
    const node = tree[idx];
    if (!node) return 0.5;
    if (node.leaf) return node.proba ?? 0.5;
    const value = features[node.feature!] ?? 0;
    idx = value <= node.threshold! ? node.left! : node.right!;
  }
  return 0.5;
}

/** Average P(PD) across every tree in the forest -> a single probability 0..1. */
export function predictProbaBinary(forest: BinaryForest, featureMap: Record<string, number>): number {
  const features = featuresFromMap(forest.featureNames, featureMap);
  if (!forest.trees.length) return 0.5;
  const sum = forest.trees.reduce((acc, tree) => acc + traverseBinary(tree, features), 0);
  return sum / forest.trees.length;
}

/** Walk a single multiclass tree to its leaf and return its class-probability vector. */
function traverseMulti(tree: MultiForest["trees"][number], features: number[], nClasses: number): number[] {
  let idx = 0;
  for (let hops = 0; hops < 10_000; hops++) {
    const node = tree[idx];
    if (!node) return new Array(nClasses).fill(1 / nClasses);
    if (node.leaf) return node.proba ?? new Array(nClasses).fill(1 / nClasses);
    const value = features[node.feature!] ?? 0;
    idx = value <= node.threshold! ? node.left! : node.right!;
  }
  return new Array(nClasses).fill(1 / nClasses);
}

/** Average class-probability vectors across every tree in a multiclass forest. */
export function predictProbaMulti(
  forest: MultiForest,
  featureMap: Record<string, number>,
): { classes: string[]; proba: number[] } {
  const features = featuresFromMap(forest.featureNames, featureMap);
  const n = forest.classes.length;
  const totals = new Array(n).fill(0);
  for (const tree of forest.trees) {
    const p = traverseMulti(tree, features, n);
    for (let i = 0; i < n; i++) totals[i] += p[i] ?? 0;
  }
  const count = forest.trees.length || 1;
  return { classes: forest.classes, proba: totals.map((t) => t / count) };
}

/** argmax helper for multiclass output. */
export function argmax(values: number[]): number {
  let best = 0;
  for (let i = 1; i < values.length; i++) if (values[i] > values[best]) best = i;
  return best;
}
