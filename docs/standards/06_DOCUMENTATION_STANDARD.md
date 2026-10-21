# Standard Dokumentasi

> Status: Draft
> Terakhir diperbarui: 2026-10-21
> Pemilik: Tim AIClub Hackathon

## 1. Tujuan dan Lingkup

Standard ini mengatur struktur folder `docs/`, penamaan berkas, header, gaya bahasa, tautan, dan pembaruan dokumen turunan. Berlaku untuk semua berkas `.md` di bawah `docs/`. `README.md` dan `brief.md` di akar repositori tetap berada di luar `docs/` ([../../README.md](../../README.md), [../../brief.md](../../brief.md)) dan mengikuti aturan bahasa pada bagian 5.

Perhatian khusus: `docs/` juga berisi hasil build GitHub Pages (`index.html`, `assets/`, `brand/`). Aturan menyentuhnya ada di [01_CONTRIBUTION_STANDARD.md](01_CONTRIBUTION_STANDARD.md) bagian 7.

## 2. Struktur `docs/`

```
docs/
  index.html                  OUTPUT BUILD, jangan diedit
  assets/                     OUTPUT BUILD, dihapus tiap build
  brand/                      SALINAN public/brand/, jangan diedit
  NN_NAMA.md                  dokumen induk bernomor (charter, PRD, TRD, dst)
  standards/                  standard proyek: 00_STANDARD_INDEX.md sampai 07_...
  plans/                      rencana kerja: YYYY-MM-DD-slug.md
  specs/                      spesifikasi teknis: YYYY-MM-DD-slug.md
  uat/                        laporan UAT: YYYY-MM-DD_deskripsi.md
```

Dokumen induk bernomor di akar `docs/` (nomor menunjukkan urutan baca, bukan prioritas):

| Berkas | Isi |
|---|---|
| [../00_PROJECT_CHARTER.md](../00_PROJECT_CHARTER.md) | Tujuan, ruang lingkup, pemangku kepentingan |
| [../01_PRD.md](../01_PRD.md) | Kebutuhan produk |
| [../02_BRD.md](../02_BRD.md) | Kebutuhan bisnis |
| [../04_TRD.md](../04_TRD.md) | Desain teknis |
| [../05_ARCHITECTURE.md](../05_ARCHITECTURE.md) | Arsitektur |
| [../06_IMPLEMENTATION_PLAN.md](../06_IMPLEMENTATION_PLAN.md) | Rencana implementasi |
| [../07_MASTER_CHECKLIST.md](../07_MASTER_CHECKLIST.md) | Checklist induk |
| [../08_ROADMAP.md](../08_ROADMAP.md) | Roadmap |
| [../10_RISK_REGISTER.md](../10_RISK_REGISTER.md) | Daftar risiko |
| [../11_DECISIONS.md](../11_DECISIONS.md) | Catatan keputusan |
| [../12_TEST_STRATEGY.md](../12_TEST_STRATEGY.md) | Strategi uji |
| [../13_GLOSSARY.md](../13_GLOSSARY.md) | Glosarium |
| [../14_SECURITY_THREAT_MODEL.md](../14_SECURITY_THREAT_MODEL.md) | Model ancaman keamanan |
| [../16_CONFIG_REFERENCE.md](../16_CONFIG_REFERENCE.md) | Referensi konfigurasi |
| [../17_DEVELOPER_SETUP.md](../17_DEVELOPER_SETUP.md) | Persiapan pengembang |
| Changelog (nomor 03, 09, 15 belum terpakai) | Nomor dan nama berkas: _TBD_ |

Daftar di atas mencerminkan berkas yang ada pada tanggal dokumen ini; nomor yang kosong (03, 09, 15) tidak boleh diisi ulang dengan makna lain tanpa keputusan pemilik indeks `docs/`.

Aturan struktur:

