"""ML-based keystroke biometric analysis engine.

Uses scikit-learn's IsolationForest to detect anomalous typing patterns once
enough baselines have been collected.  Falls back to simple threshold
comparison for users with fewer than three baselines.
"""

from __future__ import annotations

import numpy as np
from sklearn.ensemble import IsolationForest

from models import KeystrokeProfile
from user_store import get_user


# ---------------------------------------------------------------------------
# Feature extraction
# ---------------------------------------------------------------------------


def extract_features(profile: KeystrokeProfile) -> np.ndarray:
    """Convert a :class:`KeystrokeProfile` into a 1-D feature vector.

    Features (5-dimensional):
        0. mean dwell time
        1. std  dwell time
        2. mean flight time
        3. std  flight time
        4. typing speed
    """
    dwell = np.array(profile.dwell_times) if profile.dwell_times else np.array([0.0])
    flight = np.array(profile.flight_times) if profile.flight_times else np.array([0.0])

    return np.array([
        float(np.mean(dwell)),
        float(np.std(dwell)),
        float(np.mean(flight)),
        float(np.std(flight)),
        profile.typing_speed,
    ])


# ---------------------------------------------------------------------------
# Main evaluation
# ---------------------------------------------------------------------------


def evaluate_keystroke(
    username: str, profile: KeystrokeProfile
) -> tuple[float, list[str]]:
    """Score the keystroke profile against the user's baselines.

    Returns
    -------
    tuple[float, list[str]]
        A ``(score, factors)`` pair where *score* is in the range 0–25 and
        *factors* lists the anomalies detected.
    """
    user = get_user(username)
    if user is None:
        return 5.0, ["no_baseline"]

    baselines: list[dict] = user["keystroke_baselines"]

    # --- No baselines at all (brand-new user) ---
    if len(baselines) == 0:
        return 5.0, ["no_baseline"]

    # Reconstruct KeystrokeProfile objects from stored dicts
    baseline_profiles = [
        KeystrokeProfile(**b) if isinstance(b, dict) else b for b in baselines
    ]

    # --- Fewer than 3 baselines → simple threshold comparison ---
    if len(baseline_profiles) < 3:
        avg_speed = float(
            np.mean([bp.typing_speed for bp in baseline_profiles])
        )
        deviation = abs(profile.typing_speed - avg_speed) / max(avg_speed, 1e-6)
        if deviation > 0.5:
            return 20.0, ["unusual_typing_speed"]
        return 0.0, []

    # --- 3 or more baselines → IsolationForest ---
    baseline_features = np.array(
        [extract_features(bp) for bp in baseline_profiles]
    )
    new_features = extract_features(profile).reshape(1, -1)

    model = IsolationForest(
        n_estimators=100,
        contamination=0.1,
        random_state=42,
    )
    model.fit(baseline_features)

    # decision_function: large negative → more anomalous
    raw_score = model.decision_function(new_features)[0]

    # Map raw score to 0–25 range.
    # Typical decision_function values fall in roughly [-0.5, 0.5].
    # We clamp and linearly map so that -0.5 → 25 and 0.5 → 0.
    clamped = float(np.clip(raw_score, -0.5, 0.5))
    anomaly_score = (0.5 - clamped) / 1.0 * 25.0  # 0–25

    factors: list[str] = []
    if anomaly_score > 12.5:
        factors.append("keystroke_anomaly")
    if anomaly_score > 18.0:
        factors.append("unusual_typing_speed")

    return round(anomaly_score, 2), factors
