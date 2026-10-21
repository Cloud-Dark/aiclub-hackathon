# Brief: Integrasi Portal Hackathon dengan aiclub.id

Status: **draf untuk didiskusikan** · Terakhir diperbarui: 2026-10-21 · Repo: `cloud-dark/aiclub-hackathon`

## 1. Tujuan

Hari ini portal pendaftaran AI Agent Hackathon berjalan sendiri dengan data dummy di `localStorage`. Tujuannya: portal ini menjadi bagian dari ekosistem aiclub.id.

1. **Login dan session memakai akun aiclub.id.** Tidak ada sistem login terpisah.
2. **Semua data memakai database aiclub.id**, bukan dummy: profil peserta, jawaban skenario, tim, lamaran, aktivitas, pengumuman, dan chat tim.
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
| Link undangan tim (`?tim=<data tim dikodekan>`) | `src/lib/share.js` | `?tim=<share_code>` yang dicari server (5.2, 6.2) |
| Batas keputusan owner 24 jam | `expirePending()` di `src/lib/rules.js`, `CONFIG.approveHours` | Kolom `expires_at` + cron + cek saat baca (5.3) |
| Pengumuman dan hitungan tayangan | `PENGUMUMAN` di `src/data.js`, teks di `src/i18n/*.js`, `annViewed` di `localStorage` | Tabel pengumuman + tayangan unik per member (5.2, 6.3) |
| Anggota tim dan kontak | `ANGGOTA`, kontak `BUILDER` di `src/data.js`, `src/lib/team.js` | `hackathon_team_member` + profil, hanya untuk sesama anggota (5.3) |
| Chat tim | `chats` di `localStorage`, `src/components/TeamRoom.jsx` | Tabel pesan + realtime (5.2, 6.4, 6.5) |

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

`memberId, nama, email, kota (cityId), whatsapp, linkedin, github`

- Layar **Data diri** diisi otomatis dari profil. Perubahan data (kota, WA, LinkedIn, GitHub) ditulis balik ke profil aiclub.id agar tidak ada dua sumber kebenaran. Kalau penulisan balik belum diizinkan, simpan di `hackathon_participant` dan tandai sebagai override.
- Kota memakai `cityId` dari `/agent/regions`, bukan teks bebas.
- Bila profil aiclub.id belum punya kolom GitHub, simpan di `hackathon_participant.github` (lihat pertanyaan 8.4).
- Kontak (WA, email, LinkedIn, GitHub) hanya dibagikan ke sesama anggota tim setelah member menyetujui (`contact_consent_at`, pertanyaan 8.5).

### 5.2 Tabel baru (usulan, prefiks `hackathon_`)

Tipe mengikuti SQLite/D1. Waktu disimpan sebagai epoch milidetik (UTC).

