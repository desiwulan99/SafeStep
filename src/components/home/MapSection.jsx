import React from 'react';

export const MapSection = () => {
  return (
    <div style={styles.card}>
      <div style={styles.searchBar}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          type="text"
          placeholder="Where to?"
          style={styles.searchInput}
          onClick={() => alert('Membuka pencarian rute')}
        />
      </div>

      <div style={styles.mapContainer}>
        <div style={styles.mapBg}>
          <div style={styles.badge}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Aman: 98% Safe Routes Found
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  card: {
    position: 'relative',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    backgroundColor: '#ffffff',
  },
  searchBar: {
    position: 'absolute',
    top: '16px',
    left: '16px',
    right: '16px',
    zIndex: 10,
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '10px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    width: '100%',
    fontSize: '14px',
  },
  mapContainer: {
    height: '320px',
    width: '100%',
    position: 'relative',
  },
  mapBg: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e2e8f0',
    backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
    backgroundSize: '16px 16px',
    display: 'flex',
    alignItems: 'flex-end',
    padding: '16px',
    boxSizing: 'border-box',
  },
  badge: {
    backgroundColor: '#6366f1',
    color: '#ffffff',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    display: 'inline-flex',
    alignItems: 'center',
  },
};