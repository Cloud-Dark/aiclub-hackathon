# Master Checklist

> Status: Draft
> Terakhir diperbarui: 2026-10-21
> Pemilik: Tim AIClub Hackathon

Checklist ini melacak kemajuan tiap fase di [06_IMPLEMENTATION_PLAN.md](06_IMPLEMENTATION_PLAN.md). Penandaan `[x]` pada prototipe dummy berdasarkan riwayat `git log` per 2026-10-21; integrasi aiclub.id belum dimulai (`[ ]`). Jadwal: [08_ROADMAP.md](08_ROADMAP.md). Risiko: [10_RISK_REGISTER.md](10_RISK_REGISTER.md).

## Ringkasan

| Bagian | Status |
|---|---|
| Prototipe dummy | Selesai |
| Fase 0 Keputusan | Belum mulai |
| Fase 1 Auth | Belum mulai |
| Fase 2 Data peserta | Belum mulai |
| Fase 3 Tim dan lamaran | Belum mulai |
| Fase 4 Pembersihan | Belum mulai |
| Fase 5 Admin (opsional) | Belum mulai |

## A. Prototipe Dummy (selesai)

Dasar: riwayat commit 2026-10-19 sampai 2026-10-21.

- [x] Pecah form pendaftaran menjadi React + Vite (commit 2026-10-19)
- [x] README awal; hilangkan fokus ring judul saat load (2026-10-19)
- [x] Alur 3 langkah: daftar di portal, daftar tim ke Tencent, submit project; indikator langkah kecil di langkah 1 (2026-10-19)
- [x] Gabung grup WhatsApp utama wajib sebelum pasar tim (2026-10-19)
- [x] Wizard tim: pilih gabung atau buat (eksklusif), tutup/keluar tim untuk pindah, indikator langkah (2026-10-19)
- [x] Satu lamaran aktif per orang; halaman detail tim dan grup; link WhatsApp hanya setelah disetujui (2026-10-19)
- [x] Lamar per grup tim dengan approve/reject owner; status, aktivitas, timeline (2026-10-19)
- [x] Halaman login aiclub.id (dummy); data wajib (kota, WhatsApp) sebelum pasar tim (2026-10-19)
- [x] i18n id/en/zh (`src/i18n/id.js`, `en.js`, `zh.js`)
- [x] Info event resmi: hadiah USD 3.100, 3 tantangan, tanggal penting, mitra, logo, poster, favicon, footer mitra (2026-10-19)
- [x] Revisi pusat: batas pendaftaran 1 Nov menggantikan 6 minggu; kartu target peserta dihapus (2026-10-19)
- [x] Build ke `docs/` dan deploy GitHub Pages (2026-10-19)
- [x] Apps Script dihapus (2026-10-19)
- [x] `brief.md`: rencana integrasi login, session, dan database aiclub.id (2026-10-21)
- [x] Perbaikan `vite.config.js`: `emptyOutDir: false` dan hanya `docs/assets` yang dibersihkan, agar `docs/*.md` tidak terhapus (2026-10-21)
- [x] Link undangan tim: owner membagikan link `?tim=...`, pengunjung melamar lewat link (FR-059, mode demo)
- [ ] Dokumentasi proyek (`docs/00` sampai `docs/20`, `standards/`) lengkap dan ditinjau (sedang disusun, status Draft)

## B. Fase 0 - Keputusan

- [ ] Pertanyaan brief bagian 8 dikirim ke pengelola aiclub.id
- [ ] 8.1 Login: OAuth/OIDC atau cookie session; hosting di `*.aiclub.id` dimungkinkan
- [ ] 8.2 Format dan cara validasi session diketahui
- [ ] 8.3 Akses DB (binding D1 atau API) dan pelaksana migrasi ditetapkan
- [ ] 8.4 Endpoint profil milik sendiri dan izin tulis kota/WA/LinkedIn dipastikan
- [ ] 8.5 Dasar persetujuan data pribadi dipastikan; layar persetujuan diputuskan
- [ ] 8.6 Kebutuhan pencocokan identitas Tencent diputuskan
- [ ] 8.7 Peran yang boleh melihat seluruh data diputuskan
- [ ] 8.8 Hosting produksi diputuskan
- [ ] Opsi login dipilih (A, B, atau C) dan dicatat di [11_DECISIONS.md](11_DECISIONS.md)
- [ ] [04_TRD.md](04_TRD.md) diperbarui sesuai keputusan

