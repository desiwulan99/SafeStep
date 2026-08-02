import React from 'react';
import mascotImg from '../../assets/images/mascot.png';
export const LiveGuardianCard = ({ onClick }) => {
  return (
    <div style={styles.card} onClick={onClick}>
      <div style={styles.header}>
        <div style={styles.iconBox}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.72-8.72 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </div>
        <h3 style={styles.title}>Live Guardian</h3>
        <p style={styles.desc}>
          Bagikan lokasi real-time mu dengan kontak terpercaya!
        </p>
      </div>

      <div style={styles.mascotWrapper}>
        <img 
          src={mascotImg} 
          alt="SafeStep Mascot" 
          style={styles.mascotImage} 
        />
      </div>
    </div>
  );
};

const styles = {
  card: {
    backgroundColor: '#eb72a2', // Warna pink sesuai acuan UI
    borderRadius: '16px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    cursor: 'pointer',
    minHeight: '260px',
    overflow: 'hidden',
    boxSizing: 'border-box',
    boxShadow: '0 4px 12px rgba(235, 114, 162, 0.2)',
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
    fontWeight: '800',
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
    alignItems: 'flex-end',
    marginTop: '12px',
    height: '140px',
  },
  mascotImage: {
    maxHeight: '100%',
    maxWidth: '100%',
    objectFit: 'contain',
    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))',
  },
};