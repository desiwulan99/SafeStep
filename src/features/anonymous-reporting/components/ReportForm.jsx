import React, { useState } from "react";
import { useGeolocation } from "../../../hooks/useGeolocation";

export const ReportForm = () => {
  const { location, error: geoError, loading: geoLoading } = useGeolocation();
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [manualAddress, setManualAddress] = useState("");
  const [validationError, setValidationError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!category) {
      setValidationError("Pilih kategori insiden terlebih dahulu.");
      return;
    }
    setValidationError("");
    setIsSubmitting(true);

    const reportPayload = {
      category,
      description,
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
        manualAddress: manualAddress.trim() || null,
      },
      timestamp: new Date().toISOString(),
    };

    console.log("Payload Laporan Anonim SafeStep:", reportPayload);

    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessMessage("Laporan anonim Anda berhasil dikirim.");
      setCategory("");
      setDescription("");
      setManualAddress("");
    }, 1000);
  };

  return (
    <div style={{ maxWidth: "480px", margin: "20px auto", padding: "24px", borderRadius: "12px", border: "1px solid #e5e7eb", backgroundColor: "#ffffff" }}>
      <h2>Laporkan Insiden Anonim</h2>
      <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
        Identitas Anda aman dan tidak akan direkam oleh sistem.
      </p>

      {validationError && <div style={{ color: "#991b1b", backgroundColor: "#fef2f2", padding: "10px", marginBottom: "16px", borderRadius: "6px" }}>{validationError}</div>}
      {successMessage && <div style={{ color: "#166534", backgroundColor: "#f0fdf4", padding: "10px", marginBottom: "16px", borderRadius: "6px" }}>{successMessage}</div>}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "6px", fontWeight: "600" }}>
            Kategori Insiden *
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #d1d5db" }}
          >
            <option value="">-- Pilih Kategori --</option>
            <option value="Catcalling / Pelecehan Verbal">Catcalling / Pelecehan Verbal</option>
            <option value="Pelecehan Fisik">Pelecehan Fisik</option>
            <option value="Penguntitan (Stalking)">Penguntitan (Stalking)</option>
            <option value="Area Minim Penerangan">Area Minim Penerangan</option>
            <option value="Lainnya">Lainnya</option>
          </select>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "6px", fontWeight: "600" }}>Lokasi Kejadian (GPS)</label>
          <div style={{ padding: "10px", borderRadius: "6px", backgroundColor: "#f9fafb", border: "1px solid #f3f4f6", fontSize: "0.85rem" }}>
            {geoLoading && <span>Mendeteksi koordinat GPS...</span>}
            {!geoLoading && location.latitude && (
              <span style={{ color: "green" }}>
                GPS Terdeteksi ({location.latitude.toFixed(5)}, {location.longitude.toFixed(5)})
              </span>
            )}
            {!geoLoading && geoError && (
              <span style={{ color: "orange" }}>{geoError}</span>
            )}
          </div>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "6px", fontWeight: "600" }}>Alamat / Patokan Lokasi Manual (Opsional)</label>
          <input
            type="text"
            value={manualAddress}
            onChange={(e) => setManualAddress(e.target.value)}
            placeholder="Contoh: Dekat halte BSI, gang sepi sebelah minimarket"
            style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #d1d5db", boxSizing: "border-box" }}
          />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "6px", fontWeight: "600" }}>Deskripsi Kejadian</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Ceritakan singkat kronologi tanpa menyebutkan data pribadi Anda..."
            style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #d1d5db", boxSizing: "border-box", resize: "vertical" }}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            width: "100%",
            padding: "12px",
            color: "#ffffff",
            backgroundColor: isSubmitting ? "#9ca3af" : "#e11d48",
            border: "none",
            borderRadius: "6px",
            fontSize: "1rem",
            fontWeight: "600",
            cursor: "pointer"
          }}
        >
          {isSubmitting ? "Mengirim..." : "Kirim Laporan Anonim"}
        </button>
      </form>
    </div>
  );
};
