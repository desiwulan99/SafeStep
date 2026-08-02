import React from 'react';

export const LiveGuardianCard = ({ onClick }) => {
  return (
    <div style={styles.card} onClick={onClick}>
      <div style={styles.header}>
        <div style={styles.iconBox}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.72-8.72 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </div>
        <h3 style={styles.title}>Live Guardian</h3>
        <p style={styles.desc}>Bagikan lokasi real-time mu dengan kontak terpercaya!</p>
      </div>

      {/* Mascot Illustration SVG */}
      <div style={styles.mascotWrapper}>
        <svg width="120" height="120" viewBox="0 0 100 100" fill="none">
          {/* Bird Body */}
          <path d="M50 30C35 30 25 45 25 65C25 80 38 88 50 88C62 88 75 80 75 65C75 45 65 30 50 30Z" fill="#FFFFFF" />
          {/* Wings */}
          <path d="M25 60C15 58 10 65 12 72C15 80 28 72 30 68Z" fill="#FFFFFF" />
          <path d="M75 60C85 58 90 65 88 72C85 80 72 72 70 68Z" fill="#FFFFFF" />
          {/* Eyes */}
          <circle cx="43" cy="52" r="3" fill="#1E293B" />
          <circle cx="57" cy="52" r="3" fill="#1E293B" />
          {/* Beak */}
          <polygon points="50,56 46,62 54,62" fill="#FBBF24" />
          {/* Feet */}
          <line x1="45" y1="88" x2="43" y2="95" stroke="#FBBF24" strokeWidth="3" strokeLinecap="round" />
          <line x1="55" y1="88" x2="57" y2="95" stroke="#FBBF24" strokeWidth="3" strokeLinecap="round" />
          {/* Crown Heart */}
          <path d="M50 38 L46 32 A3 3 0 0 1 50 28 A3 3 0 0 1 54 32 Z" fill="#B90053" />
        </svg>
      </div>
    </div>
  );
};

const styles = {
  card: {
    backgroundColor: '#f472b6',
    borderRadius: '16px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    cursor: 'pointer',
    minHeight: '220px',
  },
  header: {
    color: '#ffffff',
  },
  iconBox: {
    marginBottom: '8px',
  },
  title: {
    margin: '0 0 6px 0',
    fontSize: '20px',
    fontWeight: '700',
  },
  desc: {
    margin: 0,
    fontSize: '13px',
    lineHeight: '1.4',
    opacity: 0.95,
  },
  mascotWrapper: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '12px',
  },
};