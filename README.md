# Pendaftaran AI Agent Hackathon

**Produksi: https://aicandoit.aiclub.id**

Daftar atau masuk dengan akun portal hackathon (email dan kata sandi). Akun dikelola backend sendiri, tidak terhubung ke aiclub.id.

## Alur (3 langkah)

**1. Daftar di portal kita** (indikator kecil: Data → Skenario → Jalur → Grup utama → Tim → Status)
- Daftar atau masuk, lengkapi data (kota dan WhatsApp wajib; LinkedIn dan GitHub opsional), jawab skenario, dapat jalur
- Gabung grup WhatsApp utama (wajib)
- Pilih jalan: gabung tim atau buat tim. Satu orang hanya bisa jadi anggota satu tim, atau owner satu tim, tidak keduanya.
  - Gabung: lihat detail tim dan grupnya, lalu lamar. Hanya boleh satu lamaran aktif; mau pindah, tarik lamaran dulu. Link grup WhatsApp baru terbuka setelah owner menyetujui.
  - Buat: isi nama, slot yang dicari, dan link grup WhatsApp tim.
  - Bagikan: di dasbor owner ada link tim (`?tim=...`) untuk disalin atau dikirim ke WhatsApp. Orang yang membuka link melihat undangan, menyelesaikan pendaftaran, lalu langsung masuk ke halaman tim untuk melamar. Link grup WhatsApp tim tidak ikut di link ini.
  - Batas keputusan: owner punya 24 jam untuk menyetujui atau menolak lamaran. Sisa waktu tampil ke pelamar dan owner; lewat dari itu lamaran ditolak otomatis dan pelamar bisa melamar ke tim lain. Selama menunggu, pelamar boleh menarik lamarannya.
  - Ruang tim: setelah lamaran disetujui (atau bagi owner), tampil anggota tim beserta kontak (WhatsApp, email, LinkedIn, GitHub) dan chat tim. Sebelum disetujui, ruang tim terkunci.
  - Mau pindah pilihan: owner menutup tim dulu, anggota keluar dari tim dulu, atau tarik lamaran yang masih menunggu.
- Status: lamaran, tim saya (pelamar masuk, undang builder), aktivitas, timeline sampai demo day, pengumuman terbaru

**Pengumuman** bisa dibuka kapan saja, termasuk sebelum login, lewat tombol PENGUMUMAN di header (desktop) atau navigasi bawah (mobile). Pengumuman yang disematkan tampil paling atas, lalu yang terbaru. Tiap pengumuman punya penanda BARU atau SUDAH DIBACA dan jumlah tayangan (satu akun dihitung sekali); jumlah yang belum dibaca tampil sebagai badge.

**2. Daftarkan tim ke portal Tencent** — https://aiclub.id/l/O3Sa9yF

**3. Submit project ke Tencent** — https://aiclub.id/l/9k54mLk. Dikerjakan nanti setelah project selesai dibuat; tombol submit baru terbuka setelah peserta mencentang bahwa project sudah selesai.

## Info event

Data event (hadiah USD 2.500, 3 tantangan, tanggal penting, mitra) diambil dari halaman resmi
https://aiclub.id/event/tencent-cloud-hackathon-2026. Teks ada di `src/i18n/*.js` (kunci `event`, `schedule`),
logo dan poster di `public/brand/`.

## Backend

Aplikasi terhubung ke backend sungguhan: Cloudflare Pages Functions + D1, di domain yang sama dengan situs (`/api/*`). Tidak ada data dummy di frontend; akun, tim, lamaran, pengumuman, anggota, kontak, dan chat semuanya dari API. Batas 24 jam keputusan owner dihitung server. Yang disimpan di `localStorage` hanya preferensi (bahasa `hk_lang`, layar terakhir `hk_nav`).

- Detail endpoint dan perilaku: [`docs/21_BACKEND.md`](docs/21_BACKEND.md), skema: [`docs/20_DATABASE.md`](docs/20_DATABASE.md), rancangan awal: [`brief.md`](brief.md)
- Link portal Tencent dan grup utama: `TENCENT_REGISTER_URL`, `TENCENT_SUBMIT_URL`, `WA_GROUP_URL` di `src/data.js`
- Pengumuman dibaca dari server (`/api/hackathon/announcements`)

## Pengembangan

```
npm install
npm run dev
```

## Build & deploy

```
npm run build        # tulis ke docs/
npm run dev:api      # wrangler pages dev docs --local (frontend + API lokal)
npm run db:migrate   # terapkan migrasi D1 (remote); db:migrate:local untuk lokal
npm run test:api     # tes integrasi API
```

Frontend (`docs/`) dan Functions (`functions/`) disajikan bersama oleh Cloudflare Pages di https://aicandoit.aiclub.id.
