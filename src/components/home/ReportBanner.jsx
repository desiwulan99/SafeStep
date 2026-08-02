import React from 'react';

export const ReportBanner = ({ onReportClick }) => {
  return (
    <div style={styles.card} onClick={onReportClick}>
      <div style={styles.iconCircle}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <div>
        <h3 style={styles.title}>Laporkan Insiden</h3>
        <p style={styles.subtitle}>Laporkan area yang tidak aman dan jaga sesama</p>
      </div>
    </div>
  );
};

const styles = {
  card: {
    backgroundColor: '#98c5e2',
    borderRadius: '16px',
    padding: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    cursor: 'pointer',
    transition: 'opacity 0.2s ease',
  },
  iconCircle: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#000000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  title: {
    margin: '0 0 4px 0',
    fontSize: '18px',
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    margin: 0,
    fontSize: '14px',
    color: '#374151',
  },
};