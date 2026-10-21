# Rencana Implementasi

> Status: Draft
> Terakhir diperbarui: 2026-10-21
> Pemilik: Tim AIClub Hackathon

## 1. Tujuan dan Ruang Lingkup

Dokumen ini merinci tahapan kerja untuk mengganti prototipe dummy (React + Vite statis, state di `localStorage`) dengan integrasi nyata ke aiclub.id: login dan session akun aiclub.id, serta data peserta, tim, dan lamaran di database aiclub.id. Fase mengikuti [../brief.md](../brief.md) bagian 9, dirinci menjadi langkah bernomor.

Di luar cakupan (sesuai brief bagian 1): perubahan alur 3 langkah, isi event, dan tampilan. Portal Tencent tetap diakses lewat link `aiclub.id/l/...`.

Dokumen terkait: [03_FRD.md](03_FRD.md), [04_TRD.md](04_TRD.md), [07_MASTER_CHECKLIST.md](07_MASTER_CHECKLIST.md), [08_ROADMAP.md](08_ROADMAP.md), [10_RISK_REGISTER.md](10_RISK_REGISTER.md), [11_DECISIONS.md](11_DECISIONS.md).

## 2. Kondisi Awal (per 2026-10-21)

- Aplikasi statis di `src/`, hasil build di `docs/` dan disajikan GitHub Pages (`vite.config.js`: `base: "./"`, `outDir: "docs"`, `emptyOutDir: false`).
- Seluruh state peserta disimpan di `localStorage` key `hk_state` (daftar `PERSIST` di `src/App.jsx`).
- Aturan satu orang satu tim dan satu lamaran aktif hanya ada di klien (`src/lib/rules.js`).
- Data tim dan builder contoh berada di `src/data.js` (`TIM`, `BUILDER`, `SEED_APPLICANTS`); simulasi keputusan owner dikendalikan `CONFIG.demoOwner`.
- Prototipe dummy sudah selesai dan di-deploy; lihat [07_MASTER_CHECKLIST.md](07_MASTER_CHECKLIST.md).

## 3. Ringkasan Fase dan Dependensi

| Fase | Nama | Bergantung pada | Keluaran utama | Kriteria selesai (brief bagian 9) |
|---|---|---|---|---|
| 0 | Keputusan | - | Jawaban pertanyaan brief bagian 8; opsi login dan akses DB dipilih | Opsi login dan akses DB disepakati |
| 1 | Auth | Fase 0 | Login aiclub.id, `GET /me`, logout; Data diri terisi dari profil | Login dummy hilang; refresh halaman tetap login |
| 2 | Data peserta | Fase 1 | Tabel `hackathon_participant`; jawaban, jalur, flag langkah tersimpan server | Pindah browser atau perangkat, progres tetap ada |
| 3 | Tim dan lamaran | Fase 2 | Tabel tim, lamaran, undangan; aturan bisnis di server; `wa_link` terkunci | Dua akun nyata bisa buat tim, lamar, setujui; aturan brief 5.3 lolos tes |
| 4 | Pembersihan | Fase 3 | Dummy dan `demoOwner` dihapus; README diperbarui; domain produksi | Tidak ada referensi `DUMMY_USERS`, `TIM`, `BUILDER` |
| 5 | Admin (opsional) | Fase 3 (data); Fase 0 untuk keputusan peran | Daftar peserta/tim dan ekspor CSV | Pengurus bisa memantau pendaftar |

```
Fase 0 --> Fase 1 --> Fase 2 --> Fase 3 --> Fase 4
                                      \
                                       --> Fase 5 (opsional, paralel dengan Fase 4)
```

Catatan jadwal: pendaftaran ditutup 1 Nov 2026 (23.59 WIB, sumber `src/i18n/id.js`, kunci `schedule`). Fase 1 sampai 3 perlu selesai sebelum tanggal itu agar pasar tim berjalan di data nyata; bila tidak, lihat jalur mitigasi di [10_RISK_REGISTER.md](10_RISK_REGISTER.md). Estimasi durasi per fase: _TBD_ (tergantung jawaban Fase 0).

## 4. Fase 0 - Keputusan

**Tujuan:** menghilangkan tebakan sebelum menulis kode integrasi.

**Dependensi:** tidak ada. Fase ini memblokir semua fase lain (risiko terbesar, brief bagian 11).

