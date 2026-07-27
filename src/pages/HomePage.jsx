import React, { useState } from 'react';
import { Sidebar } from '../components/layout/Sidebar.jsx';
import { QuickCard } from '../components/home/QuickCard.jsx';
import { MapSection } from '../components/home/MapSection.jsx';
import { ReportBanner } from '../components/home/ReportBanner.jsx';
import { RecentActivity } from '../components/home/RecentActivity.jsx';
import { SosButton } from '../features/sos-emergency/components/SosButton.jsx';
export const HomePage = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState('Beranda');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavigation = (menuName, routePath) => {
    setActiveTab(menuName);
    if (onNavigate && routePath) {
      onNavigate(routePath);
    }
  };

  return (
    <div style={styles.container}>
      <Sidebar
        activeTab={activeTab}
        onSelectMenu={handleNavigation}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      <main style={styles.mainContent}>
        <header style={styles.header}>
          <div style={styles.headerLeft}>
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              style={styles.hamburgerBtn}
              aria-label="Open Menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <div>
              <h1 style={styles.greeting}>Hi, Sarah</h1>
              <div style={styles.locationBadge}>
                <span style={styles.locationDot}></span>
                LOCATION ACTIVE • JAKARTA PUSAT
              </div>
            </div>
          </div>

          <div style={styles.headerRight}>
            <button style={styles.iconBtn} onClick={() => alert('Notifikasi')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
            </button>
            <img
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
              alt="Profile"
              style={styles.profileAvatar}
              onClick={() => alert('Buka Profil')}
            />
          </div>
        </header>

        <div style={styles.dashboardGrid}>
          <div style={styles.leftColumn}>
            <MapSection />
            <ReportBanner
              onReportClick={() => handleNavigation('Laporkan Insiden', '/report')}
            />
          </div>

          <div style={styles.rightColumn}>
            <QuickCard
              iconSvg={
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              }
              iconBg="#fef3c7"
              title="Live Guardian"
              description="Share your real-time path with trusted contacts."
              actionText="Mulai Sekarang →"
              onClick={() => handleNavigation('Live Guardian', '/guardian')}
            />

            <QuickCard
              iconSvg={
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="3 11 22 2 13 21 11 13 3 11"/>
                </svg>
              }
              iconBg="#e0e7ff"
              title="Safe Route"
              description="Find the safest way home based on community data."
              actionText="Pilih Rute →"
              onClick={() => handleNavigation('Safe Route', '/safe-route')}
            />

            <RecentActivity
              onViewAll={() => handleNavigation('Riwayat', '/history')}
            />
          </div>
        </div>

        <footer style={styles.footer}>
          <span>© 2024 SafeStep. Empowering Women Everywhere.</span>
          <div style={styles.footerLinks}>
            <a href="#privacy" style={styles.footerLink}>Privacy Policy</a>
            <a href="#terms" style={styles.footerLink}>Terms of Service</a>
            <a href="#support" style={styles.footerLink}>Contact Support</a>
          </div>
        </footer>
      </main>

      <SosButton />
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    fontFamily: "'Inter', sans-serif",
    position: 'relative',
  },
  mainContent: {
    flex: 1,
    padding: '24px 32px',
    maxWidth: '1280px',
    margin: '0 auto',
    width: '100%',
    boxSizing: 'border-box',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  hamburgerBtn: {
    display: 'none',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
  },
  greeting: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#0f172a',
    margin: 0,
  },
  locationBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    fontWeight: '700',
    color: '#6366f1',
    marginTop: '4px',
  },
  locationDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#6366f1',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  iconBtn: {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  },
  profileAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    objectFit: 'cover',
    cursor: 'pointer',
  },
  dashboardGrid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '24px',
  },
  leftColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  rightColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  footer: {
    marginTop: '40px',
    paddingTop: '20px',
    borderTop: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '12px',
    color: '#94a3b8',
    flexWrap: 'wrap',
    gap: '12px',
  },
  footerLinks: {
    display: 'flex',
    gap: '16px',
  },
  footerLink: {
    color: '#64748b',
    textDecoration: 'none',
  },
};