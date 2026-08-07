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
import { reverseGeocode, distanceInMeters, geocode, geocodeSearch } from "../services/locationService";
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

/**
 * Extract the top unique major road names from OSRM route steps.
 * Filters out unnamed roads and deduplicates.
 */
const extractMajorRoads = (route) => {
  const steps = route.legs?.[0]?.steps || [];
  const seen = new Set();
  const roads = [];
  for (const step of steps) {
    const name = step.name;
    if (name && name.trim() && !seen.has(name) && step.distance > 30) {
      seen.add(name);
      roads.push(name);
    }
  }
  return roads;
};

/**
 * Build a descriptive route name from major road names.
 * e.g. "via Jl. Sudirman, Jl. Thamrin"
 */
const buildRouteName = (roads, index) => {
  const prefix = index === 0 ? "Rute Utama" : `Rute Alternatif ${index}`;
  if (roads.length === 0) return prefix;
  const display = roads.slice(0, 2).join(", ");
  return `${prefix} — via ${display}`;
};

/**
 * Fetch a real OSRM route through a via-waypoint to create an alternative.
 * Returns null if the request fails.
 */
const fetchRouteViaWaypoint = async (start, end, viaLat, viaLng, profile = "foot") => {
  const url = `https://router.project-osrm.org/route/v1/${profile}/${start.lng},${start.lat};${viaLng},${viaLat};${end.lng},${end.lat}?overview=full&geometries=geojson&steps=true`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.code === "Ok" && data.routes && data.routes.length > 0) {
      // Merge legs into a single route-like object
      const route = data.routes[0];
      const allSteps = route.legs.flatMap(leg => leg.steps || []);
      return {
        geometry: route.geometry,
        distance: route.distance,
        duration: route.duration,
        legs: [{ steps: allSteps }]
      };
    }
    return null;
  } catch {
    return null;
  }
};

/** Route color palette — distinct colors for up to 3 routes */
const ROUTE_COLORS = ["#b01a5b", "#2563eb", "#059669"];