```sql
-- peserta hackathon (1 baris per member)
hackathon_participant (
  member_id          TEXT PRIMARY KEY,      -- = memberId aiclub.id
  latar              TEXT,                  -- kerja-tech, mahasiswa, dst
  jawaban            TEXT,                  -- JSON array indeks jawaban skenario
  jalur              TEXT,                  -- hasil skor server: CEO/CTO/AI/PM/DSG/GRW/DOM/DAT
  jalur_override     TEXT,
  github             TEXT,                  -- bila profil aiclub.id belum punya kolom ini
  contact_consent_at INTEGER,               -- setuju kontak dibagikan ke sesama anggota tim
  joined_main_at     INTEGER,               -- gabung grup WA utama (NULL = belum)
  tencent_clicked_at INTEGER,
  project_ready_at   INTEGER,
  submit_clicked_at  INTEGER,
  created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL
)

hackathon_team (
  id          TEXT PRIMARY KEY,
  owner_id    TEXT NOT NULL REFERENCES hackathon_participant(member_id),
  nama        TEXT NOT NULL,                -- maks 40 karakter
  deskripsi   TEXT,                         -- maks 200 karakter
  kota_id     TEXT,
  butuh       TEXT NOT NULL,                -- JSON array peran yang dicari
  wa_link     TEXT,                         -- hanya dikirim ke owner dan anggota
  share_code  TEXT NOT NULL UNIQUE,         -- kode acak untuk link undangan ?tim=<share_code>
  status      TEXT NOT NULL DEFAULT 'open', -- open | closed
  created_at  INTEGER NOT NULL, closed_at INTEGER
)
-- satu owner hanya punya satu tim TERBUKA (owner yang menutup tim boleh membuat tim lagi)
CREATE UNIQUE INDEX one_open_team_per_owner ON hackathon_team(owner_id) WHERE status = 'open';

-- keanggotaan eksplisit: sumber otorisasi untuk kontak dan chat
hackathon_team_member (
  team_id    TEXT NOT NULL REFERENCES hackathon_team(id),
  member_id  TEXT NOT NULL REFERENCES hackathon_participant(member_id),
  role       TEXT NOT NULL,                 -- owner | member
  joined_at  INTEGER NOT NULL,
  left_at    INTEGER,                       -- NULL = masih anggota
  PRIMARY KEY (team_id, member_id, joined_at)
)
-- satu orang hanya aktif di satu tim (sebagai owner atau anggota)
CREATE UNIQUE INDEX one_active_membership ON hackathon_team_member(member_id) WHERE left_at IS NULL;

hackathon_application (
  id          TEXT PRIMARY KEY,
  team_id     TEXT NOT NULL REFERENCES hackathon_team(id),
  member_id   TEXT NOT NULL REFERENCES hackathon_participant(member_id),
  status      TEXT NOT NULL,                -- pending | approved | rejected | expired | withdrawn
  via         TEXT,                         -- market | share_link | invite
  created_at  INTEGER NOT NULL,
  expires_at  INTEGER NOT NULL,             -- created_at + 24 jam (APPROVE_HOURS)
  decided_at  INTEGER,
  decided_by  TEXT                          -- member_id owner; NULL untuk expired/withdrawn
)
-- satu lamaran aktif per orang:
CREATE UNIQUE INDEX one_active_app ON hackathon_application(member_id)
  WHERE status IN ('pending','approved');
-- untuk cron kedaluwarsa:
CREATE INDEX app_pending_expiry ON hackathon_application(expires_at) WHERE status = 'pending';

hackathon_invite (id, team_id, member_id, created_at)                -- owner mengundang builder
hackathon_activity (id, member_id, kind, team_id, meta, created_at)  -- pengganti `log`

-- pengumuman
hackathon_announcement (
  id           TEXT PRIMARY KEY,            -- slug, mis. p-jadwal
  pinned       INTEGER NOT NULL DEFAULT 0,
  status       TEXT NOT NULL DEFAULT 'draft', -- draft | published | archived
  published_at INTEGER,
  created_by   TEXT NOT NULL,               -- member_id pengurus
  created_at   INTEGER NOT NULL, updated_at INTEGER NOT NULL
)
hackathon_announcement_i18n (
  announcement_id TEXT NOT NULL REFERENCES hackathon_announcement(id),
  lang     TEXT NOT NULL,                   -- id | en | zh
  title    TEXT NOT NULL,
  summary  TEXT NOT NULL,
  body     TEXT NOT NULL,                   -- paragraf teks polos (tanpa HTML)
  PRIMARY KEY (announcement_id, lang)
)
-- tayangan unik: satu baris per (pengumuman, member)
hackathon_announcement_view (
  announcement_id TEXT NOT NULL REFERENCES hackathon_announcement(id),
  member_id       TEXT NOT NULL,
  first_viewed_at INTEGER NOT NULL,
  last_viewed_at  INTEGER NOT NULL,
  open_count      INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (announcement_id, member_id)
)

-- chat tim
hackathon_chat_message (
  id          TEXT PRIMARY KEY,             -- ULID, bisa diurutkan menurut waktu
  team_id     TEXT NOT NULL REFERENCES hackathon_team(id),
  member_id   TEXT NOT NULL,
  body        TEXT NOT NULL,                -- 1..1000 karakter, teks polos
  created_at  INTEGER NOT NULL,
  deleted_at  INTEGER,                      -- hapus lunak oleh penulis atau owner
  deleted_by  TEXT
)
CREATE INDEX chat_by_team ON hackathon_chat_message(team_id, id);
hackathon_chat_read (
  team_id      TEXT NOT NULL,
  member_id    TEXT NOT NULL,
  last_read_id TEXT,                        -- untuk hitung pesan belum dibaca
  PRIMARY KEY (team_id, member_id)
)
```

