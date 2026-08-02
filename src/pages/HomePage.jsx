import React, { useState } from 'react';
import { SosButton } from '../features/sos-emergency/components/SosButton';
import { MapSection } from '../components/home/MapSection';
import { ReportBanner } from '../components/home/ReportBanner';
import { LiveGuardianCard } from '../components/home/LiveGuardianCard';

export const HomePage = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState('Beranda');
  const [showSosAlert, setShowSosAlert] = useState(false);

  const menuItems = [
    { name: 'Beranda', icon: 'home', path: '/' },
    { name: 'Peta Aman', icon: 'map-pin', path: '/safe-route' },
    { name: 'Live Guardian', icon: 'heart', path: '/guardian' },
    { name: 'Lapor', icon: 'alert', path: '/report' },
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
    <div style={styles.wrapper}>
      {/* Top Bar Header */}
      <header style={styles.topHeader}>
        <div style={styles.logoContainer}>
          <span style={styles.logoText}>SafeStep</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#b90053">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </div>

        {/* SOS Alert Notification (Atas) */}
        {showSosAlert && (
          <div style={styles.sosNotification}>
            <div style={styles.notifCheck}>✓</div>
            <div>
              <strong style={{ display: 'block', fontSize: '14px' }}>SOS Berhasil Dikirim!</strong>
              <span style={{ fontSize: '12px' }}>Lokasimu sudah dibagikan ke semua kontak darurat</span>
            </div>
          </div>
        )}

        <div style={styles.userAvatar}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#9ca3af">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        </div>
      </header>

      {/* Main Layout Body */}
      <div style={styles.bodyLayout}>
        {/* Left Sidebar (Desktop) */}
        <aside style={styles.sidebar}>
          {menuItems.map((item) => {
            const isActive = activeTab === item.name;
            return (
              <button
                key={item.name}
                onClick={() => handleNavClick(item.name, item.path)}
                style={{
                  ...styles.sidebarBtn,
                  backgroundColor: isActive ? '#b90053' : '#ffffff',
                  color: isActive ? '#ffffff' : '#b90053',
                  border: isActive ? 'none' : '1.5px solid #b90053',
                }}
              >
                {item.name}
              </button>
            );
          })}
        </aside>

        {/* Center / Main Content Area */}
        <main style={styles.mainContent}>
          <div style={styles.userGreeting}>
            <h2 style={styles.greetingTitle}>Halo, user!</h2>
            <div style={styles.statusBadge}>
              <span style={styles.statusDot} />
              Lokasi Aktif
            </div>
          </div>

          <div style={styles.gridContent}>
            {/* Middle Column: Map & Report */}
            <div style={styles.centerColumn}>
              <MapSection />
              <ReportBanner onReportClick={() => handleNavClick('Lapor', '/report')} />
            </div>

            {/* Right Column: SOS & Live Guardian */}
            <div style={styles.rightColumn}>
              <SosButton onTriggerSos={handleSosClick} />
              <LiveGuardianCard onClick={() => handleNavClick('Live Guardian', '/guardian')} />
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav style={styles.mobileBottomNav}>
        {menuItems.map((item) => {
          const isActive = activeTab === item.name;
          return (
            <button
              key={item.name}
              onClick={() => handleNavClick(item.name, item.path)}
              style={{
                ...styles.mobileNavBtn,
                color: isActive ? '#b90053' : '#6b7280',
                fontWeight: isActive ? '700' : '500',
              }}
            >
              {item.name}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

const styles = {
  wrapper: {
    backgroundColor: '#f3f4f6',
    minHeight: '100vh',
    fontFamily: "'Inter', sans-serif",
    display: 'flex',
    flexDirection: 'column',
    paddingBottom: '60px', // Space for mobile nav
  },
  topHeader: {
    backgroundColor: '#fbcfe8',
    padding: '16px 32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  logoText: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#b90053',
  },
  userAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sosNotification: {
    position: 'absolute',
    left: '50%',
    top: '12px',
    transform: 'translateX(-50%)',
    backgroundColor: '#4ade80',
    color: '#ffffff',
    padding: '10px 20px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    zIndex: 10,
    width: 'max-content',
    maxWidth: '90%',
  },
  notifCheck: {
    backgroundColor: '#ffffff',
    color: '#22c55e',
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
  },
  bodyLayout: {
    display: 'flex',
    padding: '24px 32px',
    gap: '32px',
    maxWidth: '1280px',
    width: '100%',
    margin: '0 auto',
    boxSizing: 'border-box',
  },
  sidebar: {
    width: '200px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    flexShrink: 0,
  },
  sidebarBtn: {
    padding: '12px 20px',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.2s ease',
  },
  mainContent: {
    flex: 1,
  },
  userGreeting: {
    marginBottom: '20px',
  },
  greetingTitle: {
    fontSize: '26px',
    fontWeight: '800',
    color: '#1f2937',
    margin: 0,
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#fce7f3',
    color: '#b90053',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    marginTop: '6px',
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#b90053',
  },
  gridContent: {
    display: 'grid',
    gridTemplateColumns: '1.8fr 1fr',
    gap: '24px',
  },
  centerColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  rightColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  mobileBottomNav: {
    display: 'none',
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTop: '1px solid #e5e7eb',
    padding: '12px',
    justifyContent: 'space-around',
    zIndex: 50,
  },
  mobileNavBtn: {
    background: 'none',
    border: 'none',
    fontSize: '13px',
    cursor: 'pointer',
  },
};