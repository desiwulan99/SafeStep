import React from 'react';

export const SosButton = ({ onTriggerSos }) => {
  return (
    <div style={styles.container}>
      <button
        onClick={onTriggerSos}
        style={styles.sosCircle}
        aria-label="Tombol SOS Darurat"
      >
        <div style={styles.iconWrapper}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="7 13 12 18 17 13" />
            <polyline points="7 6 12 11 17 6" />
          </svg>
        </div>
        <span style={styles.sosText}>SOS</span>
      </button>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  sosCircle: {
    width: '200px',
    height: '200px',
    borderRadius: '50%',
    backgroundColor: '#b90053',
    border: '12px solid #a00047',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    cursor: 'pointer',
    boxShadow: '0 8px 20px rgba(185, 0, 83, 0.3)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    outline: 'none',
  },
  iconWrapper: {
    marginBottom: '4px',
  },
  sosText: {
    fontSize: '32px',
    fontWeight: '800',
    letterSpacing: '2px',
  },
};