### 5.3 Aturan bisnis yang harus dijaga di server

Semua ini sekarang hanya ada di klien dan bisa dilewati. Pindahkan ke server dan constraint DB:

**Tim dan lamaran**

1. Satu orang: anggota satu tim **atau** owner satu tim, tidak keduanya (`one_active_membership`). Membuat tim ditolak bila punya lamaran `pending/approved`. Melamar ditolak bila sudah jadi owner atau anggota.
2. Satu lamaran aktif per orang (`one_active_app`).
3. Owner tidak bisa melamar ke timnya sendiri. Pelamar yang pernah `rejected` atau `expired` di sebuah tim tidak bisa melamar lagi ke tim yang sama (sesuai perilaku sekarang; ubah bila panitia mau).
4. Saat lamaran `approved` (satu transaksi):
   - status lamaran `approved`, `decided_at`, `decided_by` terisi;
   - baris baru di `hackathon_team_member` (role `member`);
   - lamaran `pending` lain milik orang itu menjadi `withdrawn`.
5. `wa_link`, daftar anggota, dan kontak **hanya** ada di respons untuk anggota aktif tim itu (owner atau `hackathon_team_member` dengan `left_at IS NULL`). Daftar tim publik dan endpoint link undangan tidak memuatnya.
6. Pindah pilihan: owner menutup tim dulu (semua anggota `left_at` terisi, lamaran `pending` jadi `withdrawn`), anggota keluar dulu (`left_at`), pelamar menarik lamaran dulu (`withdrawn`, hanya dari `pending`).
7. Validasi `wa_link` di server dengan pola yang dijangkar penuh: `^https://chat\.whatsapp\.com/[A-Za-z0-9_-]+$` (pola di klien sekarang belum punya `$`).
8. Submit ke Tencent (langkah 3) hanya bisa bila `project_ready_at` terisi.

**Batas keputusan 24 jam**

9. `expires_at = created_at + APPROVE_HOURS` (default 24 jam, satu konstanta di server, bukan dari klien).
10. Keputusan owner hanya sah bila lamaran masih `pending` dan belum lewat batas. Pakai update bersyarat lalu cek jumlah baris berubah:
    ```sql
    UPDATE hackathon_application
       SET status = ?, decided_at = ?, decided_by = ?
     WHERE id = ? AND status = 'pending' AND expires_at > ?;
    -- changes() = 0 -> 409 (sudah diputuskan / kedaluwarsa)
    ```
11. Kedaluwarsa dijalankan dua cara supaya tidak bergantung pada satu mekanisme:
    - **Cron Trigger** Cloudflare tiap 5 menit: `UPDATE ... SET status='expired', decided_at=expires_at WHERE status='pending' AND expires_at <= now`, lalu tulis `hackathon_activity` dan kirim notifikasi.
    - **Cek saat baca**: setiap endpoint yang mengembalikan lamaran memperlakukan `pending` dengan `expires_at <= now` sebagai `expired` (dan memperbaruinya), jadi status tetap benar walau cron terlambat.
12. Respons API menyertakan `expires_at` dan `server_time` supaya hitung mundur di klien tidak bergantung jam perangkat.
13. Pelamar boleh menarik lamaran selama `pending`. Setelah `approved`, yang ada adalah "keluar dari tim" (`left_at`), bukan tarik lamaran.

