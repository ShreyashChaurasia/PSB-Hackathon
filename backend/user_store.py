"""In-memory user database for the Identity Trust Framework.

Stores credentials, keystroke baselines, known devices, and login history.
Pre-seeded with three demo accounts for hackathon demonstrations.
"""

from __future__ import annotations

from typing import Any


# ---------------------------------------------------------------------------
# Internal storage
# ---------------------------------------------------------------------------

_users: dict[str, dict[str, Any]] = {}


def _make_user_record(password: str) -> dict[str, Any]:
    """Return a fresh user record dictionary."""
    return {
        "password": password,
        "keystroke_baselines": [],       # list[KeystrokeProfile-like dicts]
        "known_devices": set(),          # set of user-agent strings
        "known_timezones": set(),        # set of IANA timezone strings
        "known_resolutions": set(),      # set of resolution strings
        "login_history": [],             # list of login event dicts
        "failed_attempts": 0,
    }


# ---------------------------------------------------------------------------
# Pre-seed demo users
# ---------------------------------------------------------------------------

for _uname, _pwd in [
    ("demo_user", "password123"),
    ("admin_user", "admin@456"),
    ("test_user", "test789"),
]:
    _users[_uname] = _make_user_record(_pwd)


# ---------------------------------------------------------------------------
# Public helpers
# ---------------------------------------------------------------------------


def get_user(username: str) -> dict[str, Any] | None:
    """Return the user record for *username*, or ``None`` if not found."""
    return _users.get(username)


def create_user(username: str, password: str) -> dict[str, Any]:
    """Create a new user and return the record.

    Raises ``ValueError`` if the username already exists.
    """
    if username in _users:
        raise ValueError(f"User '{username}' already exists")
    _users[username] = _make_user_record(password)
    return _users[username]


def add_baseline(username: str, profile: dict[str, Any]) -> None:
    """Append a keystroke profile to the user's baselines."""
    user = _users.get(username)
    if user is None:
        raise ValueError(f"User '{username}' not found")
    user["keystroke_baselines"].append(profile)


def add_known_device(
    username: str,
    user_agent: str,
    timezone: str,
    screen_resolution: str,
) -> None:
    """Record a device / environment fingerprint for the user."""
    user = _users.get(username)
    if user is None:
        raise ValueError(f"User '{username}' not found")
    user["known_devices"].add(user_agent)
    user["known_timezones"].add(timezone)
    user["known_resolutions"].add(screen_resolution)


def record_login(username: str, event: dict[str, Any]) -> None:
    """Append a login event to the user's history."""
    user = _users.get(username)
    if user is None:
        raise ValueError(f"User '{username}' not found")
    user["login_history"].append(event)


def increment_failed_attempts(username: str) -> int:
    """Increment and return the failed-attempt counter."""
    user = _users.get(username)
    if user is None:
        raise ValueError(f"User '{username}' not found")
    user["failed_attempts"] += 1
    return user["failed_attempts"]


def reset_failed_attempts(username: str) -> None:
    """Reset the failed-attempt counter to zero."""
    user = _users.get(username)
    if user is None:
        raise ValueError(f"User '{username}' not found")
    user["failed_attempts"] = 0
