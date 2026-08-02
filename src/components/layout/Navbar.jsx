import React from 'react';

export const Navbar = ({ showSosAlert, onOpenSidebar }) => {
  return (
    <header style={styles.header}>
      {/* Logo Group */}
      <div style={styles.logoGroup}>
        <span style={styles.logoText}>SafeStep</span>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#a00047">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      </div>

      {/* Pop-up Alert SOS */}
      {showSosAlert && (
        <div style={styles.sosNotification}>
          <div style={styles.notifCheck}>✓</div>
          <div>
            <strong style={{ display: 'block', fontSize: '13px' }}>SOS Berhasil Dikirim!</strong>
            <span style={{ fontSize: '11px' }}>Lokasimu sudah dibagikan ke semua kontak darurat</span>
          </div>
        </div>
      )}

      {/* Profile Icon / Sidebar Toggle */}
      <div style={styles.userProfileIcon} onClick={onOpenSidebar}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="#a00047">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
      </div>
    </header>
  );
};

const styles = {
  header: {
    backgroundColor: '#f3a4c8',
    height: '64px',
    padding: '0 32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
  },
  logoGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#ffffff',
    padding: '6px 16px',
    borderRadius: '12px',
    border: '2px dashed #f3a4c8',
  },
  logoText: {
    fontSize: '22px',
    fontWeight: '900',
    color: '#a00047',
    letterSpacing: '-0.5px',
  },
  userProfileIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    border: '2px dashed #f3a4c8',
    boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
  },
  sosNotification: {
    position: 'absolute',
    left: '50%',
    top: '10px',
    transform: 'translateX(-50%)',
    backgroundColor: '#34d399',
    color: '#ffffff',
    padding: '8px 18px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
    zIndex: 100,
  },
  notifCheck: {
    backgroundColor: '#ffffff',
    color: '#059669',
    borderRadius: '50%',
    width: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '12px',
  },
};