# Standard Arsitektur

> Status: Draft
> Terakhir diperbarui: 2026-10-21
> Pemilik: Tim AIClub Hackathon

## 1. Tujuan dan Lingkup

Standard ini menetapkan batas lapisan aplikasi dan aturan yang WAJIB dipatuhi agar portal dapat berpindah dari mode dummy (state di `localStorage`) ke integrasi aiclub.id tanpa mengulang desain. Dasar rencana integrasi: [../../brief.md](../../brief.md). Desain teknis terperinci: [../04_TRD.md](../04_TRD.md).

Status integrasi pada tanggal dokumen ini: belum ada backend. Semua aturan pada bagian "setelah integrasi" berlaku mulai fase 1 pada brief dan DISARANKAN ditiru sedini mungkin di klien.

## 2. Arsitektur Saat Ini dan Target

Saat ini (dummy):

```
Browser (SPA React statis, GitHub Pages)
  App.jsx  --useState--> st  --useEffect--> localStorage "hk_state"
  src/data.js (TIM, BUILDER, DUMMY_USERS)   src/lib/*.js (aturan, skor)
```

Target (usulan brief, belum final; keputusan hosting dan login _TBD_ menunggu jawaban pengelola aiclub.id):

```
Browser (SPA React)
   |  cookie session aiclub.id
   v
hackathon.aiclub.id -- Worker/Pages Functions (BFF) -- /api/hackathon/*
   v
D1 aiclub.id (tabel member + hackathon_*)
```

## 3. Lapisan dan Batasnya

| Lapisan | Lokasi | Tanggung jawab | Boleh bergantung pada |
|---|---|---|---|
| UI | `src/components/*.jsx`, `src/styles.css` | Render, input pengguna, umpan balik (memuat, kosong, gagal) | State dan `actions` dari `App.jsx`, `lib/`, `i18n/`, konstanta tampilan di `data.js` |
| Orkestrasi | `src/App.jsx` | State global, navigasi layar, `actions` | `lib/`, `data.js`, `i18n/`, (setelah integrasi) `lib/api.js` |
| Lib (fungsi murni) | `src/lib/*.js` | Aturan turunan untuk tampilan (kelayakan tombol, skor pratinjau, format waktu) | Hanya `data.js` dan lib lain |
| Data statis | `src/data.js`, `src/i18n/*` | Konstanta, bobot, teks, URL | Tidak ada |
| API klien | `src/lib/api.js` (belum ada, dirancang di brief bagian 7) | Satu-satunya pintu `fetch` ke server | Variabel lingkungan `VITE_API_BASE`, `VITE_LOGIN_URL` |
| Server (BFF) | Di luar repo ini atau folder baru: _TBD_ | Autentikasi, otorisasi, aturan bisnis, transaksi, akses DB | DB, session aiclub.id |
| Database | D1 aiclub.id (usulan) | Sumber kebenaran, constraint | Tidak ada |

Aturan arah ketergantungan: UI -> Orkestrasi -> Lib/API -> Data. Arah sebaliknya DILARANG.

| Aturan | Tingkat |
|---|---|
| Komponen memanggil `fetch` langsung | DILARANG; semua panggilan lewat `lib/api.js` |
| `lib/*.js` mengimpor komponen atau React | DILARANG |
| Komponen mengubah `localStorage` | DILARANG; persistensi hanya di `App.jsx` dan `i18n/index.js` |
| Komponen membaca `TIM`, `BUILDER`, `DUMMY_USERS` langsung setelah integrasi | DILARANG; data datang dari API lewat state |
| Duplikasi aturan bisnis di dua tempat klien | DILARANG; satu fungsi di `lib/` |
| Data dan konfigurasi tampilan (URUT, WEIGHTS, URL Tencent, `WA_GROUP_URL`) tinggal di `data.js` | WAJIB |

Contoh benar:

```jsx
// komponen hanya memakai hasil fungsi lib dan memanggil actions
const act = activeApp(st);
<button type="button" onClick={() => actions.toggleApply(tm.nama)}>{t("market.apply")}</button>
```

Contoh salah:

```jsx
// komponen mengambil keputusan bisnis dan memanggil jaringan sendiri
if (!st.myTeam && st.apps.length === 0) {
  fetch("https://.../apply", { method: "POST" });   // DILARANG
}
```

## 4. Logika Bisnis di Server (Setelah Integrasi)

Prinsip: klien adalah penyaji dan pengumpul input; server adalah pengambil keputusan.