## C. Fase 1 - Auth

- [ ] Worker/BFF dengan validasi session; `401` tanpa session
- [ ] `GET /api/hackathon/me` dan `POST /api/auth/logout`
- [ ] `src/lib/api.js` (fetch `credentials: "include"`, penanganan `401`)
- [ ] `Login.jsx` diganti tombol Masuk dengan aiclub.id
- [ ] `initState()` memakai `GET /me`; state `loading`/`error`; `PERSIST` hanya `lang` dan `screen`
- [ ] Layar Data diri terisi dari profil (kota via `cityId`)
- [ ] Perilaku tulis-balik profil atau override ditetapkan dan diuji
- [ ] `DUMMY_USERS` dihapus; teks login dummy dihapus di id/en/zh
- [ ] Variabel `VITE_API_BASE` dan `VITE_LOGIN_URL` terpasang; tidak ada rahasia di bundel
- [ ] Uji: refresh tetap login; logout berlaku di kedua sisi

## D. Fase 2 - Data Peserta

- [ ] Migrasi `hackathon_participant`
- [ ] `PATCH /api/hackathon/me` dengan validasi input
- [ ] Jalur resmi dihitung ulang di server dari `jawaban`
- [ ] Flag `joinedMain`, `tencentClicked`, `projectReady`, `submitClicked` tersimpan di server
- [ ] Submit ke Tencent ditolak bila `project_ready_at` kosong
- [ ] Guard layar di `initState()` memakai status server
- [ ] Uji lintas browser/perangkat: progres tetap ada

## E. Fase 3 - Tim dan Lamaran

- [ ] Migrasi `hackathon_team`, `hackathon_application`, `hackathon_invite`, `hackathon_activity`
- [ ] Indeks unik `one_active_app` dan `owner_id UNIQUE` aktif
- [ ] Endpoint tim, lamaran, keputusan, undangan sesuai brief bagian 6
- [ ] Aturan 5.3 (1): satu orang satu tim atau owner, ditegakkan server
- [ ] Aturan 5.3 (2): satu lamaran aktif per orang, ditegakkan constraint DB
- [ ] Aturan 5.3 (3): persetujuan membuat lamaran `pending` lain `withdrawn` dalam satu transaksi
- [ ] Aturan 5.3 (4): `wa_link` hanya untuk owner dan pelamar `approved`
- [ ] Aturan 5.3 (5): urutan pindah pilihan ditegakkan
- [ ] Aturan 5.3 (6): `WA_LINK_RE` divalidasi di server
- [ ] Aturan 5.3 (7): submit Tencent hanya bila `project_ready_at` terisi
- [ ] `403` untuk owner lain yang mencoba memutuskan lamaran tim bukan miliknya
- [ ] Uji lamaran bersamaan (race) lolos
- [ ] Layar Market, TeamDetail, Choose, MyTeam, Create, Dash membaca dari API dengan state memuat, kosong, gagal
- [ ] Uji end-to-end dua akun nyata

## F. Fase 4 - Pembersihan

- [ ] `TIM`, `BUILDER`, `SEED_APPLICANTS`, `CONFIG.demoOwner` dihapus
- [ ] Teks dan cabang kode mode demo dihapus
- [ ] `localStorage` hanya berisi preferensi
- [ ] Pencarian: tidak ada referensi `DUMMY_USERS`, `TIM`, `BUILDER`
- [ ] `README.md` diperbarui
- [ ] Domain produksi aktif; nasib GitHub Pages diputuskan
- [ ] Kriteria selesai brief bagian 10 diperiksa seluruhnya

## G. Fase 5 - Admin (Opsional)

- [ ] Peran akses admin ditetapkan
- [ ] Endpoint daftar peserta/tim dengan otorisasi
- [ ] Ekspor CSV; nomor WA tidak bocor ke peserta lain
- [ ] Uji otorisasi (peserta biasa ditolak)
