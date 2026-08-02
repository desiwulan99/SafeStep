import React, { useState, useEffect, useRef } from "react";
import { Sidebar } from "../../components/layout/Sidebar.jsx";
import { predictSafetyRisk } from "../../services/riskService";

export const SafeRoute = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState("Peta Aman");
  const [selectedHour, setSelectedHour] = useState(new Date().getHours());
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(1);
  const mapContainerRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.L && mapContainerRef.current && !mapInstance.current) {
      mapInstance.current = window.L.map(mapContainerRef.current).setView([-6.2085, 106.8454], 13);
      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstance.current);
    }
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#fdf2f8' }}>
      <Sidebar activeTab={activeTab} onSelectMenu={onNavigate} />
      <main style={{ flex: 1, padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <h3>📍 Rute Perjalanan Aman</h3>
        <div style={{ backgroundColor: '#fff', padding: 20, borderRadius: 12 }}>
          <label style={{ fontWeight: 'bold' }}>Waktu Keberangkatan: {selectedHour}:00</label>
          <input 
            type="range" 
            min="0" 
            max="23" 
            value={selectedHour} 
            onChange={(e) => setSelectedHour(parseInt(e.target.value))} 
            style={{ width: '100%', marginTop: 8 }}
          />
        </div>
        <div ref={mapContainerRef} style={{ height: '380px', borderRadius: '16px', border: '1.5px solid #fce7f3' }} />
      </main>
    </div>
  );
};
