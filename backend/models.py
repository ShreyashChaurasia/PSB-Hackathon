"""Pydantic schemas for the Identity Trust Framework API."""

from __future__ import annotations

from pydantic import BaseModel, Field


class KeystrokeProfile(BaseModel):
    """Biometric keystroke-dynamics profile captured during typing."""

    dwell_times: list[float] = Field(
        ..., description="Key-press durations in milliseconds"
    )
    flight_times: list[float] = Field(
        ..., description="Inter-key intervals in milliseconds"
    )
    typing_speed: float = Field(
        ..., description="Overall typing speed in characters per second"
    )


class ContextData(BaseModel):
    """Environmental context captured from the client."""

    user_agent: str = Field(..., description="Browser / device user-agent string")
    timezone: str = Field(..., description="IANA timezone, e.g. 'Asia/Kolkata'")
    screen_resolution: str = Field(
        ..., description="Screen resolution, e.g. '1920x1080'"
    )


class LoginRequest(BaseModel):
    """Payload sent by the client when the user attempts to log in."""

    username: str
    password: str
    keystroke_profile: KeystrokeProfile
    context: ContextData


class EnrollRequest(BaseModel):
    """Payload sent by the client to register a new user."""

    username: str
    password: str
    keystroke_profile: KeystrokeProfile
    context: ContextData


class OTPVerifyRequest(BaseModel):
    """Payload for second-factor OTP verification."""

    username: str
    otp_code: str


class RiskResponse(BaseModel):
    """Response returned after risk evaluation on login."""

    risk_score: float = Field(..., ge=0, le=100, description="Composite risk score")
    risk_level: str = Field(
        ..., description="Risk bucket: 'low', 'medium', or 'high'"
    )
    factors: list[str] = Field(
        default_factory=list, description="Risk factors that contributed to the score"
    )
    requires_mfa: bool = Field(
        False, description="Whether multi-factor authentication is required"
    )
    session_token: str | None = Field(
        None, description="Session token (None when MFA is pending)"
    )
    otp_sent: bool = Field(
        False, description="Whether an OTP was dispatched to the user"
    )


class SessionResponse(BaseModel):
    """Details about an active session."""

    username: str
    risk_score: float
    risk_level: str
    factors: list[str]
    login_time: str
