# Technical Requirements Document (TRD)

> Status: Draft
> Terakhir diperbarui: 2026-10-21
> Pemilik: Tim AIClub Hackathon

Dokumen ini memuat kebutuhan teknis portal pendaftaran AI Agent Hackathon aiclub.id x Tencent Cloud. Setiap kebutuhan diberi ID `TR-xxx`, kriteria penerimaan (acceptance criteria, AC), dan penanda status:

- **As-built**: sudah terpasang di kode repositori pada tanggal pembaruan di atas dan dapat diverifikasi dengan membaca kode atau menjalankan aplikasi.
- **Rencana**: belum ada di kode; bersumber dari [../brief.md](../brief.md) dan bergantung pada keputusan di brief bagian 8.

Dokumen terkait: [../README.md](../README.md), [../brief.md](../brief.md), [03_FRD.md](03_FRD.md), [05_ARCHITECTURE.md](05_ARCHITECTURE.md), [16_CONFIG_REFERENCE.md](16_CONFIG_REFERENCE.md), [20_DATABASE.md](20_DATABASE.md).

Konvensi: nilai yang belum diketahui ditulis `_TBD_` dan merujuk ke pertanyaan terbuka brief bagian 8 (disingkat **Q8.n**). Dokumen ini tidak mengarang fakta tentang sistem aiclub.id.

## 1. Ringkasan

| Aspek | Kondisi sekarang (As-built) | Target (Rencana) |
|---|---|---|
| Jenis aplikasi | SPA React statis | SPA yang sama + BFF Cloudflare (Worker/Pages Functions) |
| Hosting | GitHub Pages dari folder `docs/` | Subdomain aiclub.id (mis. `hackathon.aiclub.id`) `_TBD_` (Q8.8) |
| Login | Dummy (email + sandi bebas) | Session aiclub.id (opsi login `_TBD_`, Q8.1, Q8.2) |
| Data | Dummy di `localStorage` (`hk_state`) | D1 aiclub.id, tabel `hackathon_*` (akses `_TBD_`, Q8.3) |
| Aturan bisnis | Di klien (`src/lib/rules.js`) | Di server + constraint DB |

Daftar modul dan rentang ID:

| Modul | Rentang ID |
|---|---|
| A. Stack dan build | TR-001 s.d. TR-007 |
| B. State dan persistensi klien | TR-008 s.d. TR-014 |
| C. Aturan bisnis dan skor | TR-015 s.d. TR-018 |
| D. Integrasi aiclub.id (auth, API, data) | TR-019 s.d. TR-030 |
| E. Integrasi Tencent dan WhatsApp | TR-031 s.d. TR-034 |
| F. Batasan teknis | TR-035 s.d. TR-039 |
| G. Performa | TR-040 s.d. TR-044 |
| H. Aksesibilitas | TR-045 s.d. TR-052 |
| I. Internasionalisasi (i18n) | TR-053 s.d. TR-058 |
| J. Keamanan dan privasi | TR-059 s.d. TR-070 |
| K. Deploy dan operasi | TR-071 s.d. TR-078 |

## 2. Modul A: Stack dan build

### TR-001 SPA React 18 + Vite 5 (As-built)
Aplikasi adalah single-page application berbasis React 18.3 dan Vite 5.4 dengan ES modules (`"type": "module"` di `package.json`).
- AC1: `npm install` lalu `npm run dev` menjalankan server pengembangan Vite tanpa konfigurasi tambahan.
- AC2: `npm run build` menghasilkan satu berkas HTML, satu JS, dan satu CSS di `docs/` (saat ini `docs/index.html`, `docs/assets/index-*.js`, `docs/assets/index-*.css`).
- AC3: `npm run preview` menyajikan hasil build.

### TR-002 Dependensi runtime minimal (As-built)
Dependensi runtime hanya `react` dan `react-dom`. Dev dependency hanya `vite` dan `@vitejs/plugin-react`. Tidak ada library router, state, UI, form, atau i18n pihak ketiga.
- AC1: `package.json` `dependencies` hanya berisi `react` dan `react-dom`.
- AC2: Penambahan dependensi runtime baru wajib dicatat di dokumen ini beserta alasannya.

### TR-003 Konfigurasi build untuk sub-path (As-built)
`vite.config.js` memakai `base: "./"` agar hasil build berjalan di sub-path GitHub Pages (`.../aiclub-hackathon/`), `build.outDir: "docs"`, dan `emptyOutDir: false` karena `docs/` juga berisi dokumentasi `.md`. Plugin `clean-docs-assets` menghapus hanya `docs/assets` pada `buildStart`.
- AC1: Setelah `npm run build`, berkas `docs/*.md` tidak terhapus.
- AC2: Berkas JS/CSS lama di `docs/assets` tidak menumpuk (hanya hash terbaru yang ada).
- AC3: Aplikasi terbuka benar bila disajikan dari sub-path.
- Rujukan: [16_CONFIG_REFERENCE.md](16_CONFIG_REFERENCE.md) bagian vite.config.js.

### TR-004 Tanpa router; navigasi lewat state layar (As-built)
Perpindahan layar dilakukan oleh state `screen` di `src/App.jsx` (daftar `SCREENS` di `src/data.js`), bukan oleh URL. Konsekuensinya: tombol Back browser tidak berpindah layar dan layar tidak dapat dibuka lewat deep link.
- AC1: 13 layar valid terdaftar di `SCREENS`: `intro, login, identitas, kuis, hasil, grup, pilih, pasar, tim, buat, dasbor, tencent, submit`.
- AC2: Setiap layar memiliki entri di `STEP_OF` (-1, 0, 1, atau 2).
- Catatan: apakah versi produksi memerlukan routing berbasis URL adalah keputusan terbuka `_TBD_` (lihat [05_ARCHITECTURE.md](05_ARCHITECTURE.md) bagian keputusan arsitektur).

