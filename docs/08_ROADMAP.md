# Roadmap

> Status: Draft
> Terakhir diperbarui: 2026-10-21
> Pemilik: Tim AIClub Hackathon

Legenda: ✅ selesai, 🚧 sedang berjalan, 📋 direncanakan. Rincian kerja ada di [06_IMPLEMENTATION_PLAN.md](06_IMPLEMENTATION_PLAN.md); checklist di [07_MASTER_CHECKLIST.md](07_MASTER_CHECKLIST.md).

## 1. Tenggat Penting Event

Sumber: `src/i18n/id.js` (kunci `schedule` dan `event.dates`). Hanya tanggal yang tertulis di sana yang dipakai.

| Tanggal | Peristiwa | Keterangan |
|---|---|---|
| 15 Okt 2026 | Pendaftaran dibuka | Daftar di aiclub.id, gabung grup WhatsApp, pilih satu tantangan |
| 1 Nov 2026, 23.59 WIB | Batas pendaftaran dan pengumpulan karya | Pasar tim dan pendaftaran tutup |
| 14 Nov 2026 | Pengumuman finalis | |
| 27 Nov 2026, 13.00-16.00 WIB | Demo Day dan Awarding, Jakarta | Juara 1, 2, dan 3 diumumkan; lokasi detail menyusul (`event.venue`) |

Catatan: tahun 2026 mengikuti nama event "Tencent Cloud Hackathon Indonesia 2026" dan tanggal commit; teks jadwal di `id.js` tidak menulis tahun secara eksplisit.

## 2. Milestone Proyek Portal

| # | Milestone | Tanggal | Status | Catatan |
|---|---|---|---|---|
| M1 | Pecah form menjadi React + Vite | 2026-10-19 | ✅ | |
| M2 | Alur 3 langkah, wizard tim, satu lamaran aktif, link WA setelah disetujui | 2026-10-19 | ✅ | |
| M3 | Login dummy, data wajib, build ke `docs/` untuk GitHub Pages | 2026-10-19 | ✅ | |
| M4 | Info event resmi, logo, poster, footer mitra; i18n id/en/zh | 2026-10-19 | ✅ | |
| M5 | `brief.md` integrasi aiclub.id | 2026-10-21 | ✅ | |
| M6 | Perbaikan `emptyOutDir` pada `vite.config.js` agar `docs/*.md` aman | 2026-10-21 | ✅ | Dikerjakan Alya, 2026-10-21 |
| M7 | Dokumentasi proyek (`docs/00` sampai `docs/20`, `standards/`) | 2026-10-21 | 🚧 | Status Draft |
| M8 | Fase 0: keputusan dan jawaban pertanyaan brief bagian 8 | _TBD_ | 📋 | Memblokir fase lain |
| M9 | Fase 1: Auth aiclub.id | _TBD_ | 📋 | Target: sebelum 1 Nov 2026 bila memungkinkan |
| M10 | Fase 2: Data peserta di server | _TBD_ | 📋 | Target: sebelum 1 Nov 2026 bila memungkinkan |
| M11 | Fase 3: Tim dan lamaran di server | _TBD_ | 📋 | Target: sebelum 1 Nov 2026 bila memungkinkan |
| M12 | Fase 4: Pembersihan dan domain produksi | _TBD_ | 📋 | |
| M13 | Fase 5: Admin dan ekspor CSV (opsional) | _TBD_ | 📋 | |

## 3. Linimasa Gabungan

```
Okt 2026
 15 ── Pendaftaran event dibuka
 19 ── M1-M4 prototipe dummy selesai, deploy Pages
 21 ── M5 brief.md, M6 perbaikan emptyOutDir, M7 dokumentasi dimulai
Nov 2026
  1 ── Batas pendaftaran dan pengumpulan karya (23.59 WIB)
 14 ── Pengumuman finalis
 27 ── Demo Day dan Awarding, Jakarta
```

## 4. Keterkaitan dengan Tenggat

- Pendaftaran ditutup 1 Nov 2026. Selama integrasi aiclub.id belum selesai, portal tetap berjalan sebagai prototipe dummy (state di `localStorage`, tidak berbagi antarperangkat). Konsekuensinya dicatat di [10_RISK_REGISTER.md](10_RISK_REGISTER.md).
- Apakah integrasi harus aktif untuk periode pendaftaran berjalan atau cukup untuk tahap berikutnya: _TBD_ (menunggu keputusan Fase 0).
- Tanggal target Fase 1 sampai 5: _TBD_; diisi setelah Fase 0 menetapkan opsi login dan akses DB.

## 5. Dependensi Eksternal

- Jawaban pengelola aiclub.id atas pertanyaan brief bagian 8 (login, session, akses DB).
- Portal Tencent (`aiclub.id/l/O3Sa9yF`, `aiclub.id/l/9k54mLk`): hanya short link, tanpa data balik.
