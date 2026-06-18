"""Rule-based contextual risk scoring engine.

Evaluates environmental signals (device, timezone, screen, failed attempts)
against the user's history and returns a composite score (0–75) together with
the list of risk factors that fired.
"""

from __future__ import annotations

from models import ContextData
from user_store import get_user


def evaluate_context(username: str, context: ContextData) -> tuple[float, list[str]]:
    """Score the login context for *username*.

    Returns
    -------
    tuple[float, list[str]]
        A ``(score, factors)`` pair where *score* is in the range 0–75 and
        *factors* lists every rule that contributed to the score.
    """
    score: float = 0.0
    factors: list[str] = []

    user = get_user(username)
    if user is None:
        # Unknown user – caller should have validated first; treat as max risk
        return 75.0, ["unknown_user"]

    # ----- Check for First Login (No Baselines) -----
    if not user["known_devices"]:
        return 5.0, ["first_login"]

    # ----- Rule 1: New device (user-agent not previously seen) -----
    if context.user_agent not in user["known_devices"]:
        score += 25
        factors.append("new_device")

    # ----- Rule 2: Unusual timezone -----
    if context.timezone not in user["known_timezones"]:
        score += 20
        factors.append("unusual_timezone")

    # ----- Rule 3: Screen resolution mismatch -----
    if context.screen_resolution not in user["known_resolutions"]:
        score += 10
        factors.append("screen_mismatch")

    # ----- Rule 4: Multiple recent failed attempts -----
    if user["failed_attempts"] > 2:
        score += 15
        factors.append("multiple_failed_attempts")

    # Cap the contextual score at 75
    score = min(score, 75.0)

    return score, factors
