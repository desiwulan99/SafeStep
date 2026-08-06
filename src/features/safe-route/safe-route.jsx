import React, { useState, useEffect, useRef } from "react";
import { Sidebar } from "../../components/layout/Sidebar.jsx";
import { predictSafetyRisk, getSafetyRiskScore } from "../../services/riskService";

const DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni", 
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

// Predefined hot-spots in Jakarta/Bogor for safety heatmap prediction
const heatmapPointsBase = [
  { lat: -6.1754, lng: 106.8272, name: "Kawasan Monas", descBase: "Area wisata monumen nasional." },
  { lat: -6.2085, lng: 106.8454, name: "Stasiun Manggarai", descBase: "Hub transportasi kereta api komuter." },
  { lat: -6.2297, lng: 106.7973, name: "Kawasan Bisnis Sudirman", descBase: "Pusat bisnis perkantoran utama." },
  { lat: -6.5950, lng: 106.7940, name: "Kebun Raya Bogor", descBase: "Area sekitar gerbang Kebun Raya." },
  { lat: -6.5217, lng: 106.7760, name: "Kec. Tanah Sareal", descBase: "Wilayah perumahan dan jalan penghubung." },
  { lat: -6.1856, lng: 106.8122, name: "Stasiun Tanah Abang", descBase: "Kawasan pasar dan stasiun transit padat." },
  { lat: -6.1376, lng: 106.8143, name: "Kota Tua Jakarta", descBase: "Kawasan cagar budaya bersejarah." },
  { lat: -6.2443, lng: 106.7982, name: "Kawasan Blok M", descBase: "Terminal bus, MRT, dan pusat kuliner malam." }
];

