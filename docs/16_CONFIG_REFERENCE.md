# Referensi Konfigurasi

> Status: Draft
> Terakhir diperbarui: 2026-10-21
> Pemilik: Tim AIClub Hackathon

Dokumen ini merinci seluruh konfigurasi, konstanta, kunci penyimpanan, dan variabel lingkungan portal pendaftaran AI Agent Hackathon. Nilai pada bagian As-built dibaca dari kode (`src/data.js`, `src/App.jsx`, `src/i18n/index.js`, `vite.config.js`, `package.json`, `index.html`). Bagian Rencana bersumber dari [../brief.md](../brief.md).

Dokumen terkait: [04_TRD.md](04_TRD.md), [05_ARCHITECTURE.md](05_ARCHITECTURE.md), [20_DATABASE.md](20_DATABASE.md), [../README.md](../README.md).

Konvensi: `_TBD_` berarti belum diputuskan atau belum diketahui; rujukan **Q8.n** menunjuk ke pertanyaan terbuka di [../brief.md](../brief.md) bagian 8.

## 1. Ikhtisar lokasi konfigurasi

| Lokasi | Isi | Status |
|---|---|---|
| `src/data.js` | `CONFIG`, konstanta skor, URL, regex, data dummy, `SCREENS`, `STEP_OF`, `ICONS` | As-built |
| `src/App.jsx` | `PERSIST`, `EMAIL_RE`, `fresh()`, kunci `hk_state`, batas log | As-built |
| `src/i18n/index.js` | `LANGS`, urutan deteksi bahasa, kunci `hk_lang` | As-built |
| `vite.config.js` | `base`, `outDir`, `emptyOutDir`, plugin `clean-docs-assets` | As-built |
| `package.json` | skrip, dependensi | As-built |
| `index.html` | meta, font, ikon | As-built |
| Variabel lingkungan `VITE_*` | `VITE_API_BASE`, `VITE_LOGIN_URL` | Rencana |

## 2. `CONFIG` di `src/data.js`

```js
export const CONFIG = { modeDraft: false, quizLen: 6, demoOwner: true, approveHours: 24 };
```

| Kunci | Tipe | Nilai sekarang | Dipakai di | Efek |
|---|---|---|---|---|
| `modeDraft` | boolean | `false` | `Result.jsx` | `canTeam = (jalur aktif === "CEO") \|\| !CONFIG.modeDraft`. Bila `true`, hanya jalur CEO yang diberi opsi membuat tim (teks `result.openTeam` vs `result.openTeamLocked`). Bila `false`, semua jalur boleh membuat tim. Tidak memengaruhi `canCreate()` di `rules.js`. |
| `quizLen` | number | `6` | `lib/scoring.js` (`total()`) | Jumlah pertanyaan kuis = `min(quizLen, WEIGHTS.length)`. Saat ini `WEIGHTS` berisi 6 baris sehingga nilai di atas 6 tidak menambah pertanyaan. Mengubahnya memengaruhi `quizDone`, `reachable`, dan teks langkah `{n}`. |
| `demoOwner` | boolean | `true` | `Dash.jsx` | Menampilkan tombol simulasi Setujui/Tolak untuk lamaran `pending` pada tim contoh serta catatan `dash.demoNote`. **Wajib dimatikan/dihapus saat backend tersambung** (README; brief bagian 7 butir 5). |
| `approveHours` | number | `24` | `lib/rules.js` (`DEADLINE_MS`, `deadlineOf`, `expirePending`, `leftHM`), `App.jsx` | Batas waktu owner memutuskan lamaran, dihitung dari `at` lamaran. Lamaran `pending` yang melewati batas diubah menjadi `{status: "rejected", reason: "expired", decidedAt}` saat aplikasi dibuka dan setiap 30 detik (interval tetap di `App.jsx`). Teks i18n `deadline.*` dan pengumuman menyebut "24 jam" secara harfiah, sehingga mengubah nilai ini juga menuntut perubahan teks di ketiga kamus. Pada integrasi, batas yang berlaku adalah nilai di server ([../brief.md](../brief.md)); FR-063, FR-064. |

Catatan:

