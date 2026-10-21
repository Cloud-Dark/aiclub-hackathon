# Standard Pengujian

> Status: Draft
> Terakhir diperbarui: 2026-10-21
> Pemilik: Tim AIClub Hackathon

## 1. Tujuan dan Lingkup

Standard ini menetapkan strategi uji, cakupan minimum aturan bisnis, dan penamaan tes. Aturan bisnis yang diuji bersumber dari [03_ARCHITECTURE_STANDARD.md](03_ARCHITECTURE_STANDARD.md) bagian 4.1 dan [../../brief.md](../../brief.md) bagian 5.3 dan 10.

## 2. Kondisi Saat Ini

| Hal | Fakta |
|---|---|
| Kerangka tes | Belum terpasang. `package.json` hanya memiliki skrip `dev`, `build`, `preview`. |
| Tes otomatis | Belum ada. |
| CI | Belum ada: _TBD_ |
| Bukti verifikasi | `npm run build` sukses dan uji manual di peramban pada tiga bahasa. |
| Kandidat alat | Vitest (selaras dengan Vite 5) untuk unit dan komponen, Testing Library untuk komponen React, Playwright untuk E2E: _TBD_ (belum diputuskan; pemilihan WAJIB dicatat sebagai keputusan). |

Selama kerangka belum terpasang, setiap PR WAJIB menyertakan hasil uji manual pada deskripsi PR menurut daftar di bagian 8. Mulai fase 1 integrasi, tes otomatis untuk aturan bisnis WAJIB ada sebelum merge.

## 3. Piramida Uji

```
          /  E2E  \        sedikit: alur utama lewat peramban + API uji
         /----------\
        / Integrasi  \     sedang: endpoint API + DB uji; komponen + state App
       /--------------\
      /     Unit       \   banyak: fungsi murni di src/lib dan aturan server
     /------------------\
```

| Tingkat | Sasaran | Proporsi yang disarankan | Kecepatan |
|---|---|---|---|
| Unit | `src/lib/rules.js`, `scoring.js`, `time.js`, `i18n/index.js`; fungsi aturan di server | Sekitar 70 persen | Milidetik, tanpa jaringan |
| Integrasi | Endpoint `/api/hackathon/*` dengan DB uji; komponen layar dengan `st` dan `actions` palsu | Sekitar 20 persen | Detik |
| E2E | Alur peserta dari login sampai submit pada peramban nyata | Sekitar 10 persen | Menit |

Aturan:

1. Aturan bisnis WAJIB diuji pada tingkat serendah mungkin (unit lebih dulu), lalu sekali pada tingkat integrasi terhadap server nyata.
2. Tes WAJIB deterministik: tanpa ketergantungan pada waktu sistem, acak, atau jaringan luar. Waktu (`Date.now`) dan acak WAJIB di-stub.
3. Tes WAJIB independen: urutan eksekusi tidak boleh memengaruhi hasil; `localStorage` WAJIB dibersihkan antar tes.
4. Tes yang kadang gagal (flaky) WAJIB diperbaiki atau dikarantina dengan isu yang tercatat, DILARANG dibiarkan diulang sampai lolos.
5. Tes DILARANG memakai data pribadi nyata ([04_SECURITY_STANDARD.md](04_SECURITY_STANDARD.md)) dan DILARANG memanggil layanan produksi.

## 4. Cakupan Minimum Aturan Bisnis

Setiap aturan WAJIB punya sedikitnya satu tes jalur sukses dan satu tes jalur gagal. Setelah integrasi, aturan R1 sampai R9 WAJIB diuji pada level server dengan memanggil API langsung (brief bagian 10: aturan "tidak bisa dilanggar dengan memanggil API langsung").

| ID | Aturan | Tes minimum |
|---|---|---|
| R1 | Satu orang: anggota satu tim ATAU owner satu tim | (a) pemilik tim melamar: ditolak; (b) pelamar `pending` membuat tim: ditolak; (c) peserta bebas membuat tim: berhasil |
| R2 | Satu lamaran aktif per orang | (a) lamaran kedua saat ada `pending`: ditolak `409`; (b) setelah ditarik, melamar lagi: berhasil; (c) dua permintaan serentak: tepat satu berhasil |
| R3 | `approved` membatalkan `pending` lain | Setelah satu lamaran disetujui, lamaran `pending` lain menjadi `withdrawn` dalam satu transaksi; transaksi gagal membatalkan semuanya |
| R4 | Link WA hanya untuk owner dan `approved` | Respons untuk anonim, pelamar `pending`, `rejected`, orang lain, owner, dan `approved`; daftar tim publik tidak pernah memuat `wa_link` |
| R5 | Pindah pilihan hanya setelah tutup, keluar, atau tarik | Tiap jalur pindah ditolak sebelum prasyarat dan berhasil sesudahnya |
| R6 | Validasi link grup WhatsApp | Daftar masukan sah dan tidak sah (lihat bagian 5.1) |
| R7 | Submit hanya bila project siap | Submit sebelum `project_ready_at` terisi ditolak; sesudahnya berhasil |
| R8 | Jalur resmi dihitung server | Hasil server cocok dengan `skor()`; klien tidak bisa menyuntikkan `jalur` |
| R9 | Hanya owner memutuskan lamaran timnya | Owner tim lain mendapat `403`; tanpa session `401` |
| A1 | Tanpa session `401` pada setiap endpoint | Tes berparameter untuk seluruh daftar endpoint |
| P1 | Data pribadi tidak bocor | Respons daftar dan detail tidak memuat WhatsApp atau email peserta lain |