1. Dokumen induk baru WAJIB memakai nomor setelah nomor tertinggi yang pernah terpakai pada akar `docs/`; nomor kosong di tengah tidak diisi.
2. Nomor dokumen yang sudah terbit DILARANG dinomori ulang, dihapus lalu dipakai ulang, atau digeser, walaupun ada nomor yang kosong. Dokumen usang diubah statusnya menjadi `Deprecated` dan tetap berada di tempat. Alasannya: tautan, changelog, dan keputusan merujuk ke nomor itu.
3. Berkas dan folder di bawah `docs/` DILARANG memakai nama yang bentrok dengan output build (`index.html`, `assets`, `brand`).
4. Berkas yang bukan `.md` (gambar diagram, lampiran) WAJIB ditaruh di `docs/<folder-dokumen>/img/` atau folder lampiran milik dokumennya, bukan di `docs/assets/`. Lokasi lampiran final: _TBD_.
5. Semua dokumen WAJIB dapat dijangkau dari indeks: standard dari [00_STANDARD_INDEX.md](00_STANDARD_INDEX.md), dokumen lain dari indeks `docs/` (berkas indeks: _TBD_).

## 3. Penamaan Berkas

| Jenis | Pola | Contoh benar | Contoh salah |
|---|---|---|---|
| Dokumen induk | `NN_NAMA.md` (NN dua digit, NAMA huruf besar, pemisah `_`) | `04_TRD.md`, `01_PRD.md` | `4_trd.md`, `TRD.md`, `04-trd.md` |
| Standard | `NN_NAMA_STANDARD.md` | `05_TESTING_STANDARD.md` | `testing.md`, `05_testing_standard.md` |
| Rencana (plans/) | `YYYY-MM-DD-slug.md` (tanggal pembuatan, slug huruf kecil dengan `-`) | `2026-10-21-integrasi-login-aiclub.md` | `rencana-integrasi.md`, `21-10-2026-integrasi.md` |
| Spesifikasi (specs/) | `YYYY-MM-DD-slug.md` | `2026-10-22-kontrak-api-hackathon.md` | `spec_api.md` |
| UAT (uat/) | `YYYY-MM-DD_deskripsi.md` (garis bawah antara tanggal dan deskripsi, deskripsi huruf kecil dengan `-`) | `2026-11-02_uat-alur-lamaran.md` | `uat-1.md`, `2026-11-02-UAT.md` |

Aturan penamaan:

1. Tanggal pada nama berkas adalah tanggal pembuatan dan DILARANG diubah ketika isi diperbarui; tanggal pembaruan dicatat pada header.
2. Slug WAJIB ringkas (maksimal sekitar 60 karakter), tanpa spasi, tanpa huruf besar, tanpa karakter non-ASCII.
3. Berkas DILARANG diganti nama setelah dirujuk dari dokumen lain. Bila terpaksa, semua tautan masuk WAJIB diperbarui pada PR yang sama.
4. Satu berkas satu topik.

## 4. Header Dokumen

Setiap berkas `.md` di `docs/` WAJIB diawali persis seperti berikut (tanpa baris kosong sebelum judul):

```
# <Judul Dokumen>

> Status: Draft
> Terakhir diperbarui: YYYY-MM-DD
> Pemilik: <tim atau peran>
```

| Bidang | Aturan |
|---|---|
| Judul | Satu `# H1` per berkas; judul bahasa Indonesia, tanpa nomor berkas |
| Status | Salah satu: `Draft`, `Aktif`, `Deprecated`. Dokumen rencana dan spesifikasi boleh memakai `Selesai` bila sudah dijalankan: _TBD_ (nilai tambahan disepakati pada rapat dokumentasi) |
| Terakhir diperbarui | Tanggal absolut `YYYY-MM-DD`; WAJIB diperbarui pada setiap perubahan isi |
| Pemilik | Tim atau peran, bukan nama perorangan |

Contoh benar:

```
# Rencana Integrasi Login aiclub.id

> Status: Draft
> Terakhir diperbarui: 2026-10-21
> Pemilik: Tim AIClub Hackathon
```

Contoh salah:

```
# 04 - TRD
Status: draft
Updated: kemarin
Owner: Budi
```