### TR-005 CSS tunggal tanpa framework (As-built)
Seluruh gaya berada di `src/styles.css` (token warna sebagai CSS variable, mis. `--yellow`, `--cyan`, `--magenta`, `--line`, `--gut`) dengan breakpoint mobile-first (`min-width` 560, 640, 760, 768, 860, 1000 px).
- AC1: Tidak ada framework CSS atau CSS-in-JS yang dimuat.
- AC2: Tata letak dapat dipakai pada lebar layar ponsel hingga desktop (bottom nav `.bnav` tampil di bawah 768 px, stepper tampil mulai 768 px).

### TR-006 Font eksternal Google Fonts (As-built)
`index.html` memuat Press Start 2P, Space Grotesk, VT323, dan Noto Sans SC (untuk bahasa Mandarin) dari Google Fonts dengan `preconnect` dan `display=swap`.
- AC1: Teks tetap terbaca (font cadangan sistem) bila Google Fonts gagal dimuat.
- AC2: Ketergantungan ini dicatat sebagai pihak ketiga pada tinjauan privasi (lihat TR-068).

### TR-007 Aset brand statis (As-built)
Logo dan poster berada di `public/brand/` (salinan hasil build di `docs/brand/`) dan dirujuk lewat helper `asset(name)` di `src/components/Brand.jsx` yang memakai `import.meta.env.BASE_URL`.
- AC1: Semua gambar merujuk lewat `asset()` sehingga tidak rusak di sub-path.
- AC2: Gambar logo informatif memiliki `alt`; gambar dekoratif memakai `alt=""`.

## 3. Modul B: State dan persistensi klien

### TR-008 State aplikasi tunggal di komponen App (As-built)
Seluruh state peserta disimpan dalam satu objek `st` pada `useState` di `App.jsx`, dengan pembaruan lewat `patch`, `update`, dan `setSt`. Komponen layar menerima `st` dan `actions` sebagai props. Bentuk state dijelaskan di [20_DATABASE.md](20_DATABASE.md) bagian 2.
- AC1: Tidak ada state peserta yang disimpan di luar `st` kecuali state lokal UI (nilai form, `errors`, `toastMsg`).
- AC2: Setiap perubahan `st` menulis ulang `hk_state`.

### TR-009 Persistensi `hk_state` lewat daftar `PERSIST` (As-built)
Hanya kunci dalam konstanta `PERSIST` (24 kunci) yang ditulis ke `localStorage` kunci `hk_state` sebagai JSON. `lang` tidak termasuk dalam `PERSIST`.
- AC1: Setelah refresh, peserta kembali ke layar terakhir yang sah dengan data terisi.
- AC2: Kunci yang tidak ada di `PERSIST` tidak pernah ditulis.

### TR-010 Preferensi bahasa `hk_lang` (As-built)
Bahasa dipilih disimpan terpisah di `localStorage` kunci `hk_lang` oleh `setLang`.
- AC1: Setelah memilih bahasa lalu refresh, bahasa yang sama dipakai (selama tidak ada parameter `?lang=`).

### TR-011 Akses `localStorage` aman gagal (As-built)
Semua pembacaan dan penulisan `localStorage` dibungkus `try/catch` sehingga aplikasi tetap berjalan bila penyimpanan diblokir (mis. mode privat).
- AC1: Dengan `localStorage` yang melempar error, aplikasi tetap terbuka dari layar `intro` dan dapat dipakai pada sesi tersebut.

### TR-012 Pemulihan layar saat rehidrasi (As-built)
`initState()` memvalidasi layar tersimpan terhadap kemajuan: layar tidak valid kembali ke `intro`; tanpa `user` kembali ke `intro`; data diri belum lengkap kembali ke `identitas`; kuis belum selesai kembali ke `kuis`; belum bergabung grup utama kembali ke `grup`; sudah punya tim menggeser `pasar/buat/tim` ke `dasbor`; `tim` dengan `viewTeam` tak dikenal kembali ke `pasar`; `buat` tanpa hak (`canCreate`) kembali ke `pilih`.
- AC1: Mengedit `hk_state` secara manual menjadi layar di luar kemajuan tidak membuka layar terlarang.
- AC2: Urutan pengecekan tidak diubah tanpa memperbarui [05_ARCHITECTURE.md](05_ARCHITECTURE.md).

### TR-013 Log aktivitas lokal berbatas (As-built)
Aktivitas peserta dicatat lewat `withLog` ke `st.log` dengan maksimum 60 entri terakhir (`slice(-60)`), berisi `{k, at, ...}` dengan `at = Date.now()`.
- AC1: `log.length <= 60` setelah operasi apa pun.
- AC2: Layar `dasbor` menampilkan log dalam urutan terbaru di atas dan waktu diformat oleh `fmtTime` sesuai bahasa aktif.

