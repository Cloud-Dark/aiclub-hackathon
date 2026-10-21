# Standard Rilis

> Status: Draft
> Terakhir diperbarui: 2026-10-21
> Pemilik: Tim AIClub Hackathon

## 1. Tujuan dan Lingkup

Standard ini mengatur penomoran versi, changelog, proses build ke `docs/`, deploy ke GitHub Pages, checklist rilis, dan rollback. Berlaku untuk rilis demo (GitHub Pages) dan, setelah integrasi, rilis produksi pada domain aiclub.id ([../../brief.md](../../brief.md)).

## 2. Kondisi Saat Ini

| Hal | Fakta |
|---|---|
| Versi pada `package.json` | `1.0.0` (`private: true`) |
| Tag git | Belum ada |
| Changelog | Belum ada: _TBD_ |
| Build | `npm run build` (Vite) menulis ke `docs/`, `base: "./"` |
| Hosting demo | GitHub Pages, sumber branch `main`, folder `/docs`; alamat: https://cloud-dark.github.io/aiclub-hackathon/ |
| CI/CD | Belum ada; build dijalankan manual dan hasilnya di-commit |
| Hosting produksi | _TBD_ (subdomain aiclub.id diusulkan; menunggu keputusan pengelola) |
| Tenggat bisnis | Pendaftaran ditutup 1 Nov (tahun event 2026; lihat halaman resmi event) |

## 3. Penomoran Versi

Proyek memakai Semantic Versioning `MAJOR.MINOR.PATCH`.

| Naik | Kapan | Contoh |
|---|---|---|
| MAJOR | Perubahan yang merusak: format data tersimpan, kontrak API, migrasi pindah dari mode dummy ke aiclub.id | `1.x.x` menjadi `2.0.0` saat login dummy diganti login aiclub.id |
| MINOR | Fitur atau layar baru yang kompatibel | `1.1.0` menambah layar persetujuan data |
| PATCH | Perbaikan bug, teks, atau gaya tanpa perubahan perilaku | `1.0.1` memperbaiki validasi link WhatsApp |

Aturan:

1. Sumber kebenaran versi adalah `version` pada `package.json`. Versi DILARANG ditulis manual di tempat lain tanpa sumber yang sama.
2. Naik versi WAJIB lewat PR rilis (`rilis/vX.Y.Z`), bukan dalam PR fitur.
3. Setiap rilis WAJIB diberi tag git beranotasi `vX.Y.Z` pada commit rilis. Contoh benar: `v1.1.0`. Contoh salah: `1.1`, `release-final`, `v1.1.0-baru`.
4. Versi dan tag yang sudah terbit DILARANG diubah atau dipakai ulang. Perbaikan dikeluarkan sebagai PATCH baru.
5. Pra-rilis memakai akhiran (`v2.0.0-rc.1`) dan DILARANG diumumkan ke peserta.
6. Versi pada `package-lock.json` WAJIB sinkron dengan `package.json` (jalankan `npm install` setelah mengubah versi).

## 4. Changelog

1. Perubahan WAJIB dicatat pada berkas changelog (nama dan nomor berkas mengikuti [06_DOCUMENTATION_STANDARD.md](06_DOCUMENTATION_STANDARD.md); lokasi: _TBD_ karena belum ada).
2. Satu entri per rilis, terbaru di atas, dengan format:

```
## [1.1.0] - 2026-10-28

### Ditambah
- Layar persetujuan penggunaan data (WhatsApp, kota).

### Diubah
- Pola `WA_LINK_RE` diberi penutup agar teks tambahan ditolak.

### Diperbaiki
- Lamaran ganda saat dua tab dibuka bersamaan.

### Dihapus
- (tidak ada)

### Keamanan
- (tidak ada)
```

3. Kelompok yang dipakai: Ditambah, Diubah, Diperbaiki, Dihapus, Keamanan. Kelompok kosong boleh dihilangkan.
4. Tiap butir ditulis dari sudut pandang dampak bagi pengguna atau kontributor, dalam bahasa Indonesia formal tanpa persona, dan menyebut PR atau commit bila ada.
5. Perubahan yang merusak (data `hk_state` tidak kompatibel, bidang API berganti nama) WAJIB diberi penanda `BREAKING` beserta langkah migrasinya.
6. Tanggal rilis WAJIB tanggal absolut `YYYY-MM-DD`.
7. Perubahan standard atau cara kerja kontributor WAJIB muncul pada changelog.

## 5. Build ke `docs/`

Konfigurasi (`vite.config.js`): `base: "./"` agar berjalan di sub-path GitHub Pages; `build.outDir: "docs"`; `build.emptyOutDir: false`; plugin `clean-docs-assets` menghapus hanya `docs/assets` saat `buildStart`.

| Hasil | Perlakuan |
|---|---|
| `docs/index.html`, `docs/assets/*` | Dibuat ulang tiap build; di-commit |
| `docs/brand/*` | Disalin dari `public/brand/` oleh Vite; di-commit |
| `docs/**/*.md` | Tidak disentuh build; ditulis manual |

