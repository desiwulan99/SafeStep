import React, { useState } from 'react';
import { Navbar } from '../components/Navbar.jsx';
import { Sidebar } from '../components/Sidebar.jsx';
import { SosButton } from '../features/sos-emergency/components/SosButton';
import { LiveGuardianCard } from '../components/home/LiveGuardianCard';

export const HomePage = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState('Beranda');
  const [showSosAlert, setShowSosAlert] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
      {/* Navbar Component */}
      <Navbar 
        showSosAlert={showSosAlert} 
        onOpenSidebar={() => setIsSidebarOpen(true)} 
      />

      {/* Grid Utama 3 Kolom (Sidebar - Content Maps - SOS/Guardian) */}
      <div style={styles.dashboardGrid}>
        
        {/* Kolom Kiri: Sidebar Component */}
        <div>
          <Sidebar 
            activeTab={activeTab} 
            onSelectMenu={handleNavClick}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />
        </div>

        {/* Kolom Tengah: Peta & Konten Utama */}
        <div style={styles.centerColumn}>
          <div style={styles.cardBox}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#1e293b' }}>
                  Peta Zona Keamanan Real-Time
                </h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                  Pantau area aman dan indikator bahaya di sekitarmu
                </p>
              </div>
              <button style={styles.btnHeatmap}>Live Map</button>
            </div>

            {/* Map Placeholder Container */}
            <div style={styles.mapAreaPlaceholder}>
              <p style={{ color: '#94a3b8', fontSize: '14px', fontWeight: '600' }}>
                Area Interactive Map SafeStep
              </p>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: SOS & Live Guardian */}
        <div style={styles.rightColumn}>
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <SosButton onTriggerSos={handleSosClick} />
          </div>

          <div style={{ width: '100%' }}>
            <LiveGuardianCard onClick={() => handleNavClick('Live Guardian', '/guardian')} />
          </div>
        </div>

      </div>
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
  dashboardGrid: {
    display: 'grid',
    gridTemplateColumns: '220px 1fr 220px',
    gap: '24px',
    padding: '24px 24px 24px 12px',
    maxWidth: '1440px',
    width: '100%',
    margin: '0 auto',
    boxSizing: 'border-box',
    alignItems: 'start',
  },
  centerColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    width: '100%',
  },
  cardBox: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
    border: '1px solid #f1f5f9',
  },
  btnHeatmap: {
    backgroundColor: '#a00047',
    color: '#ffffff',
    border: 'none',
    borderRadius: '20px',
    padding: '6px 14px',
    fontSize: '12px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  mapAreaPlaceholder: {
    height: '480px',
    backgroundColor: '#f1f5f9',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px dashed #cbd5e1',
  },
  rightColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    alignItems: 'center',
    width: '100%',
  },
};