- `Result.jsx` juga membaca `CONFIG.showScore` (`CONFIG.showScore !== false` menampilkan kartu skor). Kunci ini **tidak didefinisikan** di `CONFIG`, sehingga nilainya `undefined` dan kartu skor selalu tampil. Menyetel `showScore: false` akan menyembunyikan kartu skor. Kunci ini belum terdokumentasi di tempat lain; pemakaiannya bersifat opsional.
- `CONFIG` dibaca saat modul dimuat dan dibundel; perubahan nilai membutuhkan build ulang (`npm run build`).

## 3. Konstanta skor dan peran

### 3.1 `URUT`

```js
export const URUT = ["CEO", "CTO", "AI", "PM", "DSG", "GRW", "DOM", "DAT"];
```

Daftar 8 kode peran/jalur. Dipakai untuk:

- mengurutkan skor (urutan ini menjadi pemutus seri yang stabil pada `urutSkor`);
- inisialisasi skor 0 di `skor()`;
- pilihan peran di layar `hasil` (koreksi `override`) dan slot yang dicari saat membuat tim (`Create.jsx`).

Kunci terjemahan peran ada di `src/i18n/*.js` pada `roles.<KODE>` (properti `nama`, `ringkas`, `desc`). Pada rencana, `hackathon_participant.jalur` dan `jalur_override` berisi kode ini ([20_DATABASE.md](20_DATABASE.md)). Label kepanjangan setiap kode: lihat `roles.*` di kamus (tidak diulang di sini agar tidak ganda).

### 3.2 `WEIGHTS`

Matriks bobot skor: indeks pertama = nomor pertanyaan (0 sampai 5), indeks kedua = pilihan jawaban (0 sampai 4), nilai = objek `{KODE: bobot}`.

| Pertanyaan | Jumlah opsi | Bobot per opsi (urutan A, B, C, ...) |
|---|---|---|
| 1 | 5 | `{DOM:3, PM:1}`, `{PM:3, AI:1}`, `{CTO:3, AI:1}`, `{CEO:3}`, `{DAT:3}` |
| 2 | 4 | `{DSG:3}`, `{CTO:2, AI:1}`, `{PM:2, DSG:2}`, `{CEO:2, GRW:2}` |
| 3 | 4 | `{AI:3, CTO:1}`, `{AI:2, DAT:2}`, `{PM:2, CEO:1}`, `{DOM:3}` |
| 4 | 4 | `{CTO:2, CEO:1}`, `{CEO:3}`, `{PM:3}`, `{GRW:2, DSG:1}` |
| 5 | 4 | `{CEO:3, GRW:1}`, `{CTO:2, AI:1}`, `{DAT:2, DOM:2}`, `{DSG:2, PM:1, GRW:1}` |
| 6 | 5 | `{CEO:3}`, `{CTO:2, AI:1}`, `{DOM:3}`, `{GRW:3}`, `{DAT:2, AI:1}` |

Aturan penggunaan:

- Jumlah opsi per pertanyaan di kamus (`questions[i].opsi`) harus sama dengan panjang baris `WEIGHTS[i]`; pintasan keyboard hanya menerima indeks `< opsi.length`.
- Jawaban disimpan sebagai array indeks opsi (`st.jawab`, indeks null/undefined = belum dijawab).
- Menambah pertanyaan: tambah baris `WEIGHTS`, tambah entri `questions` di ketiga kamus, naikkan `CONFIG.quizLen`.
- Server (rencana) harus memakai tabel bobot yang identik; perbedaan menyebabkan `jalur` resmi berbeda dengan tampilan klien (TR-027 di [04_TRD.md](04_TRD.md)).

### 3.3 `LATAR`

```js
export const LATAR = ["kerja-tech", "kerja-nontech", "mahasiswa", "freelance", "founder", "cari-kerja"];
```

Pilihan latar belakang peserta pada layar `identitas` (default `st.latar = "kerja-tech"`). Label tampil dari `identity.latar.<kode>` di kamus; nilai tersimpan adalah kode. Pada rencana disimpan di `hackathon_participant.latar`.

## 4. URL dan regex

