# Random Forest models — data provenance

The four per-test models (`bradykinesia.json`, `tremor.json`, `rigidity.json`,
`typing.json`) and the meta severity model (`meta.json`) are **real, trained
`sklearn.ensemble.RandomForestClassifier` models**, exported to a plain-JSON
decision-tree format and evaluated with a small hand-written JS tree-walker
(`infer.ts`) — no native ML runtime needed, so it runs anywhere this app runs
(browser, Cloudflare Worker, Node).

## What they were trained on

They were **not** trained on the raw Kaggle/PhysioNet/Mendeley datasets you
linked. The build environment used to create this integration has no network
access, and three of those four sources require an account / access request
(Kaggle login, Mendeley data-request form) that can't be completed
programmatically, and the fourth (PhysioNet Tappy) is a large multi-hundred-file
corpus too big to pull in through a page-fetching tool.

Instead, `train_models.py` generates **synthetic per-class feature
distributions calibrated to ranges and effect directions reported in the
published literature** behind these datasets, e.g.:

- **Bradykinesia** (finger tapping): MDS-UPDRS tapping-test studies — PD
  ~1.5–5 taps/sec vs. healthy ~5–6.5 taps/sec, longer reaction time, higher
  inter-tap variability, more missed taps.
- **Tremor**: PD rest tremor concentrated 4–6 Hz (range ~3.5–7.5 Hz) with
  elevated angular-rate amplitude/variability vs. controls.
- **Rigidity** (proxied via wrist/arm gyroscope ROM/velocity/smoothness): PD
  shows reduced range of motion, reduced peak velocity, reduced smoothness.
- **Typing**: Giancardo et al. 2016 (neuroQWERTY, *Scientific Reports*) and
  related keystroke-dynamics work found PD types slower with higher hold/
  flight-time variability and more pauses. **Caveat:** follow-up work
  evaluating the specific 227-subject "Tappy" corpus you linked reports
  near-chance leave-one-out performance (AUC ≈ 0.38–0.46) on that exact
  dataset — i.e. it's a documented weak-signal source. The typing model here
  is deliberately given the widest class overlap / lowest confidence of the
  four to reflect that this modality is the least reliable.

## Honest framing for end users

Because the training data is synthetic-but-literature-calibrated rather than
real patient data, **this should be presented in the app as a research/
educational screening demo, not a validated diagnostic tool** — same caveat
that applied to the original hand-tuned heuristic scoring, just now backed by
an actual trained classifier architecture instead of hard-coded thresholds.

## Swapping in real data later

The moment you obtain the real CSVs (download the Kaggle sets after logging
in, request the Mendeley set, or `wget` the PhysioNet Tappy files), retrain
with real data by:

1. Loading the CSVs and computing the same feature columns used here (see the
   `gen_*` function signatures in `train_models.py` for the exact feature
   names/order expected by each model).
2. Replacing the corresponding `gen_bradykinesia` / `gen_tremor` /
   `gen_rigidity` / `gen_typing` function body with a real data loader instead
   of the synthetic generator.
3. Re-running `python3 train_models.py` (needs `scikit-learn`, `numpy`) — it
   writes fresh `bradykinesia.json` / `tremor.json` / `rigidity.json` /
   `typing.json` / `meta.json` files that are drop-in compatible with the
   existing `infer.ts` / `models.ts` code — no other app code needs to change.
