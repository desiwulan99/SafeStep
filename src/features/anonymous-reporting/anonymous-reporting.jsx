import React, { useState } from "react";
// import { useGeolocation } from "../../../hooks/useGeolocation";

export const ReportForm = () => {
//   const { location, error: geoError, loading: geoLoading } = useGeolocation();
//   const [category, setCategory] = useState("");
//   const [description, setDescription] = useState("");
//   const [manualAddress, setManualAddress] = useState("");
//   const [validationError, setValidationError] = useState("");
//   const [successMessage, setSuccessMessage] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (!category) {
//       setValidationError("Pilih kategori insiden terlebih dahulu.");
//       return;
//     }
//     setValidationError("");
//     setIsSubmitting(true);

//     const reportPayload = {
//       category,
//       description,
//       location: {
//         latitude: location.latitude,
//         longitude: location.longitude,
//         manualAddress: manualAddress.trim() || null,
//       },
//       timestamp: new Date().toISOString(),
//     };

//     console.log("Payload Laporan Anonim SafeStep:", reportPayload);

//     setTimeout(() => {
//       setIsSubmitting(false);
//       setSuccessMessage("Laporan anonim Anda berhasil dikirim.");
//       setCategory("");
//       setDescription("");
//       setManualAddress("");
//     }, 1000);
  };

  return (
    <div>
      <header className="top-bar">
        <h1 style={{ margin: 0 }}>Laporkan Insiden</h1>
        <div className="top-badge">
          <img src="#" alt="notification"/>
          <img src="#" alt="profile"/>
        </div>
      </header>

      <p>Laporan ini anonim, identitas Anda tidak akan ditampilkan ke publik.</p>

      <content className="form-container">
        <section className="category-box">
          <h3>Pilih Kategori</h3>
          <p>Catcalling</p>
          <p>Mengikuti</p>
          <p>Kontak Fisik</p>
          <p>Lainnya</p>
        </section>
        
        <section className="location-time-box">
            <h3>Lokasi & Waktu</h3>
            <div>
                Lokasi sekarang
            </div>
            <div>
                Waktu sekarang
            </div>
        </section>

        <section className="description-box">
            <h3>Deskripsi Kejadian</h3>
            <p>Ceritakan detail kejadian secara singkat untuk membantu pemetaan zona rawan.</p>
            <textarea placeholder="Tuliskan apa yang terjadi..." rows={4} />
        </section>

        <section className="proofment-box">
            <h3>Bukti Pendukung</h3>
            <input type="file" accept="image/*,video/*" 
            placeholder="Klik untuk unggah foto atau video\nFormat: JPG, PNG, MP4 (Max. 20MB)" />
        </section>
      </content>

      <button onClick={handleSubmit} disabled={isSubmitting}>
        {isSubmitting ? "Mengirim..." : "Kirim Laporan"}
      </button>
    </div>
  );
