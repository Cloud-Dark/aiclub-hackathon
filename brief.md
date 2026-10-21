# Brief: Integrasi Portal Hackathon dengan aiclub.id

Status: **draf untuk didiskusikan** · Repo: `cloud-dark/aiclub-hackathon`

## 1. Tujuan

Hari ini portal pendaftaran AI Agent Hackathon berjalan sendiri dengan data dummy di `localStorage`. Tujuannya: portal ini menjadi bagian dari ekosistem aiclub.id.

1. **Login dan session memakai akun aiclub.id.** Tidak ada sistem login terpisah.
2. **Semua data memakai database aiclub.id**, bukan dummy: profil peserta, jawaban skenario, tim, lamaran, aktivitas.
3. Hasil akhirnya: satu identitas (`memberId`) untuk semua sistem, tanpa input ulang data yang sudah ada di profil aiclub.id.

Di luar cakupan: mengubah alur 3 langkah, isi event, atau tampilan. Portal Tencent tetap lewat link `aiclub.id/l/...`.

## 2. Kondisi sekarang

Aplikasi React + Vite statis (di-deploy ke GitHub Pages dari `docs/`). Tidak ada backend.

| Yang dummy | Lokasi | Diganti dengan |
|---|---|---|
| Login (email + sandi bebas) | `src/components/Login.jsx`, `DUMMY_USERS` di `src/data.js` | Login aiclub.id |
| State peserta (`user, nama, kota, wa, linkedin, jawab, joinedMain, ...`) | `localStorage` key `hk_state` (`PERSIST` di `src/App.jsx`) | Tabel di DB aiclub.id |
| Daftar tim dan builder | `TIM`, `BUILDER` di `src/data.js` | Query DB |
| Lamaran dan keputusan owner | `actions.toggleApply`, `decideApp`, `decideApplicant` di `App.jsx` | Endpoint API + notifikasi ke owner |
| Tombol simulasi owner | `CONFIG.demoOwner` | Dihapus |
| Link grup WA tim (`wa`) | field di `TIM` | Hanya dikirim server setelah lamaran disetujui |
| Aturan satu orang satu tim / satu lamaran aktif | `src/lib/rules.js` (di klien saja) | Dijaga server dan constraint DB |

## 3. Yang diketahui tentang sistem aiclub.id

Dari katalog API agen (`/api/v1/agent/...`) yang bisa saya akses:

- Infrastruktur memakai **Cloudflare** (D1 untuk database, R2 untuk file).
- Ada konsep `memberId`, peran (member, pengurus kota, superadmin), kota dan provinsi (`/agent/regions`), event, registrasi, short link (`aiclub.id/l/...`), form.
- API yang ada adalah **API pengurus/agen** (butuh key milik pengurus). Isinya event, peserta, surat, keuangan, dan sejenisnya.
- **Yang tidak ada di katalog itu:** endpoint login/OAuth untuk aplikasi pihak ketiga, endpoint baca profil member untuk member itu sendiri, dan tabel/endpoint untuk hackathon (tim, lamaran, jawaban skenario).

Artinya integrasi ini **tidak bisa selesai hanya dari sisi repo ini**. Perlu ada sesuatu yang disediakan di sisi aiclub.id. Pertanyaan yang harus dijawab ada di bagian 8.

## 4. Arsitektur yang diusulkan

```
Browser (SPA React)
   │  cookie session aiclub.id
   ▼
hackathon.aiclub.id  ── Cloudflare Worker/Pages Functions (BFF)
   │   /api/hackathon/*  → cek session → logika bisnis
   ▼
D1 aiclub.id (tabel member + tabel hackathon_*)
```

Prinsip:

