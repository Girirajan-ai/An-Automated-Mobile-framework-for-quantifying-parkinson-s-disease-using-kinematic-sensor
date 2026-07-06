"""
Trains Random Forest classifiers for the PDMS app's four motor tests
(bradykinesia, tremor, rigidity, typing) plus a meta-classifier that
turns the four subscores into a severity call.

IMPORTANT / HONESTY NOTE:
This script does NOT have access to the raw Kaggle/PhysioNet/Mendeley
datasets (no network in the build sandbox). Instead it generates
synthetic feature data whose per-class distributions are calibrated
to ranges and effect directions reported in the published literature
behind those datasets, e.g.:

  - Bradykinesia (finger tapping): MDS-UPDRS tapping-test studies show
    PD ~1.5-5 taps/sec vs healthy ~5-6.5 taps/sec, higher reaction time,
    higher inter-tap interval variability, and more missed/off-target taps.
  - Tremor: PD rest tremor concentrated 4-6 Hz (range ~3.5-7.5 Hz) with
    elevated angular-rate amplitude and variability vs healthy controls.
  - Rigidity (proxied via wrist/arm gyroscope range-of-motion, angular
    velocity, and smoothness/jerk): PD shows reduced ROM, reduced peak
    velocity, and reduced smoothness (cogwheel-like jerkiness).
  - Typing/keystroke dynamics: Giancardo et al. 2016 (neuroQWERTY,
    Scientific Reports) and Adams et al. (multi-feature ensemble) found
    PD types slower (lower WPM), with higher hold/flight-time variability
    and more pauses. NOTE: the specific 227-subject "Tappy" corpus linked
    by the user is documented in follow-up work as a *weak-signal* dataset
    (published leave-one-out AUC as low as ~0.38-0.46, i.e. near chance),
    so typing is the least reliable of the four modalities — the model
    below reflects that by giving it the widest class overlap.

This keeps the architecture "real" (real RandomForestClassifier, real
train/test split, real exported decision trees run at inference time)
while being transparent that the *training data* is literature-informed
synthetic data, not the original datasets. The moment real CSVs are
available, swap the generator functions below for real loaders and
rerun this script — the rest of the pipeline (export + TS inference)
does not need to change.
"""

import json
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score, accuracy_score, classification_report

rng = np.random.default_rng(42)
N_PER_CLASS = 1500


def clip(a, lo, hi):
    return np.clip(a, lo, hi)


# ----------------------------------------------------------------------------
# 1. BRADYKINESIA (finger-tapping test)
# features: tapCount, reactionTimeMs, tappingSpeed, intervalConsistency, missedTaps
# ----------------------------------------------------------------------------
def gen_bradykinesia(n):
    healthy_speed = clip(rng.normal(5.6, 0.6, n), 3.5, 7.0)
    pd_speed = clip(rng.normal(3.2, 1.0, n), 0.8, 5.5)

    healthy_rt = clip(rng.normal(260, 45, n), 150, 450)
    pd_rt = clip(rng.normal(420, 110, n), 220, 900)

    healthy_var = clip(rng.normal(75, 30, n), 15, 200)
    pd_var = clip(rng.normal(230, 90, n), 60, 500)

    healthy_missed = clip(rng.poisson(1.0, n), 0, 8)
    pd_missed = clip(rng.poisson(6.5, n), 0, 25)

    def build(speed, rt, var, missed):
        tap_count = clip(speed * 30 + rng.normal(0, 4, n), 20, 220)
        return np.stack([tap_count, rt, speed, var, missed], axis=1)

    X = np.concatenate([
        build(healthy_speed, healthy_rt, healthy_var, healthy_missed),
        build(pd_speed, pd_rt, pd_var, pd_missed),
    ])
    y = np.concatenate([np.zeros(n), np.ones(n)])
    return X, y, ["tapCount", "reactionTimeMs", "tappingSpeed", "intervalConsistency", "missedTaps"]


