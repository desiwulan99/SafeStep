# SafeStep - Women Safety & Smart Protection Platform

SafeStep adalah platform berbasis Web Responsive yang dirancang untuk meningkatkan rasa aman dan memberikan perlindungan bagi perempuan saat beraktivitas di ruang publik. Platform ini menyediakan solusi terpadu mulai dari pencegahan proaktif (rekomendasi rute aman & prediksi risiko) hingga penanganan darurat (tombol SOS & pelacakan live).

---

## Fitur Utama (MVP)

1. **Safe Route Recommendation & Risk Prediction**
   - Menampilkan minimal 2 alternatif rute perjalanan dari lokasi asal ke tujuan.
   - Menyajikan skor risiko, estimasi waktu tempuh, serta alasan skor (riwayat insiden & jumlah titik aman/safe point).
   - Menyediakan rute *fallback* standar disertai informasi *disclaimer* jika data risiko di area tujuan masih terbatas.

2. **Emergency / SOS Feature**
   - Memicu sinyal darurat dalam waktu kurang dari 2 detik melalui mekanisme tekan & tahan tombol selama 2 detik.
   - Membagikan koordinat lokasi presisi secara otomatis ke seluruh kontak tepercaya (*Trusted Guardian*).
   - Menyediakan antarmuka alternatif via tautan SMS jika terjadi gangguan koneksi internet.

3. **Anonymous Reporting (Pelaporan Anonim)**
   - Memfasilitasi pelaporan insiden keamanan secara anonim tanpa merekam atau menampilkan data identitas pribadi pengguna.
   - Deteksi otomatis koordinat GPS dan stempel waktu kejadian, disertai opsi pengisian alamat manual.
   - Fitur validasi form otomatis untuk memastikan kategori insiden telah dipilih sebelum laporan dikirim ke antrean moderasi.

4. **Live Guardian & Safe Point**
   - Memungkinkan pelacakan lokasi secara *real-time* oleh kontak tepercaya yang dipilih.
   - Menampilkan visualisasi titik perlindungan fisik (*Safe Point*) terdekat dalam radius 2 km.
   - Menampilkan status baterai HP, status GPS, dan mekanisme penanganan jika *Guardian* tidak memberikan respon dalam waktu 2 menit.

5. **Dispatcher & Analytics Dashboard (Partner Stakeholder)**
   - Tampilan berbasis Web Dashboard khusus untuk instansi mitra (Kepolisian/Dishub/Pemkot/112).
   - Menyajikan *Pop-up Alert* real-time untuk sinyal SOS yang terverifikasi.
   - Visualisasi peta sebaran kejahatan (*Heatmap*) berdasarkan waktu dan kategori insiden, lengkap dengan opsi *export* data ke format PDF/CSV.

---

## Tech Stack & Dependencies

- **Frontend Framework:** React.js / Vite
- **Styling:** CSS3 / Tailwind CSS
- **Maps & Geolocation:** Leaflet.js / Mapbox API & Browser Geolocation API
- **Deployment Platform:** Vercel / Netlify

---

## Struktur Folder Proyek

```text
src/
├── assets/                  # Icons, images, dan global styles
├── components/              # Shared components (UI kit, Layout, Maps)
├── features/                # Modul utama berdasarkan PRD
│   ├── safe-route/          # Komponen & logika Safe Route Recommendation
│   ├── sos-emergency/       # Komponen & logika Emergency SOS
│   ├── anonymous-reporting/ # Komponen & logika Pelaporan Anonim
│   ├── live-guardian/       # Komponen & logika Live Tracking & Safe Point
│   └── partner-dashboard/   # Komponen & logika Dashboard Mitra / Dispatcher
├── hooks/                   # Custom hooks (e.g., useGeolocation)
├── services/                # Konfigurasi API client & endpoint
├── utils/                   # Helper functions, validators, & constants
└── pages/                   # Halaman / routing utama