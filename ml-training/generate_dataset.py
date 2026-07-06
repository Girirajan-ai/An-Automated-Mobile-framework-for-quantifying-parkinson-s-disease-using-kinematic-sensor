"""
Generates a clinically-grounded SYNTHETIC training dataset for the Parkinson's
Disease Monitoring System (PDMS).

Why synthetic: the app has no real labeled patient dataset yet for the
tremor / rigidity / bradykinesia tests (only raw feature definitions in
scoring.ts). To bootstrap a real Random Forest model, we simulate patients
along a continuous "disease severity" latent variable and draw each raw
sensor/tap feature from a distribution whose center shifts with severity,
using the exact same clinically-informed feature ranges already encoded in
scoring.ts (e.g. resting tremor 4-6 Hz, ~5-6 taps/sec healthy baseline, etc).

Deliberate class overlap + per-feature noise is added so the classifier has
to learn real decision boundaries instead of memorizing a formula -- this
keeps it a genuine ML exercise, not just re-encoding the existing rules.

IMPORTANT: When you collect real patient/participant data, replace this
generator's output (dataset.csv) with your real CSV that has the same
column names, and rerun train_model.py. Nothing else needs to change.
"""

import numpy as np
import pandas as pd

RNG = np.random.default_rng(42)
N_PER_CLASS = 1500  # 6000 total samples across 4 classes

CLASSES = ["Normal", "Mild", "Moderate", "Severe"]
CLASS_INDEX = {c: i for i, c in enumerate(CLASSES)}


def sample_latent_severity(cls, n):
    """Continuous 0-1 latent severity within each class band, with soft
    boundaries (some overlap into neighboring classes) to mimic real UPDRS
    continuum rather than hard-clustered synthetic data."""
    bands = {
        "Normal": (0.00, 0.22),
        "Mild": (0.18, 0.45),
        "Moderate": (0.40, 0.70),
        "Severe": (0.65, 1.00),
    }
    lo, hi = bands[cls]
    # Beta distribution gives natural clustering with soft tails
    return RNG.uniform(lo, hi, n)


def make_bradykinesia(sev, n):
    # Healthy baseline ~5.5-6 taps/sec, degrades with severity
    tapping_speed = np.clip(RNG.normal(6.0 - 4.0 * sev, 0.5, n), 0.3, 7.5)
    reaction_time = np.clip(RNG.normal(260 + 550 * sev, 60, n), 150, 1200)
    interval_consistency = np.clip(RNG.normal(40 + 350 * sev, 40, n), 0, 500)
    missed_taps = np.clip(RNG.normal(1 + 18 * sev, 3, n), 0, 30).round()
    tap_count = np.clip(RNG.normal(160 - 60 * sev, 20, n), 40, 220).round()
    return pd.DataFrame({
        "brady_tapCount": tap_count,
        "brady_reactionTimeMs": reaction_time,
        "brady_tappingSpeed": tapping_speed,
        "brady_intervalConsistency": interval_consistency,
        "brady_missedTaps": missed_taps,
    })


def make_tremor(sev, n):
    # PD resting tremor concentrates in the 4-6 Hz band as severity rises;
    # healthy subjects show more diffuse / low-amplitude frequency content.
    freq = np.clip(RNG.normal(4.8 + RNG.normal(0, 1.0, n) * (1 - sev), 1.3, n), 0.2, 12)
    amplitude = np.clip(RNG.normal(0.15 + 1.3 * sev, 0.25, n), 0, 3.0)
    motion_var = np.clip(RNG.normal(0.1 + 0.7 * sev, 0.2, n), 0, 1.5)
    return pd.DataFrame({
        "tremor_frequencyHz": freq,
        "tremor_amplitude": amplitude,
        "tremor_motionVariability": motion_var,
    })


def make_rigidity(sev, n):
    rom = np.clip(RNG.normal(3.1 - 2.2 * sev, 0.4, n), 0.1, 3.5)
    ang_vel = np.clip(RNG.normal(2.1 - 1.6 * sev, 0.35, n), 0.05, 2.6)
    smoothness = np.clip(RNG.normal(0.9 - 0.65 * sev, 0.15, n), 0, 1)
    return pd.DataFrame({
        "rigidity_rangeOfMotion": rom,
        "rigidity_angularVelocity": ang_vel,
        "rigidity_smoothness": smoothness,
    })


def make_typing(sev, n):
    wpm = np.clip(RNG.normal(48 - 30 * sev, 8, n), 5, 70)
    error_rate = np.clip(RNG.normal(0.015 + 0.09 * sev, 0.02, n), 0, 0.35)
    interval_consistency = np.clip(RNG.normal(30 + 320 * sev, 50, n), 0, 500)
    pause_count = np.clip(RNG.normal(0.5 + 9 * sev, 2.5, n), 0, 25).round()
    return pd.DataFrame({
        "typing_wpm": wpm,
        "typing_errorRate": error_rate,
        "typing_intervalConsistency": interval_consistency,
        "typing_pauseCount": pause_count,
    })


def build():
    frames = []
    for cls in CLASSES:
        sev = sample_latent_severity(cls, N_PER_CLASS)
        df = pd.concat([
            make_bradykinesia(sev, N_PER_CLASS),
            make_tremor(sev, N_PER_CLASS),
            make_rigidity(sev, N_PER_CLASS),
            make_typing(sev, N_PER_CLASS),
        ], axis=1)
        df["latent_severity"] = sev
        df["severity"] = cls
        frames.append(df)

    data = pd.concat(frames, ignore_index=True)
    data = data.sample(frac=1.0, random_state=42).reset_index(drop=True)

    # Label-noise injection: randomly flip ~4% of labels to an adjacent class
    # to simulate real-world diagnostic ambiguity / borderline cases.
    flip_mask = RNG.random(len(data)) < 0.04
    idx = np.where(flip_mask)[0]
    for i in idx:
        cur = CLASS_INDEX[data.loc[i, "severity"]]
        neighbor = np.clip(cur + RNG.choice([-1, 1]), 0, len(CLASSES) - 1)
        data.loc[i, "severity"] = CLASSES[neighbor]

    data.drop(columns=["latent_severity"], inplace=True)
    return data


if __name__ == "__main__":
    df = build()
    df.to_csv("dataset.csv", index=False)
    print(df.shape)
    print(df["severity"].value_counts())
    print(df.head())
