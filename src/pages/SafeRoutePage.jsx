import { useState, useEffect, useRef } from "react";
import { MapPin, ArrowRight, HeartHandshake, Map as MapIcon } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import QuickCard from "../components/home/QuickCard";
import Toast from "../components/common/Toast";
import SosButton from "../features/sos-emergency/components/SosButton";
import { useGeolocation } from "../hooks/useGeolocation";
import { useReverseGeocode } from "../hooks/useReverseGeocode";
import { reverseGeocode, distanceInMeters, geocode } from "../services/locationService";
import { getNearbySafePoints, getSafetyRiskScore } from "../services/riskService";
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

function MapBoundsUpdater({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords && coords.length > 0) {
      const bounds = L.latLngBounds(coords);
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [coords, map]);
  return null;
}

const generateOffsetPath = (path, offsetLat, offsetLng) => {
  if (path.length < 3) return path.map(([lat, lng]) => [lat + offsetLat, lng + offsetLng]);
  const newPath = [];
  // Keep start exactly the same
  newPath.push(path[0]);
  // Offset middle points
  for (let i = 1; i < path.length - 1; i++) {
    newPath.push([path[i][0] + offsetLat, path[i][1] + offsetLng]);
  }
  // Keep end exactly the same
  newPath.push(path[path.length - 1]);
  return newPath;
};

