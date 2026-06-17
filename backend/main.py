"""FastAPI application for the Identity Trust Framework.

Endpoints
---------
POST /api/login       – Authenticate and run adaptive risk assessment.
POST /api/verify-otp  – Complete second-factor OTP verification.
GET  /api/session/{token} – Retrieve active session details.
POST /api/enroll      – Register a new user with initial biometrics.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from models import (
    EnrollRequest,
    LoginRequest,
    OTPVerifyRequest,
    RiskResponse,
    SessionResponse,
)
from user_store import (
    add_baseline,
    add_known_device,
    create_user,
    get_user,
    increment_failed_attempts,
    record_login,
    reset_failed_attempts,
)
from otp_service import generate_otp, verify_otp
from risk_engine import evaluate_context
from biometric_engine import evaluate_keystroke

# ---------------------------------------------------------------------------
# App & middleware
# ---------------------------------------------------------------------------

app = FastAPI(
    title="Identity Trust Framework",
    version="1.0.0",
    description="Adaptive identity verification with behavioural biometrics",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# In-memory session store
# ---------------------------------------------------------------------------

_sessions: dict[str, dict[str, Any]] = {}


def _create_session(
    username: str,
    risk_score: float,
    risk_level: str,
    factors: list[str],
) -> str:
    """Create a session and return its token."""
    token = str(uuid.uuid4())
    _sessions[token] = {
        "username": username,
        "risk_score": risk_score,
        "risk_level": risk_level,
        "factors": factors,
        "login_time": datetime.now(timezone.utc).isoformat(),
    }
    return token


# Temporary store for pending MFA sessions so we can issue a token after OTP
_pending_mfa: dict[str, dict[str, Any]] = {}


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------


@app.get("/")
async def root() -> dict[str, str]:
    """Health-check / welcome endpoint."""
    return {
        "service": "Identity Trust Framework API",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.post("/api/login", response_model=RiskResponse)
async def login(req: LoginRequest) -> RiskResponse:
    """Authenticate credentials and perform adaptive risk assessment."""

    # --- Credential check ---
    user = get_user(req.username)
    if user is None or user["password"] != req.password:
        # Increment failed attempts if user exists
        if user is not None:
            increment_failed_attempts(req.username)
        raise HTTPException(status_code=401, detail="Invalid username or password")

    # --- Risk evaluation ---
    context_score, context_factors = evaluate_context(req.username, req.context)
    bio_score, bio_factors = evaluate_keystroke(req.username, req.keystroke_profile)

    total_score = min(context_score + bio_score, 100.0)
    all_factors = context_factors + bio_factors

    # Determine risk level
    if total_score <= 30:
        risk_level = "low"
    elif total_score <= 60:
        risk_level = "medium"
    else:
        risk_level = "high"

    # --- Update user baselines & known devices ---
    add_baseline(req.username, req.keystroke_profile.model_dump())
    add_known_device(
        req.username,
        req.context.user_agent,
        req.context.timezone,
        req.context.screen_resolution,
    )
    reset_failed_attempts(req.username)

    # --- Record login event ---
    record_login(req.username, {
        "time": datetime.now(timezone.utc).isoformat(),
        "risk_score": total_score,
        "risk_level": risk_level,
        "factors": all_factors,
    })

    # --- High risk → require MFA ---
    if risk_level == "high":
        otp_code = generate_otp(req.username)  # noqa: F841  (printed to console)
        _pending_mfa[req.username] = {
            "risk_score": total_score,
            "risk_level": risk_level,
            "factors": all_factors,
        }
        return RiskResponse(
            risk_score=total_score,
            risk_level=risk_level,
            factors=all_factors,
            requires_mfa=True,
            session_token=None,
            otp_sent=True,
        )

    # --- Low / medium risk → issue session token ---
    token = _create_session(req.username, total_score, risk_level, all_factors)
    return RiskResponse(
        risk_score=total_score,
        risk_level=risk_level,
        factors=all_factors,
        requires_mfa=False,
        session_token=token,
        otp_sent=False,
    )


@app.post("/api/verify-otp")
async def verify_otp_endpoint(req: OTPVerifyRequest) -> dict[str, Any]:
    """Verify the OTP and issue a session token on success."""

    if not verify_otp(req.username, req.otp_code):
        raise HTTPException(status_code=401, detail="Invalid or expired OTP")

    pending = _pending_mfa.pop(req.username, None)
    if pending is None:
        raise HTTPException(status_code=400, detail="No pending MFA session")

    token = _create_session(
        req.username,
        pending["risk_score"],
        pending["risk_level"],
        pending["factors"],
    )

    return {
        "message": "OTP verified successfully",
        "session_token": token,
        "risk_score": pending["risk_score"],
        "risk_level": pending["risk_level"],
    }


@app.get("/api/session/{token}", response_model=SessionResponse)
async def get_session(token: str) -> SessionResponse:
    """Return details about an active session."""

    session = _sessions.get(token)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")

    return SessionResponse(**session)


@app.post("/api/enroll")
async def enroll(req: EnrollRequest) -> dict[str, str]:
    """Register a new user with initial keystroke baseline and context."""

    if get_user(req.username) is not None:
        raise HTTPException(status_code=409, detail="Username already exists")

    create_user(req.username, req.password)
    add_baseline(req.username, req.keystroke_profile.model_dump())
    add_known_device(
        req.username,
        req.context.user_agent,
        req.context.timezone,
        req.context.screen_resolution,
    )

    return {"message": f"User '{req.username}' enrolled successfully"}
