import React from 'react';

export const ReportBanner = ({ onReportClick }) => {
  return (
    <div style={styles.banner}>
      <div style={styles.leftBorder} />
      <div style={styles.content}>
        <div style={styles.iconBox}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
        <div>
          <h3 style={styles.title}>Laporkan Insiden</h3>
          <p style={styles.desc}>
            Bantu orang lain dengan melaporkan area yang kurang aman.
          </p>
        </div>
      </div>
      <button onClick={onReportClick} style={styles.button}>
        Buat Laporan
      </button>
    </div>
  );
};

const styles = {
  banner: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '20px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    gap: '16px',
    flexWrap: 'wrap',
  },
  leftBorder: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '6px',
    backgroundColor: '#dc2626',
  },
  content: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  iconBox: {
    backgroundColor: '#fef2f2',
    padding: '10px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    margin: '0 0 4px 0',
    fontSize: '16px',
    fontWeight: '700',
    color: '#0f172a',
  },
  desc: {
    margin: 0,
    fontSize: '13px',
    color: '#64748b',
  },
  button: {
    backgroundColor: '#dc2626',
    color: '#ffffff',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '10px',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
};