import React from 'react';

export const MapSection = () => {
  return (
    <div style={styles.container}>
      <div style={styles.mapFrame}>
        {/* Mock Map View */}
        <div style={styles.mapMock}>
          <div style={styles.road1} />
          <div style={styles.road2} />
          
          {/* Location Pin */}
          <div style={styles.pinContainer}>
            <div style={styles.pin}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#b90053">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </div>
            <span style={styles.pinText}>Manggarai</span>
          </div>

          {/* Bottom Card Overlay */}
          <div style={styles.overlayCard}>
            <span style={styles.overlaySubtitle}>Lokasi saat ini</span>
            <h4 style={styles.overlayTitle}>Stasiun Manggarai</h4>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    width: '100%',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  mapFrame: {
    height: '300px',
    width: '100%',
    backgroundColor: '#e5e7eb',
    position: 'relative',
  },
  mapMock: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e2e8f0',
    backgroundImage: 'radial-gradient(#cbd5e1 1.5px, transparent 1.5px)',
    backgroundSize: '20px 20px',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  road1: {
    position: 'absolute',
    width: '100%',
    height: '24px',
    backgroundColor: '#ffffff',
    transform: 'rotate(-15deg)',
  },
  road2: {
    position: 'absolute',
    width: '24px',
    height: '100%',
    backgroundColor: '#ffffff',
    transform: 'rotate(25deg)',
  },
  pinContainer: {
    position: 'relative',
    zIndex: 2,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  pin: {
    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
  },
  pinText: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#b90053',
    backgroundColor: '#ffffff',
    padding: '2px 6px',
    borderRadius: '4px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  overlayCard: {
    position: 'absolute',
    bottom: '16px',
    left: '16px',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    backdropFilter: 'blur(4px)',
    padding: '12px 20px',
    borderRadius: '12px',
    color: '#ffffff',
    zIndex: 3,
  },
  overlaySubtitle: {
    fontSize: '12px',
    opacity: 0.9,
  },
  overlayTitle: {
    margin: '2px 0 0 0',
    fontSize: '18px',
    fontWeight: '700',
  },
};