### TR-014 Ganti persistensi klien menjadi hanya preferensi (Rencana)
Pada versi terintegrasi, `localStorage` hanya berisi preferensi (bahasa, layar terakhir); kebenaran data berada di server ([../brief.md](../brief.md) bagian 4 prinsip 2 dan bagian 7 butir 3).
- AC1: `PERSIST` hanya menyisakan `lang` dan `screen`.
- AC2: Tidak ada data peserta (nama, kota, WA, jawaban, tim, lamaran) di `localStorage`.
- AC3: Saat start, `GET /api/hackathon/me` menentukan state; ada state `loading` dan `error`.

## 4. Modul C: Aturan bisnis dan skor

### TR-015 Aturan satu orang satu tim (As-built, sisi klien)
`src/lib/rules.js` mendefinisikan `approvedApp`, `pendingApps`, `activeApp`, `canApply`, `canCreate`. Orang yang menjadi owner (`st.myTeam`) tidak dapat melamar; orang dengan lamaran `pending` atau `approved` tidak dapat membuat tim.
- AC1: `canCreate(st)` bernilai false bila `st.myTeam` ada atau ada lamaran `pending`/`approved`.
- AC2: `toggleApply` menolak (toast) bila `st.myTeam` ada.
- Catatan: hanya dijaga di klien dan dapat dilewati; lihat TR-024.

### TR-016 Satu lamaran aktif per orang (As-built, sisi klien)
Lamaran aktif adalah status `pending` atau `approved`. `toggleApply` menolak lamaran ke tim lain selama ada lamaran aktif; peserta harus menarik lamaran dahulu. Saat satu lamaran `approved`, lamaran `pending` lain dihapus dan dicatat `autoWithdraw`.
- AC1: Maksimal satu elemen `st.apps` berstatus `pending`/`approved` pada satu waktu.
- AC2: Lamaran berstatus `rejected` tidak menghalangi lamaran lain dan tidak dapat diajukan ulang ke tim yang sama dari UI.

### TR-017 Perhitungan jalur peran deterministik (As-built)
`src/lib/scoring.js` menghitung skor 8 peran (`URUT`) dari jawaban skenario dengan bobot `WEIGHTS` (`skor`), mengurutkan (`urutSkor`), dan mengambil jalur aktif (`aktif`: `override` bila ada, selain itu peringkat pertama). Jumlah pertanyaan `total() = min(CONFIG.quizLen, WEIGHTS.length)` (saat ini 6).
- AC1: Dengan `jawab` yang sama, hasil skor identik pada setiap pemanggilan.
- AC2: Seri diurutkan stabil mengikuti urutan `URUT` (`CEO, CTO, AI, PM, DSG, GRW, DOM, DAT`).
- AC3: `quizDone(jawab)` true hanya bila seluruh `total()` jawaban terisi.

### TR-018 Validasi input di klien (As-built)
- Data diri: nama dan kota wajib (tidak kosong setelah trim); WhatsApp wajib dan `waValid` (9 sampai 15 digit setelah semua karakter non-digit dibuang); email opsional tetapi harus lolos `EMAIL_RE` bila diisi.
- Link grup WhatsApp tim: opsional, tetapi bila diisi harus lolos `WA_LINK_RE` (`^https://chat.whatsapp.com/[A-Za-z0-9_-]+`).
- Pembuatan tim: nama wajib dan minimal satu slot peran.
- AC1: Pesan galat tampil di bawah kolom dan fokus berpindah ke kolom pertama yang salah (layar `identitas`).
- AC2: Nilai nama tim disimpan dalam huruf kapital (`toUpperCase`).

## 5. Modul D: Integrasi aiclub.id

Seluruh TR di modul ini berstatus **Rencana** dan bergantung pada jawaban Q8.1 sampai Q8.8 di [../brief.md](../brief.md).

### TR-019 Login memakai session aiclub.id (Rencana)
Tidak ada sistem login terpisah. Opsi A (cookie session bersama; disarankan), B (OAuth/OIDC), atau C (magic link) dipilih pada Fase 0. Mekanisme dan format session: `_TBD_` (Q8.1, Q8.2).
- AC1: Layar `login` berisi tombol "Masuk dengan aiclub.id"; form email/sandi dan `DUMMY_USERS` dihapus.
- AC2: Setelah login, refresh halaman tetap login.
- AC3: Logout menghapus session di aiclub.id sehingga berlaku di kedua sisi (`POST /api/auth/logout`).

### TR-020 Atribut cookie session (Rencana)
Bila opsi A dipilih: cookie `Domain=.aiclub.id`, `HttpOnly`, `Secure`, `SameSite=Lax`. Nama cookie dan format nilai: `_TBD_` (Q8.2).
- AC1: Cookie tidak dapat dibaca oleh JavaScript klien.
- AC2: Portal berjalan di `*.aiclub.id` (bila tidak, cookie lintas domain gagal; lihat risiko di brief bagian 11).

### TR-021 Klien API `src/lib/api.js` (Rencana)
Wrapper `fetch` dengan `credentials: "include"`, basis URL dari `VITE_API_BASE`, penanganan `401` (arahkan ke `VITE_LOGIN_URL`), dan error terstruktur.
- AC1: Semua pemanggilan API melalui wrapper ini.
- AC2: `401` mengarahkan ke login aiclub.id tanpa kehilangan konteks yang dapat dipulihkan.
- AC3: Galat jaringan dan galat server menghasilkan state `error` yang dapat dicoba ulang di UI.
- Rujukan: [16_CONFIG_REFERENCE.md](16_CONFIG_REFERENCE.md) bagian variabel lingkungan.

