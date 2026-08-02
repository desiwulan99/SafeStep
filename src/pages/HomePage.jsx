import React, { useState } from 'react';
import { SosButton } from '../features/sos-emergency/components/SosButton';
import { MapSection } from '../components/home/MapSection';
import { ReportBanner } from '../components/home/ReportBanner';
import { LiveGuardianCard } from '../components/home/LiveGuardianCard';

export const HomePage = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState('Beranda');
  const [showSosAlert, setShowSosAlert] = useState(false);

  const menuItems = [
  { 
    name: 'Beranda', 
    path: '/',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8h5z"/>
      </svg>
    )
  },
  { 
    name: 'Peta Aman', 
    path: '/safe-route',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"/>
      </svg>
    )
  },
  { 
    name: 'Live Guardian', 
    path: '/guardian',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
      </svg>
    )
  },
  { 
    name: 'Lapor', 
    path: '/report',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M15.73 3H8.27L3 8.27v7.46L8.27 21h7.46L21 15.73V8.27L15.73 3zM12 17c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm1-4h-2V7h2v6z"/>
      </svg>
    )
  },
];

  const handleSosClick = () => {
    setShowSosAlert(true);
    setTimeout(() => {
      setShowSosAlert(false);
    }, 4000);
  };

  const handleNavClick = (name, path) => {
    setActiveTab(name);
    if (onNavigate && path) onNavigate(path);
  };

  return (
    <div style={styles.appContainer}>
      {/* 1. Header Top Bar */}
      <header style={styles.header}>
        <div style={styles.logoGroup}>
          <span style={styles.logoText}>SafeStep</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#a00047">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </div>

        {/* Floating Notification */}
        {showSosAlert && (
          <div style={styles.sosNotification}>
            <div style={styles.notifCheck}>✓</div>
            <div>
              <strong style={{ display: 'block', fontSize: '13px' }}>SOS Berhasil Dikirim!</strong>
              <span style={{ fontSize: '11px' }}>Lokasimu sudah dibagikan ke semua kontak darurat</span>
            </div>
          </div>
        )}

        <div style={styles.userProfileIcon}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#a00047">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        </div>
      </header>

      {/* 2. Main Content Grid (3 Column Layout) */}
      <div style={styles.dashboardGrid}>
        
        {/* Left Column: Sidebar Menu */}
        <aside style={styles.sidebarColumn}>
          {menuItems.map((item) => {
            const isActive = activeTab === item.name;
            return (
              <button
                key={item.name}
                onClick={() => handleNavClick(item.name, item.path)}
                style={{
                  ...styles.sidebarBtn,
                  backgroundColor: isActive ? '#a00047' : '#ffffff',
                  color: isActive ? '#ffffff' : '#a00047',
                  border: isActive ? 'none' : '1.5px solid #a00047',
                }}
              >
                <span style={styles.btnIcon}>{item.icon}</span>
                {item.name}
              </button>
            );
          })}
        </aside>

        {/* Center Column: Greeting + Map + Report */}
        <div style={styles.centerColumn}>
          <div style={styles.greetingHeader}>
            <h1 style={styles.greetingTitle}>Halo, user!</h1>
            <div style={styles.statusTag}>
              <span style={styles.statusDot} />
              Lokasi Aktif
            </div>
          </div>

          {/* Map Container */}
          <div style={styles.mapWrapper}>
            <MapSection />
          </div>

          {/* Report Banner */}
          <div style={styles.reportWrapper}>
            <ReportBanner onReportClick={() => handleNavClick('Lapor', '/report')} />
          </div>
        </div>

        {/* Right Column: SOS Button + Live Guardian */}
        <div style={styles.rightColumn}>
          <div style={styles.sosWrapper}>
            <SosButton onTriggerSos={handleSosClick} />
          </div>

          <div style={styles.guardianWrapper}>
            <LiveGuardianCard onClick={() => handleNavClick('Live Guardian', '/guardian')} />
          </div>
        </div>

      </div>

      {/* Mobile Bottom Navigation */}
      <nav style={styles.mobileNav}>
        {menuItems.map((item) => {
          const isActive = activeTab === item.name;
          return (
            <button
              key={item.name}
              onClick={() => handleNavClick(item.name, item.path)}
              style={{
                ...styles.mobileNavBtn,
                color: isActive ? '#a00047' : '#6b7280',
                fontWeight: isActive ? '700' : '500',
              }}
            >
              <span style={{ display: 'block', margin: '0 auto 2px auto' }}>{item.icon}</span>
              {item.name}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

const styles = {
  appContainer: {
    backgroundColor: '#ffffff',
    minHeight: '100vh',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
  },
  header: {
    backgroundColor: '#f3a4c8',
    height: '64px',
    padding: '0 28px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
  },
  logoGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#ffffff',
    padding: '6px 14px',
    borderRadius: '10px',
    border: '2px dashed #f3a4c8',
  },
  logoText: {
    fontSize: '22px',
    fontWeight: '900',
    color: '#a00047',
    letterSpacing: '-0.5px',
  },
  userProfileIcon: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    backgroundColor: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    border: '2px dashed #f3a4c8',
  },
  sosNotification: {
    position: 'absolute',
    left: '50%',
    top: '8px',
    transform: 'translateX(-50%)',
    backgroundColor: '#34d399',
    color: '#ffffff',
    padding: '8px 16px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
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
  dashboardGrid: {
    display: 'grid',
    gridTemplateColumns: '220px 1fr 280px',
    gap: '24px',
    padding: '24px 32px',
    maxWidth: '1300px',
    width: '100%',
    margin: '0 auto',
    boxSizing: 'border-box',
  },
  sidebarColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  sidebarBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 20px',
    borderRadius: '14px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.15s ease-in-out',
  },
  btnIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  greetingHeader: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '6px',
  },
  greetingTitle: {
    fontSize: '26px',
    fontWeight: '800',
    color: '#1e293b',
    margin: 0,
  },
  statusTag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#fce7f3',
    color: '#a00047',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '700',
  },
  statusDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    backgroundColor: '#a00047',
  },
  mapWrapper: {
    width: '100%',
    borderRadius: '16px',
    overflow: 'hidden',
  },
  reportWrapper: {
    width: '100%',
  },
  rightColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    alignItems: 'center',
  },
  sosWrapper: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
  },
  guardianWrapper: {
    width: '100%',
  },
  mobileNav: {
    display: 'none',
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTop: '1px solid #e2e8f0',
    padding: '10px 0',
    justifyContent: 'space-around',
    zIndex: 50,
  },
  mobileNavBtn: {
    background: 'none',
    border: 'none',
    fontSize: '11px',
    cursor: 'pointer',
  },
};