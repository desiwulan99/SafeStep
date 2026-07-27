import React from 'react';

export const RecentActivity = ({ onViewAll }) => {
  const activities = [
    {
      id: 1,
      title: 'Perjalanan Selesai',
      time: 'Kemarin, 21:45 • Jakarta Selatan',
      iconBg: '#f3e8ff',
      strokeColor: '#9333ea',
    },
    {
      id: 2,
      title: 'Check-in Terverifikasi',
      time: 'Kemarin, 19:30 • SCBD',
      iconBg: '#fef9c3',
      strokeColor: '#ca8a04',
    },
  ];

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h3 style={styles.title}>Aktivitas Terakhir</h3>
        <button onClick={onViewAll} style={styles.viewAllBtn}>
          Lihat Semua
        </button>
      </div>

      <div style={styles.list}>
        {activities.map((item) => (
          <div key={item.id} style={styles.item}>
            <div style={{ ...styles.iconBox, backgroundColor: item.iconBg }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={item.strokeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <div style={styles.itemInfo}>
              <h4 style={styles.itemTitle}>{item.title}</h4>
              <p style={styles.itemTime}>{item.time}</p>
            </div>
            <span style={styles.arrow}>›</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    border: '1px solid #f1f5f9',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  title: {
    margin: 0,
    fontSize: '15px',
    fontWeight: '700',
    color: '#0f172a',
  },
  viewAllBtn: {
    background: 'none',
    border: 'none',
    color: '#6366f1',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '8px 0',
  },
  iconBox: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    margin: '0 0 2px 0',
    fontSize: '13px',
    fontWeight: '600',
    color: '#1e293b',
  },
  itemTime: {
    margin: 0,
    fontSize: '11px',
    color: '#94a3b8',
  },
  arrow: {
    color: '#cbd5e1',
    fontSize: '18px',
  },
};