import { useState, useMemo } from 'react';
import useKeystrokeDynamics from '../hooks/useKeystrokeDynamics';
import { loginUser, enrollUser } from '../utils/api';

export default function LoginForm({ onLoginResult, onEnrollSuccess }) {
  const [isEnrollMode, setIsEnrollMode] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | loading | error
  const [errorMsg, setErrorMsg] = useState('');

  const { attachListeners, getKeystrokeProfile, reset } = useKeystrokeDynamics();
  const keystrokeHandlers = useMemo(() => attachListeners(), [attachListeners]);

  const gatherContext = () => ({
    user_agent: navigator.userAgent,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    screen_resolution: `${screen.width}x${screen.height}`,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setStatus('error');
      setErrorMsg('Please fill in all fields.');
      return;
    }

    setStatus('loading');
    setErrorMsg('');

    try {
      const keystrokeProfile = getKeystrokeProfile();
      const contextData = gatherContext();

      if (isEnrollMode) {
        const result = await enrollUser(username, password, keystrokeProfile, contextData);
        setStatus('idle');
        reset();
        if (onEnrollSuccess) onEnrollSuccess(result);
        setIsEnrollMode(false);
        setUsername('');
        setPassword('');
      } else {
        const result = await loginUser(username, password, keystrokeProfile, contextData);
        setStatus('idle');
        reset();
        if (onLoginResult) onLoginResult({ ...result, username });
      }
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
    }
  };

  const toggleMode = () => {
    setIsEnrollMode(!isEnrollMode);
    setStatus('idle');
    setErrorMsg('');
    setUsername('');
    setPassword('');
    reset();
  };

  return (
    <div style={containerStyle}>
      <div className="glass-card animate-scaleIn" style={cardStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <div style={logoContainerStyle}>
            <div style={logoStyle}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            </div>
          </div>
          <h1 style={titleStyle}>
            {isEnrollMode ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p style={subtitleStyle}>
            {isEnrollMode
              ? 'Set up your identity with biometric profiling'
              : 'Continuous Authentication Platform'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={formStyle}>
          {/* Username Field */}
          <div style={fieldWrapStyle}>
            <div style={iconWrapStyle}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <input
              type="text"
              className="input-field"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </div>

          {/* Password Field */}
          <div style={fieldWrapStyle}>
            <div style={iconWrapStyle}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              className="input-field"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isEnrollMode ? 'new-password' : 'current-password'}
              {...keystrokeHandlers}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={eyeBtnStyle}
              tabIndex={-1}
            >
              {showPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                  <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>

          {/* Error Message */}
          {status === 'error' && (
            <div style={errorStyle} className="animate-slideDown">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Submit Button */}
          <button type="submit" className="btn-primary" disabled={status === 'loading'}>
            {status === 'loading' ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <span className="spinner" />
                {isEnrollMode ? 'Creating Account...' : 'Signing In...'}
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                {isEnrollMode ? (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="8.5" cy="7" r="4" />
                      <line x1="20" y1="8" x2="20" y2="14" />
                      <line x1="23" y1="11" x2="17" y2="11" />
                    </svg>
                    Enroll &amp; Create Account
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                      <polyline points="10 17 15 12 10 7" />
                      <line x1="15" y1="12" x2="3" y2="12" />
                    </svg>
                    Sign In
                  </>
                )}
              </span>
            )}
          </button>
        </form>

        {/* Biometric Info Badge */}
        <div style={infoBadgeStyle} className="animate-fadeIn delay-3">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span>Your typing pattern is being analyzed for security</span>
        </div>

        {/* Mode Toggle */}
        <div style={toggleStyle}>
          <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
            {isEnrollMode ? 'Already have an account?' : 'New user?'}
          </span>
          <button onClick={toggleMode} style={linkBtnStyle}>
            {isEnrollMode ? 'Sign in here' : 'Enroll here'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── STYLES ─── */
const containerStyle = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '80px 20px 40px',
};

const cardStyle = {
  width: '100%',
  maxWidth: '440px',
  padding: '40px 36px 32px',
};

const headerStyle = {
  textAlign: 'center',
  marginBottom: '32px',
};

const logoContainerStyle = {
  display: 'flex',
  justifyContent: 'center',
  marginBottom: '20px',
};

const logoStyle = {
  width: '56px',
  height: '56px',
  borderRadius: '16px',
  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 0 30px rgba(59, 130, 246, 0.3)',
};

const titleStyle = {
  fontSize: '1.75rem',
  fontWeight: 700,
  background: 'linear-gradient(135deg, #f1f5f9, #94a3b8)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  marginBottom: '8px',
  letterSpacing: '-0.025em',
};

const subtitleStyle = {
  color: '#94a3b8',
  fontSize: '0.925rem',
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
};

const fieldWrapStyle = {
  position: 'relative',
};

const iconWrapStyle = {
  position: 'absolute',
  left: '14px',
  top: '50%',
  transform: 'translateY(-50%)',
  zIndex: 1,
  pointerEvents: 'none',
};

const eyeBtnStyle = {
  position: 'absolute',
  right: '12px',
  top: '50%',
  transform: 'translateY(-50%)',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '4px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const errorStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '12px 14px',
  background: 'rgba(239, 68, 68, 0.1)',
  border: '1px solid rgba(239, 68, 68, 0.25)',
  borderRadius: '10px',
  color: '#ef4444',
  fontSize: '0.85rem',
  fontWeight: 500,
};

const infoBadgeStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  marginTop: '20px',
  padding: '10px 16px',
  background: 'rgba(59, 130, 246, 0.08)',
  border: '1px solid rgba(59, 130, 246, 0.15)',
  borderRadius: '10px',
  color: '#94a3b8',
  fontSize: '0.8rem',
};

const toggleStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px',
  marginTop: '16px',
};

const linkBtnStyle = {
  background: 'none',
  border: 'none',
  color: '#3b82f6',
  fontSize: '0.875rem',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'Inter, sans-serif',
  textDecoration: 'none',
  transition: 'color 0.2s',
};