**File yang disentuh:** hanya dokumen: [../brief.md](../brief.md), [11_DECISIONS.md](11_DECISIONS.md), [04_TRD.md](04_TRD.md). Tidak ada perubahan kode.

**Langkah:**

1. Kirim daftar pertanyaan brief bagian 8 ke pengelola aiclub.id (login, session, akses DB, profil member, persetujuan data, identitas Tencent, peran, hosting).
2. Catat setiap jawaban di [11_DECISIONS.md](11_DECISIONS.md); ubah status ADR terkait dari Diusulkan menjadi Diterima atau Ditolak.
3. Pilih opsi login: A (cookie session bersama), B (OAuth/OIDC), atau C (token sekali pakai).
4. Putuskan akses data: binding D1 langsung dari Worker atau lewat API aiclub.id; tetapkan pihak yang menjalankan migrasi tabel `hackathon_*`.
5. Putuskan hosting produksi (subdomain `*.aiclub.id` atau digabung ke aplikasi aiclub.id yang ada).
6. Putuskan dasar persetujuan data pribadi (WA, kota); bila perlu, tambahkan layar persetujuan ke lingkup Fase 1.
7. Putuskan kebutuhan Fase 5 (halaman admin atau ekspor CSV) dan peran yang boleh mengaksesnya.
8. Perbarui [04_TRD.md](04_TRD.md) sesuai keputusan, lalu tinjau ulang urutan dan estimasi fase di dokumen ini.

**Selesai bila:** opsi login dan akses DB tercatat sebagai keputusan Diterima.

## 5. Fase 1 - Auth

**Tujuan:** menghapus login dummy; session berasal dari aiclub.id.

**Dependensi:** Fase 0 (opsi login, hosting, cara validasi session).

**File yang disentuh:**

| File | Perubahan |
|---|---|
| `src/lib/api.js` (baru) | Wrapper `fetch` dengan `credentials: "include"`, penanganan `401`, error terstruktur |
| `src/components/Login.jsx` | Form email/sandi diganti tombol Masuk dengan aiclub.id |
| `src/data.js` | Hapus `DUMMY_USERS` |
| `src/App.jsx` | `initState()` memanggil `GET /me`; `PERSIST` dikurangi; state `loading` dan `error`; `login`/`logout` memakai API |
| `src/components/Identity.jsx` | Data diri terisi dari profil (kota memakai `cityId`) |
| `src/i18n/id.js`, `en.js`, `zh.js` | Teks baru; hapus teks badge dummy (`login.badge`, `login.demoTitle`, dst) |
| `.env`/konfigurasi build (baru) | `VITE_API_BASE`, `VITE_LOGIN_URL` |
| Sisi server (Worker/BFF, di luar repo ini atau folder baru: _TBD_) | `GET /api/hackathon/me`, `POST /api/auth/logout`, validasi session |

**Langkah:**

1. Siapkan Worker/BFF dengan middleware validasi session sesuai opsi login Fase 0; tanpa session kembalikan `401`.
2. Implementasikan `GET /api/hackathon/me` (profil: `memberId`, nama, email, kota, WhatsApp, LinkedIn) dan `POST /api/auth/logout`.
3. Buat `src/lib/api.js` dengan pengalihan ke `VITE_LOGIN_URL` saat `401`.
4. Ganti `Login.jsx` dengan tombol Masuk dengan aiclub.id (redirect atau OAuth sesuai opsi).
5. Ubah `initState()` di `App.jsx`: ambil `GET /me` saat start, tampilkan state memuat dan gagal; `PERSIST` hanya menyisakan `lang` dan `screen`.
6. Isi layar Data diri dari profil; tentukan perilaku tulis-balik kota/WA/LinkedIn (brief 5.1): ke profil aiclub.id bila diizinkan, selain itu ke `hackathon_participant` sebagai override.
7. Ganti `logout()` dengan pemanggilan API sehingga session berakhir di kedua sisi.
8. Hapus `DUMMY_USERS` dan teks dummy di login; perbarui i18n tiga bahasa.
9. Uji: refresh tetap login; `401` mengarah ke login; logout di portal mengakhiri session aiclub.id.

**Selesai bila:** login dummy hilang; refresh halaman tetap login.

## 6. Fase 2 - Data Peserta

**Tujuan:** progres peserta (data diri, jawaban skenario, jalur, flag langkah) tersimpan di server.