### TR-022 BFF Cloudflare (Rencana)
`/api/hackathon/*` dilayani Cloudflare Worker/Pages Functions yang memeriksa session lalu menjalankan logika bisnis. Digabung ke aplikasi aiclub.id yang ada atau berdiri sendiri: `_TBD_` (Q8.8).
- AC1: Setiap endpoint tanpa session valid mengembalikan `401`.
- AC2: Tidak ada key pengurus (`/agent/*`) di bundel klien maupun dipanggil dari browser.

### TR-023 Akses database D1 (Rencana)
Worker mengakses D1 aiclub.id lewat binding langsung atau lewat API. Pilihan dan pihak yang menjalankan migrasi: `_TBD_` (Q8.3).
- AC1: Skema `hackathon_*` diterapkan lewat migrasi berurutan (lihat [20_DATABASE.md](20_DATABASE.md) bagian migrasi).
- AC2: Migrasi dapat diulang aman pada lingkungan baru.

### TR-024 Aturan bisnis ditegakkan server dan constraint DB (Rencana)
Aturan 5.3 di brief dipindahkan ke server: (1) satu orang owner atau anggota; (2) satu lamaran aktif (unique index parsial); (3) persetujuan satu lamaran otomatis menarik lamaran `pending` lain dalam satu transaksi; (4) `wa_link` hanya untuk owner dan pelamar `approved`; (5) urutan pindah pilihan; (6) validasi `WA_LINK_RE` di server; (7) submit hanya bila `project_ready_at` terisi.
- AC1: Memanggil API langsung tidak dapat melanggar aturan 1 sampai 7 (dites).
- AC2: Dua permintaan lamaran bersamaan dari satu orang menghasilkan tepat satu lamaran aktif.
- AC3: Owner lain yang memutuskan lamaran tim bukan miliknya menerima `403`.

### TR-025 Kontrak endpoint (Rencana)
Endpoint mengikuti brief bagian 6: `GET/PATCH /api/hackathon/me`; `GET /teams`, `GET /teams/:id`, `POST /teams`, `PATCH /teams/:id`, `POST /teams/:id/close`, `POST /teams/:id/apply`; `DELETE /applications/:id`; `POST /applications/:id/decide`; `GET /builders`; `POST /teams/:id/invites`; `POST /api/auth/logout`. Skema JSON rinci ditetapkan di dokumen API terpisah `_TBD_`.
- AC1: Setiap endpoint terdokumentasi dengan metode, otorisasi, galat, dan contoh respons.
- AC2: Respons `GET /teams` tidak memuat `wa_link`.

### TR-026 Pembacaan profil dari aiclub.id (Rencana)
Layar Data diri terisi dari profil: `memberId, nama, email, kota (cityId), whatsapp, linkedin`. Endpoint baca profil sendiri `_TBD_` (Q8.4). Kota memakai `cityId` dari `/agent/regions`, bukan teks bebas (saat ini teks bebas).
- AC1: Peserta dengan profil lengkap tidak mengisi ulang data.
- AC2: Bila penulisan balik ke profil tidak diizinkan, perubahan disimpan di `hackathon_participant` dan ditandai override (Q8.4).

### TR-027 Skor jalur resmi dihitung ulang server (Rencana)
Klien boleh menghitung skor untuk tampilan, namun hasil resmi (`jalur`) dihitung server dari `jawaban`.
- AC1: Mengirim `jalur` palsu lewat API tidak mengubah hasil resmi.
- AC2: `WEIGHTS` dan `URUT` server identik dengan klien; perbedaan dideteksi oleh tes paritas.

### TR-028 Pengganti `log` dengan `hackathon_activity` (Rencana)
Aktivitas peserta disimpan server di `hackathon_activity` menggantikan `st.log`.
- AC1: Aktivitas tetap ada di lintas perangkat.
- AC2: Jenis aktivitas (`kind`) mencakup padanan kunci log saat ini (lihat [20_DATABASE.md](20_DATABASE.md)).

### TR-029 Notifikasi ke owner (Rencana)
Brief bagian 2 menyebut "endpoint API + notifikasi ke owner" untuk lamaran. Saluran notifikasi: `_TBD_` (tidak ditentukan di brief).
- AC1: Saluran dipilih dan didokumentasikan sebelum Fase 3.

### TR-030 Pembersihan data dummy (Rencana)
Hapus `TIM`, `BUILDER`, `SEED_APPLICANTS`, `DUMMY_USERS`, `CONFIG.demoOwner`; pertahankan `URUT`, `WEIGHTS`, `LATAR`, URL Tencent dan WA utama.
- AC1: Pencarian `DUMMY_USERS`, `TIM`, `BUILDER`, `demoOwner` pada `src/` tidak menemukan referensi.
- AC2: Tombol simulasi Setujui/Tolak di layar `dasbor` hilang.

## 6. Modul E: Integrasi Tencent dan WhatsApp

### TR-031 Tautan portal Tencent lewat short link aiclub.id (As-built)
Pendaftaran tim memakai `TENCENT_REGISTER_URL` dan pengiriman project memakai `TENCENT_SUBMIT_URL` (keduanya `https://aiclub.id/l/...`), dibuka di tab baru dengan `rel="noopener noreferrer"`. Klik dicatat sebagai flag `tencentClicked` dan `submitClicked`.
- AC1: Tautan terbuka di tab baru.
- AC2: Tidak ada data peserta yang dikirim ke tautan tersebut.