1. **Satu domain induk.** Taruh portal di subdomain aiclub.id (mis. `hackathon.aiclub.id`) supaya cookie session aiclub.id bisa dipakai (`Domain=.aiclub.id`, `HttpOnly`, `Secure`, `SameSite=Lax`). GitHub Pages (`cloud-dark.github.io`) tidak bisa berbagi cookie dengan aiclub.id, jadi tidak cocok untuk versi produksi.
2. **Klien tidak pernah menyimpan kebenaran.** `localStorage` hanya untuk preferensi (bahasa, layar terakhir). Semua keputusan (boleh melamar, boleh lihat link WA, status lamaran) diputuskan server.
3. **Tidak ada key pengurus di browser.** API `/agent/*` memakai key pengurus, jadi tidak boleh dipanggil dari klien. Backend hackathon memakai session member, atau service binding ke D1 langsung.

### Opsi login (pilih satu, lihat pertanyaan 8.1)

| Opsi | Cara | Catatan |
|---|---|---|
| **A. Cookie session bersama** (disarankan) | Portal di `*.aiclub.id`, Worker memvalidasi session yang sama dengan situs utama | Paling sederhana, UX mulus. Perlu akses ke cara validasi session. |
| B. OAuth/OIDC | Tombol "Masuk dengan aiclub.id", redirect ke aiclub.id, kembali dengan code, tukar token | Perlu aiclub.id menyediakan provider OAuth. Cocok kalau portal harus tetap di domain lain. |
| C. Magic link / token sekali pakai | Halaman login aiclub.id mengarahkan balik dengan token bertanda tangan | Cepat dibuat, tapi hati-hati replay dan masa berlaku. |

## 5. Data yang disambungkan

### 5.1 Profil (dibaca dari aiclub.id, bukan disimpan ulang)

`memberId, nama, email, kota (cityId), whatsapp, linkedin`

- Layar **Data diri** diisi otomatis dari profil. Perubahan data (kota, WA, LinkedIn) ditulis balik ke profil aiclub.id agar tidak ada dua sumber kebenaran. Kalau penulisan balik belum diizinkan, simpan di `hackathon_participant` dan tandai sebagai override.
- Kota memakai `cityId` dari `/agent/regions`, bukan teks bebas.

### 5.2 Tabel baru (usulan, prefiks `hackathon_`)

```sql
hackathon_participant (
  member_id      TEXT PRIMARY KEY,      -- = memberId aiclub.id
  latar          TEXT,                  -- kerja-tech, mahasiswa, dst
  jawaban        TEXT,                  -- JSON array indeks jawaban skenario
  jalur          TEXT,                  -- hasil skor: CEO/CTO/AI/PM/DSG/GRW/DOM/DAT
  jalur_override TEXT,
  joined_main_at INTEGER,               -- gabung grup WA utama (NULL = belum)
  tencent_clicked_at INTEGER,
  project_ready_at   INTEGER,
  submit_clicked_at  INTEGER,
  created_at INTEGER, updated_at INTEGER
)

hackathon_team (
  id           TEXT PRIMARY KEY,
  owner_id     TEXT NOT NULL UNIQUE REFERENCES hackathon_participant(member_id), -- satu owner satu tim
  nama         TEXT NOT NULL,
  deskripsi    TEXT,
  kota_id      TEXT,
  butuh        TEXT,                    -- JSON array peran yang dicari
  wa_link      TEXT,                    -- hanya dikirim ke owner dan anggota disetujui
  status       TEXT DEFAULT 'open',     -- open | closed
  created_at INTEGER
)

hackathon_application (
  id         TEXT PRIMARY KEY,
  team_id    TEXT NOT NULL REFERENCES hackathon_team(id),
  member_id  TEXT NOT NULL REFERENCES hackathon_participant(member_id),
  status     TEXT NOT NULL,             -- pending | approved | rejected | withdrawn
  created_at INTEGER, decided_at INTEGER
)
-- satu lamaran aktif per orang:
CREATE UNIQUE INDEX one_active_app ON hackathon_application(member_id)
  WHERE status IN ('pending','approved');

hackathon_invite (id, team_id, member_id, created_at)   -- owner mengundang builder
hackathon_activity (id, member_id, kind, team_id, meta, created_at)  -- pengganti `log`
```

### 5.3 Aturan bisnis yang harus dijaga di server

Semua ini sekarang hanya ada di `rules.js` (klien) dan bisa dilewati. Pindahkan ke server dan constraint DB:

