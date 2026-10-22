# Instalasi dan Deploy

> Status: Draft
> Terakhir diperbarui: 2026-10-21
> Pemilik: Tim AIClub Hackathon

Dokumen ini menjelaskan cara membangun dan men-deploy portal pendaftaran AI Agent Hackathon aiclub.id x Tencent Cloud, baik kondisi sekarang (Cloudflare Pages + Functions + D1 di https://aicandoit.aiclub.id) maupun rencana lama. Catatan: bagian yang menyebut GitHub Pages, `localStorage`, atau login dummy di bawah adalah riwayat dan sudah tidak berlaku; rujukan terbaru ada di [21_BACKEND.md](21_BACKEND.md). Dokumen terkait: [17_DEVELOPER_SETUP.md](17_DEVELOPER_SETUP.md), [04_TRD.md](04_TRD.md), [14_SECURITY_THREAT_MODEL.md](14_SECURITY_THREAT_MODEL.md), [12_TEST_STRATEGY.md](12_TEST_STRATEGY.md), [../README.md](../README.md), [../brief.md](../brief.md).

## 1. Gambaran Umum

| Hal | Kondisi sekarang | Rencana produksi |
|---|---|---|
| Bentuk | SPA React + Vite + Pages Functions | SPA statis + BFF (Cloudflare Worker/Pages Functions) |
| Hosting | Cloudflare Pages | Subdomain aiclub.id (mis. `hackathon.aiclub.id`) |
| URL | `https://aicandoit.aiclub.id` | _TBD_ (usulan brief: `hackathon.aiclub.id`) |
| Sumber publikasi | Cloudflare Pages (keluaran `docs/` + `functions/`) | _TBD_ |
| Data | D1 `aiclub-hackathon-db` lewat `/api` | D1 aiclub.id lewat API |
| Login | Akun portal sendiri (session cookie) | Session aiclub.id |

Status rencana produksi: **Rencana**; seluruh detail teknis yang belum diputuskan ditandai _TBD_ (lihat bagian 8).

## 2. Instalasi Lokal Singkat

```bash
npm install
npm run dev        # pengembangan
npm run build      # build produksi ke docs/
npm run preview    # periksa hasil build secara lokal
```

Rincian prasyarat dan struktur proyek: [17_DEVELOPER_SETUP.md](17_DEVELOPER_SETUP.md).

## 3. Build ke `docs/`

Konfigurasi di `vite.config.js`:

| Pengaturan | Nilai | Alasan |
|---|---|---|
| `base` | `"./"` | Jalur aset relatif sehingga hasil build jalan di sub-path GitHub Pages (`…github.io/aiclub-hackathon/`). Pada `docs/index.html`, skrip dan CSS dirujuk sebagai `./assets/...` dan ikon sebagai `./brand/...`. |
| `build.outDir` | `"docs"` | Hasil build langsung menjadi sumber GitHub Pages. |
| `build.emptyOutDir` | `false` (perbaikan 2026-10-21) | `docs/` juga berisi dokumentasi `.md`; Vite tidak boleh mengosongkannya. |
| Plugin | `@vitejs/plugin-react` dan `clean-docs-assets` | Plugin kedua menghapus hanya `docs/assets` pada `buildStart` agar berkas berhash lama tidak menumpuk. |

Cara membangun:

```bash
npm run build
```

Keluaran (contoh pada commit terakhir yang berisi build): `docs/index.html`, `docs/assets/index-<hash>.js`, `docs/assets/index-<hash>.css`, `docs/brand/*` (salinan `public/brand/`), dan `docs/.nojekyll` (salinan `public/.nojekyll`). Nama berhash berubah saat isi berubah.

### 3.1 Catatan Perbaikan `emptyOutDir` (2026-10-21)

Alya sedang mengubah `vite.config.js` sebagai perbaikan 2026-10-21:

- `emptyOutDir` dari `true` menjadi `false`, sebab `emptyOutDir: true` menghapus seluruh isi `docs/` (termasuk dokumen `.md`) pada tiap build.
- Ditambah plugin `clean-docs-assets` (memakai `rmSync("docs/assets", { recursive: true, force: true })`) sehingga yang dibersihkan hanya `docs/assets`.

Status: perubahan ada di working tree dan belum di-commit per 2026-10-21. Sebelum perbaikan ini ter-commit, build di cabang lain tetap berisiko menghapus `docs/*.md`.

Catatan yang perlu diperhatikan:

- `docs/index.html` dan `docs/brand/*` ditimpa oleh build (Vite menyalin `public/` dan menulis ulang `index.html`), jadi tidak ada dokumen lain yang boleh bernama `index.html` atau berada di `docs/brand/`.
- Berkas lama hasil build selain `docs/assets` (mis. bila `public/` kelak kehilangan sebuah berkas) tidak otomatis terhapus dari `docs/`; bersihkan manual lewat git bila perlu.

## 4. Deploy ke GitHub Pages (Riwayat, tidak berlaku lagi)

Sumber: [../README.md](../README.md), bagian "Build & GitHub Pages".

Aktifkan Pages sekali:

1. Buka repo di GitHub, **Settings**, **Pages**.
2. **Build and deployment**, **Source: Deploy from a branch**.
3. **Branch: `main`**, folder **`/docs`**, simpan.

Setiap perubahan kode:

```bash
npm run build                      # tulis ke docs/
git add -A                         # kode + isi docs/ hasil build
git commit -m "<pesan>"
git push origin main
```

Pages kemudian menyajikan isi `docs/` dari `main`. URL demo: `https://cloud-dark.github.io/aiclub-hackathon/` (dari README).

### 4.1 `.nojekyll`

Berkas kosong `.nojekyll` ada di `public/` dan `docs/`. Berkas ini menyuruh GitHub Pages tidak memproses situs dengan Jekyll. Tanpanya, Jekyll mengabaikan berkas/folder berawalan garis bawah (`_`) dan memperlambat build. Karena `public/.nojekyll` disalin Vite ke `docs/`, berkas ini ikut ada setiap build. Catatan: dengan `.nojekyll`, berkas `.md` di `docs/` **tidak** dirender menjadi halaman HTML oleh Pages; mereka hanya tersedia sebagai berkas mentah di repo (dan dapat diakses sebagai berkas statis di URL Pages). Apakah dokumentasi dipublikasikan lewat Pages: _TBD_.

### 4.2 Verifikasi Setelah Deploy

| Pemeriksaan | Harapan |
|---|---|
| Buka URL Pages | Layar intro termuat, tanpa galat konsol |
| Jaringan | Tidak ada 404 untuk `assets/*` dan `brand/*` |
| Ikon dan font | Favicon tampil; font dimuat dari Google Fonts |
| Alur | Login, kuis, grup, pasar tim berjalan ([12_TEST_STRATEGY.md](12_TEST_STRATEGY.md)) |
| Muat ulang | Tidak ada 404 pada muat ulang (SPA tidak memakai router URL, jadi aman) |
| Bahasa | `?lang=en` dan `?lang=zh` bekerja |

### 4.3 Batasan GitHub Pages

- Tidak ada backend; sudah tidak dipakai karena aplikasi kini memakai Cloudflare Pages Functions + D1.
- Tidak ada header HTTP kustom (CSP, dst.).
- Tidak dapat berbagi cookie dengan `aiclub.id` karena domain berbeda (`cloud-dark.github.io`), sehingga tidak cocok untuk versi produksi ([../brief.md](../brief.md) bagian 4).
- Git menyimpan berkas hasil build; setiap build berhash baru menambah riwayat repo.

## 5. Rencana Deploy Produksi di Subdomain aiclub.id (Rencana)

Seluruh bagian ini adalah **rencana** yang bersumber dari [../brief.md](../brief.md); belum ada yang dikerjakan.

### 5.1 Arsitektur Target

```
Browser (SPA React)
   │  cookie session aiclub.id
   ▼
hackathon.aiclub.id ── Cloudflare Worker/Pages Functions (BFF)
   │   /api/hackathon/*  → cek session → logika bisnis
   ▼
D1 aiclub.id (tabel member + tabel hackathon_*)
```

Prinsip dari brief: satu domain induk agar cookie `Domain=.aiclub.id` (`HttpOnly`, `Secure`, `SameSite=Lax`) berlaku; klien tidak menyimpan kebenaran; tidak ada key pengurus di browser.

### 5.2 Langkah Kasar

| Fase (brief) | Pekerjaan deploy | Detail |
|---|---|---|
| 0. Keputusan | Jawab pertanyaan terbuka brief bagian 8 (opsi login, akses D1, hosting) | _TBD_ |
| 1. Auth | Siapkan subdomain, Worker BFF, validasi session, `GET /api/hackathon/me`, logout | _TBD_ |
| 2. Data peserta | Migrasi D1 tabel `hackathon_participant`; pengaturan binding | _TBD_ (siapa yang menjalankan migrasi: pertanyaan 8.3) |
| 3. Tim dan lamaran | Migrasi `hackathon_team`, `hackathon_application`, `hackathon_invite`, `hackathon_activity` | _TBD_ |
| 4. Pembersihan | Hapus data dummy dan `demoOwner`, perbarui README, domain produksi aktif | _TBD_ |
| 5. Admin (opsional) | Daftar peserta dan ekspor CSV untuk pengurus | _TBD_ |

Target waktu dari brief: fase 1 sampai 3 selesai sebelum penutupan pendaftaran 1 Nov (2026).

### 5.3 Komponen Rencana

| Komponen | Keterangan | Status |
|---|---|---|
| Nama subdomain | Usulan `hackathon.aiclub.id` | _TBD_ |
| Hosting frontend | Statis di Cloudflare (Pages/Workers) atau digabung ke aplikasi aiclub.id | _TBD_ (brief 8.8) |
| BFF | Worker yang melayani `/api/hackathon/*` dan `/api/auth/logout` | _TBD_ |
| Basis data | D1 aiclub.id; binding langsung atau lewat API | _TBD_ (brief 8.3) |
| DNS dan TLS | Rekaman untuk subdomain; sertifikat dikelola Cloudflare | _TBD_ |
| Variabel lingkungan klien | `VITE_API_BASE`, `VITE_LOGIN_URL` (publik; tanpa rahasia) | _TBD_ nilai |
| Rahasia server | Kunci dan konfigurasi di penyimpanan rahasia Worker; jangan di repo | _TBD_ |
| Build | `npm run build`; apakah `outDir` tetap `docs/` atau berpindah, dan apakah `base` tetap `"./"` | _TBD_ |
| CI/CD | Pipeline deploy otomatis | _TBD_ |
| Staging | Lingkungan uji terpisah dengan D1 terpisah ([12_TEST_STRATEGY.md](12_TEST_STRATEGY.md) bagian 7) | _TBD_ |
| Peran GitHub Pages | Dimatikan atau dipertahankan sebagai demo dummy tanpa data nyata | _TBD_ |
| Pemantauan dan log | Galat, kuota Worker/D1 | _TBD_ |
| Cadangan dan pemulihan D1 | Kebijakan cadangan | _TBD_ |
| Pembatasan laju dan WAF | Aturan Cloudflare | _TBD_ ([14_SECURITY_THREAT_MODEL.md](14_SECURITY_THREAT_MODEL.md)) |

### 5.4 Perubahan di Repo yang Terkait Deploy (dari brief bagian 7)

1. `src/lib/api.js` baru (wrapper `fetch` dengan `credentials: "include"`).
2. Login dummy diganti tombol "Masuk dengan aiclub.id".
3. `App.jsx` memuat state dari `GET /me`; `localStorage` hanya preferensi.
4. Hapus `TIM`, `BUILDER`, `SEED_APPLICANTS`, `CONFIG.demoOwner`.
5. Alur GitHub Pages dari `docs/` ditinggalkan saat pindah ke subdomain aiclub.id.
6. Perbarui README.

## 6. Daftar Periksa Rilis

Kondisi sekarang (GitHub Pages):

- [ ] `npm install` bersih berhasil.
- [ ] `npm run build` berhasil tanpa galat.
- [ ] `git status` hanya menunjukkan perubahan yang diharapkan di `docs/` dan `src/`; berkas `docs/*.md` utuh.
- [ ] `npm run preview` diperiksa: alur utama berjalan, tidak ada 404.
- [ ] Tidak ada tautan grup atau data pribadi sungguhan di `src/data.js`.
- [ ] Hasil build di-commit bersama perubahan kode, lalu push ke `main`.
- [ ] URL Pages diperiksa (bagian 4.2).

Produksi (rencana):

- [ ] Kriteria selesai [../brief.md](../brief.md) bagian 10 terpenuhi.
- [ ] Tes A-01 sampai A-22 hijau di staging.
- [ ] Tidak ada rahasia di bundel; `localStorage` hanya preferensi.
- [ ] Layar persetujuan privasi aktif (data WA dan kota).
- [ ] Rencana rollback tersedia: _TBD_.

## 7. Pemecahan Masalah

| Gejala | Kemungkinan penyebab | Tindakan |
|---|---|---|
| Halaman Pages kosong | Aset 404 karena `base` salah | Pastikan `base: "./"`, build ulang |
| Halaman lama tampil | Cache CDN/peramban atau Pages belum selesai membangun | Tunggu beberapa menit, muat ulang paksa; periksa tab Actions/Deployments |
| `docs/*.md` hilang setelah build | `emptyOutDir: true` (konfigurasi lama) | Terapkan perbaikan 2026-10-21 (bagian 3.1); pulihkan dengan `git checkout -- docs/<berkas>.md` |
| Banyak berkas `assets/index-*.js` lama | Plugin `clean-docs-assets` tidak aktif | Periksa `vite.config.js` |
| Pages menampilkan 404 pada `/docs` | Sumber Pages tidak diatur ke `main` + `/docs` | Atur ulang di Settings, Pages |
| Perubahan kode tidak tampil | Lupa `npm run build` sebelum commit | Build, commit `docs/`, push |
| Font tidak termuat | Jaringan memblokir Google Fonts | Tampil dengan font cadangan; pertimbangkan hosting font sendiri |

## 8. Pertanyaan Terbuka

1. Nama subdomain final dan pemilik DNS: _TBD_.
2. Hosting produksi dan pipeline CI/CD: _TBD_.
3. Nasib GitHub Pages setelah produksi: _TBD_.
4. Apakah dokumentasi `docs/*.md` dipublikasikan, dan di mana: _TBD_.
5. Kebijakan rollback dan cadangan D1: _TBD_.
6. Versi Node.js yang dikunci untuk build (`engines`/`.nvmrc`): _TBD_.
