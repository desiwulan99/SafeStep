import { useState } from "react";
import {
  MapPin,
  Camera,
  Send,
  AlertTriangle,
  AlertCircle,
  Calendar,
  Clock,
  Navigation,
  Info,
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import Toast from "../components/common/Toast";
import { reverseGeocode } from "../services/locationService";
import "./ReportPage.css";

const incidentPinIcon = L.divIcon({
  className: "map-pin map-pin--user",
  html: '<span class="map-pin__dot" style="background: #e33a57; border: 3px solid #ffffff;"></span>',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

function MapClickListener({ onSelectLocation }) {
  useMapEvents({
    click(e) {
      onSelectLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

export default function ReportPage({ userName = "user", onNavigate }) {
  const [category, setCategory] = useState("Lainnya");
  const [customCategory, setCustomCategory] = useState("");
  const [description, setDescription] = useState("Jalanan saat malam gelap");
  const [locationAddress, setLocationAddress] = useState("Stasiun Manggarai");
  const [coords, setCoords] = useState({ lat: -6.2088, lng: 106.8456 });
  const [dateVal, setDateVal] = useState("2026-08-01");
  const [timeVal, setTimeVal] = useState("16:30");
  const [proofFile, setProofFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [validationError, setValidationError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const clearFieldError = (field) => {
    setFieldErrors((prev) => ({ ...prev, [field]: false }));
    setValidationError("");
  };

  const handleMapClick = async (newCoords) => {
    setCoords(newCoords);
    clearFieldError("locationAddress");
    const addressName = await reverseGeocode(newCoords);
    if (addressName) {
      setLocationAddress(addressName);
    }
  };

  const handleDetectGps = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const newCoords = { lat, lng };
          setCoords(newCoords);
          clearFieldError("locationAddress");
          const addressName = await reverseGeocode(newCoords);
          if (addressName) {
            setLocationAddress(addressName);
          }
        },
        (err) => {
          alert("Gagal mendeteksi lokasi GPS: " + err.message);
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    } else {
      alert("Browser Anda tidak mendukung layanan lokasi.");
    }
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();

    const newErrors = {};
    if (!category || !category.trim()) newErrors.category = true;
    if (category === "Lainnya" && !customCategory.trim()) newErrors.customCategory = true;
    if (!description || !description.trim()) newErrors.description = true;
    if (!locationAddress || !locationAddress.trim()) newErrors.locationAddress = true;
    if (!dateVal || !dateVal.trim()) newErrors.dateVal = true;
    if (!timeVal || !timeVal.trim()) newErrors.timeVal = true;

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      setValidationError(
        "Semua kolom wajib (Kategori, Deskripsi, Lokasi, dan Waktu) tidak boleh kosong."
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setFieldErrors({});
    setValidationError("");
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setToast({
        tone: "success",
        title: "Laporan berhasil dikirim!",
        description: "Laporanmu sudah diterima dan akan kami periksa",
      });
      window.scrollTo({ top: 0, behavior: "smooth" });

      setTimeout(() => {
        setToast(null);
      }, 5000);
    }, 600);
  };

  return (
    <div className="report-page">
      <Navbar userName={userName} />

      {toast && (
        <div className="report-page__toast">
          <Toast {...toast} onClose={() => setToast(null)} />
        </div>
      )}

      <div className="report-page__body">
        <Sidebar activeKey="report" onNavigate={onNavigate} />

        <main className="report-page__main">
          {/* Top Magenta Alert Banner */}
          <div className="report-page__banner">
            <div className="report-page__banner-badge">
              <AlertCircle size={16} color="#b01a5b" strokeWidth={2.5} />
            </div>
            <span className="report-page__banner-text">
              Laporan ini anonim, identitas Anda tidak akan ditampilkan kepada publik.
            </span>
          </div>

          {validationError && (
            <div className="report-page__error-banner">
              <AlertTriangle size={18} color="#b3261e" style={{ flexShrink: 0 }} />
              <span>{validationError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="report-page__grid">
            {/* LEFT COLUMN: Kategori Insiden & Deskripsi Kejadian */}
            <div className="report-page__column">
              {/* Kategori Insiden Card */}
              <div className="report-page__card">
                <h3 className="report-page__card-title">Kategori Insiden</h3>
                <div className="report-page__category-grid">
                  {["Catcalling", "Mengikuti", "Kontak Fisik", "Lainnya"].map((cat) => {
                    const isSelected = category === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          setCategory(cat);
                          clearFieldError("category");
                        }}
                        className={`report-page__category-btn ${
                          isSelected ? "report-page__category-btn--selected" : ""
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Category Input (ONLY visible when 'Lainnya' is selected) */}
                {category === "Lainnya" && (
                  <div
                    className={`report-page__input-box ${
                      fieldErrors.customCategory ? "report-page__input-box--error" : ""
                    }`}
                    style={{ marginTop: "4px" }}
                  >
                    <input
                      type="text"
                      className="report-page__input"
                      placeholder="Tuliskan kategori insiden Anda sendiri..."
                      value={customCategory}
                      onChange={(e) => {
                        setCustomCategory(e.target.value);
                        clearFieldError("customCategory");
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Deskripsi Kejadian Card */}
              <div className="report-page__card" style={{ flex: 1 }}>
                <h3 className="report-page__card-title">Deskripsi Kejadian</h3>
                <textarea
                  className={`report-page__textarea ${
                    fieldErrors.description ? "report-page__textarea--error" : ""
                  }`}
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    clearFieldError("description");
                  }}
                  placeholder="Tuliskan kronologi kejadian di sini..."
                  rows={5}
                  style={{ flex: 1 }}
                />
              </div>
            </div>

            {/* RIGHT COLUMN: Lokasi Kejadian (Height aligned with left column) */}
            <div className="report-page__column">
              <div className="report-page__card report-page__card--location">
                <div className="report-page__map-actions">
                  <h3 className="report-page__card-title">Lokasi Kejadian</h3>
                  <button
                    type="button"
                    className="report-page__gps-btn"
                    onClick={handleDetectGps}
                  >
                    <Navigation size={13} />
                    <span>Deteksi GPS</span>
                  </button>
                </div>

                {/* Leaflet Interactive Map */}
                <div className="report-page__map-picker">
                  <MapContainer
                    center={[coords.lat, coords.lng]}
                    zoom={15}
                    scrollWheelZoom={false}
                    style={{ width: "100%", height: "100%" }}
                  >
                    <TileLayer
                      attribution='&copy; OpenStreetMap contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={[coords.lat, coords.lng]} icon={incidentPinIcon}>
                      <Popup>📍 Titik Kejadian Selected</Popup>
                    </Marker>
                    <MapClickListener onSelectLocation={handleMapClick} />
                  </MapContainer>
                </div>

                <div className="report-page__map-tip-wrap">
                  <Info size={14} color="#b01a5b" style={{ flexShrink: 0 }} />
                  <p className="report-page__map-tip">
                    Klik pada peta di atas untuk menandai titik lokasi kejadian secara akurat.
                  </p>
                </div>

                {/* Address Text Input - Automatically syncs with map reverse geocode */}
                <div
                  className={`report-page__input-box ${
                    fieldErrors.locationAddress ? "report-page__input-box--error" : ""
                  }`}
                >
                  <MapPin size={18} color="#b01a5b" style={{ flexShrink: 0 }} />
                  <input
                    type="text"
                    className="report-page__input"
                    value={locationAddress}
                    onChange={(e) => {
                      setLocationAddress(e.target.value);
                      clearFieldError("locationAddress");
                    }}
                    placeholder="Contoh: Stasiun Manggarai, Depan Halte..."
                  />
                </div>
              </div>
            </div>

            {/* FULL-WIDTH CARD 1: Waktu Kejadian (Extends to left edge aligned with Deskripsi) */}
            <div className="report-page__full-card">
              <div className="report-page__card">
                <h3 className="report-page__card-title">Waktu Kejadian</h3>
                <div className="report-page__time-row">
                  {/* Calendar Date Input */}
                  <div
                    className={`report-page__input-box ${
                      fieldErrors.dateVal ? "report-page__input-box--error" : ""
                    }`}
                    style={{ flex: 1.4 }}
                  >
                    <Calendar size={18} color="#b01a5b" style={{ flexShrink: 0 }} />
                    <input
                      type="date"
                      className="report-page__date-input"
                      value={dateVal}
                      onChange={(e) => {
                        setDateVal(e.target.value);
                        clearFieldError("dateVal");
                      }}
                    />
                  </div>

                  {/* Time Input */}
                  <div
                    className={`report-page__input-box ${
                      fieldErrors.timeVal ? "report-page__input-box--error" : ""
                    }`}
                    style={{ flex: 1 }}
                  >
                    <Clock size={18} color="#b01a5b" style={{ flexShrink: 0 }} />
                    <input
                      type="time"
                      className="report-page__time-input-field"
                      value={timeVal}
                      onChange={(e) => {
                        setTimeVal(e.target.value);
                        clearFieldError("timeVal");
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* FULL-WIDTH CARD 2: Bukti Pendukung (Opsional) (Extends to left edge aligned with Deskripsi) */}
            <div className="report-page__full-card">
              <div className="report-page__card">
                <h3 className="report-page__card-title">Bukti Pendukung (Opsional)</h3>
                <label className="report-page__upload-area">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    style={{ display: "none" }}
                    onChange={(e) => setProofFile(e.target.files[0] || null)}
                  />
                  <div className="report-page__camera-badge">
                    <Camera size={20} color="#ffffff" />
                  </div>
                  <span className="report-page__upload-title">
                    {proofFile ? proofFile.name : "Tambah Foto/Bukti (opsional)"}
                  </span>
                  <span className="report-page__upload-sub">
                    Maksimal 3 file, format JPG/PNG
                  </span>
                </label>
              </div>
            </div>

            {/* Full Width Submit Button */}
            <div className="report-page__submit-wrap">
              <button
                type="submit"
                disabled={isSubmitting}
                className="report-page__submit-btn"
              >
                <span>{isSubmitting ? "Mengirim Laporan..." : "Kirim Laporan"}</span>
                <Send size={16} color="#ffffff" />
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