1. Satu orang: anggota satu tim **atau** owner satu tim, tidak keduanya. Membuat tim ditolak bila punya lamaran `pending/approved`. Melamar ditolak bila sudah jadi owner.
2. Satu lamaran aktif per orang (unique index di atas).
3. Saat satu lamaran `approved`, lamaran `pending` lain milik orang itu otomatis `withdrawn` (satu transaksi).
4. `wa_link` tim hanya ada di respons untuk owner dan pelamar berstatus `approved`. Daftar tim publik tidak memuatnya.
5. Pindah pilihan: owner menutup tim dulu, anggota keluar dulu, pelamar menarik lamaran dulu.
6. Validasi `wa_link` dengan `WA_LINK_RE` di server juga.
7. Submit ke Tencent (langkah 3) hanya bisa bila `project_ready_at` terisi.

## 6. Kontrak API (usulan)

Semua butuh session member yang valid; tanpa itu `401`.

| Method + path | Fungsi |
|---|---|
| `GET /api/hackathon/me` | Profil + status peserta + tim/lamaran saya (menggantikan `hk_state`) |
| `PATCH /api/hackathon/me` | Simpan data diri, jawaban skenario, flag langkah (`joinedMain`, dst) |
| `GET /api/hackathon/teams` | Daftar tim terbuka (tanpa `wa_link`) |
| `GET /api/hackathon/teams/:id` | Detail tim; `wa_link` hanya bila berhak |
| `POST /api/hackathon/teams` | Buat tim (owner) |
| `PATCH /api/hackathon/teams/:id` | Ubah link WA, deskripsi (owner) |
| `POST /api/hackathon/teams/:id/close` | Tutup tim (owner) |
| `POST /api/hackathon/teams/:id/apply` | Lamar |
| `DELETE /api/hackathon/applications/:id` | Tarik lamaran / keluar tim |
| `POST /api/hackathon/applications/:id/decide` | Owner setujui/tolak (`{status}`) |
| `GET /api/hackathon/builders` | Builder yang belum bertim (untuk undangan) |
| `POST /api/hackathon/teams/:id/invites` | Undang builder |
| `POST /api/auth/logout` | Keluar (hapus session di aiclub.id) |

Skor jalur (`skor()` di `scoring.js`) boleh tetap dihitung di klien untuk tampilan, tapi **hasil resmi dihitung ulang server** dari `jawaban`.

## 7. Perubahan di repo ini

1. `src/lib/api.js` baru: wrapper `fetch` dengan `credentials: "include"`, penanganan `401` (arahkan ke login aiclub.id), dan error terstruktur.
2. `Login.jsx`: ganti form email/sandi dengan tombol **Masuk dengan aiclub.id** (redirect/OAuth sesuai opsi 4). Hapus `DUMMY_USERS`.
3. `App.jsx`: ganti `initState()` dan `localStorage` `hk_state` dengan `GET /me` saat start. `PERSIST` hanya menyisakan `lang` dan `screen`. Tambah state `loading`/`error`.
4. Setiap `actions.*` (`toggleApply`, `createTeam`, `decideApplicant`, `closeTeam`, `leaveTeam`, dst) memanggil API lalu memperbarui state dari respons. Pakai pembaruan optimistis hanya bila ada rollback.
5. `data.js`: hapus `TIM`, `BUILDER`, `SEED_APPLICANTS`, `CONFIG.demoOwner`. Pertahankan `URUT`, `WEIGHTS`, `LATAR`, URL Tencent/WA utama.
6. `Market.jsx`, `TeamDetail.jsx`, `Choose.jsx`, `MyTeam.jsx`: baca dari API, tambah state memuat, kosong, dan gagal.
7. Variabel lingkungan: `VITE_API_BASE`, `VITE_LOGIN_URL`. Tidak ada rahasia di bundel klien.
8. Hapus `docs/` dari alur GitHub Pages saat pindah ke subdomain aiclub.id; GitHub Pages tinggal untuk demo dummy atau dimatikan.
9. Perbarui `README.md` (bagian "Masih dummy").

