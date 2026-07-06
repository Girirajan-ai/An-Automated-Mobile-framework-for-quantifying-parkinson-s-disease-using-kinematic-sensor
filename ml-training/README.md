# Random Forest model for PDMS

## What was added

- `src/lib/ml/random-forest.ts` — a pure-TypeScript Random Forest inference
  engine. It loads `src/lib/ml/random-forest-model.json` (a forest exported
  from scikit-learn) and walks each tree to average class probabilities,
  exactly like `RandomForestClassifier.predict_proba` does in Python. No
  Python runtime needed at request time — this runs directly in the
  Cloudflare Worker / browser.
- `src/lib/ml/random-forest-model.json` — 60 trees, max depth 6, trained on
  4 features: `bradykinesiaScore`, `tremorScore`, `rigidityScore`,
  `typingScore` (the exact same 0-100 subscores your app already computes
  via `scoring.ts` and stores in Supabase).
- `_authenticated.results.tsx` now calls `predictSeverityRf(...)` instead of
  `combineSeverity(...)`. Same input/output shape (`severity`, `result`,
  `confidence`), so no other files needed to change.
- `scoring.ts` (the 4 rule-based per-test subscore formulas: bradykinesia,
  tremor, rigidity, typing) is untouched and still runs on each test page —
  only the *final combination step* is now ML-based instead of the
  hard-coded weighted thresholds.

## IMPORTANT: this model is trained on SYNTHETIC data

There is currently no labeled real-patient dataset for these 4 tests, so
`generate_dataset.py` simulates 6,000 synthetic patients along a continuous
severity spectrum, using the same clinical reference ranges already encoded
in `scoring.ts` (e.g. ~5-6 taps/sec healthy baseline, 4-6 Hz resting tremor
band), with per-feature noise and ~4% label noise so the classifier learns
real decision boundaries instead of memorizing a formula.

**Test accuracy on held-out synthetic data: ~78%**, with confusion mostly
between adjacent severity classes (Normal↔Mild, Mild↔Moderate, etc.) — this
is a reasonable synthetic baseline, but it is NOT validated against real
patients and should not be used for actual clinical decisions until
retrained on real data.

## How to retrain when you get a real dataset

1. Replace `dataset.csv` with real captured data. Required columns (raw
   sensor/tap features per test):
   - Bradykinesia: `brady_tapCount`, `brady_reactionTimeMs`,
     `brady_tappingSpeed`, `brady_intervalConsistency`, `brady_missedTaps`
   - Tremor: `tremor_frequencyHz`, `tremor_amplitude`,
     `tremor_motionVariability`
   - Rigidity: `rigidity_rangeOfMotion`, `rigidity_angularVelocity`,
     `rigidity_smoothness`
   - Typing: `typing_wpm`, `typing_errorRate`,
     `typing_intervalConsistency`, `typing_pauseCount`
   - Label: `severity` (`Normal` / `Mild` / `Moderate` / `Severe`)

   (Or skip `generate_dataset.py` entirely and point `compute_scores.py` /
   `train_subscore_model.py` at your real CSV instead.)

2. Run:
   ```bash
   pip install scikit-learn pandas numpy
   python3 compute_scores.py          # derives the 4 subscores from raw features
   python3 train_subscore_model.py    # trains + exports random_forest_model.json
   ```
3. Copy the new `random_forest_model.json` over
   `src/lib/ml/random-forest-model.json`.
4. Re-check `test_accuracy` / `classification_report` printed by the script
   — with real data, also consider re-running `generate_dataset.py`'s
   grid-search step (see git history / comments) to re-tune
   `n_estimators` / `max_depth` for your real data's size and noise level.

## If you also start capturing raw sensor features (not just the 0-100 subscore)

Right now each test page (`_authenticated.bradykinesia.tsx`, etc.) only
saves the final 0-100 subscore to Supabase, not the raw signals. If you
later add columns to store the raw features too, you can train a richer
15-feature Random Forest (see the `generate_dataset.py` / `train_model.py`
comments for the 15-feature raw version) for a stronger clinical model
that isn't bottlenecked by the hand-written subscore formulas.
