import React, { useState, useEffect } from 'react';

export const MapSection = () => {
  const [locationName, setLocationName] = useState('Stasiun Manggarai');
  const [coords, setCoords] = useState({ lat: -6.2098, lng: 106.8499 });
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
            setLocationName(`Lat: ${latitude.toFixed(3)}, Lng: ${longitude.toFixed(3)}`);
          } finally {
            setLoading(false);
          }
        },
        (error) => {
          setLoading(false);
          if (error.code === error.PERMISSION_DENIED) {
            setStatusText('Izin GPS Ditolak');
            setLocationName('Stasiun Manggarai');
          } else {
            setStatusText('Gagal Ambil GPS');
            setLocationName('Stasiun Manggarai');
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
        <iframe
          title="User Realtime Map"
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${coords.lng - 0.005}%2C${coords.lat - 0.003}%2C${coords.lng + 0.005}%2C${coords.lat + 0.003}&layer=mapnik&marker=${coords.lat}%2C${coords.lng}`}
          style={{ border: 0 }}
        />

        <div style={styles.overlayCard}>
          <div style={styles.overlaySubtitle}>
            {loading ? 'Mencari GPS...' : statusText}
          </div>
          <div style={styles.overlayTitle}>{locationName}</div>
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
    backgroundColor: 'transparent',
    padding: '0',
    zIndex: 3,
    pointerEvents: 'none',
    textShadow: '0 1px 4px rgba(0, 0, 0, 0.8)',
  },
  overlaySubtitle: {
    fontSize: '12px',
    color: '#ffffff',
    fontWeight: '500',
    display: 'block',
  },
  overlayTitle: {
    margin: '2px 0 0 0',
    fontSize: '18px',
    fontWeight: '800',
    color: '#ffffff',
  },
};