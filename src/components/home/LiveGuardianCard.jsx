import React from 'react';
import mascotImg from '../../assets/images/mascot.png';

export const LiveGuardianCard = ({ onClick }) => {
  return (
    <div style={styles.card} onClick={onClick}>
      <div style={styles.header}>
        <div style={styles.iconWrapper}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="#ffffff">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </div>

        <h3 style={styles.title}>Live Guardian</h3>
        <p style={styles.subtitle}>
          Bagikan lokasi real-time mu dengan kontak terpercaya!
        </p>
      </div>

      <div style={styles.imageBody}>
        <img 
          src={mascotImg} 
          alt="Maskot Live Guardian" 
          style={styles.mascotImage} 
        />
      </div>
    </div>
  );
};

const styles = {
  card: {
    width: '100%',
    borderRadius: '24px',
    overflow: 'hidden',
    backgroundColor: '#e8a5c8', 
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(255, 255, 255, 0.05)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },
  header: {
    backgroundColor: '#e6438d',
    padding: '24px 20px 20px 20px',
    borderRadius: '24px',
    color: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '8px',
  },
  iconWrapper: {
    marginBottom: '4px',
  },
  title: {
    fontSize: '22px',
    fontWeight: '700',
    margin: 0,
    letterSpacing: '-0.3px',
  },
  subtitle: {
    fontSize: '14px',
    fontWeight: '400',
    margin: 0,
    lineHeight: '1.4',
    opacity: 0.95,
  },
  imageBody: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px 16px 28px 16px',
    minHeight: '200px',
  },
  mascotImage: {
    width: '180px',
    height: 'auto',
    objectFit: 'contain',
  },
};