**Dependensi:** Fase 1 (identitas `memberId` dan session).

**File yang disentuh:**

| File | Perubahan |
|---|---|
| Migrasi DB (lokasi: _TBD_) | Tabel `hackathon_participant` (brief 5.2) |
| Worker/BFF | `PATCH /api/hackathon/me`; hitung ulang jalur resmi dari `jawaban` |
| `src/App.jsx` | Aksi yang mengubah `jawab`, `override`, `joinedMain`, `tencentClicked`, `projectReady`, `submitClicked` memanggil API |
| `src/lib/scoring.js` | Tetap untuk tampilan; hasil resmi dari server |
| `src/components/Quiz.jsx`, `Result.jsx`, `Group.jsx`, `Tencent.jsx`, `Submit.jsx` | Simpan lewat API; state memuat dan gagal |

**Langkah:**

1. Buat migrasi `hackathon_participant` (`member_id` sebagai kunci utama, `latar`, `jawaban`, `jalur`, `jalur_override`, `joined_main_at`, `tencent_clicked_at`, `project_ready_at`, `submit_clicked_at`, `created_at`, `updated_at`).
2. Implementasikan `PATCH /api/hackathon/me` dengan validasi input (panjang jawaban, nilai `latar`, format WA).
3. Hitung ulang jalur di server dari `jawaban` memakai bobot yang sama dengan `WEIGHTS` di `src/data.js`.
4. Tolak submit ke Tencent (langkah 3) bila `project_ready_at` belum terisi (brief 5.3 butir 7).
5. Sambungkan aksi klien ke API; gunakan pembaruan optimistis hanya bila ada rollback.
6. Perbarui guard pindah layar di `initState()` agar memakai status dari server, bukan `localStorage`.
7. Uji lintas perangkat: isi sebagian di browser A, lanjutkan di browser B.

**Selesai bila:** pindah browser atau perangkat, progres tetap ada.

## 7. Fase 3 - Tim dan Lamaran

**Tujuan:** tim, lamaran, dan undangan nyata dengan aturan bisnis dijaga server dan constraint DB.

**Dependensi:** Fase 2 (peserta ada di DB; kunci asing ke `hackathon_participant`).

**File yang disentuh:**

| File | Perubahan |
|---|---|
| Migrasi DB | `hackathon_team`, `hackathon_application` (+ indeks unik `one_active_app`), `hackathon_invite`, `hackathon_activity` |
| Worker/BFF | Endpoint tim, lamaran, keputusan, undangan (brief bagian 6) |
| `src/lib/rules.js` | Tetap sebagai pemandu UI; bukan penjaga |
| `src/App.jsx` | Semua `actions.*` memanggil API lalu memperbarui state dari respons |
| `src/components/Market.jsx`, `TeamDetail.jsx`, `Choose.jsx`, `MyTeam.jsx`, `Create.jsx`, `Dash.jsx` | Baca dari API; state memuat, kosong, gagal |
| `src/data.js` | `WA_LINK_RE` dipakai ulang di server |

**Langkah:**

1. Buat migrasi tabel tim, lamaran, undangan, dan aktivitas; pasang `owner_id UNIQUE` pada tim dan indeks unik parsial `one_active_app` pada lamaran.
2. Implementasikan `GET /teams` (tanpa `wa_link`) dan `GET /teams/:id` (`wa_link` hanya untuk owner dan pelamar `approved`).
3. Implementasikan `POST /teams` dengan validasi `WA_LINK_RE`; tolak bila pembuat punya lamaran `pending` atau `approved`.
4. Implementasikan `POST /teams/:id/apply`; tolak bila pelamar adalah owner atau sudah punya lamaran aktif; tangani pelanggaran constraint sebagai respons terstruktur (bukan error 500).
5. Implementasikan `POST /applications/:id/decide` dengan pemeriksaan kepemilikan (`403` bila bukan owner tim itu); saat `approved`, ubah lamaran `pending` lain milik orang itu menjadi `withdrawn` dalam satu transaksi.
6. Implementasikan `DELETE /applications/:id` (tarik lamaran atau keluar tim), `POST /teams/:id/close`, `PATCH /teams/:id`.
7. Implementasikan `GET /builders` dan `POST /teams/:id/invites`; catat aktivitas pengganti `log` ke `hackathon_activity`.
8. Sambungkan semua `actions.*` di `App.jsx` dan komponen layar; tambah state memuat, kosong, gagal.
9. Tulis tes aturan brief 5.3 (butir 1 sampai 7) yang memanggil API langsung tanpa UI, termasuk uji dua permintaan lamaran bersamaan.
10. Uji end-to-end dengan dua akun nyata: buat tim, lamar, setujui, buka link WA.