## 8. Pertanyaan terbuka untuk pengelola aiclub.id

Ini yang menentukan opsi mana yang jalan. Tanpa jawabannya implementasi akan menebak.

1. **Login:** apakah aiclub.id punya OAuth/OIDC untuk aplikasi lain, atau hanya cookie session? Bisakah portal ini di-host di `*.aiclub.id`?
2. **Session:** format dan cara memvalidasi session (JWT, token opak di D1/KV)? Bisa divalidasi dari Worker lain?
3. **Akses DB:** apakah Worker hackathon boleh binding ke D1 yang sama, atau harus lewat API? Siapa yang menjalankan migrasi tabel `hackathon_*`?
4. **Profil member:** endpoint baca profil milik sendiri, dan apakah boleh ubah kota/WA/LinkedIn dari luar?
5. **Persetujuan data:** apakah member sudah setuju datanya (WA, kota) dipakai untuk fitur ini? Kalau belum, perlu layar persetujuan sebelum nomor WA tampil ke pengelola atau owner tim.
6. **Identitas Tencent:** apakah perlu mencocokkan peserta aiclub.id dengan pendaftar di portal Tencent (email atau `memberId`)? Link `aiclub.id/l/...` hanya short link, belum ada data balik.
7. **Peran:** siapa yang boleh melihat seluruh peserta/tim hackathon (pengurus pusat saja, atau pengurus kota)? Perlu halaman admin atau cukup ekspor CSV?
8. **Hosting:** tetap statis + Worker, atau digabung ke aplikasi aiclub.id yang sudah ada?

## 9. Tahapan

| Fase | Isi | Selesai bila |
|---|---|---|
| 0. Keputusan | Jawab pertanyaan bagian 8, pilih opsi login | Opsi login dan akses DB disepakati |
| 1. Auth | Login aiclub.id, `GET /me`, logout; layar Data diri terisi dari profil | Login dummy hilang; refresh halaman tetap login |
| 2. Data peserta | Tabel `hackathon_participant`, simpan jawaban, jalur, flag langkah | Pindah browser/perangkat, progres tetap ada |
| 3. Tim dan lamaran | Tabel tim/lamaran/undangan, aturan bisnis di server, `wa_link` terkunci | Dua akun nyata bisa buat tim, lamar, setujui; aturan 5.3 lolos tes |
| 4. Pembersihan | Hapus dummy dan `demoOwner`, perbarui README, domain produksi | Tidak ada referensi `DUMMY_USERS`/`TIM`/`BUILDER` |
| 5. Admin (opsional) | Daftar peserta/tim dan ekspor CSV untuk pengurus | Pengurus bisa memantau pendaftar |

## 10. Kriteria selesai

- Tidak ada sistem login terpisah; session = session aiclub.id; logout berlaku di kedua sisi.
- Tidak ada data dummy di bundel produksi; `localStorage` hanya berisi preferensi.
- Aturan satu orang satu tim dan satu lamaran aktif **tidak bisa dilanggar** dengan memanggil API langsung (dites).
- Link grup WA tim tidak muncul di respons API untuk pengguna yang belum disetujui.
- Endpoint tanpa session mengembalikan `401`; owner lain tidak bisa memutuskan lamaran tim orang lain (`403`).
- Data peserta bisa diekspor oleh pengurus berwenang saja, dan nomor WA tidak bocor ke peserta lain.

## 11. Risiko

- **Tanpa provider login atau akses DB dari aiclub.id, integrasi tertahan** (pertanyaan 8.1 sampai 8.3). Ini risiko terbesar.
- Cookie lintas domain gagal bila portal tetap di `github.io`.
- Race condition lamaran ganda bila hanya dicek di klien; harus constraint DB dan transaksi.
- Data pribadi (WA, kota) perlu dasar persetujuan dan tidak boleh tampil di daftar publik.
- Batas waktu: pendaftaran ditutup 1 Nov, jadi fase 1 sampai 3 perlu selesai sebelum itu.