# ----------------------------------------------------------------------------
# 2. TREMOR (hold-still gyroscope test)
# features: frequencyHz, amplitude, motionVariability
# ----------------------------------------------------------------------------
def gen_tremor(n):
    healthy_freq = clip(rng.uniform(0.2, 9.5, n), 0, 12)
    pd_freq = clip(rng.normal(5.0, 1.1, n), 3.0, 8.0)

    healthy_amp = clip(rng.gamma(2.0, 0.06, n), 0, 0.9)
    pd_amp = clip(rng.gamma(2.5, 0.28, n), 0.05, 2.2)

    healthy_var = clip(rng.gamma(2.0, 0.05, n), 0, 0.7)
    pd_var = clip(rng.gamma(2.2, 0.22, n), 0.03, 1.6)

    X = np.concatenate([
        np.stack([healthy_freq, healthy_amp, healthy_var], axis=1),
        np.stack([pd_freq, pd_amp, pd_var], axis=1),
    ])
    y = np.concatenate([np.zeros(n), np.ones(n)])
    return X, y, ["frequencyHz", "amplitude", "motionVariability"]


# ----------------------------------------------------------------------------
# 3. RIGIDITY (wrist/arm range-of-motion test)
# features: rangeOfMotion, angularVelocity, smoothness
# ----------------------------------------------------------------------------
def gen_rigidity(n):
    healthy_rom = clip(rng.normal(3.4, 0.6, n), 1.5, 5.0)
    pd_rom = clip(rng.normal(1.5, 0.6, n), 0.1, 3.2)

    healthy_vel = clip(rng.normal(2.2, 0.5, n), 0.8, 3.6)
    pd_vel = clip(rng.normal(1.0, 0.5, n), 0.1, 2.4)

    healthy_smooth = clip(rng.normal(0.82, 0.09, n), 0.4, 1.0)
    pd_smooth = clip(rng.normal(0.42, 0.16, n), 0.0, 0.85)

    X = np.concatenate([
        np.stack([healthy_rom, healthy_vel, healthy_smooth], axis=1),
        np.stack([pd_rom, pd_vel, pd_smooth], axis=1),
    ])
    y = np.concatenate([np.zeros(n), np.ones(n)])
    return X, y, ["rangeOfMotion", "angularVelocity", "smoothness"]


# ----------------------------------------------------------------------------
# 4. TYPING (keystroke dynamics) — intentionally the weakest signal / most overlap
# features: wpm, errorRate, intervalConsistency, pauseCount
# ----------------------------------------------------------------------------
def gen_typing(n):
    healthy_wpm = clip(rng.normal(48, 14, n), 8, 90)
    pd_wpm = clip(rng.normal(32, 14, n), 5, 75)

    healthy_err = clip(rng.gamma(1.6, 0.02, n), 0, 0.25)
    pd_err = clip(rng.gamma(1.8, 0.035, n), 0, 0.35)

    healthy_var = clip(rng.normal(95, 40, n), 10, 260)
    pd_var = clip(rng.normal(190, 80, n), 30, 420)

    healthy_pause = clip(rng.poisson(1.2, n), 0, 8)
    pd_pause = clip(rng.poisson(3.6, n), 0, 15)

    X = np.concatenate([
        np.stack([healthy_wpm, healthy_err, healthy_var, healthy_pause], axis=1),
        np.stack([pd_wpm, pd_err, pd_var, pd_pause], axis=1),
    ])
    y = np.concatenate([np.zeros(n), np.ones(n)])
    return X, y, ["wpm", "errorRate", "intervalConsistency", "pauseCount"]


def train_and_export(name, gen_fn, n_estimators=60, max_depth=5):
    X, y, feature_names = gen_fn(N_PER_CLASS)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=0, stratify=y
    )
    clf = RandomForestClassifier(
        n_estimators=n_estimators,
        max_depth=max_depth,
        min_samples_leaf=8,
        class_weight="balanced",
        random_state=0,
    )
    clf.fit(X_train, y_train)
    proba = clf.predict_proba(X_test)[:, 1]
    pred = clf.predict(X_test)
    auc = roc_auc_score(y_test, proba)
    acc = accuracy_score(y_test, pred)
    print(f"\n=== {name} ===")
    print(f"AUC: {auc:.3f}  Accuracy: {acc:.3f}")
    print(classification_report(y_test, pred, target_names=["Healthy", "PD"]))
    importances = dict(zip(feature_names, clf.feature_importances_.round(4).tolist()))
    print("Feature importances:", importances)

    forest_json = export_forest(clf, feature_names)
    return forest_json, {"auc": round(float(auc), 4), "accuracy": round(float(acc), 4), "feature_importances": importances}


