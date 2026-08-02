import React, { useState, useEffect } from 'react';

export const MapSection = () => {
  const [locationName, setLocationName] = useState('Mendeteksi lokasi...');
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Mengambil Geolocation perangkat user
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setCoords({ lat: latitude, lng: longitude });

          // 2. Reverse Geocoding (Mendapatkan nama area dari koordinat)
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
            );
            const data = await response.json();
            
            // Mengambil nama suburb/city/road yang relevan
            const name =
              data.address.suburb ||
              data.address.city_district ||
              data.address.city ||
              data.address.town ||
              'Lokasi Anda';
              
            setLocationName(name);
          } catch (err) {
            setLocationName('Lokasi Terdeteksi');
          } finally {
            setLoading(false);
          }
        },
        (error) => {
          console.warn('Geolocation Error:', error.message);
          setLocationName('Akses Lokasi Ditolak');
          setLoading(false);
        }
      );
    } else {
      setLocationName('Fitur tidak didukung browser');
      setLoading(false);
    }
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.mapFrame}>
        {/* Jika ada koordinat, kita pakai embed map OpenStreetMap yang berfungsi secara live */}
        {coords ? (
          <iframe
            title="User Realtime Map"
            width="100%"
            height="100%"
            frameBorder="0"
            scrolling="no"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${coords.lng - 0.005}%2C${coords.lat - 0.003}%2C${coords.lng + 0.005}%2C${coords.lat + 0.003}&layer=mapnik&marker=${coords.lat}%2C${coords.lng}`}
            style={{ border: 0 }}
          />
        ) : (
          <div style={styles.mapMock}>
            <div style={styles.road1} />
            <div style={styles.road2} />
            <div style={styles.pinContainer}>
              <div style={styles.pin}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#b90053">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* Overlay Info Lokasi Realtime */}
        <div style={styles.overlayCard}>
          <span style={styles.overlaySubtitle}>
            {loading ? 'Memuat lokasi GPS...' : 'Lokasi saat ini'}
          </span>
          <h4 style={styles.overlayTitle}>{locationName}</h4>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    width: '100%',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  mapFrame: {
    height: '300px',
    width: '100%',
    backgroundColor: '#e5e7eb',
    position: 'relative',
  },
  mapMock: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e2e8f0',
    backgroundImage: 'radial-gradient(#cbd5e1 1.5px, transparent 1.5px)',
    backgroundSize: '20px 20px',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  road1: {
    position: 'absolute',
    width: '100%',
    height: '24px',
    backgroundColor: '#ffffff',
    transform: 'rotate(-15deg)',
  },
  road2: {
    position: 'absolute',
    width: '24px',
    height: '100%',
    backgroundColor: '#ffffff',
    transform: 'rotate(25deg)',
  },
  pinContainer: {
    position: 'relative',
    zIndex: 2,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  pin: {
    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
  },
  overlayCard: {
    position: 'absolute',
    bottom: '16px',
    left: '16px',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    backdropFilter: 'blur(6px)',
    padding: '12px 20px',
    borderRadius: '12px',
    color: '#ffffff',
    zIndex: 3,
    pointerEvents: 'none',
  },
  overlaySubtitle: {
    fontSize: '11px',
    opacity: 0.85,
    display: 'block',
  },
  overlayTitle: {
    margin: '2px 0 0 0',
    fontSize: '16px',
    fontWeight: '700',
  },
};