**Anggota dan kontak**

14. Kontak (WA, email, LinkedIn, GitHub) diambil dari profil saat dibaca, tidak disalin ke tabel tim.
15. Kontak seseorang hanya dikirim bila: peminta adalah anggota aktif tim yang sama **dan** pemilik kontak sudah `contact_consent_at`. Tanpa persetujuan, tampil nama dan peran saja.
16. Anggota yang keluar atau tim yang ditutup langsung kehilangan akses ke kontak dan chat.

**Chat tim**

17. Hanya anggota aktif tim yang boleh membaca dan mengirim pesan (`403` untuk selain itu, termasuk pelamar `pending`).
18. `body` di-trim, 1 sampai 1000 karakter, disimpan sebagai teks polos dan dirender tanpa HTML.
19. Batas laju per member, misalnya 20 pesan per menit dan 500 per hari (angka final `_TBD_`). Lewat batas: `429`.
20. Hapus lunak oleh penulis pesan atau owner tim; isi pesan terhapus tidak dikirim lagi ke klien.
21. Retensi pesan setelah event selesai: `_TBD_` (pertanyaan 8.10).

**Pengumuman**

22. Hanya pengurus berwenang (pertanyaan 8.9) yang bisa membuat, mengubah, menerbitkan, menyematkan, atau mengarsipkan pengumuman.
23. Yang publik hanya `status='published'`. Bisa dibaca tanpa login.
24. Tayangan dihitung **sekali per member per pengumuman**: `INSERT ... ON CONFLICT(announcement_id, member_id) DO UPDATE SET last_viewed_at=?, open_count=open_count+1`. Angka yang ditampilkan = `COUNT(*)` baris untuk pengumuman itu (unik), bukan `open_count`.
25. Tayangan tanpa login tidak dihitung (atau dihitung terpisah memakai id anonim, pertanyaan 8.11). Tayangan dicatat lewat `POST .../view` saat detail benar-benar dibuka, bukan saat daftar dimuat, supaya prefetch dan bot tidak ikut terhitung.
26. Status "sudah dibaca" dan jumlah belum dibaca untuk member yang login berasal dari tabel tayangan yang sama.

## 6. Kontrak API (usulan)

Semua butuh session member yang valid (`401` bila tidak), kecuali yang ditandai **publik**. Error memakai bentuk `{ "error": { "code": "...", "message": "..." } }`. Kode status: `400` input salah, `401` belum login, `403` tidak berhak, `404` tidak ada, `409` konflik aturan (mis. sudah punya lamaran aktif, sudah diputuskan, kedaluwarsa), `429` batas laju.

### 6.1 Profil, tim, lamaran

| Method + path | Fungsi |
|---|---|
| `GET /api/hackathon/me` | Profil + status peserta + tim/lamaran saya + jumlah pengumuman dan chat belum dibaca (menggantikan `hk_state`) |
| `PATCH /api/hackathon/me` | Simpan data diri (termasuk `github`, persetujuan kontak), jawaban skenario, flag langkah |
| `GET /api/hackathon/teams` | Daftar tim terbuka (tanpa `wa_link`, anggota, dan kontak) |
| `GET /api/hackathon/teams/:id` | Detail tim; `wa_link` hanya bila anggota aktif |
| `POST /api/hackathon/teams` | Buat tim (owner); mengembalikan `share_code` |
| `PATCH /api/hackathon/teams/:id` | Ubah link WA, deskripsi, slot (owner) |
| `POST /api/hackathon/teams/:id/close` | Tutup tim (owner) |
| `POST /api/hackathon/teams/:id/share-code/rotate` | Ganti `share_code` (owner); link lama berhenti berlaku |
| `POST /api/hackathon/teams/:id/apply` | Lamar (`{ via }`); respons memuat `expires_at` |
| `DELETE /api/hackathon/applications/:id` | Tarik lamaran (`pending` saja) |
| `POST /api/hackathon/teams/:id/leave` | Keluar dari tim (anggota) |
| `GET /api/hackathon/teams/:id/applications` | Kotak pelamar (owner), dengan `expires_at` |
| `POST /api/hackathon/applications/:id/decide` | Owner setujui/tolak `{ status: "approved" \| "rejected" }`; `409` bila sudah diputuskan atau lewat batas |
| `GET /api/hackathon/builders` | Builder yang belum bertim (untuk undangan) |
| `POST /api/hackathon/teams/:id/invites` | Undang builder |
| `POST /api/auth/logout` | Keluar (hapus session di aiclub.id) |

