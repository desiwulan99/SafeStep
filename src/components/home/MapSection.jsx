import React, { useState, useEffect } from 'react';

export const MapSection = () => {
  const [locationName, setLocationName] = useState('Depok, Jawa Barat');
  const [coords, setCoords] = useState({ lat: -6.4025, lng: 106.7942 });
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
                'Depok';
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
          setStatusText('Lokasi saat ini');
          setLocationName('Depok');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setLoading(false);
      setStatusText('Lokasi saat ini');
      setLocationName('Depok');
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

        <div style={styles.gradientOverlay} />

        <div style={styles.overlayCard}>
          <span style={styles.overlaySubtitle}>
            {loading ? 'Mencari GPS...' : statusText}
          </span>
          <span style={styles.overlayTitle}>
            {locationName}
          </span>
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
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '90px',
    background: 'linear-gradient(to top, rgba(0, 0, 0, 0.45) 0%, rgba(0, 0, 0, 0) 100%)',
    pointerEvents: 'none',
    zIndex: 2,
  },
  overlayCard: {
    position: 'absolute',
    bottom: '16px',
    left: '16px',
    backgroundColor: 'transparent',
    padding: 0,
    zIndex: 3,
    pointerEvents: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  overlaySubtitle: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#ffffff',
    margin: 0,
    padding: 0,
    lineHeight: '1.2',
    opacity: 0.9,
  },
  overlayTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#ffffff',
    margin: 0,
    padding: 0,
    lineHeight: '1.2',
  },
};