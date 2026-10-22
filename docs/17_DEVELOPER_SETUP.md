# Setup Developer

> Status: Draft
> Terakhir diperbarui: 2026-10-21
> Pemilik: Tim AIClub Hackathon

Panduan menyiapkan lingkungan pengembangan portal pendaftaran AI Agent Hackathon aiclub.id x Tencent Cloud (React + Vite, backend Cloudflare Pages Functions + D1 di `/api`, tanpa data dummy). Dokumen terkait: [04_TRD.md](04_TRD.md), [18_INSTALLATION.md](18_INSTALLATION.md), [12_TEST_STRATEGY.md](12_TEST_STRATEGY.md), [13_GLOSSARY.md](13_GLOSSARY.md), [../README.md](../README.md), [../brief.md](../brief.md).

## 1. Prasyarat

| Kebutuhan | Keterangan |
|---|---|
| Node.js | Versi minimum tidak dideklarasikan di `package.json` (tidak ada kolom `engines`; tidak ada `.nvmrc`): _TBD_. Vite `^5.4.11` membutuhkan Node.js 18 atau lebih baru; gunakan versi LTS aktif. |
| npm | Bawaan Node.js. Repo memakai `package-lock.json`, jadi gunakan npm (bukan yarn/pnpm) agar dependensi konsisten. |
| Git | Untuk mengambil repo `cloud-dark/aiclub-hackathon`. |
| Peramban | Peramban modern dengan DevTools. |
| Editor | Bebas. Tidak ada konfigurasi editor, linter, atau formatter di repo. |

## 2. Memulai

```bash
git clone <url-repo> aiclub-hackathon     # URL repo: _TBD_ (repo: cloud-dark/aiclub-hackathon)
cd aiclub-hackathon
npm install
npm run dev
```

`npm run dev` menjalankan server pengembangan Vite. Alamat dan port bawaan Vite (`http://localhost:5173`) kecuali bentrok dengan proses lain; konfigurasi khusus tidak ada di `vite.config.js`.

Login: daftar akun baru di halaman login. Untuk API lokal jalankan `npm run db:migrate:local` lalu `npm run dev:api` ([21_BACKEND.md](21_BACKEND.md)).

## 3. Skrip npm

Dari `package.json`:

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Menjalankan server pengembangan dengan hot reload. |
| `npm run build` | Menjalankan `vite build`; hasil ditulis ke folder `docs/` (lihat bagian 8 dan [18_INSTALLATION.md](18_INSTALLATION.md)). |
| `npm run preview` | Menyajikan hasil build secara lokal untuk diperiksa sebelum commit. Jalankan setelah `npm run build`. |

Belum ada skrip `test` atau `lint` ([12_TEST_STRATEGY.md](12_TEST_STRATEGY.md) mengusulkan penambahannya).

Dependensi:

| Paket | Jenis | Versi |
|---|---|---|
| `react`, `react-dom` | dependencies | `^18.3.1` |
| `@vitejs/plugin-react` | devDependencies | `^4.3.4` |
| `vite` | devDependencies | `^5.4.11` |

Berkas `package.json` memakai `"type": "module"` dan `"private": true`.

## 4. Struktur Folder

```
aiclub-hackathon/
├── index.html            # titik masuk Vite (memuat /src/main.jsx dan Google Fonts)
├── package.json          # skrip dan dependensi
├── package-lock.json
├── vite.config.js        # base "./", outDir docs, plugin react + pembersih docs/assets
├── README.md             # ringkasan proyek, alur, backend, build
├── brief.md              # rencana integrasi dengan aiclub.id (draf)
├── .gitignore            # node_modules, .env, .env.local
├── public/               # disalin apa adanya ke hasil build
│   ├── .nojekyll
│   └── brand/            # logo (aiclub, tencent, sumopod, workbuddy, codebuddy), favicon, poster
├── src/
│   ├── main.jsx          # render <App/> ke #root
│   ├── App.jsx           # state utama, navigasi, actions, state dari API (localStorage hanya preferensi)
│   ├── data.js           # konstanta statis (lihat bagian 6)
│   ├── styles.css        # gaya global
│   ├── components/       # layar dan widget UI (satu berkas per layar)
│   ├── i18n/             # teks tiga bahasa: id.js, en.js, zh.js, index.js
│   └── lib/              # logika murni: scoring.js, rules.js, time.js
└── docs/                 # LIHAT CATATAN BAWAH: output build + dokumen
    ├── .nojekyll
    ├── index.html        # hasil build
    ├── assets/           # hasil build (JS/CSS berhash)
    ├── brand/            # salinan public/brand dari build
    └── *.md              # dokumentasi proyek (00 sampai 31, standards/ dst)
```