### TR-032 Gerbang tombol submit (As-built, sisi klien)
Tombol submit ke Tencent aktif hanya setelah peserta mencentang "project sudah selesai" (`projectReady`).
- AC1: Dengan `projectReady=false`, tombol berupa `aria-disabled="true"` tanpa tautan.
- AC2: Versi server menolak penandaan submit tanpa `project_ready_at` (lihat TR-024).

### TR-033 Grup WhatsApp utama wajib (As-built, sisi klien)
Peserta membuka `WA_GROUP_URL`, lalu mengonfirmasi (`confirmMain`) agar `joinedMain=true`. Konfirmasi hanya diterima bila tautan sudah diklik (`clickedMain`). Layar setelah `grup` terkunci selama `joinedMain=false`.
- AC1: `confirmMain` tanpa klik tautan menampilkan toast dan tidak mengubah state.
- AC2: `reachable(st, step>0)` memerlukan `identDone`, `quizDone`, dan `joinedMain`.
- Catatan: server tidak dapat memverifikasi keanggotaan grup WhatsApp; verifikasi bersifat pernyataan peserta (as-built) dan tetap demikian pada rencana kecuali ditentukan lain `_TBD_`.

### TR-034 Pencocokan identitas Tencent (Rencana, `_TBD_`)
Apakah peserta aiclub.id perlu dicocokkan dengan pendaftar di portal Tencent (email atau `memberId`) belum diputuskan (Q8.6); short link belum mengembalikan data.
- AC1: Keputusan Q8.6 dicatat sebelum fitur apa pun dibangun.

## 7. Modul F: Batasan teknis

### TR-035 Tidak ada backend pada versi sekarang (As-built)
Seluruh logika berjalan di browser. Data tersimpan hanya di `localStorage` masing-masing browser sehingga tim, pelamar, dan keputusan owner tidak dibagi antarpengguna.
- AC1: Tidak ada permintaan jaringan ke API aplikasi pada versi sekarang (hanya aset statis, font, dan tautan keluar).

### TR-036 GitHub Pages tidak cocok untuk produksi terintegrasi (Rencana)
`cloud-dark.github.io` tidak dapat berbagi cookie dengan aiclub.id. Versi produksi pindah ke subdomain aiclub.id (brief bagian 4 prinsip 1).
- AC1: Domain produksi `_TBD_` ditetapkan (Q8.1, Q8.8).

### TR-037 Batas waktu proyek (As-built sebagai fakta jadwal)
Pendaftaran dibuka 15 Okt dan ditutup 1 Nov 2026 (teks `top.open`); fase 1 sampai 3 integrasi perlu selesai sebelum penutupan ([../brief.md](../brief.md) bagian 11).
- AC1: Rencana rilis merujuk ke tenggat ini; bila terlewat, versi dummy tetap menjadi fallback yang jelas ditandai demo.

### TR-038 Pembatasan skala data klien (As-built)
Data contoh tetap dan kecil (6 tim di `TIM`, 6 builder di `BUILDER`, 6 pertanyaan). Aplikasi tidak melakukan paginasi atau virtualisasi.
- AC1: Versi terintegrasi menetapkan paginasi atau batas jumlah item pada `GET /teams` dan `GET /builders` bila jumlah data melebihi puluhan `_TBD_`.

### TR-039 Peramban yang didukung (Rencana, `_TBD_`)
Daftar peramban minimum belum ditetapkan di repositori. Kode memakai API modern (`import.meta.env`, `Intl.DateTimeFormat`, `matchMedia`, `URLSearchParams`).
- AC1: Matriks peramban ditetapkan dan diuji sebelum rilis produksi.

## 8. Modul G: Performa

### TR-040 Ukuran bundel (As-built, pengukuran 2026-10-21)
Hasil build saat ini: JS 256.664 byte (sekitar 82,7 KB gzip) dan CSS 25.902 byte (sekitar 5,8 KB gzip), satu berkas masing-masing.
- AC1: Ukuran dicatat ulang tiap rilis; kenaikan JS gzip lebih dari 20 persen memerlukan alasan tertulis.
- Catatan: angka ini pengukuran, bukan batas yang disepakati; ambang resmi `_TBD_`.

### TR-041 Tanpa pemecahan kode dan pemuatan malas (As-built)
Seluruh layar diimpor statis di `App.jsx` sehingga dimuat dalam satu bundel.
- AC1: Dipertahankan selama ukuran bundel di bawah ambang TR-040.

### TR-042 Render dan interaksi (As-built)
Perpindahan layar tidak memerlukan permintaan jaringan; guliran ke atas memakai `behavior: "smooth"` kecuali pengguna meminta gerak berkurang.
- AC1: Perpindahan antarlayar terjadi tanpa jeda jaringan pada versi sekarang.

### TR-043 Anggaran latensi API (Rencana, usulan)
Usulan awal untuk versi terintegrasi: respons `GET /me` dan endpoint baca p95 di bawah 500 ms dan endpoint tulis p95 di bawah 800 ms dari sisi klien di Indonesia. Angka ini usulan dokumen, bukan keputusan; ditetapkan ulang setelah arsitektur final `_TBD_`.
- AC1: Ada pengukuran p95 sebelum rilis dan hasilnya dicatat.

### TR-044 Keadaan memuat, kosong, dan gagal (Rencana)
Layar `Market`, `TeamDetail`, `Choose`, `MyTeam` menampilkan state memuat, kosong, dan gagal ketika data berasal dari API ([../brief.md](../brief.md) bagian 7 butir 6). Pembaruan optimistis hanya dengan rollback.
- AC1: Tidak ada layar kosong tanpa penjelasan saat API lambat atau gagal.
- AC2: Aksi tulis yang gagal mengembalikan state tampilan ke nilai sebelumnya dan menampilkan pesan.

