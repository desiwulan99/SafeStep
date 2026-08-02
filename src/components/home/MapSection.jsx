import React, { useState, useEffect } from 'react';

export const MapSection = () => {
  const [locationName, setLocationName] = useState('Stasiun Manggarai');
  const [coords, setCoords] = useState({ lat: -6.2098, lng: 106.8499 }); // Default Stasiun Manggarai
  const [loading, setLoading] = useState(true);
  const [statusText, setStatusText] = useState('Mendeteksi GPS...');

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setCoords({ lat: latitude, lng: longitude });
          setStatusText('Lokasi saat ini');

          try {
            // Mengambil nama lokasi dari koordinat GPS
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
              {
                headers: {
                  'Accept-Language': 'id',
                },
              }
            );
            const data = await response.json();

            if (data && data.address) {
              const name =
                data.address.suburb ||
                data.address.village ||
                data.address.city_district ||
                data.address.city ||
                data.address.town ||
                'Area Terdeteksi';
              setLocationName(name);
            }
          } catch (err) {
            console.warn('Gagal fetch nama lokasi:', err);
            setLocationName(`Lat: ${latitude.toFixed(3)}, Lng: ${longitude.toFixed(3)}`);
          } finally {
            setLoading(false);
          }
        },
        (error) => {
          console.warn('Geolocation Error:', error.message);
          setLoading(false);
          if (error.code === error.PERMISSION_DENIED) {
            setStatusText('Izin GPS Ditolak');
            setLocationName('Stasiun Manggarai (Default)');
          } else {
            setStatusText('Gagal Ambil GPS');
            setLocationName('Stasiun Manggarai (Default)');
          }
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setLoading(false);
      setStatusText('GPS Tidak Didukung');
    }
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.mapFrame}>
        {/* Render Map Embed */}
        <iframe
          title="User Realtime Map"
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${coords.lng - 0.005}%2C${coords.lat - 0.003}%2C${coords.lng + 0.005}%2C${coords.lat + 0.003}&layer=mapnik&marker=${coords.lat}%2C${coords.lng}`}
          style={{ border: 0 }}
        />

        {/* Overlay Info Lokasi */}
        <div style={styles.overlayCard}>
          <span style={styles.overlaySubtitle}>
            {loading ? 'Mencari GPS...' : statusText}
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
    height: '280px',
    width: '100%',
    backgroundColor: '#e5e7eb',
    position: 'relative',
  },
  overlayCard: {
    position: 'absolute',
    bottom: '16px',
    left: '16px',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    backdropFilter: 'blur(6px)',
    padding: '10px 18px',
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