Contoh respons lamaran:

```json
{ "id": "app_01J...", "team_id": "team_01J...", "status": "pending",
  "created_at": 1792567601908, "expires_at": 1792654001908, "server_time": 1792570000000 }
```

### 6.2 Link undangan tim

| Method + path | Fungsi |
|---|---|
| `GET /api/hackathon/share/:code` (**publik**) | Ringkasan tim untuk halaman undangan: `id, nama, deskripsi, kota, butuh, nama owner, jumlah anggota, status`. Tanpa `wa_link`, anggota lain, atau kontak. `404` bila kode tidak ada atau tim ditutup. |

Link berubah dari `?tim=<data tim dikodekan>` menjadi `?tim=<share_code>` (acak, minimal 10 karakter, tidak bisa ditebak). Setelah login dan syarat pendaftaran terpenuhi, klien membuka detail tim itu seperti sekarang. Lamaran lewat link memakai `via: "share_link"`.

### 6.3 Pengumuman

| Method + path | Fungsi |
|---|---|
| `GET /api/hackathon/announcements?lang=id` (**publik**) | Daftar terbit: disematkan dulu, lalu `published_at` terbaru. Tiap item: `id, title, summary, pinned, published_at, views`, plus `read` bila login. |
| `GET /api/hackathon/announcements/:id?lang=id` (**publik**) | Detail lengkap (`body`). Tidak mencatat tayangan. |
| `POST /api/hackathon/announcements/:id/view` | Catat tayangan unik member (idempoten); balas `{ views, read: true }` |
| `GET /api/hackathon/admin/announcements` | Semua status (pengurus) |
| `POST /api/hackathon/admin/announcements` | Buat draf dengan teks id/en/zh (pengurus) |
| `PATCH /api/hackathon/admin/announcements/:id` | Ubah teks, sematkan/lepas (pengurus) |
| `POST /api/hackathon/admin/announcements/:id/publish` | Terbitkan (pengurus) |
| `POST /api/hackathon/admin/announcements/:id/archive` | Arsipkan (pengurus) |
| `GET /api/hackathon/admin/announcements/:id/views` | Jumlah tayangan unik dan per hari (pengurus); tanpa daftar nama kecuali diizinkan |

Bila teks satu bahasa belum ada, kembalikan teks `id` (perilaku fallback sama dengan i18n klien).

### 6.4 Anggota, kontak, dan chat tim

| Method + path | Fungsi |
|---|---|
| `GET /api/hackathon/teams/:id/members` | Anggota aktif: `member_id, nama, peran, role, joined_at`, plus `contacts { wa, email, linkedin, github }` bila pemiliknya setuju. Hanya anggota aktif (`403` selain itu). |
| `GET /api/hackathon/teams/:id/messages?after=<id>&limit=50` | Pesan setelah id tertentu (naik), atau `before=<id>` untuk riwayat. Hanya anggota aktif. |
| `POST /api/hackathon/teams/:id/messages` | Kirim `{ body }`; balas pesan tersimpan (`id`, `created_at`). `429` bila lewat batas laju. |
| `DELETE /api/hackathon/teams/:id/messages/:mid` | Hapus lunak (penulis atau owner) |
| `POST /api/hackathon/teams/:id/messages/read` | Tandai terbaca sampai `{ last_read_id }` |
| `GET /api/hackathon/teams/:id/stream` | WebSocket realtime (lihat 6.5) |

