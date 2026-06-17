"""OTP generation and verification service.

Generates random 6-digit one-time passwords, stores them in memory with a
two-minute TTL, and provides verification that automatically expires the code.
The OTP is also printed to the console so the presenter can read it during a
live demo.
"""

from __future__ import annotations

import random
import time

# ---------------------------------------------------------------------------
# Internal storage  –  { username: (otp_code, created_timestamp) }
# ---------------------------------------------------------------------------

_otp_store: dict[str, tuple[str, float]] = {}

_OTP_TTL_SECONDS: int = 120  # 2 minutes


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------


def generate_otp(username: str) -> str:
    """Generate a 6-digit OTP for *username*, store it, and return the code.

    Any previously stored OTP for this user is overwritten.
    """
    code = f"{random.randint(0, 999_999):06d}"
    _otp_store[username] = (code, time.time())

    # Print to console so the demo presenter can see the code
    print(f"\n{'='*50}")
    print(f"  OTP for '{username}': {code}")
    print(f"  Expires in {_OTP_TTL_SECONDS} seconds")
    print(f"{'='*50}\n")

    return code


def verify_otp(username: str, code: str) -> bool:
    """Verify *code* against the stored OTP for *username*.

    Returns ``True`` if the code matches and has not expired.  The OTP is
    consumed (deleted) regardless of the outcome to prevent replay.
    """
    entry = _otp_store.pop(username, None)

    if entry is None:
        return False

    stored_code, created_at = entry

    # Check expiry
    if time.time() - created_at > _OTP_TTL_SECONDS:
        return False

    return stored_code == code