export const SafeRoute = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState("Peta Aman");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Form states
  const [startPoint, setStartPoint] = useState("");
  const [endPoint, setEndPoint] = useState("");
  const [startCoords, setStartCoords] = useState(null); // { lat, lng }
  const [endCoords, setEndCoords] = useState(null); // { lat, lng }

  // Helper to format local date-time string YYYY-MM-DDTHH:MM
  const getLocalISODateTime = (date = new Date()) => {
    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
  };

  // Temporal Filter states
  const [selectedDateTime, setSelectedDateTime] = useState(getLocalISODateTime());
  
  // Derived temporal values for compatibility (e.g. heatmap query)
  const dateObj = new Date(selectedDateTime);
  const selectedHour = dateObj.getHours();
  const jsDay = dateObj.getDay();
  const selectedDay = jsDay === 0 ? 6 : jsDay - 1; // Mon = 0, Sun = 6
  const selectedMonth = dateObj.getMonth() + 1;

  // Multiple Route State
  const [routesData, setRoutesData] = useState([]); // [{ id: 0, name: "Rute Utama", distance, duration, path: [...], sampledPoints: [...], samplePredictions: [...], score: X, level: "High/Medium/Low", reason: "..." }]
  const [selectedRouteIdx, setSelectedRouteIdx] = useState(0);

  // Selected Route Details for backward compatibility
  const selectedRoute = routesData[selectedRouteIdx] || null;
  const prediction = selectedRoute ? selectedRoute.samplePredictions[selectedRoute.samplePredictions.length - 1] : null;
  const startPrediction = selectedRoute ? selectedRoute.samplePredictions[0] : null;
  const endPrediction = selectedRoute ? selectedRoute.samplePredictions[selectedRoute.samplePredictions.length - 1] : null;
  const routeDistance = selectedRoute ? selectedRoute.distance : "";
  const routeDuration = selectedRoute ? selectedRoute.duration : null;
  const routePathCoordinates = selectedRoute ? selectedRoute.path : [];
  const routeSamplePredictions = selectedRoute ? selectedRoute.samplePredictions : [];
  const routeAverageScore = selectedRoute ? selectedRoute.score : null;
  const routeAverageLevel = selectedRoute ? selectedRoute.level : "";
  
  // Find highest risk segment for backward compatibility
  let highestRiskSegment = null;
  if (selectedRoute && selectedRoute.samplePredictions.length > 0) {
    selectedRoute.samplePredictions.forEach((res, idx) => {
      if (!highestRiskSegment || res.risk_score > highestRiskSegment.risk_score) {
        highestRiskSegment = {
          lat: selectedRoute.sampledPoints[idx].lat,
          lng: selectedRoute.sampledPoints[idx].lng,
          risk_score: res.risk_score,
          risk_level: res.risk_level,
          index: idx
        };
      }
    });
  }

  // Loaders
  const [isLoadingRisk, setIsLoadingRisk] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [heatmapData, setHeatmapData] = useState([]);
  const [isLoadingHeatmap, setIsLoadingHeatmap] = useState(false);

  // Map refs
  const mapContainerRef = useRef(null);
  const mapInstance = useRef(null);
  const startMarkerRef = useRef(null);
  const endMarkerRef = useRef(null);
  const heatmapLayerGroup = useRef(null);
  const heatOverlayInstance = useRef(null);

  // Fetch updated risks for heatmap points dynamically when filters change
  const loadHeatmapRisks = async () => {
    setIsLoadingHeatmap(true);
    try {
      const promises = heatmapPointsBase.map(async (point) => {
        const res = await predictSafetyRisk(point.lat, point.lng, selectedHour, selectedDay, selectedMonth);
        return {
          ...point,
          risk: res.risk_level,
          risk_score: res.risk_score,
          is_mock: res.is_mock,
          desc: point.descBase + ` (Dianalisis untuk pukul ${selectedHour.toString().padStart(2, '0')}:00 hari ${DAYS[selectedDay]})`
        };
      });
      const results = await Promise.all(promises);
      setHeatmapData(results);
    } catch (error) {
      console.error("Gagal memperbarui data heatmap:", error);
    } finally {
      setIsLoadingHeatmap(false);
    }
  };

  // Convert typed address text to coordinates using OpenStreetMap Nominatim API
  const handleGeocode = async (text, isStart) => {
    if (!text || text.startsWith("Lat: ") || text.startsWith("Lokasi Saya")) return;
    
    setIsLoadingRisk(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(text)}&limit=1`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        const shortName = data[0].display_name.split(',')[0];
        
        if (isStart) {
          setStartCoords({ lat, lng });
          setStartPoint(`${shortName} (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
          if (mapInstance.current) {
            mapInstance.current.flyTo([lat, lng], 14);
          }
        } else {
          setEndCoords({ lat, lng });
          setEndPoint(`${shortName} (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
          if (mapInstance.current) {
            mapInstance.current.flyTo([lat, lng], 14);
          }
        }
      } else {
        alert("Lokasi tidak ditemukan. Coba masukkan nama tempat atau jalan yang lebih spesifik.");
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      alert("Koneksi gagal saat mencari lokasi. Silakan periksa jaringan internet Anda.");
    } finally {
      setIsLoadingRisk(false);
    }
  };

  // Geolocation trigger
  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          setStartCoords({ lat, lng });
          setStartPoint(`Lokasi Saya (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
          
          if (mapInstance.current) {
            mapInstance.current.flyTo([lat, lng], 15, {
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

  // Initialize Map
  useEffect(() => {
    if (typeof window !== "undefined" && window.L && mapContainerRef.current && !mapInstance.current) {
      // Default to Jakarta/Manggarai area coords
      mapInstance.current = window.L.map(mapContainerRef.current).setView([-6.2085, 106.8454], 13);
      
      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstance.current);

      // Create LayerGroup for Heatmap markers & visual overlay
      heatmapLayerGroup.current = window.L.layerGroup().addTo(mapInstance.current);

      mapInstance.current.on("click", (e) => {
        const { lat, lng } = e.latlng;
        
        setStartCoords((currStart) => {
          setEndCoords((currEnd) => {
            if (!currStart) {
              setStartPoint(`Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`);
              return { lat, lng };
            } else if (!currEnd) {
              setEndPoint(`Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`);
              return { lat, lng };
            } else {
              setEndPoint("");
              setStartPoint(`Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`);
              return { lat, lng };
            }
          });
          if (currStart && endCoords) {
            return null; 
          }
          return currStart;
        });
      });
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Update heatmap data when filters or showHeatmap toggle changes
  useEffect(() => {
    if (showHeatmap) {
      loadHeatmapRisks();
    }
  }, [selectedHour, selectedDay, selectedMonth, showHeatmap]);

  // Sync heatmap layer on map using L.heatLayer and glowing circles fallback
  useEffect(() => {
    if (!mapInstance.current || !heatmapLayerGroup.current || !window.L) return;

    // Clear previous heatmap dots & overlays
    heatmapLayerGroup.current.clearLayers();
    if (heatOverlayInstance.current) {
      heatOverlayInstance.current.remove();
      heatOverlayInstance.current = null;
    }

    if (showHeatmap && heatmapData.length > 0) {
      // 1. Plot continuous gradient safety heatmap using leaflet.heat if available
      const heatPoints = heatmapData.map((pt) => {
        const intensity = pt.risk_score ? (pt.risk_score / 100) : 0.5;
        return [pt.lat, pt.lng, intensity];
      });

      if (window.L.heatLayer) {
        try {
          heatOverlayInstance.current = window.L.heatLayer(heatPoints, {
            radius: 40,
            blur: 20,
            maxZoom: 16,
            gradient: {
              0.15: '#10b981', // Low: Green
              0.45: '#f59e0b', // Medium: Yellow/Orange
              0.75: '#ef4444'  // High: Red
            }
          }).addTo(mapInstance.current);
        } catch (e) {
          console.warn("L.heatLayer failed, relying on vector fallback:", e);
        }
      }

      // 2. Plot soft glowing translucent circles as a robust native fallback/enhancement.
      // This guarantees visual heatmap spots are ALWAYS displayed even if the canvas plugin fails to render!
      heatmapData.forEach((point) => {
        const color = point.risk === "High" ? "#ef4444" : point.risk === "Medium" ? "#f59e0b" : "#10b981";
        
        // Large outer glowing circle (glowing effect)
        window.L.circle([point.lat, point.lng], {
          radius: 800, // 800 meters glow
          color: "transparent",
          fillColor: color,
          fillOpacity: 0.12,
          interactive: false
        }).addTo(heatmapLayerGroup.current);

        // Medium glowing circle
        window.L.circle([point.lat, point.lng], {
          radius: 400, // 400 meters glow
          color: "transparent",
          fillColor: color,
          fillOpacity: 0.22,
          interactive: false
        }).addTo(heatmapLayerGroup.current);

        // Core marker dot (interactive)
        window.L.circleMarker([point.lat, point.lng], {
          radius: 8,
          color: "#ffffff",
          fillColor: color,
          fillOpacity: 1,
          weight: 2,
        }).addTo(heatmapLayerGroup.current)
          .bindPopup(`
            <div style="font-family: 'Inter', sans-serif; font-size:12px; width:180px;">
              <strong style="font-size:13px; color:#1e293b;">🔥 ${point.name}</strong><br/>
              <div style="margin-top:6px; background-color:${color}15; padding:4px 8px; border-radius:6px;">
                Skor Risiko: <b style="color:${color}; font-size:14px;">${point.risk_score.toFixed(1)}</b>/100 (${point.risk})
              </div>
              <p style="margin:8px 0 0 0; color:#475569; font-size:11px; line-height:1.4;">${point.desc}</p>
              <div style="margin-top:8px; font-size:10px; color:#94a3b8; border-top:1px solid #f1f5f9; padding-top:4px;">
                ${point.is_mock ? "⚡ Simulasi Offline" : "🟢 MLOps API Aktif"}
              </div>
            </div>
          `);
      });
    }
  }, [showHeatmap, heatmapData]);

  // Sync Start & End Markers
  useEffect(() => {
    if (!mapInstance.current || !window.L) return;

    if (startCoords) {
      if (startMarkerRef.current) {
        startMarkerRef.current.setLatLng([startCoords.lat, startCoords.lng]);
      } else {
        startMarkerRef.current = window.L.circleMarker([startCoords.lat, startCoords.lng], {
          radius: 9,
          fillColor: "#2563eb", // Primary blue for start
          color: "#ffffff",
          weight: 2,
          fillOpacity: 1
        }).addTo(mapInstance.current)
          .bindPopup("<b>🟢 Titik Awal</b>")
          .openPopup();
      }
    } else {
      if (startMarkerRef.current) {
        startMarkerRef.current.remove();
        startMarkerRef.current = null;
      }
    }

    if (endCoords) {
      if (endMarkerRef.current) {
        endMarkerRef.current.setLatLng([endCoords.lat, endCoords.lng]);
      } else {
        endMarkerRef.current = window.L.circleMarker([endCoords.lat, endCoords.lng], {
          radius: 9,
          fillColor: "#be185d", // Magenta for destination
          color: "#ffffff",
          weight: 2,
          fillOpacity: 1
        }).addTo(mapInstance.current)
          .bindPopup("<b>🔴 Titik Tujuan</b>")
          .openPopup();
      }
    } else {
      if (endMarkerRef.current) {
        endMarkerRef.current.remove();
        endMarkerRef.current = null;
      }
    }
  }, [startCoords, endCoords]);

  // Helper to sample coords along the route
  const getSamplePoints = (coords, distanceMeters) => {
    const sampleCount = 8;
    const points = [];
    if (coords.length <= sampleCount) {
      coords.forEach(c => points.push({ lat: c[0], lng: c[1] }));
    } else {
      const step = (coords.length - 1) / (sampleCount - 1);
      for (let i = 0; i < sampleCount; i++) {
        const idx = Math.round(i * step);
        points.push({ lat: coords[idx][0], lng: coords[idx][1] });
      }
    }
    return points;
  };

  // Generate and evaluate routes
  useEffect(() => {
    if (!mapInstance.current || !window.L) return;

    const generateAndEvaluateRoutes = async () => {
      if (!startCoords || !endCoords) {
        setRoutesData([]);
        return;
      }

      setIsLoadingRisk(true);
      try {
        let osrmRoutes = [];
        try {
          const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${startCoords.lng},${startCoords.lat};${endCoords.lng},${endCoords.lat}?overview=full&geometries=geojson&alternatives=true`;
          const response = await fetch(osrmUrl);
          const data = await response.json();
          
          if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
            osrmRoutes = data.routes;
            
            // If only 1 route is returned, generate a second route via a waypoint
            if (osrmRoutes.length === 1 && osrmRoutes[0].geometry?.coordinates?.length > 4) {
              try {
                const mainCoords = osrmRoutes[0].geometry.coordinates;
                const midIdx = Math.floor(mainCoords.length / 2);
                const midCoord = mainCoords[midIdx];
                
                // Offset the midpoint coordinates slightly
                const wpLng = midCoord[0] - 0.005;
                const wpLat = midCoord[1] + 0.005;
                
                const wpUrl = `https://router.project-osrm.org/route/v1/driving/${startCoords.lng},${startCoords.lat};${wpLng},${wpLat};${endCoords.lng},${endCoords.lat}?overview=full&geometries=geojson`;
                const wpResponse = await fetch(wpUrl);
                const wpData = await wpResponse.json();
                
                if (wpData.code === 'Ok' && wpData.routes && wpData.routes.length > 0) {
                  osrmRoutes.push(wpData.routes[0]);
                }
              } catch (err) {
                console.warn("Failed to generate waypoint alternative route:", err);
              }
            }
          } else {
            throw new Error("Invalid OSRM response structure");
          }
        } catch (error) {
          console.warn("OSRM routing server unavailable, falling back to vector lines:", error);
          // Fallback to straight-line vectors
          const pathA = [
            [startCoords.lat, startCoords.lng],
            [endCoords.lat, endCoords.lng]
          ];
          const midLat = (startCoords.lat + endCoords.lat) / 2;
          const midLng = (startCoords.lng + endCoords.lng) / 2;
          const offsetLat = midLat + (endCoords.lng - startCoords.lng) * 0.1;
          const offsetLng = midLng - (endCoords.lat - startCoords.lat) * 0.1;
          const pathB = [
            [startCoords.lat, startCoords.lng],
            [offsetLat, offsetLng],
            [endCoords.lat, endCoords.lng]
          ];
          
          osrmRoutes = [
            {
              distance: 1000,
              duration: 900,
              fallbackPath: pathA,
              name: "Rute Utama (Vektor)"
            },
            {
              distance: 1200,
              duration: 1080,
              fallbackPath: pathB,
              name: "Rute Alternatif (Vektor)"
            }
          ];
        }

        // Limit to top 2 routes for comparison
        const routesToProcess = osrmRoutes.slice(0, 2);
        
        const processedRoutes = await Promise.all(routesToProcess.map(async (osrmRoute, index) => {
          const path = osrmRoute.fallbackPath || osrmRoute.geometry.coordinates.map(coord => [coord[1], coord[0]]);
          const distanceKm = osrmRoute.fallbackPath ? (index === 0 ? "Vektor" : "Offset Vektor") : (osrmRoute.distance / 1000).toFixed(2);
          const durationMin = Math.round(osrmRoute.duration / 60);
          
          // Sample points along the route
          const sampledPoints = getSamplePoints(path, osrmRoute.fallbackPath ? 1000 : osrmRoute.distance);
          
          // Fetch predictions for all sampled points using the new datetime-local picker value
          const predictions = await Promise.all(sampledPoints.map(pt => 
            getSafetyRiskScore(pt.lat, pt.lng, selectedDateTime)
          ));
          
          // Aggregate calculations using MAX (worst-case scenario)
          const maxScore = Math.max(...predictions.map(p => p.risk_score));
          
          let level = "Low";
          if (maxScore >= 70) {
            level = "High";
          } else if (maxScore >= 40) {
            level = "Medium";
          }
          
          // Realistic reason mapping
          let reason = "Risiko rendah di sepanjang rute";
          if (maxScore >= 70) {
            reason = "Risiko tinggi terdeteksi di sebagian rute ini";
          } else if (maxScore >= 40) {
            reason = "Risiko sedang di beberapa titik";
          }
          
          return {
            id: index,
            name: osrmRoute.name || (index === 0 ? "Rute Utama" : "Rute Alternatif"),
            distance: distanceKm,
            duration: durationMin,
            path,
            sampledPoints,
            samplePredictions: predictions,
            score: maxScore,
            level,
            reason
          };
        }));

        setRoutesData(processedRoutes);
        setSelectedRouteIdx(0);
      } catch (err) {
        console.error("Gagal memproses evaluasi rute:", err);
      } finally {
        setIsLoadingRisk(false);
      }
    };

    generateAndEvaluateRoutes();
  }, [startCoords, endCoords, selectedDateTime]);

  // Ref to hold the multiple route polyline layers
  const routeLayersGroup = useRef(null);

  // Synchronize route polylines on map
  useEffect(() => {
    if (!mapInstance.current || !window.L) return;

    if (!routeLayersGroup.current) {
      routeLayersGroup.current = window.L.featureGroup().addTo(mapInstance.current);
    } else {
      routeLayersGroup.current.clearLayers();
    }

    if (routesData.length === 0) return;

    routesData.forEach((route) => {
      const isSelected = route.id === selectedRouteIdx;
      
      let lineStyle;
      if (isSelected) {
        const color = route.level === "High" ? "#ef4444" : route.level === "Medium" ? "#f59e0b" : "#10b981";
        lineStyle = {
          color: color,
          weight: 7,
          opacity: 0.9,
          lineJoin: 'round'
        };
        
        // Draw a soft glowing outline underneath for selected route
        window.L.polyline(route.path, {
          color: color,
          weight: 12,
          opacity: 0.25,
          lineJoin: 'round'
        }).addTo(routeLayersGroup.current);
      } else {
        lineStyle = {
          color: "#94a3b8", // neutral slate
          weight: 4,
          opacity: 0.55,
          dashArray: "6, 12",
          lineJoin: 'round'
        };
      }

      const poly = window.L.polyline(route.path, lineStyle)
        .addTo(routeLayersGroup.current)
        .bindTooltip(`<b>${route.name}</b><br/>Skor Risiko: ${route.score.toFixed(0)} (${route.level})`, {
          sticky: true,
          opacity: 0.9
        });
      
      // Select route when clicking its polyline
      poly.on('click', () => {
        setSelectedRouteIdx(route.id);
      });
    });

    // Fit map bounds to show all routes
    try {
      const bounds = routeLayersGroup.current.getBounds();
      if (bounds.isValid()) {
        mapInstance.current.fitBounds(bounds, { padding: [50, 50] });
      }
    } catch (e) {
      console.warn("Failed to fit map bounds:", e);
    }
  }, [routesData, selectedRouteIdx]);

  const handleNavigation = (menuName, routePath) => {
    setActiveTab(menuName);
    if (onNavigate && routePath) {
      onNavigate(routePath);
    }
  };

  const handleSendToLiveGuardian = () => {
    if (!startPoint || !endPoint) return;
    alert(`Rute aman dari "${startPoint.split(' (')[0]}" menuju "${endPoint.split(' (')[0]}" berhasil dikirim ke Live Guardian!`);
  };

  // Generate safety insights text based on MLOps API score
  const getSafetyAnalysis = (routeScore, hour) => {
    let analysis = "";
    let recommendation = "";
    let scoreColor = "#10b981";

    if (routeScore >= 70) {
      scoreColor = "#ef4444";
      analysis = `Rute komuter terdeteksi memiliki tingkat kerawanan TINGGI (skor rute (max): ${routeScore.toFixed(1)}/100).`;
      if (hour >= 20 || hour <= 4) {
        recommendation = "Kombinasi jam malam dan segmen wilayah dengan risiko tinggi sangat berbahaya. Disarankan memesan taksi roda empat/ojek resmi terpercaya, hindari berjalan kaki sendirian, dan aktifkan fitur 'Live Guardian' sekarang.";
      } else {
        recommendation = "Area jalan raya ini terpantau rawan kejahatan jalanan pada jam padat. Simpan barang berharga Anda dengan aman di dalam tas, tetap berjalan di rute utama, dan hindari lorong sepi.";
      }
    } else if (routeScore >= 40) {
      scoreColor = "#f59e0b";
      analysis = `Rute komuter terpantau memiliki tingkat kerawanan SEDANG (skor rute (max): ${routeScore.toFixed(1)}/100).`;
      if (hour >= 18 || hour <= 5) {
        recommendation = "Penerangan jalan di beberapa bagian rute minim di malam hari. Berjalanlah dengan langkah pasti di tempat terang, pastikan daya baterai ponsel, dan pantau sekeliling Anda.";
      } else {
        recommendation = "Rute cukup kondusif. Tetap waspada terhadap pencopetan di area sekitar stasiun transit transit padat/halte bus.";
      }
    } else {
      scoreColor = "#10b981";
      analysis = `Rute komuter terpantau AMAN dan minim risiko (skor rute (max): ${routeScore.toFixed(1)}/100).`;
      recommendation = "Pengawasan lingkungan aktif, lampu jalan memadai, dan laporan kriminalitas rendah pada jam ini. Anda dapat berkendara dengan tenang.";
    }

    return { analysis, recommendation, scoreColor };
  };

  const hasCommuteSelected = startCoords && endCoords;
  const commuteInsights = hasCommuteSelected && routeAverageScore !== null
    ? getSafetyAnalysis(routeAverageScore, selectedHour) 
    : null;

  return (
    <div style={styles.container}>
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectMenu={handleNavigation}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Center Column: Inputs, Map, Direction details */}
      <main style={styles.mainContent}>
        
        {/* Destination & Location Inputs */}
        <div style={styles.inputContainer}>
          <h3 style={styles.sectionHeader}>📍 Rute Perjalanan Aman</h3>
          <div style={styles.inputRow}>
            <div style={styles.inputIconStart}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="8" stroke="#2563eb" strokeWidth="3" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Masukkan atau klik peta untuk Titik Awal"
              value={startPoint}
              onChange={(e) => setStartPoint(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGeocode(startPoint, true)}
              style={styles.mockupInput}
            />
            <button
              onClick={() => handleGeocode(startPoint, true)}
              style={styles.searchIconBtn}
              title="Cari Titik Awal"
            >
              🔍
            </button>
            <button
              onClick={handleUseCurrentLocation}
              style={styles.locationIconBtn}
              title="Gunakan Lokasi Saat Ini"
            >
              📍
            </button>
          </div>

          <div style={styles.inputRow}>
            <div style={styles.inputIconEnd}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#be185d">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Masukkan atau klik peta untuk Titik Tujuan"
              value={endPoint}
              onChange={(e) => setEndPoint(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGeocode(endPoint, false)}
              style={styles.mockupInput}
            />
            <button
              onClick={() => handleGeocode(endPoint, false)}
              style={styles.searchIconBtn}
              title="Cari Titik Tujuan"
            >
              🔍
            </button>
          </div>
          <span style={styles.helperText}>*Anda juga bisa langsung mengklik dua lokasi di peta untuk menandai rute Anda.</span>
        </div>

        {/* Temporal Filters Card */}
        <div style={styles.filterCard}>
          <div style={styles.filterHeader}>
            <span style={styles.filterTitle}>⏰ Pengaturan Waktu Perjalanan (Temporal Filters)</span>
            <span style={styles.filterBadge}>Dinamis</span>
          </div>
          <div style={styles.filterBody}>
            <div style={styles.filterGroup}>
              <div style={styles.filterLabelRow}>
                <span style={styles.filterLabel}>Pilih Tanggal & Waktu Keberangkatan:</span>
              </div>
              <input
                type="datetime-local"
                value={selectedDateTime}
                onChange={(e) => setSelectedDateTime(e.target.value)}
                style={styles.datetimeInput}
              />
              <div style={styles.datetimeHelper}>
                Menganalisis risiko temporal: <b>{DAYS[selectedDay]}</b> pukul <b>{selectedHour.toString().padStart(2, '0')}:00</b> (Bulan {MONTHS[selectedMonth - 1]})
              </div>
            </div>
          </div>
        </div>

        {/* Map Container Area */}
        <div style={styles.mapCard}>
          <div style={styles.mapHeaderRow}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={styles.mapSubTitle}>• INTERACTIVE SAFETY MAP</span>
            </div>
            
            {/* Interactive Heatmap Layer Toggle */}
            <button 
              onClick={() => setShowHeatmap(!showHeatmap)} 
              style={{
                ...styles.heatmapToggleBtn,
                backgroundColor: showHeatmap ? "#9d004b" : "#ffffff",
                color: showHeatmap ? "#ffffff" : "#9d004b",
                border: showHeatmap ? "none" : "1.5px solid #9d004b",
              }}
            >
              🔥 {showHeatmap ? "Sembunyikan Heatmap" : "Tampilkan Heatmap Risiko"}
            </button>
          </div>

          <div ref={mapContainerRef} style={styles.mapContainer} />
          {isLoadingHeatmap && (
            <div style={styles.mapLoadingOverlay}>
              <span>Memproses Heatmap Risiko Wilayah...</span>
            </div>
          )}
        </div>

        {/* Route Comparison Panel */}
        {hasCommuteSelected && routesData.length > 0 && (
          <div style={styles.comparisonCard}>
            <div style={styles.comparisonHeader}>
              <span style={styles.comparisonTitle}>🗺️ Perbandingan Rute Alternatif</span>
              <span style={styles.comparisonSubTitle}>Pilih rute untuk melihat rincian keamanan</span>
            </div>
            <div style={styles.comparisonRow}>
              {routesData.map((route) => {
                const isSelected = route.id === selectedRouteIdx;
                const isSafest = routesData.length > 1 && route.score === Math.min(...routesData.map(r => r.score));
                const color = route.level === "High" ? "#ef4444" : route.level === "Medium" ? "#f59e0b" : "#10b981";
                
                return (
                  <div 
                    key={route.id}
                    onClick={() => setSelectedRouteIdx(route.id)}
                    style={{
                      ...styles.routeCard,
                      border: isSelected ? `2.5px solid ${color}` : '1.5px solid #fce7f3',
                      backgroundColor: isSelected ? `${color}05` : '#ffffff',
                    }}
                  >
                    <div style={styles.routeCardHeader}>
                      <span style={{ ...styles.routeName, color: isSelected ? color : '#1e293b' }}>
                        {route.name}
                      </span>
                      {isSafest && (
                        <span style={styles.safestBadge}>
                          🛡️ Paling Aman
                        </span>
                      )}
                    </div>
                    
                    <div style={styles.routeCardStats}>
                      <div style={styles.statItem}>
                        <span style={styles.statLabel}>Waktu</span>
                        <span style={styles.statValue}>{route.duration} mnt</span>
                      </div>
                      <div style={styles.statItem}>
                        <span style={styles.statLabel}>Jarak</span>
                        <span style={styles.statValue}>{route.distance} km</span>
                      </div>
                      <div style={styles.statItem}>
                        <span style={styles.statLabel}>Skor Risiko</span>
                        <span style={{ ...styles.statValue, color: color }}>
                          {route.score.toFixed(0)}/100
                        </span>
                      </div>
                    </div>
                    
                    <div style={styles.routeCardFooter}>
                      <span style={{ ...styles.riskTextBadge, backgroundColor: `${color}15`, color: color }}>
                        {route.level} Risk
                      </span>
                      <span style={styles.reasonText}>
                        {route.reason}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            {routesData.length > 1 && (
              <div style={styles.aggregationExplanation}>
                💡 <i>Skor rute dihitung berdasarkan <b>skor maksimum (MAX)</b> dari semua titik sampel di rute tersebut. Ini memastikan area dengan satu titik bahaya ekstrem tidak dikesampingkan oleh segmen rute aman lainnya.</i>
              </div>
            )}
          </div>
        )}

        {/* Safe Commute Insights Section */}
        {hasCommuteSelected && commuteInsights && (
          <div style={styles.insightsCard}>
            <div style={styles.insightsHeader}>
              <div style={styles.insightsHeaderTitleGroup}>
                <span style={styles.shieldIcon}>🛡️</span>
                <h3 style={styles.insightsTitle}>Safe Commute Insights (Evaluasi Risiko)</h3>
              </div>
              <div style={{
                ...styles.riskBadge,
                backgroundColor: commuteInsights.scoreColor + '20',
                color: commuteInsights.scoreColor,
                border: `1.5px solid ${commuteInsights.scoreColor}`
              }}>
                Risiko: {routeAverageLevel === "High" ? "Tinggi" : routeAverageLevel === "Medium" ? "Sedang" : "Rendah"}
              </div>
            </div>

            <div style={styles.insightsTemporalInfo}>
              Evaluasi perjalanan untuk hari <b>{DAYS[selectedDay]}</b> pukul <b>{selectedHour.toString().padStart(2, '0')}:00</b>
            </div>

            {/* OSRM Route Info Panel */}
            <div style={styles.routeMetaRow}>
              <span>🛣️ Jarak Rute: <b>{routeDistance} km</b></span>
              {routeDuration && <span>⏱️ Est. Waktu: <b>{routeDuration} menit</b></span>}
            </div>

            <div style={styles.insightsScoresRow}>
              {/* Start Point Prediction */}
              <div style={styles.pointScoreCard}>
                <div style={styles.pointScoreLabel}>
                  <span style={{ color: "#2563eb", marginRight: "6px" }}>🟢</span> Titik Awal
                </div>
                <div style={styles.pointScoreValue}>
                  {startPrediction ? startPrediction.risk_score.toFixed(1) : "Loading..."}{" "}
                  <span style={{ fontSize: "12px", color: "#64748b" }}>/ 100</span>
                </div>
                <div style={styles.progressBarBg}>
                  <div style={{
                    ...styles.progressBarFill,
                    width: `${startPrediction ? startPrediction.risk_score : 0}%`,
                    backgroundColor: startPrediction?.risk_score >= 70 ? "#ef4444" : startPrediction?.risk_score >= 40 ? "#f59e0b" : "#10b981"
                  }} />
                </div>
                <div style={styles.apiMeta}>
                  <span>Latency: {startPrediction?.latency_ms} ms</span>
                  <span>{startPrediction?.is_mock ? "Simulation" : "ML API"}</span>
                </div>
              </div>

              {/* End Point Prediction */}
              <div style={styles.pointScoreCard}>
                <div style={styles.pointScoreLabel}>
                  <span style={{ color: "#be185d", marginRight: "6px" }}>🔴</span> Titik Tujuan
                </div>
                <div style={styles.pointScoreValue}>
                  {endPrediction ? endPrediction.risk_score.toFixed(1) : "Loading..."}{" "}
                  <span style={{ fontSize: "12px", color: "#64748b" }}>/ 100</span>
                </div>
                <div style={styles.progressBarBg}>
                  <div style={{
                    ...styles.progressBarFill,
                    width: `${endPrediction ? endPrediction.risk_score : 0}%`,
                    backgroundColor: endPrediction?.risk_score >= 70 ? "#ef4444" : endPrediction?.risk_score >= 40 ? "#f59e0b" : "#10b981"
                  }} />
                </div>
                <div style={styles.apiMeta}>
                  <span>Latency: {endPrediction?.latency_ms} ms</span>
                  <span>{endPrediction?.is_mock ? "Simulation" : "ML API"}</span>
                </div>
              </div>
            </div>

            {/* Visual Route Segment Risk Tracker */}
            {routeSamplePredictions.length > 0 && (
              <div style={styles.segmentTrackerContainer}>
                <div style={styles.analysisTitle}>📈 Segment Risk Tracker (Kondisi Sepanjang Rute Jalan)</div>
                <div style={styles.timelineWrapper}>
                  <div style={styles.timelineLine} />
                  {routeSamplePredictions.map((pred, idx) => {
                    const color = pred.risk_level === "High" ? "#ef4444" : pred.risk_level === "Medium" ? "#f59e0b" : "#10b981";
                    return (
                      <div key={idx} style={styles.timelineNode}>
                        <div 
                          style={{ ...styles.timelineDot, backgroundColor: color }} 
                          title={`Titik ${idx+1}: Skor ${pred.risk_score.toFixed(0)}/100 (${pred.risk_level})`}
                        >
                          {idx === 0 ? "Awal" : idx === routeSamplePredictions.length - 1 ? "Akhir" : idx + 1}
                        </div>
                        <div style={styles.timelineValue}>{pred.risk_score.toFixed(0)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Analysis & Recommendations */}
            <div style={styles.analysisContainer}>
              <div style={styles.analysisTitle}>🔍 Analisis Keamanan Perjalanan:</div>
              <p style={styles.analysisText}>{commuteInsights.analysis}</p>
              
              {highestRiskSegment && highestRiskSegment.risk_score > 55 && (
                <div style={{ margin: "4px 0 12px 0", padding: "8px 12px", backgroundColor: "#fffbeb", borderLeft: "4px solid #f59e0b", borderRadius: "4px" }}>
                  <span style={{ fontSize: "12.5px", color: "#b45309", fontWeight: "700" }}>⚠️ Peringatan Zona Risiko Tinggi:</span>
                  <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "#78350f" }}>
                    Terdapat lonjakan risiko keamanan hingga <b>{highestRiskSegment.risk_score.toFixed(0)}/100</b> di segmen {highestRiskSegment.index + 1} sepanjang jalur perutean jalan Anda. Tetap waspada di perlintasan ini!
                  </p>
                </div>
              )}

              <div style={styles.analysisTitle}>💡 Rekomendasi Langkah Aman:</div>
              <p style={styles.recommendationText}>{commuteInsights.recommendation}</p>
            </div>

            {/* API Connection Indicator */}
            <div style={styles.apiStatusIndicator}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: routeSamplePredictions.some(p => p.is_mock) ? '#f59e0b' : '#10b981'
                }} />
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '500' }}>
                  {routeSamplePredictions.some(p => p.is_mock)
                    ? "Menghubungi Fallback Predictor (API Lokal Offline)" 
                    : `Koneksi Aktif ke MLOps FastAPI Risk Server (Inference Latency: ~${endPrediction?.latency_ms || 10}ms)`}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Action Button: Send to Live Guardian */}
        <div style={styles.directionsCard}>
          <div style={{ color: '#ffffff', fontSize: '14px', fontWeight: '600' }}>
            {hasCommuteSelected ? "Rute Perjalanan Terpetakan" : "Silakan masukkan lokasi awal & tujuan Anda"}
          </div>
          <button 
            onClick={handleSendToLiveGuardian}
            disabled={!startCoords || !endCoords || isLoadingRisk}
            style={{
              ...styles.liveGuardianBtn,
              opacity: (!startCoords || !endCoords || isLoadingRisk) ? 0.65 : 1,
              cursor: (!startCoords || !endCoords || isLoadingRisk) ? "not-allowed" : "pointer"
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '8px' }}>
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            {isLoadingRisk ? "Mengevaluasi Rute..." : "Bagikan ke Live Guardian"}
          </button>
        </div>
      </main>

      {/* Right Column: SOS Button, Live Guardian Mascot Card, Profile */}
      <aside style={styles.rightColumn}>
        <div style={styles.profileRow}>
          <img
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
            alt="Profile"
            style={styles.profileAvatar}
            onClick={() => alert("Profil Saya")}
          />
        </div>

        {/* Massive Round SOS Button */}
        <button 
          onClick={() => alert("SOS Emergency Triggered! Mengirim lokasi dan meminta bantuan...")}
          style={styles.sosButton}
        >
          <div style={styles.sosLogo}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <span style={styles.sosText}>SOS</span>
        </button>

        {/* Live Guardian Sidebar Card */}
        <div style={styles.guardianPromoCard}>
          <div style={styles.guardianPromoHeader}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#ffffff" style={{ marginRight: '6px' }}>
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            Live Guardian
          </div>
          <p style={styles.guardianPromoText}>
            Bagikan lokasi real-time mu dengan kontak terpercaya!
          </p>
          
          {/* Vector Bird Mascot Illustration */}
          <div style={styles.mascotContainer}>
            <svg width="120" height="120" viewBox="0 0 200 200">
              <circle cx="100" cy="110" r="50" fill="#ffffff" />
              <ellipse cx="50" cy="110" rx="15" ry="30" fill="#ffffff" transform="rotate(-15, 50, 110)" />
              <ellipse cx="150" cy="110" rx="15" ry="30" fill="#ffffff" transform="rotate(15, 150, 110)" />
              <circle cx="85" cy="95" r="7" fill="#0f172a" />
              <circle cx="115" cy="95" r="7" fill="#0f172a" />
              <circle cx="83" cy="93" r="2.5" fill="#ffffff" />
              <circle cx="113" cy="93" r="2.5" fill="#ffffff" />
              <circle cx="75" cy="105" r="5" fill="#f472b6" opacity="0.6" />
              <circle cx="125" cy="105" r="5" fill="#f472b6" opacity="0.6" />
              <polygon points="100,98 94,106 106,106" fill="#f59e0b" />
              <path d="M100 68c-2-2-4-2-5 0s-1 4 5 8c6-4 6-6 5-8s-3-2-5 0z" fill="#9d004b" />
              <line x1="85" y1="160" x2="85" y2="175" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
              <line x1="115" y1="160" x2="115" y2="175" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </aside>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#fdf2f8',
    fontFamily: "'Inter', sans-serif",
  },
  mainContent: {
    flex: 1,
    padding: '24px 32px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    boxSizing: 'border-box',
  },
  sectionHeader: {
    margin: '0 0 12px 0',
    color: '#be185d',
    fontSize: '18px',
    fontWeight: '700',
  },
  inputContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    backgroundColor: '#ffffff',
    padding: '20px',
    borderRadius: '16px',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
    border: '1.5px solid #fce7f3',
  },
  inputRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  inputIconStart: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
  },
  inputIconEnd: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
  },
  mockupInput: {
    flex: 1,
    border: '1.5px solid #fbcfe8',
    borderRadius: '24px',
    padding: '12px 20px',
    outline: 'none',
    fontSize: '14px',
    color: '#1e293b',
    backgroundColor: '#ffffff',
    transition: 'border-color 0.2s',
  },
  searchIconBtn: {
    backgroundColor: '#fbcfe8',
    border: 'none',
    borderRadius: '50%',
    width: '44px',
    height: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'background-color 0.2s',
  },
  locationIconBtn: {
    backgroundColor: '#fce7f3',
    border: 'none',
    borderRadius: '50%',
    width: '44px',
    height: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'background-color 0.2s',
  },
  helperText: {
    fontSize: '11px',
    color: '#94a3b8',
    fontStyle: 'italic',
    marginTop: '4px',
  },
  filterCard: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '20px',
    border: '1.5px solid #fce7f3',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  filterHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #fce7f3',
    paddingBottom: '12px',
  },
  filterTitle: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#be185d',
  },
  filterBadge: {
    backgroundColor: '#fbcfe8',
    color: '#be185d',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '700',
  },
  filterBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  filterLabelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#475569',
  },
  filterValue: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#be185d',
    backgroundColor: '#fdf2f8',
    padding: '2px 8px',
    borderRadius: '6px',
    border: '1px solid #fbcfe8',
  },
  slider: {
    width: '100%',
    cursor: 'pointer',
    accentColor: '#be185d',
    height: '6px',
    borderRadius: '3px',
    backgroundColor: '#e2e8f0',
  },
  sliderTicks: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '10px',
    color: '#94a3b8',
    padding: '0 4px',
  },
  selectRow: {
    display: 'flex',
    gap: '16px',
  },
  selectGroup: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  filterSelectLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#475569',
  },
  select: {
    padding: '10px 16px',
    borderRadius: '12px',
    border: '1.5px solid #fbcfe8',
    outline: 'none',
    fontSize: '13px',
    backgroundColor: '#ffffff',
    color: '#1e293b',
    cursor: 'pointer',
  },
  mapCard: {
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    padding: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
    border: '1.5px solid #fce7f3',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    position: 'relative',
  },
  mapHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 8px',
  },
  mapSubTitle: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#be185d',
    letterSpacing: '0.08em',
  },
  heatmapToggleBtn: {
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s',
    outline: 'none',
  },
  mapContainer: {
    height: '380px',
    borderRadius: '16px',
    border: '1.5px solid #fce7f3',
    zIndex: 1,
  },
  mapLoadingOverlay: {
    position: 'absolute',
    bottom: '24px',
    left: '24px',
    backgroundColor: 'rgba(255,255,255,0.92)',
    padding: '8px 16px',
    borderRadius: '8px',
    border: '1.5px solid #fbcfe8',
    zIndex: 2,
    fontSize: '12px',
    color: '#be185d',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  },
  insightsCard: {
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    padding: '24px',
    border: '2px solid #fbcfe8',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  insightsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #f3f4f6',
    paddingBottom: '14px',
  },
  insightsHeaderTitleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  shieldIcon: {
    fontSize: '24px',
  },
  insightsTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '700',
    color: '#be185d',
  },
  riskBadge: {
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  insightsTemporalInfo: {
    fontSize: '13px',
    color: '#475569',
    backgroundColor: '#f8fafc',
    padding: '10px 14px',
    borderRadius: '8px',
    borderLeft: '4px solid #94a3b8',
  },
  routeMetaRow: {
    display: 'flex',
    gap: '18px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#be185d',
    backgroundColor: '#fce7f3',
    padding: '8px 18px',
    borderRadius: '10px',
    alignSelf: 'flex-start',
    boxShadow: '0 2px 4px rgba(190, 24, 93, 0.05)',
  },
  insightsScoresRow: {
    display: 'flex',
    gap: '16px',
  },
  pointScoreCard: {
    flex: 1,
    backgroundColor: '#faf5f8',
    border: '1px solid #fce7f3',
    borderRadius: '12px',
    padding: '14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  pointScoreLabel: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#334155',
    display: 'flex',
    alignItems: 'center',
  },
  pointScoreValue: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#1e293b',
  },
  progressBarBg: {
    width: '100%',
    height: '8px',
    backgroundColor: '#e2e8f0',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.4s ease-out',
  },
  apiMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '10px',
    color: '#94a3b8',
    marginTop: '2px',
  },
  segmentTrackerContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    padding: '16px',
    border: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  timelineWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    padding: '10px 0',
  },
  timelineLine: {
    position: 'absolute',
    left: '12px',
    right: '12px',
    top: '24px',
    height: '4px',
    backgroundColor: '#e2e8f0',
    zIndex: 1,
  },
  timelineNode: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    zIndex: 2,
  },
  timelineDot: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    color: '#ffffff',
    fontSize: '9px',
    fontWeight: '800',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
    border: '2px solid #ffffff',
    cursor: 'pointer',
    transition: 'transform 0.15s ease',
    ':hover': {
      transform: 'scale(1.15)',
    }
  },
  timelineValue: {
    fontSize: '11px',
    fontWeight: '800',
    color: '#475569',
  },
  analysisContainer: {
    backgroundColor: '#fafaf9',
    borderRadius: '12px',
    padding: '16px',
    border: '1px solid #f5f5f4',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  analysisTitle: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#be185d',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  analysisText: {
    fontSize: '13px',
    color: '#1e293b',
    margin: '0 0 8px 0',
    lineHeight: '1.6',
    fontWeight: '600',
  },
  recommendationText: {
    fontSize: '13px',
    color: '#475569',
    margin: 0,
    lineHeight: '1.6',
  },
  apiStatusIndicator: {
    borderTop: '1px solid #f3f4f6',
    paddingTop: '12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  directionsCard: {
    backgroundColor: '#ec4899',
    borderRadius: '20px',
    padding: '24px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    boxShadow: '0 4px 14px rgba(236, 72, 153, 0.25)',
  },
  liveGuardianBtn: {
    backgroundColor: '#9d004b',
    color: '#ffffff',
    border: 'none',
    padding: '14px 28px',
    borderRadius: '24px',
    fontWeight: '700',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 10px rgba(157, 0, 75, 0.25)',
    transition: 'all 0.2s',
  },
  rightColumn: {
    width: '320px',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '30px',
    boxSizing: 'border-box',
  },
  profileRow: {
    alignSelf: 'flex-end',
    marginBottom: '10px',
  },
  profileAvatar: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    objectFit: 'cover',
    cursor: 'pointer',
    border: '2px solid #be185d',
  },
  sosButton: {
    width: '160px',
    height: '160px',
    borderRadius: '50%',
    backgroundColor: '#be185d',
    border: '8px solid #fbcfe8',
    color: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 10px 25px rgba(190, 24, 93, 0.35)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  sosLogo: {
    marginBottom: '4px',
  },
  sosText: {
    fontSize: '22px',
    fontWeight: '800',
    letterSpacing: '0.05em',
  },
  guardianPromoCard: {
    backgroundColor: '#ec4899',
    color: '#ffffff',
    borderRadius: '24px',
    padding: '24px',
    width: '100%',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    boxShadow: '0 8px 20px rgba(236, 72, 153, 0.2)',
  },
  guardianPromoHeader: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '15px',
    fontWeight: '800',
  },
  guardianPromoText: {
    fontSize: '13px',
    lineHeight: '1.5',
    margin: 0,
    fontWeight: '500',
    opacity: 0.9,
  },
  mascotContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '10px',
  },
  datetimeInput: {
    padding: '12px 18px',
    borderRadius: '12px',
    border: '1.5px solid #fbcfe8',
    outline: 'none',
    fontSize: '14px',
    backgroundColor: '#ffffff',
    color: '#1e293b',
    fontFamily: "'Inter', sans-serif",
    cursor: 'pointer',
    transition: 'border-color 0.2s',
  },
  datetimeHelper: {
    fontSize: '12px',
    color: '#64748b',
    marginTop: '4px',
  },
  comparisonCard: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '20px',
    border: '1.5px solid #fce7f3',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  comparisonHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    borderBottom: '1px solid #fce7f3',
    paddingBottom: '10px',
  },
  comparisonTitle: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#be185d',
  },
  comparisonSubTitle: {
    fontSize: '11px',
    color: '#94a3b8',
  },
  comparisonRow: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
  },
  routeCard: {
    flex: 1,
    minWidth: '240px',
    borderRadius: '12px',
    padding: '16px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
    border: '1.5px solid #fce7f3',
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
    }
  },
  routeCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  routeName: {
    fontSize: '15px',
    fontWeight: '700',
  },
  safestBadge: {
    backgroundColor: '#d1fae5',
    color: '#065f46',
    fontSize: '10px',
    fontWeight: '700',
    padding: '2px 8px',
    borderRadius: '8px',
  },
  routeCardStats: {
    display: 'flex',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid #f1f5f9',
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
  },
  statLabel: {
    fontSize: '10px',
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#1e293b',
  },
  routeCardFooter: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  riskTextBadge: {
    fontSize: '10px',
    fontWeight: '700',
    padding: '2px 8px',
    borderRadius: '6px',
    textTransform: 'uppercase',
  },
  reasonText: {
    fontSize: '11px',
    color: '#475569',
    fontWeight: '500',
    flex: 1,
  },
  aggregationExplanation: {
    fontSize: '11px',
    color: '#64748b',
    backgroundColor: '#f8fafc',
    padding: '8px 12px',
    borderRadius: '8px',
    borderLeft: '3px solid #be185d',
    lineHeight: '1.4',
  },
};