### 6.5 Realtime chat dan notifikasi

**Chat realtime.** Usulan: satu **Durable Object** per tim (`TeamRoom`) sebagai titik siar.

1. Klien membuka WebSocket ke `/api/hackathon/teams/:id/stream`. Worker memvalidasi session dan keanggotaan **sebelum** meneruskan koneksi ke Durable Object.
2. Kirim pesan tetap lewat `POST .../messages` (tersimpan di D1 dulu), lalu Worker memberi tahu Durable Object untuk menyiarkan `{ type: "message", message }` ke semua koneksi tim itu.
3. Saat anggota keluar atau tim ditutup, Durable Object memutus koneksi orang itu.
4. Fallback tanpa WebSocket: polling `GET .../messages?after=<id terakhir>` tiap 5 detik saat ruang tim terbuka, tiap 30 detik saat tidak.

Bila Durable Object tidak tersedia di akun aiclub.id, cukup polling dulu; kontrak API di 6.4 tidak berubah.

**Notifikasi** (kanal: email via aiclub.id atau lainnya, pertanyaan 8.12):

| Kejadian | Penerima | Isi |
|---|---|---|
| Lamaran baru | Owner | Nama, peran, batas keputusan (`expires_at`) |
| 4 jam sebelum batas | Owner | Pengingat lamaran yang belum diputuskan |
| Disetujui / ditolak | Pelamar | Hasil; bila disetujui, ajakan membuka ruang tim |
| Kedaluwarsa | Pelamar dan owner | Lamaran ditolak otomatis, pelamar bisa melamar ke tim lain |
| Pesan chat baru (opsional, digabung) | Anggota yang tidak sedang online | Ringkasan jumlah pesan, maksimal satu per jam |
| Pengumuman disematkan baru | Semua peserta (opsional) | Judul dan ringkasan |

## 7. Perubahan di repo ini

1. `src/lib/api.js` baru: wrapper `fetch` dengan `credentials: "include"`, penanganan `401` (arahkan ke login aiclub.id), dan error terstruktur.
2. `Login.jsx`: ganti form email/sandi dengan tombol **Masuk dengan aiclub.id** (redirect/OAuth sesuai opsi login di bagian 4). Hapus `DUMMY_USERS`.
3. `App.jsx`: ganti `initState()` dan `localStorage` `hk_state` dengan `GET /me` saat start. `PERSIST` hanya menyisakan `lang` dan `screen`. Tambah state `loading`/`error`.
4. Setiap `actions.*` (`toggleApply`, `createTeam`, `decideApplicant`, `closeTeam`, `leaveTeam`, `openAnn`, `sendChat`, dst) memanggil API lalu memperbarui state dari respons. Pakai pembaruan optimistis hanya bila ada rollback (pesan chat boleh tampil "mengirim…" lalu diganti respons server).
5. `data.js`: hapus `TIM`, `BUILDER`, `ANGGOTA`, `PENGUMUMAN`, `SEED_APPLICANTS`, `CONFIG.demoOwner`, `CONFIG.approveHours`. Pertahankan `URUT`, `WEIGHTS`, `LATAR`, URL Tencent/WA utama. Teks `announcements` di `src/i18n/*.js` dihapus karena datang dari API.
6. `src/lib/share.js`: `encodeTeam/decodeTeam` diganti `share_code` dari server; `readInviteFromUrl` cukup membaca kode lalu memanggil `GET /share/:code`.
7. `src/lib/rules.js`: `expirePending` hanya untuk tampilan hitung mundur memakai `expires_at` dan `server_time`; keputusan status dari server.
8. `src/lib/team.js` dan `TeamRoom.jsx`: anggota dari `GET .../members`, pesan dari `GET/POST .../messages` + WebSocket. Hapus `chats` dari `PERSIST`.
9. `Announcements.jsx`: daftar dan detail dari API; panggil `POST .../view` saat detail dibuka; `annViewed` dihapus dari `PERSIST`.
10. `Market.jsx`, `TeamDetail.jsx`, `Choose.jsx`, `MyTeam.jsx`, `Dash.jsx`: baca dari API, tambah state memuat, kosong, dan gagal.
11. Layar persetujuan berbagi kontak sebelum ruang tim pertama kali dibuka (bila jawaban 8.5 mengharuskan).
12. Variabel lingkungan: `VITE_API_BASE`, `VITE_LOGIN_URL`. Tidak ada rahasia di bundel klien.
13. Hapus `docs/` dari alur GitHub Pages saat pindah ke subdomain aiclub.id; GitHub Pages tinggal untuk demo dummy atau dimatikan.
14. Perbarui `README.md` (bagian "Masih dummy") dan dokumen di `docs/`.