## 9. Modul H: Aksesibilitas

Target acuan: WCAG 2.1 tingkat AA sebagai sasaran `_TBD_` (belum ada audit resmi; lihat TR-052).

### TR-045 Bahasa dokumen dan judul (As-built)
`document.documentElement.lang` dan `document.title` diperbarui sesuai bahasa aktif (`meta.lang`, `meta.title`).
- AC1: Mengganti bahasa mengubah atribut `lang` pada `<html>`.
- AC2: Tombol pemilih bahasa memiliki atribut `lang` masing-masing, `aria-pressed`, dan grup berlabel.

### TR-046 Manajemen fokus saat pindah layar (As-built)
Setelah pindah layar atau pertanyaan (kecuali render pertama), fokus dipindah ke `h1`/`h2` pertama di `#app` dengan `tabindex="-1"` dan `preventScroll`.
- AC1: Pengguna pembaca layar mendengar judul layar baru setelah navigasi.
- AC2: Fokus tidak berpindah pada interaksi yang tidak mengganti layar.

### TR-047 Wilayah live dan toast (As-built)
`<main id="app" aria-live="polite">` dan toast `role="status"` mengumumkan perubahan.
- AC1: Pesan toast (mis. "pilih satu jawaban") diumumkan pembaca layar.

### TR-048 Navigasi langkah (As-built)
Stepper dan bottom nav memakai `<nav aria-label>`, `aria-current="step"` pada langkah aktif, dan langkah terkunci ditandai `disabled` (stepper) atau `aria-disabled` (bottom nav); indikator kecil memakai `<ol aria-label="progress">` dengan `aria-current`.
- AC1: Langkah aktif dapat dibedakan tanpa warna saja (penanda `aria-current`).

### TR-049 Pintasan keyboard kuis (As-built)
Di layar `kuis`, tombol A sampai E atau 1 sampai 5 memilih opsi, dan Enter melanjutkan; pintasan dinonaktifkan saat fokus berada di `input/select/textarea` atau modifier Ctrl/Meta/Alt ditekan.
- AC1: Mengetik di kolom isian tidak memicu pintasan.
- AC2: Hanya opsi yang ada pada pertanyaan yang dapat dipilih.

### TR-050 Formulir yang dapat diakses (As-built)
Kolom formulir dibungkus `<label>`, kolom salah memakai `aria-invalid` dan pesan `.err-msg`, atribut `autoComplete`/`inputMode` dipakai (mis. `address-level2`, `username`, `current-password`, `url`). Tombol toggle memakai `aria-pressed`. Tombol terkunci memakai `aria-disabled`.
- AC1: Setiap input memiliki label terprogram.
- AC2: Galat validasi tersambung ke kolomnya secara visual dan lewat `aria-invalid`.

### TR-051 Gerak berkurang dan ikon dekoratif (As-built)
Blok `@media (prefers-reduced-motion: reduce)` ada di `src/styles.css`; guliran halaman memeriksa `matchMedia("(prefers-reduced-motion: reduce)")`; simbol dekoratif memakai `aria-hidden="true"`.
- AC1: Dengan preferensi gerak berkurang, animasi dan guliran halus tidak berjalan.

### TR-052 Audit aksesibilitas formal (Rencana, `_TBD_`)
Belum ada audit kontras warna (tema gelap bergaya piksel dengan warna kuning/cyan/magenta), uji pembaca layar, atau uji keyboard menyeluruh yang terdokumentasi. Komponen `Combo` (combobox pencarian untuk latar dan peran) perlu diuji pola ARIA combobox-nya.
- AC1: Laporan audit WCAG 2.1 AA dilampirkan sebelum rilis produksi; temuan kritis ditutup.

## 10. Modul I: Internasionalisasi (i18n)

### TR-053 Tiga bahasa (As-built)
Bahasa: Indonesia (`id`), Inggris (`en`), Mandarin (`zh`), masing-masing berkas kamus di `src/i18n/`; `I18N` dan `LANGS` diekspor dari `src/i18n/index.js`. Bahasa default dokumen `id`.
- AC1: Ketiga kamus memuat struktur kunci yang sama (saat ini masing-masing 562 baris).
- AC2: Seluruh teks UI diambil lewat `t()`/`get()`, bukan literal di komponen (pengecualian: label kecil seperti `aria-label="steps"`, `"progress"`, yang masih literal).

### TR-054 Deteksi bahasa (As-built)
`detectLang()` memilih berurutan: parameter URL `?lang=`, `localStorage hk_lang`, lalu `navigator.languages` (awalan `id/ms/jv/su` menjadi `id`, `zh` menjadi `zh`, `en` menjadi `en`), terakhir `en`.
- AC1: `?lang=zh` mengalahkan nilai tersimpan.
- AC2: Peramban berbahasa Melayu atau Jawa menghasilkan `id`.

### TR-055 Fallback kunci dan interpolasi (As-built)
`makeT(lang)` mengembalikan `t`, `get`, dan `role`. Kunci yang tidak ada pada bahasa aktif jatuh ke bahasa `id`. Interpolasi memakai pola `{nama}` dan membiarkan pola tak dikenal apa adanya.
- AC1: Kunci hilang di `en` menampilkan teks `id`, bukan string kosong.
- AC2: `t()` pada nilai non-string mengembalikan string kosong.

