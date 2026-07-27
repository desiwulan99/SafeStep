import React from 'react';

export const QuickCard = ({ iconSvg, iconBg, title, description, actionText, onClick }) => {
  return (
    <div style={styles.card}>
      <div style={{ ...styles.iconBox, backgroundColor: iconBg }}>
        {iconSvg}
      </div>
      <div>
        <h3 style={styles.title}>{title}</h3>
        <p style={styles.desc}>{description}</p>
        <button onClick={onClick} style={styles.actionBtn}>
          {actionText}
        </button>
      </div>
    </div>
  );
};

const styles = {
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '20px',
    display: 'flex',
    gap: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    border: '1px solid #f1f5f9',
  },
  iconBox: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  title: {
    margin: '0 0 6px 0',
    fontSize: '16px',
    fontWeight: '700',
    color: '#0f172a',
  },
  desc: {
    margin: '0 0 12px 0',
    fontSize: '13px',
    color: '#64748b',
    lineHeight: '1.4',
  },
  actionBtn: {
    background: 'none',
    border: 'none',
    color: '#6366f1',
    fontWeight: '600',
    fontSize: '13px',
    cursor: 'pointer',
    padding: 0,
  },
};