1. Setiap aturan bisnis WAJIB ditegakkan di server dan, bila bisa, oleh constraint database. Aturan di klien (`src/lib/rules.js`) hanya untuk pengalaman pengguna (menonaktifkan tombol, pesan lebih cepat) dan DILARANG dianggap sebagai pengaman.
2. Klien DILARANG menjadi sumber kebenaran untuk: identitas peserta, status lamaran, kepemilikan tim, hak melihat link WhatsApp, hasil resmi jalur, dan kesiapan submit. Server WAJIB menghitung ulang atau memeriksa ulang semuanya.
3. `localStorage` setelah integrasi hanya berisi preferensi (`lang`, `screen` terakhir). Isi `hk_state` untuk data peserta DILARANG dipertahankan (brief bagian 4, prinsip 2 dan bagian 7 butir 3).
4. Pembaruan optimistis di klien DILARANG kecuali ada rollback ketika server menolak; status akhir selalu diambil dari respons server.
5. Server WAJIB idempotent untuk aksi yang bisa terkirim ganda (klik ganda, retry jaringan).

### 4.1 Aturan Bisnis yang Harus di Server

Sumber: [../../brief.md](../../brief.md) bagian 5.3. Berikut pemetaan dari kode klien saat ini ke penegak di server.

| No | Aturan | Kode klien saat ini | Penegak di server |
|---|---|---|---|
| R1 | Satu orang: anggota satu tim ATAU owner satu tim | `canApply`, `canCreate` pada `rules.js` | Pemeriksaan di endpoint buat tim dan lamar; `owner_id` UNIQUE |
| R2 | Satu lamaran aktif (`pending`/`approved`) per orang | `activeApp` | Unique index parsial `one_active_app` |
| R3 | Saat satu lamaran `approved`, lamaran `pending` lain menjadi `withdrawn` | `decideApp` pada `App.jsx` | Satu transaksi DB |
| R4 | Link WhatsApp tim hanya untuk owner dan pelamar `approved` | `wa` pada `TIM` (placeholder) | Pemfilteran respons di server |
| R5 | Pindah pilihan hanya setelah tutup tim, keluar tim, atau tarik lamaran | `closeTeam`, `leaveTeam`, `withdrawAll` | Endpoint terkait memeriksa status |
| R6 | Link grup WhatsApp valid | `WA_LINK_RE` pada `data.js` | Validasi ulang dengan pola yang sama |
| R7 | Submit ke Tencent hanya bila `project_ready_at` terisi | `projectReady` | Pemeriksaan di server |
| R8 | Jalur resmi dihitung dari `jawaban` | `skor()` pada `scoring.js` | Hitung ulang; hasil klien hanya tampilan |
| R9 | Hanya owner tim yang memutuskan lamaran tim itu | `CONFIG.demoOwner` (simulasi) | Otorisasi `403` |

Setiap aturan baru WAJIB ditambahkan ke tabel ini beserta tes yang sesuai ([05_TESTING_STANDARD.md](05_TESTING_STANDARD.md)).

## 5. Kontrak API

Kontrak awal diusulkan pada [../../brief.md](../../brief.md) bagian 6 dan masih draf. Standard ini menetapkan aturan umum; daftar endpoint final dicatat pada [../04_TRD.md](../04_TRD.md) dan dokumen spesifikasi API di `docs/specs/` (lihat [06_DOCUMENTATION_STANDARD.md](06_DOCUMENTATION_STANDARD.md)).

### 5.1 Aturan Umum

| Aturan | Tingkat |
|---|---|
| Semua endpoint di bawah awalan `/api/hackathon/*`, kecuali logout `/api/auth/logout` | WAJIB |
| Semua endpoint memerlukan session valid; tanpa session menjawab `401` | WAJIB |
| Pengguna terautentikasi tetapi tidak berhak menjawab `403` | WAJIB |
| Sumber daya tidak ada menjawab `404`; input tidak valid `400` atau `422`; konflik aturan bisnis `409` | WAJIB |
| Body dan respons berformat JSON, `Content-Type: application/json` | WAJIB |
| Galat berstruktur: `{ "error": { "code": "...", "message": "..." } }` dengan `code` stabil (misalnya `ACTIVE_APPLICATION_EXISTS`) | WAJIB |
| Klien memetakan `code` ke kunci i18n; teks galat server DILARANG ditampilkan mentah | WAJIB |
| Nilai enum dan nama kolom API memakai Inggris huruf kecil: `pending`, `approved`, `rejected`, `withdrawn`, `open`, `closed` | WAJIB |
| Penanda waktu API memakai epoch milidetik atau ISO 8601 UTC (pilih satu, ditetapkan di spesifikasi): _TBD_ | WAJIB |
| Perubahan yang merusak kompatibilitas (hapus atau ganti nama bidang) WAJIB lewat versi baru atau masa transisi dua rilis | WAJIB |
| Daftar WAJIB mendukung pagination bila dapat melebihi 50 item | DISARANKAN |

### 5.2 Bentuk Respons Kunci