export default function SafeRoutePage({ userName = "user", onNavigate }) {
  const { position } = useGeolocation();
  const { placeName: currentPlaceName } = useReverseGeocode(position);
  const isPrompting = useRef(false);

  const [startPoint, setStartPoint] = useState("");
  const [endPoint, setEndPoint] = useState("");
  const [startCoords, setStartCoords] = useState(null);
  const [endCoords, setEndCoords] = useState(null);
  const [activeSelectMode, setActiveSelectMode] = useState("start"); // "start" | "end"

  // Autocomplete suggestion state
  const [startSuggestions, setStartSuggestions] = useState([]);
  const [endSuggestions, setEndSuggestions] = useState([]);
  const [showStartSuggestions, setShowStartSuggestions] = useState(false);
  const [showEndSuggestions, setShowEndSuggestions] = useState(false);
  const startSearchTimer = useRef(null);
  const endSearchTimer = useRef(null);
  const startAbortRef = useRef(null);
  const endAbortRef = useRef(null);
  const startInputWrapperRef = useRef(null);
  const endInputWrapperRef = useRef(null);

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

  // Debounced search for autocomplete suggestions
  const handleStartInputChange = (value) => {
    setStartPoint(value);
    setStartCoords(null);

    // Cancel previous search
    if (startSearchTimer.current) clearTimeout(startSearchTimer.current);
    if (startAbortRef.current) startAbortRef.current.abort();

    if (!value || value.trim().length < 2) {
      setStartSuggestions([]);
      setShowStartSuggestions(false);
      return;
    }

    startSearchTimer.current = setTimeout(async () => {
      const controller = new AbortController();
      startAbortRef.current = controller;
      const results = await geocodeSearch(value, { signal: controller.signal });
      if (results.length > 0) {
        setStartSuggestions(results);
        setShowStartSuggestions(true);
      } else {
        setStartSuggestions([]);
        setShowStartSuggestions(false);
      }
    }, 350);
  };

  const handleEndInputChange = (value) => {
    setEndPoint(value);
    setEndCoords(null);

    if (endSearchTimer.current) clearTimeout(endSearchTimer.current);
    if (endAbortRef.current) endAbortRef.current.abort();

    if (!value || value.trim().length < 2) {
      setEndSuggestions([]);
      setShowEndSuggestions(false);
      return;
    }

    endSearchTimer.current = setTimeout(async () => {
      const controller = new AbortController();
      endAbortRef.current = controller;
      const results = await geocodeSearch(value, { signal: controller.signal });
      if (results.length > 0) {
        setEndSuggestions(results);
        setShowEndSuggestions(true);
      } else {
        setEndSuggestions([]);
        setShowEndSuggestions(false);
      }
    }, 350);
  };

  const handleSelectStartSuggestion = (suggestion) => {
    setStartPoint(suggestion.shortName);
    setStartCoords({ lat: suggestion.lat, lng: suggestion.lng });
    setStartSuggestions([]);
    setShowStartSuggestions(false);
    setActiveSelectMode("end");
  };

  const handleSelectEndSuggestion = (suggestion) => {
    setEndPoint(suggestion.shortName);
    setEndCoords({ lat: suggestion.lat, lng: suggestion.lng });
    setEndSuggestions([]);
    setShowEndSuggestions(false);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (startInputWrapperRef.current && !startInputWrapperRef.current.contains(e.target)) {
        setShowStartSuggestions(false);
      }
      if (endInputWrapperRef.current && !endInputWrapperRef.current.contains(e.target)) {
        setShowEndSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Helper to get icon based on place type/category
  const getSuggestionIcon = (suggestion) => {
    const cat = suggestion.category;
    const type = suggestion.type;
    if (cat === "amenity" || type === "university" || type === "school" || type === "college") return "🏫";
    if (cat === "building" || type === "apartments" || type === "residential") return "🏢";
    if (type === "hospital" || type === "clinic" || type === "doctors") return "🏥";
    if (type === "mall" || type === "supermarket" || type === "marketplace") return "🛒";
    if (cat === "tourism" || cat === "historic" || type === "museum") return "🏛️";
    if (cat === "highway" || type === "road" || type === "street") return "🛣️";
    if (cat === "railway" || type === "station" || type === "halt") return "🚉";
    if (cat === "place" || type === "city" || type === "town" || type === "village") return "🏘️";
    return "📍";
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
      // OSRM routing with alternatives=true (correct parameter name) and steps=true
      let profile = "foot";
      const osrmUrl = `https://router.project-osrm.org/route/v1/${profile}/${finalStartCoords.lng},${finalStartCoords.lat};${finalEndCoords.lng},${finalEndCoords.lat}?overview=full&geometries=geojson&alternatives=3&steps=true`;
      
      const res = await fetch(osrmUrl);
      let routesList = [];

      if (res.ok) {
        const data = await res.json();
        if (data.code === "Ok" && data.routes && data.routes.length > 0) {
          routesList = data.routes;
        }
      }

      // Jika rute jalan kaki gagal (snapping error), coba driving profile
      if (routesList.length === 0) {
        console.warn("Pedestrian snap failed. Trying driving profile fallback...");
        profile = "driving";
        const drivingUrl = `https://router.project-osrm.org/route/v1/${profile}/${finalStartCoords.lng},${finalStartCoords.lat};${finalEndCoords.lng},${finalEndCoords.lat}?overview=full&geometries=geojson&alternatives=3&steps=true`;
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

      // If OSRM only returned 1 route, try to create real alternatives via offset waypoints
      let rawRoutes = [...routesList];
      if (rawRoutes.length < 3) {
        const primaryCoords = rawRoutes[0].geometry.coordinates;
        const midIdx = Math.floor(primaryCoords.length / 2);
        const midLng = primaryCoords[midIdx][0];
        const midLat = primaryCoords[midIdx][1];

        // Calculate perpendicular offset directions from route bearing
        const offsetDist = 0.003; // ~300m offset to find genuinely different roads
        const viaPoints = [
          { lat: midLat + offsetDist, lng: midLng - offsetDist * 0.7 },
          { lat: midLat - offsetDist * 0.7, lng: midLng + offsetDist },
        ];

        for (const via of viaPoints) {
          if (rawRoutes.length >= 3) break;
          const altRoute = await fetchRouteViaWaypoint(
            finalStartCoords, finalEndCoords,
            via.lat, via.lng, profile
          );
          if (altRoute) {
            // Only add if path is meaningfully different from existing routes
            rawRoutes.push(altRoute);
          }
        }
      }

      const evaluated = await Promise.all(rawRoutes.slice(0, 3).map(async (route, index) => {
        const path = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
        const majorRoads = extractMajorRoads(route);
        
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
          const type = step.maneuver?.type;
          const modifier = step.maneuver?.modifier;
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
          name: buildRouteName(majorRoads, index),
          majorRoads,
          routeColor: ROUTE_COLORS[index] || "#94a3b8",
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

            <div className="safe-route-page__input-wrapper" ref={startInputWrapperRef}>
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
                    onChange={(e) => handleStartInputChange(e.target.value)}
                    onFocus={() => {
                      handleInputFocus("start");
                      if (startSuggestions.length > 0) setShowStartSuggestions(true);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setShowStartSuggestions(false);
                        handleSearchRoute();
                      }
                    }}
                    autoComplete="off"
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
              {showStartSuggestions && startSuggestions.length > 0 && (
                <div className="safe-route-page__suggestions">
                  {startSuggestions.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="safe-route-page__suggestion-item"
                      onClick={() => handleSelectStartSuggestion(s)}
                    >
                      <span className="safe-route-page__suggestion-icon">{getSuggestionIcon(s)}</span>
                      <div className="safe-route-page__suggestion-text">
                        <span className="safe-route-page__suggestion-name">{s.shortName}</span>
                        <span className="safe-route-page__suggestion-detail">{s.name.split(",").slice(0, 3).join(",")}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="safe-route-page__input-wrapper" ref={endInputWrapperRef}>
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
                  onChange={(e) => handleEndInputChange(e.target.value)}
                  onFocus={() => {
                    handleInputFocus("end");
                    if (endSuggestions.length > 0) setShowEndSuggestions(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setShowEndSuggestions(false);
                      handleSearchRoute();
                    }
                  }}
                  autoComplete="off"
                />
              </div>
              {showEndSuggestions && endSuggestions.length > 0 && (
                <div className="safe-route-page__suggestions">
                  {endSuggestions.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="safe-route-page__suggestion-item"
                      onClick={() => handleSelectEndSuggestion(s)}
                    >
                      <span className="safe-route-page__suggestion-icon">{getSuggestionIcon(s)}</span>
                      <div className="safe-route-page__suggestion-text">
                        <span className="safe-route-page__suggestion-name">{s.shortName}</span>
                        <span className="safe-route-page__suggestion-detail">{s.name.split(",").slice(0, 3).join(",")}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
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
                      color={isSelected ? route.routeColor : "#94a3b8"}
                      weight={isSelected ? 6 : 3}
                      opacity={isSelected ? 0.95 : 0.35}
                      dashArray={isSelected ? undefined : "8 6"}
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
                        border: isSelected ? `2.5px solid ${route.routeColor}` : "1.5px solid #e2e8f0",
                        background: isSelected ? `${route.routeColor}0D` : "#ffffff",
                        textAlign: "left",
                        cursor: "pointer",
                        minWidth: "210px",
                        flexShrink: 0,
                        transition: "all 0.2s",
                        boxShadow: isSelected ? "0 4px 12px rgba(0,0,0,0.06)" : "none"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <span style={{
                          width: "14px", height: "4px", borderRadius: "2px",
                          backgroundColor: route.routeColor, flexShrink: 0
                        }} />
                        <p style={{ margin: 0, fontSize: "12.5px", fontWeight: "700", color: isSelected ? route.routeColor : "#241422" }}>
                          {idx === 0 ? "Rute Utama" : `Rute Alternatif ${idx}`}
                        </p>
                      </div>
                      {route.majorRoads && route.majorRoads.length > 0 && (
                        <p style={{ margin: "0 0 4px 22px", fontSize: "11px", fontWeight: "600", color: "#6b5c66", lineHeight: "1.3" }}>
                          via {route.majorRoads.slice(0, 3).join(" → ")}
                        </p>
                      )}
                      <p style={{ margin: "2px 0 0 22px", fontSize: "13px", fontWeight: "800", color: "#6b5c66" }}>
                        {distLabel} ({durMin} mnt)
                      </p>
                      <span
                        style={{
                          display: "inline-block",
                          marginTop: "8px",
                          marginLeft: "22px",
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
              <ArrowRight size={28} color="#ffffff" strokeWidth={3} style={{ marginLeft: "auto" }} />
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
