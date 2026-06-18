import RiskMeter from './RiskMeter';

const FACTOR_META = {
  new_device: {
    label: 'New Device Detected',
    desc: 'Login from an unrecognized device',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    color: '#f59e0b',
  },
  unusual_timezone: {
    label: 'Unusual Location',
    desc: 'Timezone differs from your baseline',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
    color: '#ef4444',
  },
  screen_mismatch: {
    label: 'Screen Mismatch',
    desc: 'Display resolution not seen before',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    color: '#8b5cf6',
  },
  multiple_failed_attempts: {
    label: 'Failed Attempts',
    desc: 'Multiple recent failed login attempts',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    color: '#ef4444',
  },
  first_login: {
    label: 'First Login',
    desc: 'Building your behavioral baseline',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    color: '#3b82f6',
  },
  unusual_typing_speed: {
    label: 'Typing Anomaly',
    desc: 'Typing speed deviates from your pattern',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    color: '#f59e0b',
  },
  keystroke_anomaly: {
    label: 'Keystroke Anomaly',
    desc: "Keystroke pattern doesn't match your baseline",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h.01M12 12h.01M16 12h.01M7 16h10" />
      </svg>
    ),
    color: '#8b5cf6',
  },
  no_baseline: {
    label: 'No Baseline',
    desc: 'Behavioral profile is being established',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
    color: '#94a3b8',
  },
};

const HOW_IT_WORKS = [
  {
    title: 'Context Analysis',
    desc: 'Device fingerprint, timezone, screen resolution, and browser metadata are collected to build a contextual profile.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="url(#grad1)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <defs><linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#3b82f6" /><stop offset="100%" stopColor="#8b5cf6" /></linearGradient></defs>
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
    color: '#3b82f6',
  },
  {
    title: 'Biometric Verification',
    desc: 'Keystroke dynamics — dwell times, flight times, and typing speed — create a unique behavioral fingerprint.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="url(#grad2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <defs><linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#8b5cf6" /><stop offset="100%" stopColor="#ec4899" /></linearGradient></defs>
        <path d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 0 0 8 11a4 4 0 1 1 8 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0 0 15.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 0 0 8 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
      </svg>
    ),
    color: '#8b5cf6',
  },
  {
    title: 'Adaptive MFA',
    desc: 'Risk scores trigger step-up authentication only when anomalies are detected — seamless for trusted behavior.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="url(#grad3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <defs><linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#10b981" /><stop offset="100%" stopColor="#3b82f6" /></linearGradient></defs>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
    color: '#10b981',
  },
];

