import { useMemo } from 'react';

const styles = {
  nav: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    background: '#ffffff',
    borderBottom: '1px solid var(--border-glass)',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 24px',
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    textDecoration: 'none',
  },
  iconWrap: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    background: 'var(--text-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    fontSize: '1.25rem',
    fontWeight: 800,
    color: 'var(--text-primary)',
    letterSpacing: '-0.025em',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'var(--text-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.85rem',
    fontWeight: 600,
    color: 'white',
  },
  userName: {
    fontSize: '0.9rem',
    fontWeight: 500,
    color: 'var(--text-primary)',
  },
  logoutBtn: {
    padding: '8px 16px',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.25)',
    borderRadius: '8px',
    color: '#ef4444',
    fontSize: '0.825rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: 'Inter, sans-serif',
  },
};

export default function Navbar({ user, onLogout }) {
  const initials = useMemo(() => {
    if (!user?.username) return '';
    return user.username.slice(0, 2).toUpperCase();
  }, [user]);

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        {/* Brand */}
        <div style={styles.brand}>
          <div style={styles.iconWrap}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          </div>
          <span style={styles.appName}>TrustShield</span>
        </div>

        {/* Right side */}
        {user && (
          <div style={styles.right} className="animate-fadeIn">
            <div style={styles.avatar}>{initials}</div>
            <span style={styles.userName}>{user.username}</span>
            <button
              style={styles.logoutBtn}
              onClick={onLogout}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(239, 68, 68, 0.2)';
                e.target.style.borderColor = 'rgba(239, 68, 68, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(239, 68, 68, 0.1)';
                e.target.style.borderColor = 'rgba(239, 68, 68, 0.25)';
              }}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