| Konstanta | Nilai | Dipakai di | Catatan |
|---|---|---|---|
| `WA_GROUP_URL` | `https://chat.whatsapp.com/GNcd3TL3bZ71LoxlL8RzH9` | `Group.jsx`, `Dash.jsx` | Grup WhatsApp utama (wajib dimasuki). Tautan publik. |
| `TENCENT_REGISTER_URL` | `https://aiclub.id/l/O3Sa9yF` | `Tencent.jsx` | Pendaftaran tim ke portal Tencent (langkah 2). Short link aiclub.id. |
| `TENCENT_SUBMIT_URL` | `https://aiclub.id/l/9k54mLk` | `Submit.jsx` | Pengiriman project ke Tencent (langkah 3). Aktif setelah `projectReady`. |
| `WA_LINK_RE` | `/^https:\/\/chat\.whatsapp\.com\/[A-Za-z0-9_-]+/` | `Create.jsx`, `MyTeam.jsx` | Validasi tautan grup WhatsApp tim. Hanya jangkar awal (tidak ada jangkar akhir `$`), sehingga karakter tambahan setelah kode undangan tetap lolos (mis. parameter query). Server harus memvalidasi dengan regex yang sama atau lebih ketat (brief bagian 5.3 butir 6). |

Konstanta lain di luar `data.js`:

| Konstanta | Lokasi | Nilai | Catatan |
|---|---|---|---|
| `EMAIL_RE` | `src/App.jsx` dan `src/components/Login.jsx` (salinan terpisah) | `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` | Validasi email di layar `login` dan `identitas` (email opsional di `identitas`). Dua salinan harus dijaga identik. |
| `waValid(v)` | `src/lib/scoring.js` | 9 sampai 15 digit setelah karakter non-digit dibuang | Validasi nomor WhatsApp di data diri. |
| Batas log | `src/App.jsx` (`withLog`) | 60 entri terakhir | `slice(-60)`. |
| Waktu konfirmasi dua klik | `src/components/Widgets.jsx` (`ConfirmButton`) | 4000 ms | Tombol kembali ke keadaan semula bila tidak diklik lagi. |
| Waktu toast | `src/App.jsx` (`toast`) | 2200 ms | |
| Interval cek kedaluwarsa lamaran | `src/App.jsx` (efek `setInterval`) | 30000 ms | Menjalankan `expirePending` pada `apps` dan `applicants`. |
| Panjang maksimum pesan chat | `src/components/TeamRoom.jsx` | 1000 karakter | `maxLength` pada kolom dan `slice(0, 1000)` saat kirim. |
| Batas riwayat chat per tim | `src/App.jsx` (`sendChat`) | 200 pesan terakhir | `slice(-200)`. |
| Aset brand | `src/components/Brand.jsx` | `asset(name)` = `import.meta.env.BASE_URL + "brand/" + name` | Berkas di `public/brand/`. |

## 5. Data dummy di `src/data.js`

Akan dihapus saat integrasi (kecuali yang disebut dipertahankan; [../brief.md](../brief.md) bagian 7 butir 5).

| Konstanta | Isi | Bentuk | Nasib pada integrasi |
|---|---|---|---|
| `DUMMY_USERS` | 3 akun demo: `rani@aiclub.id` (profil kosong), `bagas@aiclub.id` (kota Malang), `salsa@aiclub.id` (kota Bandung + LinkedIn) | `{email, nama, kota, wa, linkedin}` | Dihapus |
| `TIM` | 6 tim contoh: REKON (Jakarta), WARUNG TAP (Bandung), SIAP RISIKO (Surabaya), TANYA OPS (Yogyakarta), ANTRE HABIS (Makassar), BACA KONTRAK (Medan) | `{nama, kota, anggota, ceo, butuh[], wa, hari, grupN}` | Dihapus; diganti `GET /teams` |
| `BUILDER` | 6 builder contoh: Dimas, Lala, Hendra, Vina, Arif, Tari, masing-masing dengan kontak contoh | `{nama, kota, peran, wa, email, linkedin, github}` | Dihapus; diganti `GET /builders` (kontak hanya untuk pihak berhak) |
| `ANGGOTA` | Anggota contoh per tim `TIM` (indeks berupa nama tim), anggota pertama adalah owner | `{[namaTim]: [{nama, peran, owner, wa, email, linkedin, github}]}` | Dihapus; diganti data anggota dari server, hanya untuk owner dan anggota disetujui ([../brief.md](../brief.md)) |
| `PENGUMUMAN` | 4 pengumuman: `p-jadwal` (disematkan, 87 tayangan contoh), `p-batas-1-nov` (142), `p-aturan-tim` (196), `p-dibuka` (318) | `{id, at (ISO 8601, +07:00), pin, views}` | Diganti data pengumuman dan tayangan dari server ([../brief.md](../brief.md)) |
| `SEED_APPLICANTS` | `[0, 4]` (indeks ke `BUILDER`) | array indeks | Dihapus; pelamar sungguhan dari DB |
| `SCREENS` | 14 nama layar (termasuk `info` untuk pengumuman) | array string | Dipertahankan |
| `STEP_OF` | peta layar ke langkah (-1, 0, 1, 2); `info` = -1 | objek | Dipertahankan |
| `ICONS` | path SVG piksel (`home, user, quiz, path, team, bell`) | objek string | Dipertahankan |