export default function Dashboard({ sessionData, onLogout }) {
  const {
    username = 'User',
    risk_score = 0,
    risk_level = 'low',
    factors = [],
    login_time,
    session_token,
  } = sessionData || {};

  const formattedTime = login_time
    ? new Date(login_time).toLocaleString()
    : new Date().toLocaleString();

  const truncatedToken = session_token
    ? `${session_token.slice(0, 8)}...${session_token.slice(-8)}`
    : '—';

  return (
    <div style={wrapperStyle}>
      {/* Welcome Section */}
      <div className="animate-slideUp" style={welcomeSectionStyle}>
        <div style={welcomeTextStyle}>
          <h1 style={welcomeHeadingStyle}>
            Welcome back, <span className="gradient-text">{username}</span>
          </h1>
          <p style={welcomeSubStyle}>
            Your session is active and being continuously monitored for security.
          </p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
            <span className={`badge ${risk_level === 'low' ? 'badge-green' : risk_level === 'medium' ? 'badge-yellow' : 'badge-red'}`}>
              {risk_level?.toUpperCase()} RISK
            </span>
            <span className="badge badge-blue">
              {factors.length} Factor{factors.length !== 1 ? 's' : ''} Detected
            </span>
          </div>
        </div>
        <div className="glass-card" style={meterCardStyle}>
          <p style={meterLabelStyle}>Session Risk Score</p>
          <RiskMeter score={risk_score} level={`${risk_level?.toUpperCase() || 'LOW'} RISK`} />
        </div>
      </div>

      {/* Risk Factors */}
      {factors.length > 0 && (
        <div className="animate-slideUp delay-1" style={sectionStyle}>
          <h2 style={sectionHeadingStyle}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            Detected Risk Factors
          </h2>
          <div style={factorsGridStyle}>
            {factors.map((factor, i) => {
              const meta = FACTOR_META[factor] || {
                label: factor,
                desc: 'Unknown risk factor',
                icon: null,
                color: '#94a3b8',
              };
              return (
                <div
                  key={i}
                  className="glass-card"
                  style={{
                    ...factorCardStyle,
                    animationDelay: `${i * 0.1}s`,
                    borderLeft: `3px solid ${meta.color}`,
                  }}
                >
                  <div style={{ ...factorIconStyle, color: meta.color, background: `${meta.color}15` }}>
                    {meta.icon}
                  </div>
                  <div>
                    <h3 style={{ ...factorNameStyle, color: meta.color }}>{meta.label}</h3>
                    <p style={factorDescStyle}>{meta.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Session Info */}
      <div className="animate-slideUp delay-2" style={sectionStyle}>
        <h2 style={sectionHeadingStyle}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          Session Information
        </h2>
        <div className="glass-card" style={sessionCardStyle}>
          <div style={sessionGridStyle}>
            <div style={sessionItemStyle}>
              <span style={sessionLabelStyle}>Login Time</span>
              <span style={sessionValueStyle}>{formattedTime}</span>
            </div>
            <div style={sessionItemStyle}>
              <span style={sessionLabelStyle}>Session Token</span>
              <span style={{ ...sessionValueStyle, fontFamily: 'monospace', fontSize: '0.8rem' }}>
                {truncatedToken}
              </span>
            </div>
            <div style={sessionItemStyle}>
              <span style={sessionLabelStyle}>Risk Score</span>
              <span style={{
                ...sessionValueStyle,
                color: risk_score <= 30 ? '#10b981' : risk_score <= 60 ? '#f59e0b' : '#ef4444',
                fontWeight: 700,
              }}>
                {risk_score}/100
              </span>
            </div>
            <div style={sessionItemStyle}>
              <span style={sessionLabelStyle}>Status</span>
              <span style={{ ...sessionValueStyle, color: '#10b981' }}>
                ● Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="animate-slideUp delay-3" style={sectionStyle}>
        <h2 style={sectionHeadingStyle}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          How It Works
        </h2>
        <div style={howItWorksGridStyle}>
          {HOW_IT_WORKS.map((item, i) => (
            <div key={i} className="glass-card" style={howCardStyle}>
              <div style={{ ...howIconWrapStyle, boxShadow: `0 0 20px ${item.color}20` }}>
                {item.icon}
              </div>
              <h3 style={howTitleStyle}>{item.title}</h3>
              <p style={howDescStyle}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── STYLES ─── */
const wrapperStyle = {
  maxWidth: '1100px',
  margin: '0 auto',
  padding: '88px 24px 48px',
};

const welcomeSectionStyle = {
  display: 'flex',
  gap: '32px',
  alignItems: 'center',
  marginBottom: '40px',
  flexWrap: 'wrap',
};

const welcomeTextStyle = {
  flex: 1,
  minWidth: '280px',
};

const welcomeHeadingStyle = {
  fontSize: '2rem',
  fontWeight: 800,
  color: 'var(--text-primary)',
  letterSpacing: '-0.03em',
  lineHeight: 1.2,
  marginBottom: '8px',
};

const welcomeSubStyle = {
  color: 'var(--text-secondary)',
  fontSize: '1rem',
  lineHeight: 1.6,
};

const meterCardStyle = {
  padding: '24px',
  minWidth: '280px',
  textAlign: 'center',
};

const meterLabelStyle = {
  fontSize: '0.8rem',
  fontWeight: 600,
  color: 'var(--text-secondary)',
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  marginBottom: '4px',
};

const sectionStyle = {
  marginBottom: '36px',
};

const sectionHeadingStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  fontSize: '1.15rem',
  fontWeight: 800,
  color: 'var(--text-primary)',
  marginBottom: '16px',
  letterSpacing: '-0.02em',
};

const factorsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  gap: '12px',
};

const factorCardStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '14px',
  padding: '16px 18px',
  borderRadius: '12px',
};

const factorIconStyle = {
  width: '40px',
  height: '40px',
  borderRadius: '10px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

const factorNameStyle = {
  fontSize: '0.9rem',
  fontWeight: 600,
  marginBottom: '2px',
};

const factorDescStyle = {
  fontSize: '0.8rem',
  color: 'var(--text-secondary)',
  lineHeight: 1.4,
};

const sessionCardStyle = {
  padding: '24px',
};

const sessionGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
  gap: '20px',
};

const sessionItemStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
};

const sessionLabelStyle = {
  fontSize: '0.75rem',
  fontWeight: 600,
  color: 'var(--text-secondary)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const sessionValueStyle = {
  fontSize: '0.95rem',
  fontWeight: 500,
  color: 'var(--text-primary)',
};

const howItWorksGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  gap: '16px',
};

const howCardStyle = {
  padding: '28px 24px',
  textAlign: 'center',
  borderRadius: '16px',
};

const howIconWrapStyle = {
  width: '56px',
  height: '56px',
  borderRadius: '14px',
  background: '#f4f4f5',
  border: '1px solid #e4e4e7',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 16px',
};

const howTitleStyle = {
  fontSize: '1rem',
  fontWeight: 800,
  color: 'var(--text-primary)',
  marginBottom: '8px',
  letterSpacing: '-0.015em',
};

const howDescStyle = {
  fontSize: '0.85rem',
  color: 'var(--text-secondary)',
  lineHeight: 1.6,
};
