import React from 'react';

export const Navbar = ({ showSosAlert, onOpenSidebar }) => {
  return (
    <header style={styles.header}>
      <div style={styles.logoGroup}>
        <span style={styles.logoText}>SafeStep</span>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      </div>

      {showSosAlert && (
        <div style={styles.sosNotification}>
          <div style={styles.notifCheck}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="3">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <div>
            <strong style={{ display: 'block', fontSize: '13px' }}>SOS Berhasil Dikirim!</strong>
            <span style={{ fontSize: '11px' }}>Lokasimu sudah dibagikan ke semua kontak darurat</span>
          </div>
        </div>
      )}

      <div style={styles.userProfileIcon} onClick={onOpenSidebar}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      </div>
    </header>
  );
};

const styles = {
  header: {
    backgroundColor: '#ffffff',
    height: '64px',
    padding: '0 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'sticky',
    top: 0,
    zIndex: 30,
    borderBottom: '1px solid #f1f5f9',
  },
  logoGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  logoText: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#1e293b',
  },
  userProfileIcon: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    backgroundColor: '#f8fafc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    border: '1px solid #e2e8f0',
  },
  sosNotification: {
    position: 'absolute',
    left: '50%',
    top: '10px',
    transform: 'translateX(-50%)',
    backgroundColor: '#10b981',
    color: '#ffffff',
    padding: '8px 18px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
    zIndex: 100,
  },
  notifCheck: {
    backgroundColor: '#ffffff',
    borderRadius: '50%',
    width: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};