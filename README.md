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
├── assets/                  # Icons, gambar SVG/PNG, dan asset statis
│   └── images/
├── components/              # Komponen UI modular
│   ├── common/              # Komponen reusable (SosButton, Toast, SelectGuardianModal, QuickCard)
│   ├── layout/              # Komponen struktur halaman (Navbar, Sidebar)
│   ├── home/                # Komponen spesifik Beranda (MapSection, RecentActivity, ReportBanner)
│   └── maps/                # Komponen pemetaan (MapWidget)
├── hooks/                   # Custom React Hooks (useGeolocation, useReverseGeocode, useSosTrigger)
├── pages/                   # Halaman utama aplikasi (SPA Views)
│   ├── HomePage.jsx & HomePage.css         # Halaman Beranda Utama
│   ├── SafeRoutePage.jsx & SafeRoutePage.css # Halaman Peta Aman & Insights Rute
│   ├── LiveGuardianPage.jsx & LiveGuardianPage.css # Halaman Live Guardian & Tracking
│   └── ReportPage.jsx & ReportPage.css     # Halaman Pelaporan Anonim
├── services/                # Konfigurasi API client & endpoint service
│   ├── apiConfig.js         # API Fetch client wrapper
│   ├── riskService.js       # MLOps Risk Prediction API & Overpass POIs
│   ├── locationService.js   # Nominatim Reverse & Forward Geocoding
│   ├── guardianService.js   # Live Guardian tracking & chat session
│   └── sosService.js        # Emergency SOS trigger service
└── utils/                   # Helper functions, validators, & constants
    └── constants.js
```

SISTECH Group 9 FE - Desi Wulan Sari & Tasya Angellica Sugiharto

