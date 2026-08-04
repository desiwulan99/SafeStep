import MapWidget from "../maps/MapWidget";
import "./MapSection.css";

export default function MapSection({ userName, position, placeName, safePoints, geoStatus }) {
  return (
    <section className="map-section">
      <div className="map-section__heading">
        <h1>
          Halo, <span>{userName}!</span>
        </h1>
        <span className="map-section__pill">
          <span className="map-section__pill-dot" />
          Lokasi Aktif
        </span>
      </div>

      <MapWidget center={position} placeName={placeName} safePoints={safePoints} />

      {geoStatus === "error" && (
        <p className="map-section__notice">
          Tidak bisa mengakses lokasi kamu. Aktifkan izin lokasi untuk pengalaman terbaik.
        </p>
      )}
    </section>
  );
}