Fungsi lib klien yang WAJIB diuji unit saat kerangka tersedia:

| Fungsi | Berkas | Kasus wajib |
|---|---|---|
| `activeApp`, `approvedApp`, `pendingApps` | `rules.js` | Larik kosong, hanya `rejected`, campuran `pending` dan `approved` |
| `canApply`, `canCreate` | `rules.js` | Sudah punya `myTeam`; punya lamaran `pending`; punya lamaran `rejected` saja (harus boleh); bersih |
| `skor`, `urutSkor`, `aktif` | `scoring.js` | Jawaban kosong; satu jawaban; semua jawaban; `override` mengalahkan skor; urutan seri mengikuti `URUT` |
| `quizDone`, `total` | `scoring.js` | Kurang satu jawaban; jawaban bernilai `0` dihitung terisi (bukan `null`) |
| `waValid`, `identDone` | `scoring.js` | 8, 9, 15, 16 digit; karakter non-digit diabaikan; nama atau kota hanya spasi |
| `reachable`, `subReachable` | `scoring.js` | Setiap kunci layar pada kombinasi prasyarat |
| `fmtTime` | `time.js` | Tiga lokal; masukan tidak valid mengembalikan string kosong |
| `makeT().t`, `get` | `i18n/index.js` | Sisipan `{var}`; variabel hilang dibiarkan; fallback ke `id` untuk kunci yang tidak ada |

Catatan: `canApply` dan `canCreate` pada `rules.js` saat ini memiliki isi logika yang sama; tes WAJIB mengunci perilaku agar perubahan salah satunya terdeteksi.

## 5. Jenis Tes Khusus

### 5.1 Validasi Input

Tes berparameter untuk `WA_LINK_RE` dan `waValid`:

| Masukan | Hasil yang diharapkan |
|---|---|
| `https://chat.whatsapp.com/AbC_123-x` | sah |
| `http://chat.whatsapp.com/AbC` | tidak sah (bukan https) |
| `https://chat.whatsapp.com/` | tidak sah (tanpa kode) |
| `https://chat.whatsapp.com.evil.com/AbC` | tidak sah |
| `https://chat.whatsapp.com/AbC <skrip>` | tidak sah setelah pola diberi penutup `$` ([04_SECURITY_STANDARD.md](04_SECURITY_STANDARD.md) bagian 5) |

### 5.2 i18n

1. Tes WAJIB memastikan `id.js`, `en.js`, dan `zh.js` memiliki himpunan kunci yang identik (bandingkan jalur kunci secara rekursif, termasuk panjang larik `questions`, `roles`, `teams`, `builders`, `schedule`).
2. Tes WAJIB memastikan setiap placeholder `{nama}` pada teks `id` juga ada pada `en` dan `zh`.
3. Setiap nilai string WAJIB tidak kosong.

### 5.3 Komponen

1. Uji komponen WAJIB melalui perilaku yang terlihat pengguna (teks, peran ARIA, label), bukan struktur internal atau nama kelas CSS.
2. Komponen WAJIB diuji pada keadaan memuat, kosong, gagal, dan sukses setelah data berasal dari API.
3. Tombol terkunci (`aria-disabled="true"`) WAJIB diuji tidak memicu aksi.

### 5.4 E2E

Alur minimum yang WAJIB lolos sebelum rilis (setelah integrasi, pada lingkungan uji):

1. Login, lengkapi data diri, jawab skenario, lihat jalur, gabung grup utama.
2. Buat tim, ubah link WhatsApp, tutup tim.
3. Dua akun: A membuat tim, B melamar, A menyetujui, B melihat link grup.
4. Peserta B menarik lamaran lalu melamar tim lain.
5. Centang project selesai, tombol submit aktif.
6. Ganti bahasa (id, en, zh) dan muat ulang: bahasa tetap.
7. Muat ulang halaman: progres tetap ada (data dari server).

