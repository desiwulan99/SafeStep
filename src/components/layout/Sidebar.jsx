import React from 'react';

export const Sidebar = ({ activeTab, onSelectMenu, isOpen, onClose }) => {
  const menuItems = [
    { 
      name: 'Beranda', 
      path: '/',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8h5z"/>
        </svg>
      )
    },
    { 
      name: 'Peta Aman', 
      path: '/safe-route',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path fillRule="evenodd" clipRule="evenodd" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"/>
        </svg>
      )
    },
    { 
      name: 'Live Guardian', 
      path: '/guardian',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      )
    },
    { 
      name: 'Lapor', 
      path: '/report',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M15.73 3H8.27L3 8.27v7.46L8.27 21h7.46L21 15.73V8.27L15.73 3zM12 17c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm1-4h-2V7h2v6z"/>
        </svg>
      )
    },
  ];

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          style={styles.overlay}
        />
      )}

      <aside style={styles.sidebarColumn} className="sidebar-column">
        {menuItems.map((item) => {
          const isActive = activeTab === item.name;
          return (
            <button
              key={item.name}
              onClick={() => {
                onSelectMenu(item.name, item.path);
                if (onClose) onClose();
              }}
              style={{
                ...styles.sidebarBtn,
                backgroundColor: isActive ? '#a00047' : '#fdf2f8',
                color: isActive ? '#ffffff' : '#a00047',
                border: isActive ? '2px solid #a00047' : '1.5px solid #f472b6',
              }}
            >
              <span style={styles.btnIcon}>{item.icon}</span>
              {item.name}
            </button>
          );
        })}
      </aside>
    </>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 40,
  },
  sidebarColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '-4px',
    width: '100%',
  },
  sidebarBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 18px',
    borderRadius: '16px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    textAlign: 'left',
    boxShadow: '0 2px 6px rgba(160,0,71,0.04)',
    transition: 'all 0.15s ease-in-out',
    width: '100%',
    boxSizing: 'border-box',
  },
  btnIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'inherit',
  },
};