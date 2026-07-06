// Portable representation of a trained scikit-learn RandomForestClassifier,
// exported to plain JSON so it can be evaluated with zero native dependencies
// (works in the browser, in a Cloudflare Worker, anywhere JS runs).

export interface BinaryTreeNode {
  leaf: boolean;
  // leaf-only:
  proba?: number; // P(class = PD), 0..1
  // internal-node-only:
  feature?: number; // index into featureNames
  threshold?: number;
  left?: number; // node index if feature <= threshold
  right?: number; // node index if feature > threshold
}

export interface BinaryForest {
  featureNames: string[];
  trees: BinaryTreeNode[][];
}

export interface MultiTreeNode {
  leaf: boolean;
  proba?: number[]; // per-class probability vector, leaf-only
  feature?: number;
  threshold?: number;
  left?: number;
  right?: number;
}

export interface MultiForest {
  featureNames: string[];
  classes: string[];
  trees: MultiTreeNode[][];
}
