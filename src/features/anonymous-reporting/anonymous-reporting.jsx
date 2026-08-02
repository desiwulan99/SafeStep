import React, { useState, useEffect, useRef } from "react";
import { useGeolocation } from "../../hooks/useGeolocation";

export const ReportForm = () => {
  const { location: geoCoords, error: geoError, loading: geoLoading } = useGeolocation();
  
  const [coords, setCoords] = useState({ lat: -6.1754, lng: 106.8272 }); // Default to Jakarta
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [manualAddress, setManualAddress] = useState("");
  const [validationError, setValidationError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [proofFile, setProofFile] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Leaflet map refs
  const mapContainerRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null);

  // Sync geolocation coordinates with state
  useEffect(() => {
    if (geoCoords && geoCoords.latitude && geoCoords.longitude) {
      setCoords({ lat: geoCoords.latitude, lng: geoCoords.longitude });
      if (mapInstance.current) {
        mapInstance.current.setView([geoCoords.latitude, geoCoords.longitude], 15);
      }
    }
  }, [geoCoords]);

  // Request live location manually and fly to it
  const handleDetectMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setCoords({ lat, lng });
          if (mapInstance.current) {
            mapInstance.current.flyTo([lat, lng], 16, {
              animate: true,
              duration: 1.5
            });
          }
        },
        (error) => {
          alert(`Gagal mengakses lokasi: ${error.message}. Pastikan izin lokasi telah aktif.`);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      alert("Browser Anda tidak mendukung layanan lokasi.");
    }
  };

  // Update time dynamic clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Initialize Leaflet Map
  useEffect(() => {
    if (typeof window !== "undefined" && window.L && mapContainerRef.current && !mapInstance.current) {
      mapInstance.current = window.L.map(mapContainerRef.current).setView([coords.lat, coords.lng], 15);
      
      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstance.current);

      // Handle click to select incident location
      mapInstance.current.on("click", (e) => {
        const { lat, lng } = e.latlng;
        setCoords({ lat, lng });
      });
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Sync Leaflet marker when coordinates change
  useEffect(() => {
    if (!mapInstance.current || !window.L) return;

    if (markerRef.current) {
      markerRef.current.setLatLng([coords.lat, coords.lng]);
    } else {
      markerRef.current = window.L.circleMarker([coords.lat, coords.lng], {
        radius: 8,
        fillColor: "#ef4444", // Red for incident
        color: "#ffffff",
        weight: 2,
        fillOpacity: 1
      }).addTo(mapInstance.current)
        .bindPopup("📍 Lokasi Kejadian")
        .openPopup();
    }
  }, [coords]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    
    if (!category) {
      setValidationError("Pilih kategori insiden terlebih dahulu.");
      setSuccessMessage("");
      return;
    }
    
    setValidationError("");
    setIsSubmitting(true);

    const reportPayload = {
      category,
      description,
      location: {
        latitude: coords.lat,
        longitude: coords.lng,
        manualAddress: manualAddress.trim() || null,
      },
      timestamp: currentTime.toISOString(),
      proofFile: proofFile ? proofFile.name : null,
    };

    console.log("Payload Laporan Anonim SafeStep:", reportPayload);

    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessMessage("Laporan anonim Anda berhasil dikirim.");
      setCategory("");
      setDescription("");
      setManualAddress("");
      setProofFile(null);
    }, 1500);
  };

  return (
    <div className="report-container">
      <header className="top-bar">
        <h1 className="top-title">Laporkan Insiden</h1>
        <div className="top-badge">
          <button className="icon-btn" aria-label="Notifications" onClick={() => alert('Notifikasi')}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
            </svg>
          </button>
          <button className="icon-btn" aria-label="Profile" onClick={() => alert('Profil')}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
            </svg>
          </button>
        </div>
      </header>

      <div className="info-banner">
        <p className="info-text">
            Laporan ini bersifat anonim. Identitas dan privasi Anda sepenuhnya terlindungi dan tidak akan dipublikasikan.
        </p>
      </div>

      {validationError && (
        <div className="alert alert-error">
          <span>⚠️ {validationError}</span>
        </div>
      )}

      {successMessage && (
        <div className="alert alert-success">
          <span>✅ {successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="form-grid">
        <section className="form-card category-box">
          <h2 className="section-title">Kategori</h2>
          <p className="section-subtitle">Pilih jenis insiden yang Anda alami atau saksikan:</p>
          <div className="category-options">
            {["Catcalling", "Mengikuti", "Kontak Fisik", "Lainnya"].map((cat) => (
              <button
                key={cat}
                type="button"
                className={`category-item ${category === cat ? "active" : ""}`}
                onClick={() => setCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>
        
        <section className="form-card location-time-box">
          <h2 className="section-title">Lokasi & Waktu</h2>
          
          <div className="info-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <span className="info-label">📍 Koordinat Lokasi:</span>
              <div className="info-val">
                {geoLoading && !coords ? (
                  <span className="loading-text animate-pulse">Mengambil koordinat GPS...</span>
                ) : (
                  <span className="coord-text">
                    Lat: {coords.lat.toFixed(6)}, Lng: {coords.lng.toFixed(6)}
                  </span>
                )}
              </div>
            </div>
            <button 
              type="button" 
              onClick={handleDetectMyLocation} 
              style={{
                backgroundColor: "#e2e8f0",
                border: "none",
                borderRadius: "8px",
                padding: "6px 12px",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
                color: "#1e293b",
                display: "flex",
                alignItems: "center",
                gap: "4px"
              }}
            >
              📍 Deteksi Lokasi
            </button>
          </div>

          <div style={{ height: "180px", borderRadius: "8px", border: "1px solid #cbd5e1", marginTop: "12px", zIndex: 1 }} ref={mapContainerRef} />
          <p style={{ fontSize: "11px", color: "#64748b", margin: "6px 0 0 0" }}>💡 <b>Tips:</b> Klik pada peta di atas untuk memindahkan marker ke lokasi kejadian secara akurat.</p>

          <div style={{ marginTop: "12px" }} className="input-group">
            <label className="input-label" htmlFor="manual-address">Alamat Detail (Opsional):</label>
            <input
              id="manual-address"
              type="text"
              className="form-input"
              placeholder="Contoh: Depan halte bus dekat stasiun..."
              value={manualAddress}
              onChange={(e) => setManualAddress(e.target.value)}
            />
          </div>

          <div className="info-row time-row" style={{ marginTop: "12px" }}>
            <span className="info-label">🕒 Waktu Kejadian:</span>
            <span className="info-val time-val">
              {currentTime.toLocaleString("id-ID", {
                dateStyle: "medium",
                timeStyle: "medium",
              })}
            </span>
          </div>
        </section>

        <section className="form-card description-box">
          <h2 className="section-title">Deskripsi</h2>
          <p className="section-subtitle">Ceritakan detail kejadian secara singkat untuk membantu pemetaan zona rawan:</p>
          <textarea
            className="form-textarea"
            placeholder="Tuliskan kronologi kejadian di sini..."
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </section>

        <section className="form-card proofment-box">
          <h2 className="section-title">Lampiran (Opsional)</h2>
          <p className="section-subtitle">Unggah bukti pendukung berupa foto atau video kejadian:</p>
          
          <label className="file-upload-area">
            <input
              type="file"
              className="file-input-hidden"
              accept="image/*,video/*"
              onChange={(e) => setProofFile(e.target.files[0] || null)}
            />
            <div className="upload-trigger">
              <svg viewBox="0 0 24 24" width="36" height="36" className="upload-icon" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
              </svg>
              <span className="upload-title">
                {proofFile ? proofFile.name : "Pilih foto atau video"}
              </span>
              <span className="upload-subtitle">Format: JPG, PNG, MP4 (Maks. 20MB)</span>
            </div>
          </label>
        </section>

        <div className="submit-row">
          <button
            type="submit"
            className={`submit-btn ${isSubmitting ? "loading" : ""}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner"></span>
                <span>Mengirim Laporan...</span>
              </>
            ) : (
              "Kirim Laporan"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

