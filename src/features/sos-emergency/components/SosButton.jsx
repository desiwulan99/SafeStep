import React from 'react';

export const SosButton = () => {
  const handleSosTrigger = () => {
    alert('SINYAL DARURAT DISIARKAN! Kontak tepercaya sedang dihubungi.');
  };

  return (
    <button
      onClick={handleSosTrigger}
      style={styles.sosFloatingBtn}
      aria-label="Tombol Darurat SOS"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
      <span>SOS</span>
    </button>
  );
};

const styles = {
  sosFloatingBtn: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    backgroundColor: '#dc2626',
    color: '#ffffff',
    border: '4px solid #fecaca',
    boxShadow: '0 8px 24px rgba(220, 38, 38, 0.4)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '800',
    fontSize: '11px',
    cursor: 'pointer',
    zIndex: 100,
    gap: '2px',
  },
};