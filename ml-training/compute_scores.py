"""
Reimplements src/lib/scoring.ts's four rule-based subscore formulas in Python,
so we can derive (bradykinesiaScore, tremorScore, rigidityScore, typingScore)
from the raw synthetic features -- these 4 subscores are exactly what your
app already computes client-side and stores in Supabase per test.

This keeps dataset.csv's severity labels (grounded in the latent-severity
simulation) but changes the MODEL INPUT to match what results.tsx actually
has available: 4 subscores, not 15 raw signals.
"""

import numpy as np
import pandas as pd


def clamp01(x):
    return np.clip(x, 0, 1)


def brady_score(df):
    speed_deficit = clamp01((6 - df["brady_tappingSpeed"]) / 5) * 40
    rt_deficit = clamp01((df["brady_reactionTimeMs"] - 250) / 600) * 25
    var_deficit = clamp01(df["brady_intervalConsistency"] / 400) * 20
    miss_deficit = clamp01(df["brady_missedTaps"] / 20) * 15
    return (speed_deficit + rt_deficit + var_deficit + miss_deficit).round()


def tremor_score(df):
    in_band = np.where(
        (df["tremor_frequencyHz"] >= 3.5) & (df["tremor_frequencyHz"] <= 7.5), 1.0, 0.3
    )
    amp_def = clamp01(df["tremor_amplitude"] / 1.5) * 60 * in_band
    var_def = clamp01(df["tremor_motionVariability"] / 1.0) * 40
    return np.minimum(100, amp_def + var_def).round()


def rigidity_score(df):
    rom_def = clamp01((3.0 - df["rigidity_rangeOfMotion"]) / 3.0) * 45
    vel_def = clamp01((2.0 - df["rigidity_angularVelocity"]) / 2.0) * 25
    smooth_def = clamp01(1 - df["rigidity_smoothness"]) * 30
    return (rom_def + vel_def + smooth_def).round()


def typing_score(df):
    speed_def = clamp01((45 - df["typing_wpm"]) / 40) * 35
    error_def = clamp01(df["typing_errorRate"] / 0.08) * 25
    var_def = clamp01(df["typing_intervalConsistency"] / 300) * 25
    pause_def = clamp01(df["typing_pauseCount"] / 8) * 15
    return np.minimum(100, speed_def + error_def + var_def + pause_def).round()


if __name__ == "__main__":
    df = pd.read_csv("dataset.csv")
    out = pd.DataFrame({
        "bradykinesiaScore": brady_score(df),
        "tremorScore": tremor_score(df),
        "rigidityScore": rigidity_score(df),
        "typingScore": typing_score(df),
        "severity": df["severity"],
    })
    out.to_csv("dataset_subscores.csv", index=False)
    print(out.shape)
    print(out.head(10))
    print(out.groupby("severity").mean(numeric_only=True))