Aturan struktur isi: setelah header, dokumen WAJIB memuat tujuan dan lingkup, isi utama bernomor `## 1.`, `## 2.`, dan diakhiri riwayat dokumen berupa tabel `Tanggal | Perubahan`. Tabel dan kode WAJIB memakai sintaks Markdown standar.

## 5. Bahasa dan Gaya

1. Bahasa Indonesia formal (baku), kalimat aktif dan ringkas. Slang, singkatan tidak baku, dan emoji DILARANG.
2. Tanpa persona: DILARANG memakai orang pertama ("saya", "kami", "aku") atau orang kedua ("kamu", "Anda") dan DILARANG memberi dokumen karakter atau nada tertentu. Gunakan kalimat impersonal atau subjek konkret ("Tim", "Server", "Kontributor").
3. Istilah teknis yang lazim boleh tetap berbahasa Inggris (branch, commit, cookie, rate limit); sertakan padanan Indonesia pada pemakaian pertama bila ada. Nama berkas, fungsi, kunci, dan perintah WAJIB dalam backtick.
4. Kata kewajiban memakai WAJIB, DISARANKAN, DILARANG (huruf besar), konsisten dengan [00_STANDARD_INDEX.md](00_STANDARD_INDEX.md).
5. Fakta yang belum diketahui WAJIB ditulis `_TBD_` disertai konteks (apa yang belum diketahui dan siapa yang memutuskan). DILARANG mengarang angka, tanggal, nama, atau perilaku sistem.
6. Setiap klaim tentang kode atau perilaku sistem WAJIB dapat ditelusuri ke berkas atau fungsi (misalnya `canApply` pada `src/lib/rules.js`).
7. Contoh benar dan salah DISARANKAN ada pada setiap aturan yang rawan salah tafsir.

Contoh benar:

> Server WAJIB menolak lamaran kedua dengan status `409`.

Contoh salah:

> Kami rasa sebaiknya nanti kamu bikin server nolak lamaran kedua ya :)

## 6. Tanggal

1. Tanggal WAJIB berupa tanggal absolut format `YYYY-MM-DD` (contoh `2026-10-21`). Ekspresi relatif ("kemarin", "minggu depan", "bulan ini") DILARANG karena kehilangan makna seiring waktu.
2. Tanggal peristiwa yang sudah ditetapkan pihak lain (misalnya pendaftaran ditutup 1 Nov) WAJIB ditulis lengkap dengan tahun saat dikutip, dan sumbernya disebut ([../../README.md](../../README.md) atau halaman resmi event).
3. Zona waktu WAJIB disebut bila jam dicantumkan (misalnya WIB).

## 7. Tautan

1. Tautan antar dokumen di repositori WAJIB relatif terhadap lokasi berkas yang menulis, bukan absolut, supaya tetap berfungsi di GitHub dan GitHub Pages.
2. Contoh dari `docs/standards/`: `[../04_TRD.md](../04_TRD.md)`, `[../../brief.md](../../brief.md)`, `[02_CODE_STANDARD.md](02_CODE_STANDARD.md)`.
3. Tautan ke bagian tertentu memakai jangkar judul huruf kecil (`#4-header-dokumen`) hanya bila judul stabil; DISARANKAN menyebut "bagian N" pada teks.
4. Tautan ke berkas yang belum ada WAJIB ditandai `_TBD_` pada teks dan DILARANG dibuat sebagai tautan aktif yang rusak.
5. Tautan luar WAJIB `https`; URL pendek aiclub.id (`aiclub.id/l/...`) hanya dikutip bila memang bagian dari alur.
6. Tautan WAJIB diperiksa saat review PR (klik atau pindai manual); alat pemeriksa otomatis: _TBD_.

## 8. Pembaruan Dokumen Turunan

Satu perubahan sering memengaruhi beberapa dokumen. Penulis perubahan WAJIB memperbarui dokumen turunan pada PR yang sama.

