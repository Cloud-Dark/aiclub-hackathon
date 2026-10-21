# Indeks Standard Proyek

> Status: Draft
> Terakhir diperbarui: 2026-10-21
> Pemilik: Tim AIClub Hackathon

## 1. Tujuan

Dokumen ini adalah pintu masuk ke seluruh standard proyek portal pendaftaran AI Agent Hackathon (aiclub.id x Tencent Cloud). Setiap standard mengatur satu bidang kerja dan bersifat mengikat bagi semua kontributor. Konteks produk dan rencana integrasi ada di [../../README.md](../../README.md) dan [../../brief.md](../../brief.md).

Kata kunci kewajiban dalam semua standard:

| Kata | Arti |
|---|---|
| WAJIB | Aturan mutlak. Pelanggaran menghalangi merge atau rilis. |
| DISARANKAN | Praktik baik. Boleh dilanggar dengan alasan tertulis di deskripsi PR. |
| DILARANG | Tidak boleh dilakukan dalam kondisi apa pun, kecuali ada keputusan tertulis yang mengubah standard. |

## 2. Daftar Standard

| No | Dokumen | Deskripsi satu baris |
|---|---|---|
| 01 | [01_CONTRIBUTION_STANDARD.md](01_CONTRIBUTION_STANDARD.md) | Alur branch, format commit, review, dan aturan menyentuh `docs/` yang juga menjadi output build. |
| 02 | [02_CODE_STANDARD.md](02_CODE_STANDARD.md) | Gaya kode React fungsional, penamaan, struktur `src/`, aturan i18n, dan CSS. |
| 03 | [03_ARCHITECTURE_STANDARD.md](03_ARCHITECTURE_STANDARD.md) | Batas lapisan UI, lib, data, dan API; logika bisnis di server; kontrak API. |
| 04 | [04_SECURITY_STANDARD.md](04_SECURITY_STANDARD.md) | Session, cookie, rahasia, validasi input, akses link WhatsApp, privasi, dan rate limit. |
| 05 | [05_TESTING_STANDARD.md](05_TESTING_STANDARD.md) | Piramida uji, cakupan minimum aturan bisnis, dan penamaan tes. |
| 06 | [06_DOCUMENTATION_STANDARD.md](06_DOCUMENTATION_STANDARD.md) | Struktur `docs/` bernomor, header dokumen, penamaan berkas, dan pembaruan dokumen turunan. |
| 07 | [07_RELEASE_STANDARD.md](07_RELEASE_STANDARD.md) | Versi, changelog, build ke `docs/`, deploy GitHub Pages, checklist rilis, dan rollback. |

Nomor `00` dicadangkan untuk indeks ini. Dokumen lain di luar folder ini (PRD, TRD, roadmap, dan sebagainya) diatur oleh [06_DOCUMENTATION_STANDARD.md](06_DOCUMENTATION_STANDARD.md); contoh dokumen induk: [../04_TRD.md](../04_TRD.md).

## 3. Urutan Baca yang Disarankan

| Peran | Baca dulu | Lalu |
|---|---|---|
| Kontributor baru | 01, 02 | 06 |
| Pengembang UI | 02, 03 | 05 |
| Pengembang backend (setelah integrasi) | 03, 04 | 05, 07 |
| Pengelola rilis | 07, 01 | 06 |
| Peninjau keamanan | 04, 03 | 05 |

## 4. Aturan Menambah Standard Baru

1. Standard baru WAJIB diberi nomor urut berikutnya yang belum terpakai, format `NN_NAMA_STANDARD.md` (huruf besar, pemisah garis bawah). Contoh benar: `08_ACCESSIBILITY_STANDARD.md`. Contoh salah: `8-accessibility.md`, `standard-aksesibilitas.md`.
2. Nomor yang sudah terpakai DILARANG dipakai ulang atau dinomori ulang, termasuk bila standard lama dicabut. Standard yang dicabut tetap berkas dengan status `Deprecated` dan menunjuk penggantinya.
3. Berkas baru WAJIB diawali header baku:

   ```
   # <Judul Dokumen>

   > Status: Draft
   > Terakhir diperbarui: YYYY-MM-DD
   > Pemilik: <tim atau peran>
   ```

4. Standard baru WAJIB memuat: tujuan, ruang lingkup, aturan (dengan kata WAJIB/DISARANKAN/DILARANG), contoh benar dan salah, serta cara pemeriksaan (review, tes, atau tooling).
5. Pada PR yang sama WAJIB: (a) menambah baris pada tabel bagian 2 dokumen ini, (b) memperbarui tanggal "Terakhir diperbarui" dokumen ini, (c) mencatat keputusan pada berkas keputusan (decisions) bila standard mengubah praktik yang sudah berjalan.
6. Standard baru tidak boleh bertentangan dengan standard yang ada. Bila bertentangan, ubah standard lama pada PR yang sama dan jelaskan alasannya.
7. Status dokumen: `Draft` (belum disepakati), `Aktif` (disetujui pemilik), `Deprecated` (dicabut). Perubahan status WAJIB lewat PR yang ditinjau minimal satu orang selain penulis.
8. Satu standard satu bidang. Bila isi sudah melewati sekitar 400 baris atau mengatur dua bidang berbeda, pecah menjadi dua standard baru dengan nomor baru.

## 5. Perubahan Standard Lama

- Perubahan substantif (aturan baru, aturan dihapus, tingkat kewajiban berubah) WAJIB lewat PR dan satu persetujuan.
- Perbaikan ejaan atau tautan boleh langsung, tetapi tanggal "Terakhir diperbarui" tetap WAJIB diperbarui.
- Standard yang berubah WAJIB dilaporkan pada changelog proyek bila memengaruhi cara kerja kontributor (lihat [07_RELEASE_STANDARD.md](07_RELEASE_STANDARD.md)).

## 6. Pemeriksaan Kepatuhan

| Standard | Cara pemeriksaan saat ini |
|---|---|
| 01 | Review PR; pemeriksaan manual atas isi `docs/` sebelum commit. |
| 02 | Review PR. Linter dan formatter: _TBD_ (belum ada di `package.json`). |
| 03 | Review PR terhadap daftar batas lapisan. |
| 04 | Review PR; pemindaian rahasia: _TBD_. |
| 05 | Kerangka tes belum terpasang: _TBD_. |
| 06 | Review PR; pemeriksaan tautan relatif manual. |
| 07 | Checklist rilis pada [07_RELEASE_STANDARD.md](07_RELEASE_STANDARD.md). |

## 7. Riwayat Dokumen

| Tanggal | Perubahan |
|---|---|
| 2026-10-21 | Draf awal indeks dan tujuh standard. |