## 8. Pertanyaan terbuka untuk pengelola aiclub.id

Ini yang menentukan opsi mana yang jalan. Tanpa jawabannya implementasi akan menebak.

1. **Login:** apakah aiclub.id punya OAuth/OIDC untuk aplikasi lain, atau hanya cookie session? Bisakah portal ini di-host di `*.aiclub.id`?
2. **Session:** format dan cara memvalidasi session (JWT, token opak di D1/KV)? Bisa divalidasi dari Worker lain?
3. **Akses DB:** apakah Worker hackathon boleh binding ke D1 yang sama, atau harus lewat API? Siapa yang menjalankan migrasi tabel `hackathon_*`?
4. **Profil member:** endpoint baca profil milik sendiri, apakah boleh ubah kota/WA/LinkedIn dari luar, dan apakah profil punya kolom GitHub?
5. **Persetujuan data:** apakah member sudah setuju datanya (WA, email, kota) dibagikan ke sesama anggota tim? Kalau belum, perlu layar persetujuan sebelum kontak tampil.
6. **Identitas Tencent:** apakah perlu mencocokkan peserta aiclub.id dengan pendaftar di portal Tencent (email atau `memberId`)? Link `aiclub.id/l/...` hanya short link, belum ada data balik.
7. **Peran:** siapa yang boleh melihat seluruh peserta/tim hackathon (pengurus pusat saja, atau pengurus kota)? Perlu halaman admin atau cukup ekspor CSV?
8. **Hosting:** tetap statis + Worker, atau digabung ke aplikasi aiclub.id yang sudah ada? Apakah Durable Objects dan Cron Triggers tersedia di akun Cloudflare aiclub.id?
9. **Pengumuman:** siapa yang boleh menulis dan menerbitkan (panitia pusat saja)? Apakah pengumuman hackathon perlu disatukan dengan sistem pengumuman/blog aiclub.id yang sudah ada?
10. **Retensi chat:** berapa lama pesan disimpan setelah event, dan siapa yang boleh membaca pesan bila ada laporan penyalahgunaan?
11. **Tayangan anonim:** apakah pembaca tanpa login ikut dihitung? Bila ya, pakai id anonim di cookie (bukan IP).
12. **Notifikasi:** kanal apa yang dipakai (email aiclub.id, WhatsApp, atau notifikasi di aplikasi saja)?
13. **Batas 24 jam:** apakah berlaku juga di akhir pendaftaran (mis. lamaran yang masuk 31 Okt malam tetap kedaluwarsa setelah 1 Nov 23.59)? Usulan: `expires_at = min(created_at + 24 jam, batas pendaftaran)`.

## 9. Tahapan