def export_tree(tree, feature_names):
    t = tree.tree_
    nodes = []
    for i in range(t.node_count):
        if t.children_left[i] == -1:  # leaf
            counts = t.value[i][0]
            total = counts.sum()
            proba_pd = float(counts[1] / total) if total > 0 else 0.5
            nodes.append({"leaf": True, "proba": round(proba_pd, 6)})
        else:
            nodes.append({
                "leaf": False,
                "feature": int(t.feature[i]),
                "threshold": float(t.threshold[i]),
                "left": int(t.children_left[i]),
                "right": int(t.children_right[i]),
            })
    return nodes


def export_forest(clf, feature_names):
    return {
        "featureNames": feature_names,
        "trees": [export_tree(est, feature_names) for est in clf.estimators_],
    }


# ----------------------------------------------------------------------------
# 5. META classifier: 4 subscores (0-100, RF-derived) -> severity class
# ----------------------------------------------------------------------------
SEVERITIES = ["Normal", "Mild", "Moderate", "Severe"]


def gen_meta(n_per_class=1200):
    # Simulate plausible joint subscore distributions per severity tier,
    # with realistic correlation (all subscores tend to move together
    # with disease severity) plus noise/discordance so the classifier
    # has to learn a real nonlinear boundary rather than a simple average.
    centers = {
        "Normal": 12,
        "Mild": 30,
        "Moderate": 50,
        "Severe": 78,
    }
    weights = np.array([0.30, 0.25, 0.20, 0.25])  # brady, tremor, rigidity, typing
    rows, labels = [], []
    for idx, sev in enumerate(SEVERITIES):
        base = centers[sev]
        for _ in range(n_per_class):
            core = clip(rng.normal(base, 10), 0, 100)
            subs = clip(core * weights * 4 + rng.normal(0, 14, 4), 0, 100)
            rows.append(subs)
            labels.append(idx)
    X = np.array(rows)
    y = np.array(labels)
    return X, y, ["bradykinesiaScore", "tremorScore", "rigidityScore", "typingScore"]


def train_meta():
    X, y, feature_names = gen_meta()
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=0, stratify=y)
    clf = RandomForestClassifier(n_estimators=60, max_depth=5, min_samples_leaf=12, random_state=0)
    clf.fit(X_train, y_train)
    acc = accuracy_score(y_test, clf.predict(X_test))
    print(f"\n=== META (severity) ===\nAccuracy: {acc:.3f}")
    print(classification_report(y_test, clf.predict(X_test), target_names=SEVERITIES))

    # Multi-class leaf export: value has shape (1, n_classes)
    def export_tree_multiclass(tree):
        t = tree.tree_
        nodes = []
        for i in range(t.node_count):
            if t.children_left[i] == -1:
                counts = t.value[i][0]
                total = counts.sum()
                proba = (counts / total).round(6).tolist() if total > 0 else [0.25, 0.25, 0.25, 0.25]
                nodes.append({"leaf": True, "proba": proba})
            else:
                nodes.append({
                    "leaf": False,
                    "feature": int(t.feature[i]),
                    "threshold": float(t.threshold[i]),
                    "left": int(t.children_left[i]),
                    "right": int(t.children_right[i]),
                })
        return nodes

    forest_json = {
        "featureNames": feature_names,
        "classes": SEVERITIES,
        "trees": [export_tree_multiclass(est) for est in clf.estimators_],
    }
    return forest_json, {"accuracy": round(float(acc), 4)}


if __name__ == "__main__":
    out = {}
    metrics = {}

    for name, fn in [
        ("bradykinesia", gen_bradykinesia),
        ("tremor", gen_tremor),
        ("rigidity", gen_rigidity),
        ("typing", gen_typing),
    ]:
        forest_json, m = train_and_export(name, fn)
        out[name] = forest_json
        metrics[name] = m

    meta_json, meta_m = train_meta()
    out["meta"] = meta_json
    metrics["meta"] = meta_m

    with open("models.json", "w") as f:
        json.dump(out, f)

    with open("metrics.json", "w") as f:
        json.dump(metrics, f, indent=2)

    print("\nDone. Wrote models.json and metrics.json")
    import os
    for k, v in out.items():
        n_trees = len(v["trees"])
        n_nodes = sum(len(t) for t in v["trees"])
        print(f"{k}: {n_trees} trees, {n_nodes} total nodes")