Langkah build:

1. Pastikan working tree bersih dan branch sudah diperbarui terhadap `main`.
2. Pasang dependensi sesuai kunci: `npm ci` (DISARANKAN) atau `npm install`.
3. Jalankan `npm run build`.
4. Pastikan keluaran bersih: tidak ada galat atau peringatan baru, ukuran bundel wajar (perbandingan terhadap rilis sebelumnya DISARANKAN; batas ukuran: _TBD_).
5. Periksa `git status`: hanya `docs/index.html`, `docs/assets/*`, dan (bila berubah) `docs/brand/*` yang berubah dari hasil build, dan berkas `.md` tidak terhapus.
6. Uji hasil: `npm run preview` dan buka dari sub-path; muat ulang pada beberapa layar; periksa tiga bahasa.
7. Commit hasil build bersama commit rilis (lihat [01_CONTRIBUTION_STANDARD.md](01_CONTRIBUTION_STANDARD.md) bagian 4 dan 7).

Larangan:

- DILARANG mengedit `docs/index.html` atau `docs/assets/*` secara manual.
- DILARANG membangun dari working tree yang kotor (perubahan yang belum di-commit ikut terkompilasi tanpa jejak).
- DILARANG mengubah `emptyOutDir` menjadi `true` (menghapus dokumentasi `.md`).
- DILARANG meninggalkan berkas hash lama di `docs/assets/`; plugin `clean-docs-assets` mencegahnya, sehingga nama berkas pada `docs/index.html` WAJIB cocok dengan isi `docs/assets/`.

## 6. Deploy GitHub Pages (Demo)

Pengaturan sekali (README): Settings, Pages, Build and deployment, Deploy from a branch, Branch `main`, folder `/docs`.

Alur deploy:

1. PR rilis berisi kode, build ulang, changelog, dan versi baru.
2. Setelah merge ke `main`, GitHub Pages menerbitkan isi `docs/` otomatis. Waktu publikasi: _TBD_ (diamati saat rilis pertama).
3. Pasca-deploy WAJIB memeriksa https://cloud-dark.github.io/aiclub-hackathon/ : halaman memuat, aset CSS dan JS tidak 404, login dummy berfungsi, tiga bahasa berfungsi, tautan Tencent terbuka.
4. Beri tag `vX.Y.Z` pada commit merge dan dorong tag.
5. Umumkan rilis kepada pemangku kepentingan hanya setelah pemeriksaan pasca-deploy lulus. Kanal pengumuman: _TBD_.

Aturan:

- Versi demo DILARANG memuat data pribadi sungguhan dan DILARANG disambungkan ke session atau database sungguhan ([04_SECURITY_STANDARD.md](04_SECURITY_STANDARD.md) dan [03_ARCHITECTURE_STANDARD.md](03_ARCHITECTURE_STANDARD.md) bagian 8).
- Berkas `.md` pada `docs/` ikut tersaji publik di Pages; periksa sebelum rilis bahwa tidak ada informasi internal sensitif.
- Perilaku Jekyll terhadap `.md` di `docs/` dan kebutuhan berkas `.nojekyll`: _TBD_ (belum diverifikasi).

## 7. Deploy Produksi (Setelah Integrasi)

Belum ada. Prasyarat yang diketahui dari brief: domain subdomain aiclub.id, Worker/Pages Functions untuk `/api/hackathon/*`, variabel lingkungan `VITE_API_BASE` dan `VITE_LOGIN_URL` (non-rahasia), migrasi tabel `hackathon_*` pada D1. Prosedur rinci _TBD_ dan WAJIB ditulis sebagai spesifikasi sebelum rilis produksi pertama.

Aturan awal:

1. Migrasi DB WAJIB berurutan, tercatat, dan dapat dibalik atau punya rencana pemulihan sebelum diterapkan ke produksi.
2. Urutan rilis: migrasi DB yang kompatibel mundur, lalu server, lalu klien. Perubahan yang merusak WAJIB lewat tahap transisi dua rilis.
3. Rahasia produksi WAJIB dikelola di platform hosting, bukan di repositori.
4. Rilis WAJIB dihindari pada jam puncak pendaftaran dan pada tiga hari terakhir sebelum penutupan pendaftaran kecuali perbaikan darurat.

## 8. Checklist Rilis

Salin ke deskripsi PR rilis dan centang seluruhnya.

**Persiapan**
- [ ] Semua PR yang masuk rilis sudah merge ke `main`.
- [ ] Cakupan rilis dan versi disepakati (MAJOR/MINOR/PATCH, bagian 3).
- [ ] Pertanyaan terbuka yang menghalangi rilis pada [../../brief.md](../../brief.md) sudah dijawab atau dicatat sebagai risiko.