**Selesai bila:** dua akun nyata bisa buat tim, lamar, setujui; aturan brief 5.3 lolos tes.

## 8. Fase 4 - Pembersihan

**Tujuan:** tidak ada sisa dummy; produksi berjalan di domain yang sesuai.

**Dependensi:** Fase 3 selesai dan diverifikasi.

**File yang disentuh:** `src/data.js`, `src/App.jsx`, `src/components/Dash.jsx`, `src/components/MyTeam.jsx`, `src/components/Market.jsx`, `src/i18n/*.js`, `README.md`, `vite.config.js`, `docs/` (hasil build), konfigurasi hosting/DNS (di luar repo).

**Langkah:**

1. Hapus `TIM`, `BUILDER`, `SEED_APPLICANTS`, `CONFIG.demoOwner` dari `src/data.js`; pertahankan `URUT`, `WEIGHTS`, `LATAR`, URL Tencent, dan URL grup WA utama.
2. Hapus teks mode demo dari i18n (mis. `demoNote`) dan cabang kode yang memakainya.
3. Pastikan `localStorage` hanya menyimpan preferensi (`lang`, `screen`).
4. Telusuri dengan pencarian bahwa tidak ada referensi `DUMMY_USERS`, `TIM`, `BUILDER`, `SEED_APPLICANTS`.
5. Perbarui `README.md` (bagian "Masih dummy", alur, build).
6. Arahkan produksi ke domain `*.aiclub.id` sesuai Fase 0; tentukan nasib GitHub Pages (demo dummy atau dimatikan; lihat brief 7 butir 8).
7. Jalankan pemeriksaan kriteria selesai brief bagian 10, termasuk pemeriksaan bahwa `wa_link` tidak muncul di respons untuk pengguna yang belum disetujui.
8. Catatan build: pastikan `npm run build` tidak menghapus dokumentasi di `docs/*.md` (perbaikan `vite.config.js` 2026-10-21; lihat [11_DECISIONS.md](11_DECISIONS.md) dan [10_RISK_REGISTER.md](10_RISK_REGISTER.md)). Bila build produksi dipindah keluar dari `docs/`, tinjau ulang konfigurasi tersebut.

**Selesai bila:** tidak ada referensi `DUMMY_USERS`, `TIM`, `BUILDER`.

## 9. Fase 5 - Admin (Opsional)

**Tujuan:** pengurus dapat memantau pendaftar.

**Dependensi:** Fase 3 (data tim dan lamaran); keputusan peran dari Fase 0 (pertanyaan 8.7).

**File yang disentuh:** Worker/BFF (endpoint admin baru, nama: _TBD_), halaman admin atau skrip ekspor (lokasi: _TBD_), `src/i18n/*.js` bila ada UI baru.

**Langkah:**

1. Tetapkan peran yang boleh mengakses (pengurus pusat saja atau juga pengurus kota) berdasarkan jawaban Fase 0.
2. Implementasikan endpoint daftar peserta/tim dengan otorisasi peran; tanpa peran kembalikan `403`.
3. Implementasikan ekspor CSV; pastikan nomor WA hanya tampil bagi peran berwenang dan tidak bocor ke peserta lain.
4. Uji otorisasi: peserta biasa tidak dapat memanggil endpoint admin.

**Selesai bila:** pengurus bisa memantau pendaftar.

## 10. Prinsip Lintas Fase

1. Klien tidak menyimpan kebenaran; semua keputusan bisnis diputuskan server.
2. Tidak ada key pengurus (`/agent/*`) di bundel klien; tidak ada rahasia di variabel `VITE_*`.
3. Setiap fase menghasilkan perubahan yang dapat diuji sendiri dan tidak merusak alur 3 langkah.
4. Perubahan keputusan dicatat di [11_DECISIONS.md](11_DECISIONS.md); risiko baru di [10_RISK_REGISTER.md](10_RISK_REGISTER.md).
