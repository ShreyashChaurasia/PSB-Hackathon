import { useState, useRef, useEffect, useCallback } from 'react';

export default function OTPModal({ factors = [], onVerify, onCancel, username }) {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [status, setStatus] = useState('idle'); // idle | loading | error
  const [errorMsg, setErrorMsg] = useState('');
  const [timeLeft, setTimeLeft] = useState(120); // 2-minute countdown
  const inputRefs = useRef([]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Auto-focus first input
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleChange = useCallback((index, value) => {
    if (value.length > 1) {
      // Handle paste
      const pasted = value.replace(/\D/g, '').slice(0, 6);
      const newDigits = [...digits];
      for (let i = 0; i < 6; i++) {
        newDigits[i] = pasted[i] || '';
      }
      setDigits(newDigits);
      const focusIdx = Math.min(pasted.length, 5);
      inputRefs.current[focusIdx]?.focus();
      return;
    }

    if (!/^\d*$/.test(value)) return;

    const newDigits = [...digits];
    newDigits[index] = value;
    setDigits(newDigits);
    setStatus('idle');
    setErrorMsg('');

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }, [digits]);

  const handleKeyDown = useCallback((index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const newDigits = [...digits];
      newDigits[index - 1] = '';
      setDigits(newDigits);
    }
    if (e.key === 'Enter') {
      handleSubmit();
    }
  }, [digits]);

  const handleSubmit = async () => {
    const code = digits.join('');
    if (code.length !== 6) {
      setStatus('error');
      setErrorMsg('Please enter all 6 digits.');
      return;
    }

    setStatus('loading');
    setErrorMsg('');

    try {
      await onVerify(code);
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message || 'Verification failed. Please try again.');
    }
  };

  const factorLabels = {
    new_device: 'New Device',
    unusual_timezone: 'Unusual Location',
    screen_mismatch: 'Screen Mismatch',
    multiple_failed_attempts: 'Failed Attempts',
    first_login: 'First Login',
    unusual_typing_speed: 'Typing Anomaly',
    keystroke_anomaly: 'Keystroke Anomaly',
    no_baseline: 'No Baseline',
  };

  return (
    <div style={overlayStyle} className="animate-fadeIn">
      <div className="glass-card animate-scaleIn" style={modalStyle}>
        {/* Warning Icon */}
        <div style={warningIconWrapStyle}>
          <div style={warningIconStyle}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
        </div>

        {/* Heading */}
        <h2 style={headingStyle}>Identity Verification Required</h2>
        <p style={subheadingStyle}>
          Unusual activity detected. Please verify your identity.
        </p>

        {/* Risk Factor Badges */}
        {factors.length > 0 && (
          <div style={factorsWrapStyle}>
            {factors.map((factor, i) => (
              <span key={i} className="badge badge-yellow" style={{ fontSize: '0.7rem' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {factorLabels[factor] || factor}
              </span>
            ))}
          </div>
        )}

        {/* OTP Input Boxes */}
        <div style={otpContainerStyle}>
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (inputRefs.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              style={{
                ...otpInputStyle,
                borderColor: status === 'error'
                  ? '#fca5a5'
                  : digit
                    ? 'var(--border-dark)'
                    : 'var(--border-glass)',
                boxShadow: digit ? '0 0 0 1px var(--border-dark)' : 'none',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--border-dark)';
                e.target.style.boxShadow = '0 0 0 1px var(--border-dark)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = digit ? 'var(--border-dark)' : 'var(--border-glass)';
                e.target.style.boxShadow = digit ? '0 0 0 1px var(--border-dark)' : 'none';
              }}
            />
          ))}
        </div>

        {/* Error Message */}
        {status === 'error' && (
          <div style={errorBannerStyle} className="animate-slideDown">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Timer */}
        <div style={timerStyle}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={timeLeft < 30 ? '#ef4444' : '#94a3b8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span style={{ color: timeLeft < 30 ? '#ef4444' : '#94a3b8' }}>
            {timeLeft > 0 ? `Code expires in ${formatTime(timeLeft)}` : 'Code expired — please try again'}
          </span>
        </div>

        {/* Username info */}
        {username && (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '4px' }}>
            Verifying as <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{username}</span>
          </p>
        )}

        {/* Actions */}
        <div style={actionsStyle}>
          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={status === 'loading' || timeLeft <= 0}
            style={{ flex: 1 }}
          >
            {status === 'loading' ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span className="spinner" />
                Verifying...
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
                Verify
              </span>
            )}
          </button>
          <button className="btn-secondary" onClick={onCancel} style={{ flex: 0.6 }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── STYLES ─── */
const overlayStyle = {
  position: 'fixed',
  inset: 0,
  zIndex: 200,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(0, 0, 0, 0.2)',
  backdropFilter: 'blur(4px)',
  WebkitBackdropFilter: 'blur(4px)',
  padding: '20px',
};

const modalStyle = {
  width: '100%',
  maxWidth: '460px',
  padding: '36px 32px 28px',
  textAlign: 'center',
};

const warningIconWrapStyle = {
  display: 'flex',
  justifyContent: 'center',
  marginBottom: '20px',
};

const warningIconStyle = {
  width: '64px',
  height: '64px',
  borderRadius: '50%',
  background: 'rgba(245, 158, 11, 0.1)',
  border: '2px solid rgba(245, 158, 11, 0.3)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  animation: 'pulse 2s ease-in-out infinite',
};

const headingStyle = {
  fontSize: '1.35rem',
  fontWeight: 800,
  color: 'var(--text-primary)',
  marginBottom: '8px',
  letterSpacing: '-0.025em',
};

const subheadingStyle = {
  color: 'var(--text-secondary)',
  fontSize: '0.9rem',
  marginBottom: '20px',
  lineHeight: 1.5,
};

const factorsWrapStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px',
  justifyContent: 'center',
  marginBottom: '24px',
};

const otpContainerStyle = {
  display: 'flex',
  gap: '10px',
  justifyContent: 'center',
  marginBottom: '16px',
};

const otpInputStyle = {
  width: '50px',
  height: '58px',
  textAlign: 'center',
  fontSize: '1.4rem',
  fontWeight: 700,
  fontFamily: 'Inter, monospace',
  background: '#ffffff',
  border: '2px solid var(--border-glass)',
  borderRadius: '8px',
  color: 'var(--text-primary)',
  outline: 'none',
  transition: 'all 0.2s ease',
  caretColor: '#3b82f6',
};

const errorBannerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  padding: '10px',
  background: 'rgba(239, 68, 68, 0.1)',
  border: '1px solid rgba(239, 68, 68, 0.25)',
  borderRadius: '8px',
  color: '#ef4444',
  fontSize: '0.8rem',
  fontWeight: 500,
  marginBottom: '8px',
};

const timerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px',
  fontSize: '0.825rem',
  marginBottom: '16px',
};

const actionsStyle = {
  display: 'flex',
  gap: '12px',
  marginTop: '8px',
};