| Bila ini berubah | Perbarui juga |
|---|---|
| Alur peserta, layar, atau aturan bisnis | PRD, TRD, checklist pengujian/UAT, `README.md` (bagian alur dan "Masih dummy") |
| Kontrak API atau skema DB | Spesifikasi di `specs/`, [03_ARCHITECTURE_STANDARD.md](03_ARCHITECTURE_STANDARD.md) bagian 4.1, tes ([05_TESTING_STANDARD.md](05_TESTING_STANDARD.md)) |
| Rencana integrasi atau pertanyaan terbuka terjawab | [../../brief.md](../../brief.md), roadmap, dokumen keputusan (decisions) |
| Keputusan arsitektur, keamanan, atau pilihan alat | Dokumen keputusan (decisions) baru; standard terkait; TRD |
| Fitur selesai atau fase roadmap tercapai | Roadmap (status fase), checklist (centang), changelog |
| Rilis | Changelog, versi `package.json`, catatan rilis ([07_RELEASE_STANDARD.md](07_RELEASE_STANDARD.md)) |
| Hasil UAT | Laporan di `uat/`, checklist, daftar bug dan keputusan tindak lanjut |
| Standard berubah | [00_STANDARD_INDEX.md](00_STANDARD_INDEX.md) (tanggal dan tabel), changelog bila memengaruhi cara kerja |
| Berkas dinomori atau ditambah | Indeks `docs/` dan semua tautan masuk |

Tata cara dokumen turunan:

1. **Checklist**: butir diberi `- [ ]`/`- [x]`; butir yang dicentang WAJIB menyebut bukti (PR, tes, tanggal). DILARANG menghapus butir yang sudah selesai; centang saja.
2. **Roadmap**: setiap fase memuat tujuan, kriteria selesai, status, dan tanggal target absolut (kerangka fase ada pada brief bagian 9). Perubahan jadwal dicatat, bukan ditimpa.
3. **Changelog**: format "Tanggal rilis, versi, daftar perubahan per kelompok (Ditambah, Diubah, Diperbaiki, Dihapus)"; urutan terbaru di atas; satu entri per rilis ([07_RELEASE_STANDARD.md](07_RELEASE_STANDARD.md)).
4. **Decisions**: satu keputusan satu entri bernomor urut tetap (misalnya `D-001`), memuat konteks, opsi, keputusan, konsekuensi, tanggal, dan pengambil keputusan (peran). Keputusan yang diganti DILARANG dihapus; tandai `Diganti oleh D-0NN`.
5. **Plans dan specs**: dokumen bertanggal adalah catatan titik waktu. Isi yang sudah usang diberi status `Deprecated` atau diganti dokumen baru bertanggal baru, bukan ditulis ulang diam-diam.
6. **UAT**: satu berkas per sesi, berisi skenario, hasil, bukti, dan keputusan lulus atau tidak.

## 9. Siklus Hidup Dokumen

| Status | Arti | Transisi |
|---|---|---|
| Draft | Sedang disusun, belum disepakati | -> Aktif bila disetujui pemilik dan satu peninjau |
| Aktif | Berlaku | -> Deprecated bila digantikan |
| Deprecated | Tidak berlaku; dipertahankan sebagai arsip | Tidak kembali |

Dokumen `Deprecated` WAJIB menyebut penggantinya pada baris pertama setelah header.

## 10. Daftar Periksa Sebelum Commit Dokumen

- [ ] Header persis sesuai bagian 4 dan tanggal diperbarui.
- [ ] Nama berkas sesuai bagian 3 dan nomor tidak bentrok.
- [ ] Tanpa persona, tanpa emoji, tanpa tanggal relatif.
- [ ] Semua tautan relatif dan menuju berkas yang ada (atau ditandai `_TBD_`).
- [ ] Fakta yang belum pasti ditulis `_TBD_`, tidak dikarang.
- [ ] Tidak ada rahasia atau data pribadi sungguhan ([04_SECURITY_STANDARD.md](04_SECURITY_STANDARD.md)).
- [ ] Dokumen turunan (bagian 8) diperbarui.
- [ ] Tidak ada berkas yang ditulis ke `docs/assets/`, `docs/brand/`, atau bernama `docs/index.html`.

## 11. Riwayat Dokumen

| Tanggal | Perubahan |
|---|---|
| 2026-10-21 | Draf awal. |
