import { useState, useEffect, useRef } from "react";
import {
  User,
  Check,
  CheckCheck,
  MapPin,
  Battery,
  ArrowLeft,
  MoreVertical,
  Paperclip,
  Camera,
  Mic,
  Send,
  X,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import QuickCard from "../components/home/QuickCard";
import Toast from "../components/common/Toast";
import SosButton from "../features/sos-emergency/components/SosButton";
import { useGeolocation } from "../hooks/useGeolocation";
import mascotImg from "../assets/images/mascot.svg";
import "./LiveGuardianPage.css";

const avatarMarkerIcon = L.divIcon({
  className: "map-pin map-pin--user",
  html: '<span class="map-pin__dot" style="background: #a81b58; border: 3px solid #ffffff;"></span>',
  iconSize: [26, 26],
  iconAnchor: [13, 13],
});

export default function LiveGuardianPage({ userName = "user", onNavigate }) {
  const { position } = useGeolocation();

  // Navigation / View state: "list" | "chat" | "map"
  const [viewMode, setViewMode] = useState("list");
  const [isActiveGuardian, setIsActiveGuardian] = useState(false);
  const [activeContact, setActiveContact] = useState("Ibu");
  const [inputText, setInputText] = useState("");
  const [toast, setToast] = useState(null);
  const [showSosModal, setShowSosModal] = useState(false);

  // Real-time timer count state (starts at 204 seconds = 03:24)
  const [activeSeconds, setActiveSeconds] = useState(204);

  // Invitation state for Anita
  const [anitaInviteStatus, setAnitaInviteStatus] = useState("pending"); // "pending" | "accepted"

  // Real chat messages state array per contact
  const [chatMessages, setChatMessages] = useState({
    Ibu: [
      {
        id: 1,
        sender: "user",
        text: "Memilih Ibu menjadi Live Guardian",
        time: "14:20",
        type: "invite",
      },
      {
        id: 2,
        sender: "Ibu",
        text: "Ibu menjadi Live Guardian",
        time: "14:20",
        type: "accepted",
      },
      {
        id: 3,
        sender: "Ibu",
        text: "Oke, nanti Ibu jemput di situ ya.",
        time: "14:22",
      },
    ],
    Anita: [
      {
        id: 1,
        sender: "Anita",
        text: "anita06 memilih Anda menjadi Live Guardian",
        time: "14:20",
        type: "invite_received",
      },
    ],
    "Kak Inul": [
      {
        id: 1,
        sender: "Kak Inul",
        text: "Live Tracking Sent.",
        time: "14:15",
      },
    ],
  });

  const messagesEndRef = useRef(null);

  // Incremental real-time timer
  useEffect(() => {
    let interval = null;
    if (isActiveGuardian) {
      interval = setInterval(() => {
        setActiveSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActiveGuardian]);

  // Auto scroll to bottom of chat
  useEffect(() => {
    if (viewMode === "chat") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, viewMode]);

  const formatTimer = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const contacts = [
    {
      id: "ibu",
      name: "Ibu",
      lastMsg:
        chatMessages.Ibu?.[chatMessages.Ibu.length - 1]?.text ||
        "Oke, nanti Ibu jemput di situ ya.",
      unread: 1,
      isOnline: true,
      hasWings: true,
    },
    {
      id: "kak-inul",
      name: "Kak Inul",
      lastMsg: "Live Tracking Sent.",
      unread: 0,
      isOnline: false,
      isTrackingSent: true,
    },
    {
      id: "anita",
      name: "Anita",
      lastMsg:
        chatMessages.Anita?.[chatMessages.Anita.length - 1]?.text ||
        "anita06 memilih Anda menjadi Live Guardian",
      unread: 3,
      isOnline: true,
    },
  ];

  const handleSosSent = () => {
    setShowSosModal(true);
  };

  const handleToggleActivate = () => {
    const nextState = !isActiveGuardian;
    setIsActiveGuardian(nextState);
    if (nextState) {
      setToast({
        tone: "success",
        title: "Live Guardian Aktif",
        description: "Status perjalananmu kini dipantau secara langsung.",
      });
      window.setTimeout(() => setToast(null), 5000);
    }
  };

  const handleOpenChat = (contactName) => {
    setActiveContact(contactName);
    setViewMode("chat");
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;

    const newMsg = {
      id: Date.now(),
      sender: "user",
      text: inputText.trim(),
      time: timeStr,
    };

    setChatMessages((prev) => ({
      ...prev,
      [activeContact]: [...(prev[activeContact] || []), newMsg],
    }));

    setInputText("");
  };

  const mapCenter = position ? [position.lat, position.lng] : [-6.2088, 106.8456];

  return (
    <div className="guardian-page">
      <Navbar userName={userName} />

      {toast && (
        <div className="guardian-page__toast">
          <Toast {...toast} onClose={() => setToast(null)} />
        </div>
      )}

      <div className="guardian-page__body">
        <Sidebar activeKey="live-guardian" onNavigate={onNavigate} />

        <main className="guardian-page__main">
          {/* FLOATING SOS EMERGENCY MODAL (Matching Screenshot) */}
          {showSosModal && (
            <div
              className="guardian-page__modal-overlay"
              onClick={() => setShowSosModal(false)}
            >
              <div
                className="guardian-page__sos-modal"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  className="guardian-page__modal-close"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowSosModal(false);
                  }}
                  aria-label="Tutup"
                >
                  <X size={20} />
                </button>

                <svg className="guardian-page__sos-icon-svg" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 3L2 12H5V20H19V12H22L12 3Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 8V13M12 16H12.01"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>

                <h2 className="guardian-page__sos-modal-title">SOS</h2>
                <p className="guardian-page__sos-modal-text">
                  Anita membutuhkan bantuanmu!
                  <br />
                  Segera periksa lokasinya.
                </p>

                <button
                  type="button"
                  className="guardian-page__sos-modal-btn"
                  onClick={() => {
                    setShowSosModal(false);
                    setActiveContact("Anita");
                    setIsActiveGuardian(true);
                    setViewMode("map");
                  }}
                >
                  Ke Lokasi
                </button>
              </div>
            </div>
          )}

          <div className="guardian-page__title-row">
            <h1 className="guardian-page__title">Live Guardian</h1>
            {isActiveGuardian && (
              <span className="guardian-page__timer">{formatTimer(activeSeconds)}</span>
            )}
          </div>

          {/* VIEW MODE 1: MAIN LIST VIEW (Mockups 1 & 2) */}
          {viewMode === "list" && (
            <>
              {/* Top Status Card */}
              <div className="guardian-page__status-card">
                {!isActiveGuardian ? (
                  <>
                    <div className="guardian-page__mascot-avatar">
                      <img src={mascotImg} alt="Maskot SafeStep" />
                    </div>
                    <p className="guardian-page__status-text">
                      Saat ini Anda sedang tidak mengaktifkan fitur Live Guardian.
                    </p>
                    <button
                      type="button"
                      className="guardian-page__activate-btn"
                      onClick={handleToggleActivate}
                    >
                      Aktifkan?
                    </button>
                  </>
                ) : (
                  <>
                    <div className="guardian-page__avatar-large">
                      <User size={48} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <h3 className="guardian-page__name-lg">{activeContact}</h3>
                      <span className="guardian-page__online-badge">Online</span>
                    </div>
                    <button
                      type="button"
                      className="guardian-page__activate-btn guardian-page__activate-btn--active"
                      onClick={() => setViewMode("map")}
                    >
                      Periksa Lokasi
                    </button>
                  </>
                )}
              </div>

              {/* Chat Contacts List Card */}
              <div className="guardian-page__chat-card">
                <h3 className="guardian-page__chat-title">Chat</h3>
                <div className="guardian-page__chat-list">
                  {contacts.map((c) => (
                    <div
                      key={c.id}
                      className="guardian-page__chat-item"
                      onClick={() => handleOpenChat(c.name)}
                    >
                      <div className="guardian-page__chat-avatar">
                        <User size={22} />
                      </div>

                      <div className="guardian-page__chat-info">
                        <div className="guardian-page__chat-name-row">
                          <span className="guardian-page__chat-name">{c.name}</span>
                          {c.hasWings && <ShieldCheck size={16} color="#a81b58" />}
                        </div>
                        <span className="guardian-page__chat-snippet">
                          {c.isTrackingSent ? "🔵 " : ""}
                          {c.lastMsg}
                        </span>
                      </div>

                      {c.unread > 0 && (
                        <div className="guardian-page__chat-badge">{c.unread}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* VIEW MODE 2: CHAT ROOM VIEW (Mockups 3 & 4) */}
          {viewMode === "chat" && (
            <div className="guardian-page__room-card">
              {/* Chat Header Bar */}
              <div className="guardian-page__room-header">
                <button
                  type="button"
                  className="guardian-page__back-btn"
                  onClick={() => setViewMode("list")}
                >
                  <ArrowLeft size={20} />
                </button>
                <div className="guardian-page__room-avatar">
                  <User size={22} />
                </div>
                <div className="guardian-page__room-title-area">
                  <span className="guardian-page__room-name">{activeContact}</span>
                  <span className="guardian-page__online-badge">Online</span>
                </div>
                <button type="button" className="guardian-page__back-btn">
                  <MoreVertical size={20} />
                </button>
              </div>

              {/* Sub-header Banner */}
              <div className="guardian-page__room-sub-banner">
                <span>
                  {activeContact === "Anita"
                    ? "Periksa lokasi Anita"
                    : "Live Guardian sedang aktif"}
                </span>
                <X size={16} style={{ cursor: "pointer" }} onClick={() => setViewMode("list")} />
              </div>

              {/* Real Messages Scroll Area */}
              <div className="guardian-page__room-messages">
                {(chatMessages[activeContact] || []).map((m) => {
                  if (m.type === "invite") {
                    return (
                      <div
                        key={m.id}
                        className="guardian-page__msg-bubble guardian-page__msg-bubble--sent"
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <ShieldCheck size={16} />
                          <span>{m.text}</span>
                        </div>
                        <span className="guardian-page__msg-time">{m.time}</span>
                      </div>
                    );
                  }

                  if (m.type === "accepted") {
                    return (
                      <div
                        key={m.id}
                        className="guardian-page__msg-bubble guardian-page__msg-bubble--received"
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <ShieldCheck size={16} color="#a81b58" />
                          <span>{m.text}</span>
                        </div>
                        <button className="guardian-page__msg-btn">
                          <span>Diterima</span>
                          <Check size={16} />
                        </button>
                        <span className="guardian-page__msg-time">{m.time}</span>
                      </div>
                    );
                  }

                  if (m.type === "invite_received") {
                    return (
                      <div key={m.id}>
                        {anitaInviteStatus === "pending" ? (
                          <div className="guardian-page__msg-bubble guardian-page__msg-bubble--received">
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <ShieldCheck size={16} color="#a81b58" />
                              <span>{m.text}</span>
                            </div>
                            <div className="guardian-page__msg-btn-group">
                              <button
                                className="guardian-page__msg-btn"
                                onClick={() => setAnitaInviteStatus("accepted")}
                              >
                                Terima
                              </button>
                              <button
                                className="guardian-page__msg-btn guardian-page__msg-btn--outline"
                                onClick={() => setAnitaInviteStatus("rejected")}
                              >
                                Tolak
                              </button>
                            </div>
                            <span className="guardian-page__msg-time">{m.time}</span>
                          </div>
                        ) : (
                          <div className="guardian-page__msg-bubble guardian-page__msg-bubble--sent">
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <ShieldCheck size={16} />
                              <span>Anda telah menjadi Live Guardian</span>
                            </div>
                            <button
                              className="guardian-page__msg-btn guardian-page__msg-btn--outline"
                              onClick={() => setViewMode("map")}
                              style={{
                                background: "#ffffff",
                                color: "#a81b58",
                                marginTop: "6px",
                              }}
                            >
                              Periksa Lokasi
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  }

                  return (
                    <div
                      key={m.id}
                      className={`guardian-page__msg-bubble ${
                        m.sender === "user"
                          ? "guardian-page__msg-bubble--sent"
                          : "guardian-page__msg-bubble--received"
                      }`}
                    >
                      <p className="guardian-page__msg-text">{m.text}</p>
                      <span className="guardian-page__msg-time">{m.time}</span>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Bottom Input Bar */}
              <div className="guardian-page__room-input-bar">
                <div className="guardian-page__room-input-wrap">
                  <input
                    type="text"
                    className="guardian-page__room-input"
                    placeholder="Pesan..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  />
                  <button type="button" className="guardian-page__icon-btn">
                    <Paperclip size={18} />
                  </button>
                  <button type="button" className="guardian-page__icon-btn">
                    <Camera size={18} />
                  </button>
                  <button type="button" className="guardian-page__icon-btn">
                    <Mic size={18} />
                  </button>
                </div>
                <button
                  type="button"
                  className="guardian-page__activate-btn"
                  style={{ padding: "10px 16px" }}
                  onClick={handleSendMessage}
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          )}

          {/* VIEW MODE 3: LIVE MAP TRACKING VIEW (Mockup 5) */}
          {viewMode === "map" && (
            <>
              {/* Interactive Leaflet Tracking Map */}
              <div className="guardian-page__map-tracking-card">
                <button
                  type="button"
                  className="guardian-page__map-close-btn"
                  onClick={() => setViewMode("list")}
                  aria-label="Tutup Peta"
                >
                  <X size={18} />
                </button>

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
                  <Marker position={mapCenter} icon={avatarMarkerIcon}>
                    <Popup>📍 Lokasi Real-time: {activeContact}</Popup>
                  </Marker>
                </MapContainer>
              </div>

              {/* Bottom Contact Details Card */}
              <div className="guardian-page__tracking-info-card">
                <div className="guardian-page__tracking-left">
                  <div className="guardian-page__tracking-avatar">
                    <User size={28} />
                  </div>
                  <div className="guardian-page__tracking-details">
                    <div className="guardian-page__tracking-name-row">
                      <span className="guardian-page__tracking-name">{activeContact}</span>
                      <span className="guardian-page__online-badge">Online</span>
                    </div>
                    <div className="guardian-page__tracking-meta">
                      <div className="guardian-page__tracking-meta-item">
                        <MapPin size={14} color="#ffffff" />
                        <span>St. Manggarai</span>
                      </div>
                      <div className="guardian-page__tracking-meta-item">
                        <Battery size={14} color="#ffffff" />
                        <span>50%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="guardian-page__chat-action-btn"
                  onClick={() => setViewMode("chat")}
                >
                  Chat
                </button>
              </div>
            </>
          )}
        </main>

        {/* Right Side Column */}
        <aside className="guardian-page__side">
          <div className="guardian-page__sos-container">
            <SosButton position={position} userId="current-user" onSent={handleSosSent} />
          </div>

          <QuickCard
            tone="pink"
            title="Live Guardian"
            description="Bagikan lokasi real-time mu dengan kontak terpercaya!"
            actionLabel="Mulai sesi"
            icon={<img src={mascotImg} alt="Maskot SafeStep" />}
            onClick={() => setViewMode("list")}
          />
        </aside>
      </div>
    </div>
  );
}