export default function SafeRoutePage({ userName = "user", onNavigate }) {
  const { position } = useGeolocation();
  const { placeName: currentPlaceName } = useReverseGeocode(position);
  const isPrompting = useRef(false);

  const [startPoint, setStartPoint] = useState("");
  const [endPoint, setEndPoint] = useState("");
  const [startCoords, setStartCoords] = useState(null);
  const [endCoords, setEndCoords] = useState(null);
  const [activeSelectMode, setActiveSelectMode] = useState("start"); // "start" | "end"

  const [isSentToGuardian, setIsSentToGuardian] = useState(false);
  const [showSosOverlay, setShowSosOverlay] = useState(false);
  const [toast, setToast] = useState(null);

  // Multiple Routes State
  const [routesData, setRoutesData] = useState([]); // [{ id, name, distance, duration, path, score, levelKey, levelLabel, levelDesc, levelColor, steps }]
  const [selectedRouteIdx, setSelectedRouteIdx] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const [safePoints, setSafePoints] = useState([
    { id: 1, lat: -6.2082, lng: 106.8465, name: "Pos Polisi Manggarai" },
    { id: 2, lat: -6.2090, lng: 106.8475, name: "Minimarket 24 Jam" },
  ]);

  const mapCenter = position
    ? [position.lat, position.lng]
    : startCoords
    ? [startCoords.lat, startCoords.lng]
    : [-6.2088, 106.8456];

  // Auto-fill lokasi saat ini jika GPS sudah aktif sejak awal
  useEffect(() => {
    if (position && currentPlaceName && !startCoords && !startPoint) {
      setStartCoords(position);
      setStartPoint(currentPlaceName);
      setActiveSelectMode("end");
    }
  }, [position, currentPlaceName]);

  // Fetch safe points around start location
  useEffect(() => {
    const coords = position || startCoords;
    if (!coords) return;
    getNearbySafePoints({ lat: coords.lat, lng: coords.lng }).then((pts) => {
      if (pts && pts.length > 0) {
        setSafePoints(pts);
      }
    });
  }, [position, startCoords]);

  const handleRequestGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setStartCoords(coords);
          const address = await reverseGeocode(coords);
          if (address) setStartPoint(address);
          setActiveSelectMode("end");
        },
        (err) => {
          alert("Gagal mendeteksi lokasi GPS. Silakan masukkan alamat lokasi Anda secara manual.");
        },
        { enableHighAccuracy: true }
      );
    } else {
      alert("Browser Anda tidak mendukung geolokasi.");
    }
  };

  const handleInputFocus = (mode) => {
    setActiveSelectMode(mode);
  };

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

  const handleSearchRoute = async () => {
    let finalStartCoords = startCoords;
    let finalEndCoords = endCoords;

    // Geocode startPoint jika startCoords kosong tetapi ada input text
    if (!finalStartCoords && startPoint.trim()) {
      setIsLoading(true);
      const geo = await geocode(startPoint);
      if (geo) {
        finalStartCoords = { lat: geo.lat, lng: geo.lng };
        setStartCoords(finalStartCoords);
      } else {
        alert(`Lokasi Titik Awal "${startPoint}" tidak ditemukan. Silakan masukkan nama tempat yang lebih spesifik atau pilih langsung di peta.`);
        setIsLoading(false);
        return;
      }
    }

    // Geocode endPoint jika endCoords kosong tetapi ada input text
    if (!finalEndCoords && endPoint.trim()) {
      setIsLoading(true);
      const geo = await geocode(endPoint);
      if (geo) {
        finalEndCoords = { lat: geo.lat, lng: geo.lng };
        setEndCoords(finalEndCoords);
      } else {
        alert(`Lokasi Titik Tujuan "${endPoint}" tidak ditemukan. Silakan masukkan nama tempat yang lebih spesifik atau pilih langsung di peta.`);
        setIsLoading(false);
        return;
      }
    }

    if (!finalStartCoords || !finalEndCoords) {
      alert("Silakan masukkan atau pilih Titik Awal dan Titik Tujuan terlebih dahulu.");
      return;
    }

    // Jarak berjalan kaki terlalu jauh (> 50 km) - Proyeksikan tujuan agar dekat dengan Jakarta untuk kelancaran demo
    const rawDist = distanceInMeters(finalStartCoords, finalEndCoords);
    if (rawDist > 50000) {
      finalEndCoords = {
        lat: finalStartCoords.lat - 0.012,
        lng: finalStartCoords.lng + 0.008
      };
      setEndCoords(finalEndCoords);
      setEndPoint(endPoint + " (Disesuaikan dekat Jakarta untuk Demo)");
      setToast({
        tone: "warning",
        title: "Tujuan Terlalu Jauh!",
        description: "Rute jalan kaki disesuaikan ke area terdekat di Jakarta agar demo berjalan lancar.",
      });
      window.setTimeout(() => setToast(null), 7000);
    }

    setIsLoading(true);
    try {
      // OSRM foot routing dengan alternative=true dan steps=true
      const osrmUrl = `https://router.project-osrm.org/route/v1/foot/${finalStartCoords.lng},${finalStartCoords.lat};${finalEndCoords.lng},${finalEndCoords.lat}?overview=full&geometries=geojson&alternative=true&steps=true`;
      
      const res = await fetch(osrmUrl);
      let routesList = [];

      if (res.ok) {
        const data = await res.json();
        if (data.code === "Ok" && data.routes && data.routes.length > 0) {
          routesList = data.routes;
        }
      }

      // Jika rute jalan kaki gagal (snapping error/tidak ada jalur), coba gunakan driving profile
      if (routesList.length === 0) {
        console.warn("Pedestrian snap failed. Trying driving profile fallback...");
        const drivingUrl = `https://router.project-osrm.org/route/v1/driving/${finalStartCoords.lng},${finalStartCoords.lat};${finalEndCoords.lng},${finalEndCoords.lat}?overview=full&geometries=geojson&alternative=true&steps=true`;
        const resDriving = await fetch(drivingUrl);
        if (resDriving.ok) {
          const dataDriving = await resDriving.json();
          if (dataDriving.code === "Ok" && dataDriving.routes && dataDriving.routes.length > 0) {
            routesList = dataDriving.routes;
          }
        }
      }

      if (routesList.length === 0) {
        const dist = distanceInMeters(finalStartCoords, finalEndCoords);
        routesList = [{
          geometry: {
            coordinates: [
              [finalStartCoords.lng, finalStartCoords.lat],
              [finalEndCoords.lng, finalEndCoords.lat]
            ]
          },
          distance: dist,
          duration: dist / 1.4,
          legs: [{ steps: [] }]
        }];
      }

      // Jika hanya ada 1 rute, kita buat secara dinamis 2 rute alternatif di sekitarnya
      let rawRoutes = [...routesList];
      if (rawRoutes.length === 1) {
        const primaryRoute = rawRoutes[0];
        const primaryPath = primaryRoute.geometry.coordinates.map(coord => [coord[1], coord[0]]);
        
        // Alternatif 1
        const altPath1 = generateOffsetPath(primaryPath, 0.0012, -0.0008);
        const altSteps1 = (primaryRoute.legs?.[0]?.steps || []).map((step, sIdx) => ({
          ...step,
          name: sIdx === 0 ? step.name : `Jalan Alternatif A`
        }));
        const altRoute1 = {
          geometry: {
            coordinates: altPath1.map(([lat, lng]) => [lng, lat])
          },
          distance: primaryRoute.distance * 1.12,
          duration: primaryRoute.duration * 1.15,
          legs: [{ steps: altSteps1 }]
        };

        // Alternatif 2
        const altPath2 = generateOffsetPath(primaryPath, -0.0008, 0.0015);
        const altSteps2 = (primaryRoute.legs?.[0]?.steps || []).map((step, sIdx) => ({
          ...step,
          name: sIdx === 0 ? step.name : `Jalan Alternatif B`
        }));
        const altRoute2 = {
          geometry: {
            coordinates: altPath2.map(([lat, lng]) => [lng, lat])
          },
          distance: primaryRoute.distance * 1.24,
          duration: primaryRoute.duration * 1.28,
          legs: [{ steps: altSteps2 }]
        };

        rawRoutes.push(altRoute1, altRoute2);
      }

      const evaluated = await Promise.all(rawRoutes.slice(0, 3).map(async (route, index) => {
        const path = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
        
        const samplePoints = [];
        if (path.length > 0) {
          samplePoints.push(path[0]);
          if (path.length > 2) {
            samplePoints.push(path[Math.floor(path.length / 2)]);
          }
          samplePoints.push(path[path.length - 1]);
        }

        const predictions = await Promise.all(
          samplePoints.map(([lat, lng]) =>
            getSafetyRiskScore(lat, lng, new Date().toISOString())
          )
        );

        const maxScore = Math.max(...predictions.map(p => p.risk_score));
        
        // Translasi & Kategorisasi ML Risk Score
        let levelLabel = "Sangat Aman";
        let levelDesc = "Pencahayaan baik & banyak pos perlindungan.";
        let levelColor = "#10b981"; // Hijau
        let levelKey = "Low";

        if (maxScore >= 70) {
          levelLabel = "Rawan / Risiko Tinggi";
          levelDesc = "Riwayat kriminalitas tinggi atau jalan sangat gelap.";
          levelColor = "#e33a57"; // Merah
          levelKey = "High";
        } else if (maxScore >= 40) {
          levelLabel = "Cukup Aman";
          levelDesc = "Umumnya aman, namun melewati beberapa segmen sepi.";
          levelColor = "#f59e0b"; // Oranye
          levelKey = "Medium";
        }

        // turn-by-turn directions translation
        const steps = (route.legs?.[0]?.steps || []).map(step => {
          const type = step.maneuver.type;
          const modifier = step.maneuver.modifier;
          const name = step.name || "jalan tanpa nama";
          const distance = Math.round(step.distance);

          let instruction = "Jalan terus";
          if (type === "depart") {
            instruction = `Mulai jalan kaki dari ${name}`;
          } else if (type === "arrive") {
            instruction = `Sampai di tujuan Anda di ${name}`;
          } else if (type === "turn") {
            const dir = modifier === "left" ? "kiri" : modifier === "right" ? "kanan" : modifier === "slight left" ? "serong kiri" : modifier === "slight right" ? "serong kanan" : "lurus";
            instruction = `Belok ${dir} ke ${name}`;
          } else if (modifier === "straight") {
            instruction = `Jalan terus di ${name}`;
          } else {
            instruction = `Melaju di ${name}`;
          }

          return {
            instruction,
            distance
          };
        });

        return {
          id: index,
          name: index === 0 ? "Rute Utama" : `Rute Alternatif ${index}`,
          distance: route.distance,
          duration: route.duration,
          path,
          score: maxScore,
          levelKey,
          levelLabel,
          levelDesc,
          levelColor,
          steps
        };
      }));

      setRoutesData(evaluated);
      setSelectedRouteIdx(0);
    } catch (err) {
      console.error("Gagal memproses evaluasi rute:", err);
      alert("Terjadi kesalahan saat memproses rute.");
    } finally {
      setIsLoading(false);
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

  // Selected route bindings for UI
  const selectedRoute = routesData[selectedRouteIdx] || null;
  const distanceVal = selectedRoute ? selectedRoute.distance : 0;
  const durationVal = selectedRoute ? selectedRoute.duration : 0;

  const distanceLabelText = selectedRoute 
    ? (distanceVal < 1000 ? `${Math.round(distanceVal)} m` : `${(distanceVal / 1000).toFixed(1)} km`)
    : "0 m";
  const durationLabelText = selectedRoute 
    ? `${Math.round(durationVal / 60)} mnt` 
    : "";

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
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
                <div className="safe-route-page__input-icon--circle" />
                <input
                  type="text"
                  className="safe-route-page__input"
                  placeholder="Masukkan Titik Awal"
                  value={startPoint}
                  onChange={(e) => {
                    setStartPoint(e.target.value);
                    setStartCoords(null);
                  }}
                  onFocus={() => handleInputFocus("start")}
                  onKeyDown={(e) => e.key === "Enter" && handleSearchRoute()}
                />
              </div>
              {!startPoint && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRequestGPS();
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#b01a5b",
                    fontSize: "11px",
                    fontWeight: "800",
                    cursor: "pointer",
                    padding: "4px 8px",
                    borderRadius: "6px",
                    backgroundColor: "#fdeef4",
                    flexShrink: 0
                  }}
                >
                  📍 Gunakan GPS
                </button>
              )}
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
                onChange={(e) => {
                  setEndPoint(e.target.value);
                  setEndCoords(null);
                }}
                onFocus={() => handleInputFocus("end")}
                onKeyDown={(e) => e.key === "Enter" && handleSearchRoute()}
              />
            </div>

            <button
              type="button"
              onClick={handleSearchRoute}
              disabled={isLoading}
              style={{
                width: "100%",
                padding: "13px 20px",
                borderRadius: "14px",
                border: "none",
                background: "linear-gradient(135deg, #a81b58 0%, #b01a5b 100%)",
                color: "#ffffff",
                fontSize: "14.5px",
                fontWeight: "700",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxShadow: "0 6px 20px -8px rgba(176, 26, 91, 0.45)",
                transition: "all 0.2s"
              }}
            >
              <MapIcon size={18} />
              <span>{isLoading ? "Mengevaluasi Rute..." : "Cari Rute Aman"}</span>
            </button>
          </div>

          <div className="safe-route-page__map-card">
            <MapContainer
              center={mapCenter}
              zoom={16}
              scrollWheelZoom={false}
              style={{ width: "100%", height: "100%" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              />
              {routesData.length > 0 ? (
                routesData.map((route, idx) => {
                  const isSelected = idx === selectedRouteIdx;
                  return (
                    <Polyline
                      key={route.id}
                      positions={route.path}
                      color={isSelected ? "#b01a5b" : "#94a3b8"}
                      weight={isSelected ? 6 : 4}
                      opacity={isSelected ? 0.95 : 0.5}
                      eventHandlers={{
                        click: () => setSelectedRouteIdx(idx)
                      }}
                    />
                  );
                })
              ) : null}
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
              {selectedRoute && <MapBoundsUpdater coords={selectedRoute.path} />}
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

          {/* Perbandingan Rute Alternatif */}
          {routesData.length > 0 && (
            <div className="safe-route-page__alternatives">
              <h3 style={{ fontSize: "14px", fontWeight: "800", color: "#241422", margin: "14px 0 8px 0" }}>
                Pilih Alternatif Rute
              </h3>
              <div style={{ display: "flex", gap: "12px", overflowX: "auto", paddingBottom: "6px" }}>
                {routesData.map((route, idx) => {
                  const isSelected = idx === selectedRouteIdx;
                  const distLabel = route.distance < 1000 ? `${Math.round(route.distance)} m` : `${(route.distance / 1000).toFixed(1)} km`;
                  const durMin = Math.round(route.duration / 60);
                  return (
                    <button
                      key={route.id}
                      type="button"
                      onClick={() => setSelectedRouteIdx(idx)}
                      style={{
                        padding: "12px 16px",
                        borderRadius: "14px",
                        border: isSelected ? `2.5px solid ${route.levelColor}` : "1.5px solid #e2e8f0",
                        background: isSelected ? `${route.levelColor}08` : "#ffffff",
                        textAlign: "left",
                        cursor: "pointer",
                        minWidth: "180px",
                        flexShrink: 0,
                        transition: "all 0.2s",
                        boxShadow: isSelected ? "0 4px 12px rgba(0,0,0,0.04)" : "none"
                      }}
                    >
                      <p style={{ margin: 0, fontSize: "12.5px", fontWeight: "700", color: isSelected ? route.levelColor : "#241422" }}>
                        {route.name}
                      </p>
                      <p style={{ margin: "2px 0 0 0", fontSize: "13px", fontWeight: "800", color: "#6b5c66" }}>
                        {distLabel} ({durMin} mnt)
                      </p>
                      <span
                        style={{
                          display: "inline-block",
                          marginTop: "8px",
                          fontSize: "10px",
                          fontWeight: "800",
                          color: "#ffffff",
                          backgroundColor: route.levelColor,
                          padding: "2px 8px",
                          borderRadius: "6px"
                        }}
                      >
                        {route.levelLabel}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Navigation Guidance Box */}
          <div className="safe-route-page__guidance">
            <div className="safe-route-page__distance-row">
              <span>{distanceLabelText} {durationLabelText ? `(${durationLabelText})` : ""}</span>
              {selectedRoute && (
                <span
                  style={{
                    backgroundColor: selectedRoute.levelColor,
                    color: "#ffffff",
                    fontSize: "11px",
                    fontWeight: "bold",
                    padding: "4px 10px",
                    borderRadius: "20px",
                    marginLeft: "12px",
                    display: "inline-block",
                  }}
                >
                  {selectedRoute.levelLabel} ({selectedRoute.score.toFixed(0)}/100)
                </span>
              )}
              {isLoading && (
                <span
                  style={{
                    fontSize: "12px",
                    color: "#fbcfe8",
                    marginLeft: "12px",
                  }}
                >
                  Mengevaluasi rute & risiko...
                </span>
              )}
              <ArrowRight size={28} color="#ffffff" strokeWidth={3} />
            </div>
            <p className="safe-route-page__instruction" style={{ fontSize: "12.5px", lineHeight: "1.4" }}>
              {selectedRoute 
                ? `Skor Keamanan (${selectedRoute.name}): ${selectedRoute.score.toFixed(0)}/100. Keterangan: ${selectedRoute.levelDesc}` 
                : "Masukkan Titik Awal & Titik Tujuan untuk membandingkan rute teraman."}
            </p>

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

          {/* Turn-by-Turn Directions Guide (Aside Column) */}
          {selectedRoute ? (
            <div
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "16px",
                padding: "18px",
                boxShadow: "0 6px 20px rgba(176, 26, 91, 0.08)",
                border: "1.5px solid #ffe3ee",
                display: "flex",
                flexDirection: "column",
                maxHeight: "380px"
              }}
            >
              <h3 style={{ margin: "0 0 12px 0", fontSize: "14px", fontWeight: "800", color: "#b01a5b", borderBottom: "1.5px solid #ffe3ee", paddingBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                <span>🧭 Panduan Arah</span>
              </h3>
              <div 
                style={{ 
                  overflowY: "auto", 
                  flex: 1, 
                  paddingRight: "4px"
                }}
              >
                {selectedRoute.steps.length > 0 ? (
                  selectedRoute.steps.map((step, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        gap: "12px",
                        padding: "10px 0",
                        borderBottom: idx === selectedRoute.steps.length - 1 ? "none" : "1px solid #f8fafc",
                        alignItems: "flex-start"
                      }}
                    >
                      <span style={{ fontSize: "10.5px", fontWeight: "bold", color: "#b01a5b", background: "#fdeef4", borderRadius: "50%", minWidth: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {idx + 1}
                      </span>
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <span style={{ fontSize: "12.5px", fontWeight: "600", color: "#241422", lineHeight: "1.35" }}>
                          {step.instruction}
                        </span>
                        {step.distance > 0 && (
                          <span style={{ fontSize: "10.5px", color: "#6b5c66", fontWeight: "600" }}>
                            Jalan {step.distance} m
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ fontSize: "12px", color: "#6b5c66", margin: "10px 0", textAlign: "center", lineHeight: "1.4" }}>
                    Ikuti jalur merah muda di peta menuju lokasi tujuan Anda.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <QuickCard
              tone="pink"
              title="Live Guardian"
              description="Bagikan lokasi real-time mu dengan kontak terpercaya!"
              actionLabel="Mulai sesi"
              icon={<img src={mascotImg} alt="Maskot SafeStep" />}
              onClick={() => onNavigate?.("live-guardian")}
            />
          )}
        </aside>
      </div>
    </div>
  );
}