`GET /api/hackathon/me` menggantikan `hk_state` dan WAJIB mengembalikan bentuk yang stabil:

```json
{
  "member": { "memberId": "...", "nama": "...", "email": "...", "kota": "...", "wa": "...", "linkedin": "..." },
  "peserta": { "latar": "kerja-tech", "jawab": [0, 1, 2, 0, 3, 1], "jalur": "AI", "joinedMain": true,
               "tencentClicked": false, "projectReady": false, "submitClicked": false },
  "tim": null,
  "lamaran": [{ "id": "...", "teamId": "...", "status": "pending", "createdAt": 0 }]
}
```

Bentuk di atas adalah ilustrasi untuk menunjukkan aturan penamaan (kunci domain Indonesia sesuai [02_CODE_STANDARD.md](02_CODE_STANDARD.md), enum Inggris); bentuk final _TBD_ pada spesifikasi API.

Aturan keluaran daftar tim: `GET /api/hackathon/teams` DILARANG memuat `wa_link` atau nomor WhatsApp siapa pun. `GET /api/hackathon/teams/:id` hanya memuat `wa_link` bila pemohon adalah owner atau pelamar berstatus `approved`.

### 5.3 Lapisan API di Klien

1. `src/lib/api.js` (baru) membungkus `fetch` dengan `credentials: "include"`, menangani `401` (arahkan ke `VITE_LOGIN_URL`), dan melempar galat berstruktur.
2. Setiap `actions.*` pada `App.jsx` memanggil API, lalu memperbarui state dari respons.
3. Komponen WAJIB menampilkan tiga keadaan untuk data jaringan: memuat, kosong, dan gagal.
4. Konfigurasi tersedia lewat `VITE_API_BASE` dan `VITE_LOGIN_URL`; tidak ada rahasia di bundel ([04_SECURITY_STANDARD.md](04_SECURITY_STANDARD.md)).

Contoh benar:

```js
// lib/api.js
export async function api(path, opts = {}) {
  const res = await fetch(import.meta.env.VITE_API_BASE + path, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...opts
  });
  if (res.status === 401) { location.assign(import.meta.env.VITE_LOGIN_URL); return; }
  if (!res.ok) throw await res.json();
  return res.json();
}
```

## 6. Pengelolaan State Klien

1. Satu sumber state global: `useState` pada `App.jsx`. Redux, Zustand, atau context baru DILARANG tanpa keputusan tertulis.
2. Persistensi hanya lewat daftar `PERSIST` pada `App.jsx`. Setelah integrasi, `PERSIST` WAJIB hanya berisi `lang` dan `screen`.
3. State turunan (misalnya `activeApp(st)`) DILARANG disimpan; hitung dari state dasar.
4. Navigasi memakai kunci layar (`SCREENS`, `STEP_OF` pada `data.js`). Router tidak dipakai; menambah layar WAJIB memperbarui `SCREENS`, `STEP_OF`, penjaga pada `initState()`, dan `switch` render pada `App.jsx`.
5. Penjaga navigasi (misalnya tidak boleh ke `pasar` sebelum `joinedMain`) DISARANKAN dipertahankan di klien demi pengalaman pengguna, dan WAJIB diulang di server untuk datanya.

## 7. Pembersihan Dummy

Sebelum rilis produksi pada domain aiclub.id, hal berikut WAJIB hilang dari bundel (brief bagian 7 dan 10): `DUMMY_USERS`, `TIM`, `BUILDER`, `SEED_APPLICANTS`, `CONFIG.demoOwner`, dan form email/sandi pada `Login.jsx`. Gunakan pencarian teks pada repositori untuk membuktikan tidak ada rujukan tersisa.

## 8. Batas Lingkungan

| Lingkungan | Tujuan | Data | Hosting |
|---|---|---|---|
| Lokal | Pengembangan (`npm run dev`) | Dummy atau API uji: _TBD_ | Vite dev server |
| Demo | Peragaan alur | Dummy di `localStorage` | GitHub Pages dari `main` `/docs` |
| Produksi | Pendaftaran nyata | DB aiclub.id | Subdomain aiclub.id: _TBD_ (pertanyaan terbuka brief bagian 8) |

Cookie session lintas domain tidak bisa dipakai dari `github.io` ke `aiclub.id`; versi demo di GitHub Pages DILARANG disambungkan ke session sungguhan.

## 9. Keputusan Arsitektur

Perubahan batas lapisan, penambahan dependensi besar, atau penggantian pola state WAJIB dicatat sebagai keputusan (decisions) sesuai [06_DOCUMENTATION_STANDARD.md](06_DOCUMENTATION_STANDARD.md), memuat konteks, opsi, keputusan, dan konsekuensi.

## 10. Riwayat Dokumen

| Tanggal | Perubahan |
|---|---|
| 2026-10-21 | Draf awal. |
