import React from 'react';

export const Sidebar = ({ activeTab, onSelectMenu, isOpen, onClose }) => {
  const menuItems = [
    { name: 'Beranda', iconColor: '#6366f1', path: '/' },
    { name: 'Safe Route', iconColor: '#10b981', path: '/safe-route' },
    { name: 'Laporkan Insiden', iconColor: '#ef4444', path: '/report' },
    { name: 'Live Guardian', iconColor: '#f59e0b', path: '/guardian' },
    { name: 'Riwayat', iconColor: '#8b5cf6', path: '/history' },
  ];

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            zIndex: 40,
          }}
        />
      )}

      <aside
        style={{
          ...styles.sidebar,
          transform: isOpen ? 'translateX(0)' : undefined,
        }}
      >
        <div style={styles.brand}>
          <div style={styles.brandBadge}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <div>
            <h2 style={styles.brandTitle}>SafeStep</h2>
            <p style={styles.brandSubtitle}>Your Safety Companion</p>
          </div>
        </div>

        <nav style={styles.navList}>
          {menuItems.map((item) => {
            const isActive = activeTab === item.name;
            return (
              <button
                key={item.name}
                onClick={() => {
                  onSelectMenu(item.name, item.path);
                  onClose();
                }}
                style={{
                  ...styles.navItem,
                  backgroundColor: isActive ? '#6366f1' : 'transparent',
                  color: isActive ? '#ffffff' : '#475569',
                  fontWeight: isActive ? '600' : '400',
                }}
              >
                <span style={{ ...styles.iconDot, backgroundColor: isActive ? '#ffffff' : item.iconColor }} />
                {item.name}
              </button>
            );
          })}
        </nav>

        <div style={styles.bottomSection}>
          <button onClick={() => alert('Halaman Bantuan')} style={{ ...styles.navItem, color: '#475569' }}>
            <span style={{ ...styles.iconDot, backgroundColor: '#64748b' }} />
            Bantuan
          </button>
          <button onClick={() => alert('Keluar dari aplikasi')} style={{ ...styles.navItem, color: '#e11d48' }}>
            <span style={{ ...styles.iconDot, backgroundColor: '#e11d48' }} />
            Keluar
          </button>
        </div>
      </aside>
    </>
  );
};

const styles = {
  sidebar: {
    width: '260px',
    backgroundColor: '#ffffff',
    borderRight: '1px solid #f1f5f9',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 16px',
    height: '100vh',
    position: 'sticky',
    top: 0,
    boxSizing: 'border-box',
    zIndex: 50,
    transition: 'transform 0.3s ease',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '32px',
    paddingLeft: '8px',
  },
  brandBadge: {
    backgroundColor: '#eef2ff',
    padding: '8px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0,
  },
  brandSubtitle: {
    fontSize: '11px',
    color: '#94a3b8',
    margin: 0,
  },
  navList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flex: 1,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '10px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    textAlign: 'left',
    width: '100%',
    transition: 'all 0.2s ease',
  },
  iconDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    display: 'inline-block',
  },
  bottomSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    borderTop: '1px solid #f1f5f9',
    paddingTop: '16px',
  },
};