Catatan `TIM`: field `wa` adalah tautan placeholder (mis. `https://chat.whatsapp.com/DummyRekon01`). Field `hari` dan `grupN` adalah data tampilan dummy. Teks deskripsi tim contoh berada di `teams[]` pada kamus i18n (berindeks sama dengan `TIM`), dan deskripsi builder contoh di `builders[]`.

Catatan kontak contoh: nomor WA berpola `0812000000NN`, email `<nama>@contoh.id`, LinkedIn `https://linkedin.com/in/contoh-<nama>`, GitHub `https://github.com/contoh-<nama>`. Data ini bukan milik orang nyata dan hanya ditampilkan di ruang tim (FR-065).

Catatan `PENGUMUMAN`: judul, ringkasan, dan isi per bahasa berada di kunci i18n `announcements[]` dengan urutan yang sama dengan `PENGUMUMAN`. Menambah pengumuman berarti menambah entri di `PENGUMUMAN` dan di `announcements` ketiga kamus pada posisi yang sama. Urutan tampil dihitung saat render (disematkan dulu, lalu `at` terbaru), bukan dari urutan array.

## 6. `vite.config.js`

```js
export default defineConfig({
  base: "./",
  plugins: [react(), cleanAssets()],
  build: { outDir: "docs", emptyOutDir: false }
});
```

| Opsi | Nilai | Alasan |
|---|---|---|
| `base` | `"./"` | Hasil build memakai jalur relatif sehingga berjalan di sub-path GitHub Pages (`.../aiclub-hackathon/`). `import.meta.env.BASE_URL` menjadi `./`. |
| `plugins[0]` | `@vitejs/plugin-react` | Transformasi JSX. |
| `plugins[1]` | `clean-docs-assets` (lokal) | `buildStart`: `rmSync("docs/assets", {recursive, force})`. Hanya `docs/assets` yang dibersihkan. |
| `build.outDir` | `"docs"` | GitHub Pages memakai folder `/docs`. |
| `build.emptyOutDir` | `false` | `docs/` juga berisi dokumentasi `.md`; tidak boleh dikosongkan. |

Skrip di `package.json`: `npm run dev` (`vite`), `npm run build` (`vite build`, menulis ke `docs/`), `npm run preview` (`vite preview`). Versi: React `^18.3.1`, react-dom `^18.3.1`, Vite `^5.4.11`, `@vitejs/plugin-react` `^4.3.4`; `"type": "module"`, `"private": true`.

Hal yang perlu diperhatikan saat pindah hosting (rencana): `base: "./"` tetap valid di sub-path maupun akar domain. Penyesuaian yang mungkin diperlukan pada Cloudflare (keluaran build, fungsi `/api`) `_TBD_` (Q8.8).

`index.html`: `lang="id"` (diganti dinamis oleh `App`), `theme-color #05070E`, ikon `/brand/favicon.png` dan `/brand/apple-touch-icon.png`, font Google (Press Start 2P, Space Grotesk, VT323, Noto Sans SC).

## 7. Penyimpanan klien (localStorage)

### 7.1 Kunci