| Fase | Isi | Selesai bila |
|---|---|---|
| 0. Keputusan | Jawab pertanyaan bagian 8, pilih opsi login | Opsi login dan akses DB disepakati |
| 1. Auth | Login aiclub.id, `GET /me`, logout; layar Data diri terisi dari profil | Login dummy hilang; refresh halaman tetap login |
| 2. Data peserta | Tabel `hackathon_participant`, simpan jawaban, jalur, flag langkah, GitHub, persetujuan kontak | Pindah browser/perangkat, progres tetap ada |
| 3. Tim dan lamaran | Tabel tim/anggota/lamaran/undangan, `share_code`, aturan 5.3 nomor 1 sampai 13, cron kedaluwarsa | Dua akun nyata bisa buat tim, bagikan link, lamar, setujui; lamaran tanpa keputusan berubah `expired` setelah 24 jam; aturan lolos tes |
| 3a. Ruang tim | Anggota + kontak (aturan 14 sampai 16), chat (17 sampai 21) dengan polling, lalu WebSocket | Anggota melihat kontak sesama anggota; pelamar `pending`/`rejected` mendapat `403`; pesan sampai ke anggota lain tanpa refresh |
| 3b. Pengumuman | Tabel pengumuman, endpoint publik dan admin, tayangan unik (aturan 22 sampai 26) | Pengurus bisa menerbitkan; tayangan naik satu kali per member |
| 3c. Notifikasi | Email/kanal terpilih untuk kejadian di 6.5 | Owner menerima pengingat sebelum batas 24 jam |
| 4. Pembersihan | Hapus dummy dan `demoOwner`, perbarui README dan docs, domain produksi | Tidak ada referensi `DUMMY_USERS`/`TIM`/`BUILDER`/`ANGGOTA`/`PENGUMUMAN` |
| 5. Admin (opsional) | Daftar peserta/tim dan ekspor CSV untuk pengurus | Pengurus bisa memantau pendaftar |

## 10. Kriteria selesai

- Tidak ada sistem login terpisah; session = session aiclub.id; logout berlaku di kedua sisi.
- Tidak ada data dummy di bundel produksi; `localStorage` hanya berisi preferensi.
- Aturan satu orang satu tim dan satu lamaran aktif **tidak bisa dilanggar** dengan memanggil API langsung (dites).
- Keputusan owner setelah `expires_at` ditolak dengan `409`; lamaran `pending` yang lewat batas selalu tampil `expired`, walau cron belum jalan.
- Link grup WA tim, daftar anggota, kontak, dan chat tidak muncul di respons API untuk pengguna yang bukan anggota aktif tim itu.
- Link undangan tidak membocorkan data selain ringkasan tim; `share_code` bisa diganti owner.
- Tayangan pengumuman bertambah paling banyak satu per member per pengumuman.
- Pesan chat dirender sebagai teks polos (uji XSS), dibatasi panjang dan laju.
- Endpoint tanpa session mengembalikan `401`; owner lain tidak bisa memutuskan lamaran tim orang lain (`403`).
- Data peserta bisa diekspor oleh pengurus berwenang saja, dan nomor WA tidak bocor ke peserta lain.

## 11. Risiko

- **Tanpa provider login atau akses DB dari aiclub.id, integrasi tertahan** (pertanyaan 8.1 sampai 8.3). Ini risiko terbesar.
- Cookie lintas domain gagal bila portal tetap di `github.io`.
- Race condition lamaran ganda atau keputusan setelah batas bila hanya dicek di klien; harus constraint DB, update bersyarat, dan transaksi.
- Data pribadi (WA, email, kota) perlu dasar persetujuan dan tidak boleh tampil di daftar publik maupun ke pelamar yang belum disetujui.
- Chat bisa dipakai untuk spam atau pelecehan: perlu batas laju, hapus pesan oleh owner, dan jalur laporan ke panitia.
- Hitungan tayangan bisa dimanipulasi bila dihitung per buka halaman; hitung unik per member.
- Cron kedaluwarsa bisa terlambat atau gagal; cek saat baca menutup celah ini.
- Batas waktu: pendaftaran ditutup 1 Nov, jadi fase 1 sampai 3a perlu selesai sebelum itu; pengumuman (fase 3b) bisa menyusul karena tetap dibutuhkan sampai Demo Day 27 Nov.