### 4.1 Komponen (`src/components/`)

| Berkas | Layar / fungsi |
|---|---|
| `Intro.jsx` | Layar awal (`intro`), ditambah `EventInfo.jsx` untuk info event. |
| `Login.jsx` | Login/daftar akun portal. |
| `Identity.jsx` | Data diri (`identitas`). |
| `Quiz.jsx`, `Result.jsx` | Skenario (`kuis`) dan hasil jalur (`hasil`). |
| `Group.jsx` | Grup WhatsApp utama (`grup`) dan pesan perkenalan. |
| `Choose.jsx` | Pilih gabung atau buat tim (`pilih`). |
| `Market.jsx`, `TeamDetail.jsx` | Pasar tim (`pasar`) dan detail tim (`tim`). |
| `Create.jsx`, `MyTeam.jsx` | Buat tim (`buat`) dan pengelolaan tim saya. |
| `Dash.jsx` | Status/dasbor (`dasbor`). |
| `Tencent.jsx`, `Submit.jsx` | Langkah 2 (`tencent`) dan langkah 3 (`submit`). |
| `Chrome.jsx`, `Widgets.jsx`, `Common.jsx`, `Combo.jsx`, `Brand.jsx` | Header, stepper, navigasi bawah, indikator sub-langkah, elemen bersama, kotak pilihan, logo mitra. |

### 4.2 Alur layar

Urutan layar ada di `SCREENS` (`src/data.js`): `intro`, `login`, `identitas`, `kuis`, `hasil`, `grup`, `pilih`, `pasar`, `tim`, `buat`, `dasbor`, `tencent`, `submit`. Pemetaan layar ke langkah besar ada di `STEP_OF` (0 daftar di portal, 1 daftar tim ke Tencent, 2 submit project). Navigasi berbasis state (`st.screen`), bukan router URL.

## 5. Menambah atau Mengubah Teks i18n

Teks antarmuka ada di tiga berkas kamus: `src/i18n/id.js` (bahasa utama dan fallback), `src/i18n/en.js`, `src/i18n/zh.js`. Ketiganya memiliki struktur kunci yang sama (saat ini masing-masing 562 baris). Akses lewat `makeT(lang)` di `src/i18n/index.js`:

- `t("kunci.bertingkat", { var })` mengembalikan string; placeholder `{var}` diganti nilai.
- `get("kunci")` mengambil nilai mentah (array/objek), mis. `get("questions")`.
- `role(kode)` mengambil `roles.<kode>`.
- Kunci hilang di `en` atau `zh` otomatis jatuh ke teks `id`.

Langkah menambah teks:

1. Tambahkan kunci pada **ketiga** berkas dengan struktur yang sama, misalnya di bagian `dash` pada `id.js`:
   ```js
   "dash": {
     "kunciBaru": "Teks Indonesia"
   }
   ```
   lalu padanan Inggris di `en.js` dan Mandarin di `zh.js`.