### TR-056 Format waktu per lokal (As-built)
`fmtTime(ms, lang)` memakai `Intl.DateTimeFormat` dengan lokal `id-ID`, `en-US`, `zh-CN`.
- AC1: Waktu log pada dasbor mengikuti bahasa aktif.

### TR-057 Font untuk aksara Mandarin (As-built)
Noto Sans SC dimuat untuk bahasa `zh`.
- AC1: Teks Mandarin tidak tampil sebagai kotak kosong pada peramban tanpa font CJK `_TBD_` (belum diuji).

### TR-058 Paritas kamus otomatis (Rencana)
Skrip pemeriksa kunci kamus (`id` sebagai acuan) dijalankan pada CI atau pra-commit.
- AC1: Build gagal bila `en` atau `zh` kehilangan kunci yang ada di `id`.

## 11. Modul J: Keamanan dan privasi

### TR-059 Tidak ada rahasia di bundel klien (As-built, wajib dipertahankan)
Kode klien tidak berisi kunci API, token, atau kredensial. URL yang ada (`WA_GROUP_URL`, `TENCENT_*_URL`) bersifat publik.
- AC1: Pencarian kunci/token pada `docs/assets/*.js` tidak menemukan rahasia.
- AC2: Variabel lingkungan klien (`VITE_*`) hanya berisi nilai publik ([16_CONFIG_REFERENCE.md](16_CONFIG_REFERENCE.md)).

### TR-060 Pencegahan XSS (As-built)
Tidak ada `dangerouslySetInnerHTML`, `innerHTML`, atau `eval` di `src/`. Teks pengguna (nama, deskripsi tim) dirender sebagai teks oleh React.
- AC1: Pencarian pola tersebut di `src/` tidak menemukan hasil.
- AC2: Input pengguna tidak pernah dimasukkan sebagai HTML mentah.

### TR-061 Tautan keluar aman (As-built)
Semua tautan `target="_blank"` memakai `rel="noopener noreferrer"`, termasuk tautan grup WhatsApp tim dan portal Tencent; `window.open` memakai `"noopener,noreferrer"`.
- AC1: Tidak ada tautan `_blank` tanpa `rel`.

### TR-062 Validasi skema tautan WhatsApp (As-built klien, Rencana server)
Tautan grup tim wajib berskema `https://chat.whatsapp.com/`. Penegakan server wajib (TR-024).
- AC1: `javascript:` atau skema lain ditolak di server.

### TR-063 Kontrol akses `wa_link` (Rencana)
Dalam data dummy, `wa` tiap tim tersedia di bundel klien. Pada versi terintegrasi, `wa_link` hanya dikirim ke owner dan pelamar `approved`; daftar publik tidak memuatnya.
- AC1: Respons `GET /teams` dan `GET /teams/:id` untuk non-berhak tidak mengandung `wa_link`.
- AC2: Dites dengan akun yang belum disetujui, dengan akun owner, dan dengan akun anggota.

### TR-064 Otorisasi dan kode status (Rencana)
Tanpa session: `401`; bukan pemilik sumber daya: `403`. Peran pengurus (lihat seluruh peserta) `_TBD_` (Q8.7).
- AC1: Owner lain tidak dapat memutuskan lamaran tim orang lain (`403`).
- AC2: Peserta tidak dapat membaca data peserta lain di luar yang diizinkan.

### TR-065 Perlindungan CSRF dan CORS (Rencana)
Dengan cookie session dan `SameSite=Lax`, metode yang mengubah data tidak boleh dapat dipicu lewat GET; asal permintaan (Origin) diperiksa; CORS hanya mengizinkan asal portal. Mekanisme token CSRF tambahan `_TBD_`.
- AC1: Permintaan mutasi dari asal tak dikenal ditolak.

### TR-066 Pembatasan laju dan pencegahan penyalahgunaan (Rencana, `_TBD_`)
Batas laju per `memberId` dan per IP pada endpoint tulis (apply, create team, invites) ditetapkan setelah arsitektur final.
- AC1: Ambang dan perilaku saat terlampaui dicatat dan diuji.

### TR-067 Header keamanan (Rencana)
Menyetel `Content-Security-Policy` (mengizinkan fonts.googleapis.com dan fonts.gstatic.com bila font tetap eksternal), `X-Content-Type-Options`, `Referrer-Policy`. GitHub Pages tidak mengizinkan header kustom; berlaku pada hosting Cloudflare.
- AC1: Header terpasang pada domain produksi dan diverifikasi.

### TR-068 Privasi data pribadi (Rencana)
Data pribadi: nomor WhatsApp, kota, email, LinkedIn. Pada versi sekarang, data hanya di browser peserta. Pada versi terintegrasi: dasar persetujuan `_TBD_` (Q8.5); WA dan kota tidak tampil di daftar publik; ekspor oleh pengurus berwenang saja (Q8.7). Layar Grup membuat pesan perkenalan berisi data diri untuk dibagikan peserta sendiri ke grup WhatsApp utama (as-built, atas inisiatif peserta). Font Google adalah pihak ketiga yang menerima alamat IP peserta.
- AC1: Layar persetujuan tersedia bila Q8.5 menyatakan perlu.
- AC2: Nomor WA tidak muncul di respons yang dapat dilihat peserta lain.
- Rujukan: [20_DATABASE.md](20_DATABASE.md) bagian privasi.