| Kunci | Ditulis oleh | Dibaca oleh | Isi | Nilai tidak sah |
|---|---|---|---|---|
| `hk_state` | efek di `App` setiap `st` berubah | `initState()` saat start | JSON objek berisi kunci `PERSIST` | JSON rusak atau bukan objek diabaikan (try/catch), state `fresh()` dipakai |
| `hk_lang` | `setLang(k)` | `detectLang()` | salah satu `id`, `en`, `zh` | Nilai di luar `I18N` diabaikan |

Semua akses dibungkus `try/catch` (TR-011). Peserta yang membuka portal di browser lain atau perangkat lain tidak membawa data (sumber kebenaran tunggal belum ada).

### 7.2 Daftar `PERSIST` (31 kunci)

```js
const PERSIST = ["user", "screen", "nama", "kota", "email", "wa", "linkedin", "github", "annViewed", "annOpen", "prevScreen", "chats", "latar", "idx", "jawab", "override",
  "clickedMain", "joinedMain", "mode", "viewTeam", "tencentClicked", "projectReady", "submitClicked", "tab", "apps", "undang", "myTeam", "applicants", "log", "sharedTeams", "invite"];
```

| Kunci | Tipe | Nilai awal (`fresh()`) | Arti |
|---|---|---|---|
| `user` | `{email, nama}` atau `null` | `null` | Akun yang sedang login (dummy) |
| `screen` | string | `"intro"` | Layar aktif; divalidasi ulang saat rehidrasi |
| `nama` | string | `""` | Nama peserta |
| `kota` | string | `""` | Kota (teks bebas pada as-built) |
| `email` | string | `""` | Email (opsional) |
| `wa` | string | `""` | Nomor WhatsApp (wajib, 9 sampai 15 digit) |
| `linkedin` | string | `""` | Tautan LinkedIn |
| `github` | string | `""` | Tautan GitHub (opsional); ikut di pesan perkenalan dan kontak ruang tim (FR-067) |
| `annViewed` | array string | `[]` | Id pengumuman yang sudah dibuka; dasar penanda BARU/SUDAH DIBACA, badge belum dibaca, dan tambahan 1 tayangan (FR-061). Ikut terhapus saat logout (`fresh()`). |
| `annOpen` | string atau `null` | `null` | Id pengumuman yang sedang dibuka di layar `info`; `null` = daftar |
| `prevScreen` | string atau `null` | `null` | Layar asal sebelum membuka layar `info`; tujuan tombol Kembali dari daftar pengumuman |
| `chats` | objek | `{}` | Chat tim per nama tim: `{[namaTim]: [{me, who, text, at}]}`, maksimal 200 pesan per tim (FR-066) |
| `latar` | string | `"kerja-tech"` | Salah satu `LATAR` |
| `idx` | number | `0` | Indeks pertanyaan kuis saat ini |
| `jawab` | array | `[]` | Indeks opsi per pertanyaan |
| `override` | string atau `null` | `null` | Jalur hasil koreksi peserta |
| `clickedMain` | boolean | `false` | Sudah mengeklik tautan grup utama |
| `joinedMain` | boolean | `false` | Sudah mengonfirmasi bergabung grup utama |
| `mode` | `"join"`, `"create"`, atau `null` | `null` | Pilihan jalan tim terakhir |
| `viewTeam` | string atau `null` | `null` | Nama tim yang sedang dilihat detailnya |
| `tencentClicked` | boolean | `false` | Sudah mengeklik tautan daftar Tencent |
| `projectReady` | boolean | `false` | Centang project selesai |
| `submitClicked` | boolean | `false` | Sudah mengeklik tautan submit |
| `tab` | string | `"tim"` | Tab (warisan; tersimpan, tidak dipakai di komponen saat ini) |
| `apps` | array | `[]` | Lamaran `{team, status, at, decidedAt?, reason?}`; `reason: "expired"` menandai penolakan otomatis (FR-063) |
| `undang` | array | `[]` | Nama builder yang diundang |
| `myTeam` | objek atau `null` | `null` | Tim milik peserta sebagai owner |
| `applicants` | array | `[]` | Pelamar ke tim sendiri `{b, status, at, decidedAt?, reason?}`; `at` diisi saat aplikasi dibuka bila belum ada |
| `log` | array | `[]` | Log aktivitas, maksimal 60 |
| `sharedTeams` | array | `[]` | Tim yang diterima lewat link undangan `?tim=` (FR-059) |
| `invite` | objek atau `null` | `null` | Undangan tim yang sedang menunggu syarat pendaftaran terpenuhi (FR-059) |

