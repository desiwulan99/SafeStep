import { useState, useEffect } from "react";
import { MapPin, ArrowRight, HeartHandshake, Map as MapIcon } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import QuickCard from "../components/home/QuickCard";
import Toast from "../components/common/Toast";
import SosButton from "../features/sos-emergency/components/SosButton";
import { useGeolocation } from "../hooks/useGeolocation";
import { reverseGeocode, distanceInMeters } from "../services/locationService";
import mascotImg from "../assets/images/mascot.svg";
import "./SafeRoutePage.css";

const startMarkerIcon = L.divIcon({
  className: "map-pin map-pin--user",
  html: '<span class="map-pin__dot" style="background: #2563eb; border: 3px solid #ffffff;"></span>',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

const endMarkerIcon = L.divIcon({
  className: "map-pin map-pin--user",
  html: '<span class="map-pin__dot" style="background: #a81b58; border: 3px solid #ffffff;"></span>',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

const safePointIcon = L.divIcon({
  className: "map-pin map-pin--safe",
  html: '<span class="map-pin__dot"></span>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

function MapRouteClickListener({ onSelectPoint }) {
  useMapEvents({
    click(e) {
      onSelectPoint({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

export default function SafeRoutePage({ userName = "user", onNavigate }) {
  const { position } = useGeolocation();

  const [startPoint, setStartPoint] = useState("");
  const [endPoint, setEndPoint] = useState("");
  const [startCoords, setStartCoords] = useState(null);
  const [endCoords, setEndCoords] = useState(null);
  const [activeSelectMode, setActiveSelectMode] = useState("start"); // "start" | "end"

  const [isSentToGuardian, setIsSentToGuardian] = useState(false);
  const [showSosOverlay, setShowSosOverlay] = useState(false);
  const [toast, setToast] = useState(null);

  const mapCenter = position
    ? [position.lat, position.lng]
    : startCoords
    ? [startCoords.lat, startCoords.lng]
    : [-6.2088, 106.8456];

  const routePolyline =
    startCoords && endCoords
      ? [
          [startCoords.lat, startCoords.lng],
          [endCoords.lat, endCoords.lng],
        ]
      : [];

  const getDistanceLabel = () => {
    if (!startCoords || !endCoords) return "0 m";
    const dist = distanceInMeters(startCoords, endCoords);
    if (dist < 1000) {
      return `${Math.round(dist)} m`;
    }
    return `${(dist / 1000).toFixed(1)} km`;
  };

  const distanceLabel = getDistanceLabel();

  const safePoints = [
    { id: 1, lat: -6.2082, lng: 106.8465, name: "Pos Polisi Manggarai" },
    { id: 2, lat: -6.2090, lng: 106.8475, name: "Minimarket 24 Jam" },
  ];

  const handleMapClick = async (clickedCoords) => {
    if (activeSelectMode === "start") {
      setStartCoords(clickedCoords);
      const addressName = await reverseGeocode(clickedCoords);
      if (addressName) setStartPoint(addressName);
      setActiveSelectMode("end"); 
    } else {
      setEndCoords(clickedCoords);
      const addressName = await reverseGeocode(clickedCoords);
      if (addressName) setEndPoint(addressName);
    }
  };

  const handleSosSent = () => {
    setShowSosOverlay(true);
    setToast({
      tone: "success",
      title: "SOS Berhasil Dikirim!",
      description: "Lokasimu sudah dibagikan ke semua kontak darurat.",
    });
    window.setTimeout(() => setToast(null), 5000);
  };

  const handleToggleGuardian = () => {
    setIsSentToGuardian(true);
    setToast({
      tone: "success",
      title: "Notifikasi terkirim kepada Live Guardian",
      description: "Status perjalananmu kini dipantau secara langsung.",
    });

    setTimeout(() => {
      setIsSentToGuardian(false);
    }, 3000);

    window.setTimeout(() => setToast(null), 5000);
  };

  return (
    <div className="safe-route-page">
      <Navbar userName={userName} />

      {toast && (
        <div className="safe-route-page__toast">
          <Toast {...toast} onClose={() => setToast(null)} />
        </div>
      )}

      <div className="safe-route-page__body">
        <Sidebar activeKey="safe-route" onNavigate={onNavigate} />

        <main className="safe-route-page__main">
          <div className="safe-route-page__inputs">
            <div className="safe-route-page__select-mode">
              <span className="safe-route-page__mode-label">Pilih di peta untuk:</span>
              <button
                type="button"
                className={`safe-route-page__mode-btn ${
                  activeSelectMode === "start" ? "safe-route-page__mode-btn--active" : ""
                }`}
                onClick={() => setActiveSelectMode("start")}
              >
                <div className="safe-route-page__input-icon--circle" style={{ width: 12, height: 12 }} />
                <span>Titik Awal</span>
              </button>
              <button
                type="button"
                className={`safe-route-page__mode-btn ${
                  activeSelectMode === "end" ? "safe-route-page__mode-btn--active" : ""
                }`}
                onClick={() => setActiveSelectMode("end")}
              >
                <MapPin size={14} />
                <span>Titik Tujuan</span>
              </button>
            </div>

            <div
              className={`safe-route-page__input-box ${
                activeSelectMode === "start" ? "safe-route-page__input-box--active" : ""
              }`}
              onClick={() => setActiveSelectMode("start")}
            >
              <div className="safe-route-page__input-icon--circle" />
              <input
                type="text"
                className="safe-route-page__input"
                placeholder="Masukkan Titik Awal"
                value={startPoint}
                onChange={(e) => setStartPoint(e.target.value)}
                onFocus={() => setActiveSelectMode("start")}
              />
            </div>

            <div
              className={`safe-route-page__input-box ${
                activeSelectMode === "end" ? "safe-route-page__input-box--active" : ""
              }`}
              onClick={() => setActiveSelectMode("end")}
            >
              <MapPin size={18} color="#a81b58" style={{ flexShrink: 0 }} />
              <input
                type="text"
                className="safe-route-page__input"
                placeholder="Masukkan Titik Tujuan"
                value={endPoint}
                onChange={(e) => setEndPoint(e.target.value)}
                onFocus={() => setActiveSelectMode("end")}
              />
            </div>
          </div>

          <div className="safe-route-page__map-card">
            <MapContainer
              center={mapCenter}
              zoom={16}
              scrollWheelZoom={false}
              style={{ width: "100%", height: "100%" }}
            >
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {routePolyline.length > 0 && (
                <Polyline positions={routePolyline} color="#2563eb" weight={5} opacity={0.8} />
              )}
              {startCoords && (
                <Marker position={[startCoords.lat, startCoords.lng]} icon={startMarkerIcon}>
                  <Popup>Titik Awal: {startPoint || "Lokasi Dipilih"}</Popup>
                </Marker>
              )}
              {endCoords && (
                <Marker position={[endCoords.lat, endCoords.lng]} icon={endMarkerIcon}>
                  <Popup>Titik Tujuan: {endPoint || "Lokasi Dipilih"}</Popup>
                </Marker>
              )}
              {safePoints.map((sp) => (
                <Marker key={sp.id} position={[sp.lat, sp.lng]} icon={safePointIcon}>
                  <Popup>{sp.name}</Popup>
                </Marker>
              ))}
              <MapRouteClickListener onSelectPoint={handleMapClick} />
            </MapContainer>

            {showSosOverlay && (
              <div className="safe-route-page__map-overlay">
                <div className="safe-route-page__map-overlay-badge">!</div>
                <span className="safe-route-page__map-overlay-text">
                  SOS: Notifikasi terkirim kepada Live Guardian
                </span>
              </div>
            )}
          </div>

          {/* Navigation Guidance Box */}
          <div className="safe-route-page__guidance">
            <div className="safe-route-page__distance-row">
              <span>{distanceLabel}</span>
              <ArrowRight size={28} color="#ffffff" strokeWidth={3} />
            </div>
            <p className="safe-route-page__instruction">Menuju Titik Tujuan</p>

            <button
              type="button"
              className={`safe-route-page__guardian-btn ${
                isSentToGuardian ? "safe-route-page__guardian-btn--sent" : ""
              }`}
              onClick={handleToggleGuardian}
            >
              <HeartHandshake
                size={16}
                color={isSentToGuardian ? "#a81b58" : "#ffffff"}
              />
              <span>
                {isSentToGuardian ? "Terkirim ke Live Guardian" : "Kirim ke Live Guardian"}
              </span>
            </button>
          </div>
        </main>

        <aside className="safe-route-page__side">
          <div className="safe-route-page__sos-container">
            <SosButton position={position} userId="current-user" onSent={handleSosSent} />
          </div>

          <QuickCard
            tone="pink"
            title="Live Guardian"
            description="Bagikan lokasi real-time mu dengan kontak terpercaya!"
            actionLabel="Mulai sesi"
            icon={<img src={mascotImg} alt="Maskot SafeStep" />}
            onClick={() => onNavigate?.("live-guardian")}
          />
        </aside>
      </div>
    </div>
  );
}