2. Pakai di komponen: `t("dash.kunciBaru")`. Untuk variabel: `"Melamar ke {team}"` dipanggil `t("dash.log.apply", { team: "REKON" })`.
3. Untuk daftar (soal, jadwal, tim), gunakan `get("questions")` dan pertahankan jumlah elemen yang sama di tiga bahasa. Soal kuis harus selaras dengan `WEIGHTS` di `src/data.js`: jumlah opsi `questions[i].opsi` sama dengan jumlah bobot `WEIGHTS[i]`.
4. Jangan menaruh HTML dalam teks; komponen merender string biasa.
5. Memeriksa: jalankan `npm run dev`, ganti bahasa lewat pemilih bahasa di header atau buka dengan `?lang=en` / `?lang=zh` / `?lang=id`.

Urutan penentuan bahasa awal (`detectLang`): parameter `?lang=`, kunci `hk_lang` di `localStorage`, bahasa peramban (`id/ms/jv/su` menjadi `id`, `zh`, `en`), jika tidak cocok `en`.

Menambah bahasa baru: buat berkas kamus baru, daftarkan di `I18N` dan `LANGS` pada `src/i18n/index.js`, dan tambah entri `LOCALE` di `src/lib/time.js`. Pemilih bahasa di `Chrome.jsx` dibangun dari `LANGS` dan memakai `meta.label`/`meta.name` kamus, sehingga bahasa baru muncul otomatis. Detail lanjutan: _TBD_.

## 6. Mengubah Data (`src/data.js`)

`src/data.js` hanya berisi konstanta statis; data tim, pelamar, pengumuman, dan akun datang dari API:

| Ekspor | Isi | Catatan perubahan |
|---|---|---|
| `CONFIG` | `modeDraft` (false), `quizLen` (6) | `quizLen` tidak boleh melebihi `WEIGHTS.length`. |
| `URUT` | Kode jalur: `CEO, CTO, AI, PM, DSG, GRW, DOM, DAT` | Mengubah urutan memengaruhi hasil seri skor. Menambah kode berarti menambah `roles.<kode>` di tiga kamus. |
| `WEIGHTS` | Bobot skor per soal dan per opsi | Satu elemen per soal; satu objek per opsi. |
| `LATAR` | Daftar latar peserta | Label ada di `identity.latar.*`. |
| `WA_GROUP_URL` | Tautan grup WhatsApp utama | Terkompilasi ke bundel (publik). |
| `WA_LINK_RE` | Ekspresi validasi tautan grup WhatsApp (sama dengan server) | Dipakai `Create.jsx` dan `MyTeam.jsx`. |
| `SCREENS`, `STEP_OF` | Daftar layar dan pemetaan ke langkah besar | Ubah bersama `App.jsx` bila menambah layar. |
| `TENCENT_REGISTER_URL`, `TENCENT_SUBMIT_URL` | Tautan portal Tencent (`aiclub.id/l/...`) | Langkah 2 dan 3. |
| `ICONS` | Path ikon piksel | - |

Teks event (hadiah, tantangan, tanggal, mitra) tidak ada di `data.js`, melainkan di kunci `event` dan `schedule` pada `src/i18n/*.js`; logo dan poster di `public/brand/`.

Keamanan: jangan menaruh data pribadi di `data.js` karena akan tertanam di bundel publik ([14_SECURITY_THREAT_MODEL.md](14_SECURITY_THREAT_MODEL.md)).

## 7. Mereset `localStorage`

Data peserta kini disimpan di server (D1). `localStorage` hanya preferensi; kunci:

| Kunci | Isi |
|---|---|
| `hk_nav` | Layar terakhir dan indeks soal kuis |
| `hk_lang` | Bahasa pilihan (`id`, `en`, `zh`) |

Cara mereset:

1. Lewat antarmuka: klik **Keluar** (mengakhiri session di server).
2. Lewat DevTools, tab Console pada origin yang sama:
   ```js
   localStorage.removeItem("hk_nav");
   localStorage.removeItem("hk_lang");
   location.reload();
   ```
   Atau `localStorage.clear()` untuk semua data origin tersebut.
3. Lewat DevTools, tab Application, Storage, Local Storage, hapus kunci.
4. Jendela privat memberikan penyimpanan bersih.