**Kualitas**
- [ ] `npm ci` dan `npm run build` sukses tanpa galat.
- [ ] Uji manual atau tes otomatis lulus sesuai [05_TESTING_STANDARD.md](05_TESTING_STANDARD.md) bagian 9.
- [ ] Tiga bahasa diperiksa (id, en, zh), layar sempit dan lebar.
- [ ] Tidak ada rahasia atau data pribadi pada diff, `docs/assets/`, dan dokumentasi.
- [ ] `npm audit` ditinjau; temuan tinggi ditangani atau dijelaskan.
- [ ] Setelah integrasi: aturan R1 sampai R9 lulus uji ([05_TESTING_STANDARD.md](05_TESTING_STANDARD.md) bagian 4).

**Dokumentasi**
- [ ] Changelog ditambah dan tanggal absolut.
- [ ] `version` pada `package.json` dan `package-lock.json` dinaikkan.
- [ ] `README.md` diperbarui bila alur atau cara pakai berubah.
- [ ] Dokumen turunan diperbarui ([06_DOCUMENTATION_STANDARD.md](06_DOCUMENTATION_STANDARD.md) bagian 8).

**Build dan deploy**
- [ ] Build dibuat dari commit rilis pada working tree bersih.
- [ ] `git status` menunjukkan hanya berkas build dan berkas rilis yang berubah; `.md` tidak terhapus.
- [ ] Merge ke `main` disetujui minimal satu reviewer ([01_CONTRIBUTION_STANDARD.md](01_CONTRIBUTION_STANDARD.md)).
- [ ] Pasca-deploy: alamat Pages dibuka, aset tidak 404, alur utama berfungsi.
- [ ] Tag `vX.Y.Z` dibuat dan didorong.
- [ ] Pemangku kepentingan diberi tahu (setelah pemeriksaan pasca-deploy).

## 9. Rollback

Prinsip: pulihkan layanan dulu, selidiki kemudian. Rollback WAJIB lewat riwayat git (revert), bukan menimpa riwayat.

### 9.1 Kapan Rollback

| Gejala | Tindakan |
|---|---|
| Halaman putih, aset 404, galat konsol yang menghalangi alur utama | Rollback segera |
| Data pribadi atau link grup bocor | Rollback segera dan jalankan [04_SECURITY_STANDARD.md](04_SECURITY_STANDARD.md) bagian 10 |
| Bug tidak menghalangi alur | Perbaikan maju (PATCH baru), rollback opsional |

### 9.2 Rollback Demo (GitHub Pages)

1. Identifikasi commit rilis yang bermasalah (`git log`).
2. Buat branch `perbaikan/rollback-vX.Y.Z` dari `main`.
3. Jalankan `git revert <sha-commit-rilis>` (untuk merge commit gunakan `-m 1`). Revert mengembalikan `docs/index.html` dan `docs/assets/*` ke keadaan rilis sebelumnya, termasuk berkas aset ber-hash lama.
4. Verifikasi bahwa `docs/index.html` merujuk berkas yang ada di `docs/assets/` dan berkas `.md` tidak terpengaruh.
5. Buka PR, setujui, merge. Untuk keadaan darurat, merge dengan satu persetujuan dan catat alasannya pada PR.
6. Periksa alamat Pages sesuai langkah pasca-deploy bagian 6.
7. Catat rollback pada changelog sebagai entri `PATCH` (misalnya `1.1.1`: "Mengembalikan 1.1.0 karena ...") dan jangan menghapus tag lama; beri catatan pada tag/rilis yang ditarik.

Alternatif bila revert terlalu rumit: bangun ulang dari tag rilis stabil terakhir (`git checkout vX.Y.Z -- src package.json package-lock.json`, lalu `npm ci && npm run build`) dan commit hasilnya sebagai commit baru. DILARANG memakai `git push --force` ke `main`.

### 9.3 Rollback Produksi (Setelah Integrasi)

_TBD_: prosedur rinci menunggu keputusan hosting dan akses DB. Prinsip yang WAJIB: (a) klien dan server dapat dikembalikan ke versi sebelumnya secara terpisah; (b) migrasi DB mempunyai langkah pemulihan terdokumentasi; (c) data peserta yang masuk selama rilis bermasalah tidak boleh hilang; (d) rollback diumumkan kepada pemangku kepentingan.

### 9.4 Pascarollback

1. Tulis catatan singkat insiden: waktu (tanggal dan jam, zona waktu), gejala, penyebab, dampak, tindakan.
2. Tambah tes regresi untuk penyebab sebelum merilis ulang ([05_TESTING_STANDARD.md](05_TESTING_STANDARD.md)).
3. Rilis ulang sebagai versi baru; DILARANG memakai ulang nomor versi yang ditarik.

## 10. Rilis Darurat (Hotfix)

1. Branch `perbaikan/<slug>` dari `main`, perubahan seminimal mungkin.
2. Satu reviewer WAJIB tetap menyetujui; menunda review lebih dari beberapa jam saat insiden bukan alasan melewatkannya.
3. Tetap mengikuti checklist bagian 8, dengan pengecualian uji manual dipersempit pada alur yang terdampak (alasan dicatat pada PR).
4. Versi PATCH baru, changelog, dan tag WAJIB tetap dibuat.

## 11. Riwayat Dokumen

| Tanggal | Perubahan |
|---|---|
| 2026-10-21 | Draf awal. |