Kunci state di luar `PERSIST`: `lang` (disimpan terpisah sebagai `hk_lang`). Nilai awal `lang` = `detectLang()`.

Rencana: `PERSIST` menyusut menjadi `lang` dan `screen` saja, dan `hk_state` tidak lagi menyimpan data peserta ([../brief.md](../brief.md) bagian 7 butir 3; TR-014).

### 7.3 Urutan deteksi bahasa (`detectLang`)

1. Parameter URL `?lang=id|en|zh`.
2. `localStorage hk_lang`.
3. `navigator.languages` (atau `navigator.language`): awalan `id`, `ms`, `jv`, `su` menjadi `id`; `zh` menjadi `zh`; `en` menjadi `en`.
4. Bawaan: `en`.

## 8. Variabel lingkungan (Rencana)

Belum ada variabel lingkungan di repositori (tidak ada berkas `.env`, tidak ada pemakaian `import.meta.env` selain `BASE_URL`). Brief bagian 7 butir 7 mengusulkan dua variabel. Prefiks `VITE_` membuat nilai tertanam di bundel klien, sehingga **tidak boleh berisi rahasia**.

| Variabel | Wajib | Contoh | Fungsi | Status |
|---|---|---|---|---|
| `VITE_API_BASE` | ya | `/api/hackathon` (relatif) atau URL penuh `_TBD_` | Basis URL BFF untuk `src/lib/api.js` | Rencana; nilai produksi `_TBD_` (Q8.8) |
| `VITE_LOGIN_URL` | ya | URL halaman login aiclub.id `_TBD_` | Tujuan pengalihan saat API mengembalikan `401` dan tombol "Masuk dengan aiclub.id" | Rencana; bentuk URL dan parameter balik `_TBD_` (Q8.1) |

Aturan:

- Build produksi harus gagal bila variabel wajib kosong (TR-074).
- Rahasia server (mis. binding D1, kunci penandatangan) hanya hidup di konfigurasi Worker/Cloudflare dan tidak pernah memakai prefiks `VITE_`. Daftar rahasia server: `_TBD_` (bergantung Q8.2 dan Q8.3).
- Nilai per lingkungan (dev, staging, produksi): `_TBD_`.

Variabel server (di luar klien) yang kemungkinan dibutuhkan, seluruhnya `_TBD_` karena belum ada jawaban atas Q8.1 sampai Q8.3: kunci/endpoint validasi session, binding D1, daftar asal CORS yang diizinkan, daftar `memberId` atau peran pengurus (Q8.7).

## 9. Cookie session (Rencana, `_TBD_`)

Bila opsi A (cookie session bersama) dipilih:

| Atribut | Nilai | Sumber |
|---|---|---|
| `Domain` | `.aiclub.id` | brief bagian 4 prinsip 1 |
| `HttpOnly` | ya | brief bagian 4 prinsip 1 |
| `Secure` | ya | brief bagian 4 prinsip 1 |
| `SameSite` | `Lax` | brief bagian 4 prinsip 1 |
| Nama cookie, masa berlaku, format nilai | `_TBD_` | Q8.2 |

## 10. Daftar periksa perubahan konfigurasi

- Mengubah `WEIGHTS`, `URUT`, atau `quizLen`: perbarui kamus ketiga bahasa, uji `quizDone` dan layar `hasil`, dan sinkronkan server (rencana).
- Mengubah `WA_GROUP_URL` atau `TENCENT_*_URL`: build ulang dan commit `docs/`.
- Menambah kunci `PERSIST`: tambahkan juga ke `fresh()` agar nilai awal terdefinisi; perbarui tabel di bagian 7.2.
- Mematikan `demoOwner`: tombol simulasi hilang, tetapi tanpa backend peserta tidak dapat memperoleh persetujuan lamaran; hanya lakukan saat backend aktif.
- Mengganti URL deploy: periksa `base` dan jalur aset di `index.html` (`/brand/...` ditransformasi oleh Vite terhadap `base`).