Catatan: `localStorage` terikat per origin. `http://localhost:5173` dan `https://aicandoit.aiclub.id` memiliki penyimpanan terpisah.

## 8. Catatan Penting: `docs/` Adalah Output Build Sekaligus Folder Dokumen

Folder `docs/` memiliki dua fungsi:

1. **Output build** Vite (`build.outDir = "docs"`): `index.html`, `assets/`, `brand/`, `.nojekyll`. Isinya disajikan Cloudflare Pages dan ikut di-commit.
2. **Dokumentasi proyek**: berkas `.md` bernomor (00 sampai 31), folder `standards/`, dst.

Sebelumnya `vite.config.js` memakai `emptyOutDir: true`, yang membuat Vite mengosongkan seluruh `docs/` pada setiap `npm run build` sehingga dokumen `.md` ikut terhapus. **Perbaikan 2026-10-21 (oleh Alya, sedang dikerjakan di `vite.config.js`):** `emptyOutDir` diubah menjadi `false`, dan plugin kecil `clean-docs-assets` menghapus **hanya** `docs/assets` pada `buildStart` agar berkas JS/CSS berhash lama tidak menumpuk. Status berkas itu per 2026-10-21: perubahan sudah ada di working tree dan belum di-commit.

Aturan kerja:

- Jangan mengedit berkas hasil build (`docs/index.html`, `docs/assets/*`) secara manual; ubah sumber lalu `npm run build`.
- Taruh dokumen baru sebagai `.md` di `docs/`; build tidak menyentuhnya setelah perbaikan di atas.
- Jangan menaruh dokumen di `docs/assets/` karena folder itu dibersihkan setiap build.
- Berkas dari `public/` (mis. `.nojekyll`, `brand/`) disalin ke `docs/` oleh Vite; `docs/brand/` adalah salinan, bukan sumber.
- Sebelum commit hasil build, periksa `git status` agar yang berubah di `docs/` hanya hasil build dan dokumen yang memang diubah.
- Saat memindahkan produksi ke subdomain aiclub.id, pertimbangkan memisahkan dokumentasi dari output build: _TBD_.

## 9. Alur Kerja yang Disarankan

1. Buat cabang kerja dari `main`.
2. Ubah kode di `src/`, jalankan `npm run dev`, uji manual memakai matriks di [12_TEST_STRATEGY.md](12_TEST_STRATEGY.md).
3. Bila perubahan menyentuh teks, perbarui `id.js`, `en.js`, dan `zh.js` sekaligus.
4. Jalankan `npm run build` dan `npm run preview` untuk memastikan build statis berjalan dengan `base "./"`.
5. Commit perubahan kode bersama isi `docs/` hasil build (sesuai [../README.md](../README.md)).
6. Aturan pesan commit dan penamaan cabang: _TBD_ (standar tim di `standards/`, jika sudah tersedia).

## 10. Pemecahan Masalah

| Gejala | Kemungkinan penyebab | Tindakan |
|---|---|---|
| `npm run dev` gagal dengan galat versi Node | Node terlalu lama untuk Vite 5 | Perbarui ke Node LTS terbaru |
| Layar langsung "intro" setelah muat ulang | Session habis atau belum login | Normal; login ulang |
| Layar terakhir tidak sesuai | `hk_nav` dari sesi sebelumnya | Reset (bagian 7) |
| Teks tampil kosong | Kunci i18n salah ketik atau tidak ada di `id.js` | Periksa nama kunci di tiga kamus |
| Aset 404 setelah build di sub-path | `base` tidak `"./"` | Pastikan `vite.config.js` memakai `base: "./"` |
| File `.md` di `docs/` hilang setelah build | Konfigurasi lama `emptyOutDir: true` | Pastikan perbaikan 2026-10-21 terpasang (bagian 8); pulihkan dari git |
| Build menumpuk file `docs/assets/index-*.js` lama | Plugin pembersih tidak terpasang | Periksa `cleanAssets` di `vite.config.js` |
