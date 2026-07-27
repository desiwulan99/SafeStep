import React, { useState, useEffect } from "react";
import { useGeolocation } from "../../hooks/useGeolocation";

export const ReportForm = () => {
//   const { location, error: geoError, loading: geoLoading } = useGeolocation();
  const location = { latitude: null, longitude: null };
  const geoError = "Layanan lokasi dinonaktifkan oleh pengguna";
  const geoLoading = false;
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [manualAddress, setManualAddress] = useState("");
  const [validationError, setValidationError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [proofFile, setProofFile] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

//   useEffect(() => {
//     const timer = setInterval(() => {
//       setCurrentTime(new Date());
//     }, 1000);
//     return () => clearInterval(timer);
//   }, []);

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
    //   location: {
    //     // latitude: location?.latitude || null,
    //     longitude: location?.longitude || null,
    //     manualAddress: manualAddress.trim() || null,
    //   },
    //   timestamp: currentTime.toISOString(),
    //   proofFile: proofFile ? proofFile.name : null,
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
          <button className="icon-btn" aria-label="Notifications">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
            </svg>
          </button>
          <button className="icon-btn" aria-label="Profile">
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
          
          <div className="info-row">
            <span className="info-label">📍 Lokasi saat ini:</span>
            <div className="info-val">
              {geoLoading ? (
                <span className="loading-text animate-pulse">Mengambil koordinat GPS...</span>
              ) : geoError ? (
                <span className="error-text">{geoError}</span>
              ) : (
                <span className="coord-text">
                  Lat: {location.latitude?.toFixed(6)}, Lng: {location.longitude?.toFixed(6)}
                </span>
              )}
            </div>
          </div>

          <div className="input-group">
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

          <div className="info-row time-row">
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