## 6. Penamaan Tes

| Objek | Konvensi | Contoh benar |
|---|---|---|
| Berkas unit | `<nama>.test.js` di samping sumber atau di `tests/unit/` (lokasi final: _TBD_) | `rules.test.js` |
| Berkas komponen | `<Nama>.test.jsx` | `Market.test.jsx` |
| Berkas E2E | `<alur>.e2e.js` di `tests/e2e/` | `lamar-tim.e2e.js` |
| Blok `describe` | Nama unit atau endpoint | `describe("canApply", ...)`, `describe("POST /teams/:id/apply", ...)` |
| Nama kasus (`it`/`test`) | Kalimat Indonesia: "<subjek> <kondisi> -> <hasil>" | `"peserta yang sudah owner melamar -> ditolak"` |
| ID aturan | Awalan `[R2]` untuk menelusuri ke aturan bisnis | `"[R2] lamaran kedua saat ada pending -> 409"` |

Contoh benar:

```js
describe("canApply", () => {
  it("[R1] owner tim tidak boleh melamar -> false", () => {
    expect(canApply({ myTeam: { nama: "X" }, apps: [] })).toBe(false);
  });
  it("[R2] ada lamaran pending -> false", () => {
    expect(canApply({ myTeam: null, apps: [{ team: "A", status: "pending" }] })).toBe(false);
  });
});
```

Contoh salah:

```js
it("test 1", () => { /* tidak menyebut perilaku */ });
it("works", () => { expect(canApply(x)).toBeTruthy(); });   // tidak jelas dan longgar
```

Aturan nama: DILARANG nama generik (`test1`, `works`, `fix`); satu kasus satu perilaku; satu `expect` utama per kasus.

## 7. Data Uji

1. Data uji WAJIB fiktif dan dibangun lewat fungsi pembangun (`buatPeserta()`, `buatTim()`), bukan disalin dari `TIM`/`BUILDER` agar tes tidak patah saat data contoh berubah.
2. Tes server WAJIB memakai DB uji terpisah yang direset tiap rangkaian; DILARANG menjalankan tes terhadap DB produksi.
3. Fixture WAJIB menyertakan kasus tepi: peserta tanpa tim, owner, `pending`, `approved`, `rejected`, `withdrawn`, tim `closed`.

## 8. Uji Manual Sampai Tes Otomatis Ada

Sebelum merge, penulis PR WAJIB menjalankan dan mencentang pada deskripsi PR:

- [ ] `npm run build` selesai tanpa galat.
- [ ] `npm run preview` memuat halaman dari sub-path tanpa aset rusak.
- [ ] Alur: Intro, Login, Data diri (validasi kosong dan WhatsApp 8 digit ditolak), Skenario (pintasan keyboard A sampai E), Hasil, Grup utama, Pilih jalan.
- [ ] Lamar tim, tarik lamaran, lamaran kedua ditolak selama ada lamaran aktif.
- [ ] Setujui lamaran (mode demo): lamaran `pending` lain hilang, tombol grup terbuka.
- [ ] Buat tim: nama, link WhatsApp tidak sah ditolak, tutup tim mengembalikan ke pilihan.
- [ ] Layar Tencent dan Submit: tombol submit terkunci sampai kotak "project selesai" dicentang.
- [ ] Tiga bahasa: tidak ada teks keras atau tata letak patah (`?lang=id`, `?lang=en`, `?lang=zh`).
- [ ] Layar sempit (sekitar 360 px) dan lebar (sekitar 1280 px) tanpa scroll horizontal.
- [ ] Navigasi keyboard dan fokus terlihat; tidak ada galat di konsol.
- [ ] Muat ulang pada tiap layar: kembali ke layar yang sah (penjaga `initState()`).

## 9. Kriteria Lulus untuk Merge dan Rilis

| Tahap | Kriteria |
|---|---|
| Merge | Build sukses; uji manual bagian 8 dicentang; setelah kerangka terpasang, seluruh tes lulus dan tes baru untuk aturan yang berubah ada |
| Rilis | Seluruh tes lulus; E2E bagian 5.4 lulus; tidak ada galat konsol; uji UAT sesuai [06_DOCUMENTATION_STANDARD.md](06_DOCUMENTATION_STANDARD.md) bila rilis besar |
| Cakupan kode (coverage) | Target numerik: _TBD_. Untuk `src/lib` DISARANKAN 100 persen cabang aturan bisnis. |

Temuan bug WAJIB disertai tes regresi yang gagal sebelum perbaikan dan lulus sesudahnya.

## 10. Riwayat Dokumen

| Tanggal | Perubahan |
|---|---|
| 2026-10-21 | Draf awal. |
