import { useEffect, useState } from "react";
import { Map as MapIcon } from "lucide-react";
import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import MapSection from "../components/home/MapSection";
import QuickCard from "../components/home/QuickCard";
import ReportBanner from "../components/home/ReportBanner";
import RecentActivity from "../components/home/RecentActivity";
import Toast from "../components/common/Toast";
import SosButton from "../features/sos-emergency/components/SosButton";
import { useGeolocation } from "../hooks/useGeolocation";
import { useReverseGeocode } from "../hooks/useReverseGeocode";
import { getNearbySafePoints } from "../services/riskService";
import mascotImg from "../assets/images/mascot.png";
import "./HomePage.css";

const MOCK_ACTIVITY = [
  { id: 1, type: "route", title: "Rute ke lokasi terakhir dipilih", time: "2 jam lalu" },
  { id: 2, type: "report", title: "Laporan area gelap di sekitar lokasimu", time: "Kemarin" },
  { id: 3, type: "guardian", title: "Live Guardian dengan Kak Dinda selesai", time: "2 hari lalu" },
];

export default function HomePage({ userName = "user", onNavigate }) {
  const { position, status: geoStatus } = useGeolocation();
  const { placeName } = useReverseGeocode(position);

  const [safePoints, setSafePoints] = useState([]);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!position) return;
    getNearbySafePoints({ lat: position.lat, lng: position.lng }).then(setSafePoints);
  }, [position]);

  const handleSosSent = () => {
    setToast({
      tone: "success",
      title: "SOS Berhasil Dikirim!",
      description: "Lokasimu sudah dibagikan ke semua kontak darurat.",
    });
    window.setTimeout(() => setToast(null), 5000);
  };

  return (
    <div className="home-page">
      <Navbar userName={userName} />

      {toast && (
        <div className="home-page__toast">
          <Toast {...toast} onClose={() => setToast(null)} />
        </div>
      )}

      <div className="home-page__body">
        <Sidebar activeKey="home" onNavigate={onNavigate} />

        <main className="home-page__main">
          <MapSection
            userName={userName}
            position={position}
            placeName={placeName}
            safePoints={safePoints}
            geoStatus={geoStatus}
          />

          <ReportBanner onReport={() => onNavigate?.({ key: "report" })} />

          <RecentActivity items={MOCK_ACTIVITY} />
        </main>

        <aside className="home-page__side">
          <div className="home-page__sos-container">
            <SosButton position={position} userId="current-user" onSent={handleSosSent} />
          </div>

          <div className="home-page__cards">
            <QuickCard
              tone="pink"
              title="Live Guardian"
              description="Bagikan lokasi real-time-mu dengan kontak tepercaya!"
              actionLabel="Mulai sesi"
              icon={<img src={mascotImg} alt="Maskot SafeStep" />}
              onClick={() => console.log("navigate: live guardian")}
            />

            <QuickCard
              tone="light"
              title="Peta Aman Terdekat"
              description="Lihat titik perlindungan dalam radius 2 km dari lokasimu."
              actionLabel="Lihat peta"
              icon={<MapIcon size={30} strokeWidth={1.8} color="#B01A5B" />}
              onClick={() => console.log("navigate: safe route")}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
