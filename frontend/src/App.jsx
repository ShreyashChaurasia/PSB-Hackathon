import { useState, useCallback } from 'react';
import Navbar from './components/Navbar';
import LoginForm from './components/LoginForm';
import OTPModal from './components/OTPModal';
import Dashboard from './components/Dashboard';
import { verifyOTP, getSession } from './utils/api';

export default function App() {
  const [currentView, setCurrentView] = useState('login'); // login | otp | dashboard
  const [sessionData, setSessionData] = useState(null);
  const [riskResponse, setRiskResponse] = useState(null);
  const [enrollMsg, setEnrollMsg] = useState('');

  const goToDashboard = useCallback(async (token, username) => {
    try {
      const session = await getSession(token);
      setSessionData({
        ...session,
        username: session.username || username,
        session_token: token,
      });
      setCurrentView('dashboard');
    } catch (err) {
      // If session endpoint doesn't exist yet, build a minimal session object
      setSessionData({
        username,
        risk_score: riskResponse?.risk_score ?? 0,
        risk_level: riskResponse?.risk_level ?? 'low',
        factors: riskResponse?.factors ?? [],
        login_time: new Date().toISOString(),
        session_token: token,
      });
      setCurrentView('dashboard');
    }
  }, [riskResponse]);

  const handleLoginResult = useCallback((response) => {
    setRiskResponse(response);

    if (response.requires_mfa) {
      setCurrentView('otp');
    } else {
      goToDashboard(response.session_token || response.token, response.username);
    }
  }, [goToDashboard]);

  const handleOTPVerify = useCallback(async (otpCode) => {
    const username = riskResponse?.username;
    const result = await verifyOTP(username, otpCode);
    await goToDashboard(result.session_token || result.token, username);
  }, [riskResponse, goToDashboard]);

  const handleOTPCancel = useCallback(() => {
    setCurrentView('login');
    setRiskResponse(null);
  }, []);

  const handleLogout = useCallback(() => {
    setCurrentView('login');
    setSessionData(null);
    setRiskResponse(null);
  }, []);

  const handleEnrollSuccess = useCallback((result) => {
    setEnrollMsg('Account created successfully! You can now sign in.');
    setTimeout(() => setEnrollMsg(''), 5000);
  }, []);

  const user = currentView === 'dashboard' && sessionData
    ? { username: sessionData.username }
    : null;

  return (
    <>
      {/* Animated background */}
      <div className="app-bg" />

      {/* Content */}
      <div className="app-content">
        <Navbar user={user} onLogout={handleLogout} />

        {/* Enrollment success message */}
        {enrollMsg && currentView === 'login' && (
          <div style={successBannerStyle} className="animate-slideDown">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            {enrollMsg}
          </div>
        )}

        {/* Views */}
        {currentView === 'login' && (
          <LoginForm
            onLoginResult={handleLoginResult}
            onEnrollSuccess={handleEnrollSuccess}
          />
        )}

        {currentView === 'otp' && (
          <OTPModal
            factors={riskResponse?.factors || []}
            onVerify={handleOTPVerify}
            onCancel={handleOTPCancel}
            username={riskResponse?.username}
          />
        )}

        {currentView === 'dashboard' && sessionData && (
          <Dashboard
            sessionData={sessionData}
            onLogout={handleLogout}
          />
        )}
      </div>
    </>
  );
}

const successBannerStyle = {
  position: 'fixed',
  top: '76px',
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 150,
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '12px 24px',
  background: 'rgba(16, 185, 129, 0.1)',
  border: '1px solid rgba(16, 185, 129, 0.3)',
  borderRadius: '12px',
  backdropFilter: 'blur(20px)',
  color: '#10b981',
  fontSize: '0.9rem',
  fontWeight: 500,
  whiteSpace: 'nowrap',
};