### TR-069 Penanganan galat tanpa kebocoran (Rencana)
Respons galat tidak memuat jejak tumpukan, nama tabel, atau isi query.
- AC1: Galat 5xx hanya berisi kode dan pesan umum.

### TR-070 Log dan retensi (Rencana, `_TBD_`)
Log akses server tidak boleh memuat nomor WA atau isi `wa_link`. Masa retensi data peserta setelah acara `_TBD_`.
- AC1: Kebijakan retensi diputuskan sebelum produksi.

## 12. Modul K: Deploy dan operasi

### TR-071 Deploy GitHub Pages dari `docs/` (As-built)
Hasil build dikomit di `docs/`, GitHub Pages memakai sumber branch `main` folder `/docs` ([../README.md](../README.md) bagian Build). Tidak ada pipeline CI di repositori (tidak ada `.github/`).
- AC1: Setelah `npm run build` dan commit `docs/`, situs publik menampilkan versi terbaru.
- AC2: `docs/index.html` merujuk berkas `assets/index-*` yang ada di repositori.

### TR-072 Prosedur rilis manual (As-built)
Setiap perubahan kode: jalankan `npm run build`, lalu komit isi `docs/` bersama perubahannya.
- AC1: Tidak ada selisih antara `src/` dan `docs/assets` pada commit rilis.

### TR-073 Pemisahan dokumentasi dan hasil build (As-built)
`docs/` berisi hasil build dan dokumentasi `.md` bernomor; build hanya menghapus `docs/assets`.
- AC1: Dokumen `.md` tidak hilang oleh build (TR-003).

### TR-074 Lingkungan dan variabel konfigurasi (Rencana)
`VITE_API_BASE` dan `VITE_LOGIN_URL` ditanam saat build; tidak ada rahasia. Nilai per lingkungan (dev, staging, produksi) `_TBD_`.
- AC1: Build produksi gagal bila variabel wajib tidak diisi.
- Rujukan: [16_CONFIG_REFERENCE.md](16_CONFIG_REFERENCE.md).

### TR-075 Pipeline CI/CD (Rencana, `_TBD_`)
Pipeline untuk build, pemeriksaan paritas kamus (TR-058), tes aturan bisnis (TR-024), dan deploy ke Cloudflare. Platform (Cloudflare Pages atau lainnya) mengikuti Q8.8.
- AC1: Merge ke `main` memicu build dan deploy terverifikasi.

### TR-076 Migrasi basis data (Rencana)
Migrasi terversi untuk tabel `hackathon_*` (lihat [20_DATABASE.md](20_DATABASE.md)); pelaksana `_TBD_` (Q8.3).
- AC1: Migrasi dan rollback diuji pada salinan DB sebelum produksi.

### TR-077 Pemantauan dan rollback (Rencana, `_TBD_`)
Pemantauan galat dan ketersediaan, serta prosedur rollback rilis, ditetapkan sebelum produksi. Untuk GitHub Pages, rollback dilakukan dengan mengembalikan commit `docs/`.
- AC1: Prosedur rollback tertulis dan pernah dicoba.

### TR-078 Penghentian versi dummy (Rencana)
Saat pindah ke subdomain aiclub.id, GitHub Pages dimatikan atau dibiarkan sebagai demo dummy yang jelas ditandai; README bagian "Masih dummy" diperbarui ([../brief.md](../brief.md) bagian 7 butir 8 dan 9).
- AC1: Peserta tidak dapat salah mengira versi demo sebagai pendaftaran resmi.

## 13. Matriks ringkas status

| Status | ID |
|---|---|
| As-built | TR-001 s.d. TR-013, TR-015 s.d. TR-018, TR-031 s.d. TR-033, TR-035, TR-037, TR-038, TR-040 s.d. TR-042, TR-045 s.d. TR-051, TR-053 s.d. TR-057, TR-059 s.d. TR-061, TR-071 s.d. TR-073 |
| Rencana | TR-014, TR-019 s.d. TR-030, TR-034, TR-036, TR-039, TR-043, TR-044, TR-052, TR-058, TR-062 (sisi server), TR-063 s.d. TR-070, TR-074 s.d. TR-078 |

Catatan: TR-015, TR-016, TR-018, TR-032, TR-033, dan TR-062 memiliki bagian As-built di klien dan bagian Rencana di server; bagian Rencana-nya dirinci pada TR-024.

## 14. Pertanyaan terbuka yang memengaruhi dokumen ini

| Rujukan | Pertanyaan (ringkas) | TR terdampak |
|---|---|---|
| Q8.1 | OAuth/OIDC atau cookie session; bisakah di-host di `*.aiclub.id` | TR-019, TR-020, TR-036 |
| Q8.2 | Format dan cara validasi session | TR-019, TR-020, TR-022 |
| Q8.3 | Akses D1 langsung atau via API; pelaksana migrasi | TR-023, TR-076 |
| Q8.4 | Endpoint profil sendiri; boleh ubah kota/WA/LinkedIn | TR-026 |
| Q8.5 | Persetujuan data WA dan kota | TR-068 |
| Q8.6 | Pencocokan identitas dengan portal Tencent | TR-034 |
| Q8.7 | Peran yang boleh melihat seluruh data | TR-064, TR-068 |
| Q8.8 | Hosting: statis + Worker atau digabung | TR-022, TR-036, TR-075 |

Teks lengkap pertanyaan ada di [../brief.md](../brief.md) bagian 8.
