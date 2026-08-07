import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./MapWidget.css";

const userIcon = L.divIcon({
  className: "map-pin map-pin--user",
  html: '<span class="map-pin__dot"></span>',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

const safePointIcon = L.divIcon({
  className: "map-pin map-pin--safe",
  html: '<span class="map-pin__dot"></span>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

export default function MapWidget({
  center,
  zoom = 16,
  safePoints = [],
  placeName,
  height = 320,
  geoStatus = "idle",
}) {
  const isLocating = geoStatus === "locating" || (geoStatus === "idle" && !center);

  if (isLocating) {
    return (
      <div className="map-widget map-widget--loading" style={{ height }}>
        <div className="map-widget__spinner" />
        <p>Mengambil lokasi kamu...</p>
      </div>
    );
  }

  const defaultCenter = { lat: -6.2088, lng: 106.8456 }; // Jakarta center
  const displayCenter = center || defaultCenter;

  return (
    <div className="map-widget" style={{ height }}>
      <MapContainer
        key={`${displayCenter.lat}-${displayCenter.lng}`}
        center={[displayCenter.lat, displayCenter.lng]}
        zoom={zoom}
        scrollWheelZoom={false}
        className="map-widget__map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        {center && (
          <Marker position={[center.lat, center.lng]} icon={userIcon}>
            <Popup>{placeName || "Lokasi kamu saat ini"}</Popup>
          </Marker>
        )}
        {center && center.accuracy && (
          <Circle
            center={[center.lat, center.lng]}
            radius={center.accuracy}
            pathOptions={{ color: "#B01A5B", fillOpacity: 0.08, weight: 1 }}
          />
        )}
        {safePoints.map((sp) => (
          <Marker key={sp.id} position={[sp.lat, sp.lng]} icon={safePointIcon}>
            <Popup>{sp.name}</Popup>
          </Marker>
        ))}
      </MapContainer>

      {placeName && (
        <div className="map-widget__badge">
          <span className="map-widget__badge-dot" />
          {placeName}
        </div>
      )}
    </div>
  );
}
