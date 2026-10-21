# Catatan Perubahan (Changelog)

> Status: Draft
> Terakhir diperbarui: 2026-10-21
> Pemilik: Tim AIClub Hackathon

Format mengikuti [Keep a Changelog](https://keepachangelog.com/id-ID/1.1.0/): perubahan dikelompokkan per tanggal dengan kategori Added, Changed, Fixed, dan Removed. Proyek belum memakai penomoran rilis (versi di `package.json`: `1.0.0`, tidak ada tag git), sehingga entri dikelompokkan per tanggal commit. Entri dibangun dari keluaran:

```
git log --format='%h %ad %s' --date=short
```

Hash di dalam kurung adalah commit sumber. Entri 2026-10-21 bagian "Fixed" dan sebagian "Added" memuat pekerjaan yang pada saat dokumen ini ditulis belum di-commit (ditandai). Dokumen terkait: [17_DEVELOPER_SETUP.md](17_DEVELOPER_SETUP.md), [18_INSTALLATION.md](18_INSTALLATION.md), [../README.md](../README.md), [../brief.md](../brief.md).

## [Belum Dirilis]

### Added

- Link undangan tim: owner dapat menyalin atau membagikan link `?tim=...` (WhatsApp, Web Share API). Pengunjung yang membuka link melihat banner undangan, lalu setelah menyelesaikan pendaftaran langsung diarahkan ke detail tim untuk melamar. Tim dari link tampil di pasar tim dengan penanda "LEWAT LINK". Teks tersedia dalam id/en/zh. Lihat FR-059 di [03_FRD.md](03_FRD.md).

### Changed

- Pasar tim, detail tim, dan dasbor membaca daftar gabungan tim contoh dan tim dari link (`src/lib/share.js`). Tim baru kini menyimpan `id` dan `at`.

## [2026-10-21]

### Added

- `brief.md`: rencana integrasi login, session, dan database aiclub.id (opsi login, arsitektur BFF, tabel `hackathon_*`, kontrak API, aturan bisnis server, tahapan, risiko) (`1ea78d5`).
- Dokumentasi proyek di folder `docs/` (berkas `.md` bernomor dan folder `standards/`, termasuk dokumen ini). Belum di-commit pada saat penulisan.

### Fixed

- `vite.config.js`: `emptyOutDir` diubah dari `true` menjadi `false`, ditambah plugin `clean-docs-assets` yang hanya menghapus `docs/assets` pada awal build. Sebelumnya `npm run build` mengosongkan seluruh `docs/` sehingga dokumen `.md` ikut terhapus. Perbaikan dikerjakan Alya; belum di-commit pada saat penulisan (lihat [18_INSTALLATION.md](18_INSTALLATION.md) bagian 3.1).

## [2026-10-19]

Seluruh pengembangan awal dikerjakan pada tanggal ini. Urutan kronologis dari commit tertua ke terbaru.

### Added

- Pemecahan form pendaftaran menjadi aplikasi React + Vite: komponen `Intro`, `Identity`, `Quiz`, `Result`, `Chrome`, `Combo`, `Common`; kamus tiga bahasa (`id`, `en`, `zh`) di `src/i18n/`; skor jalur di `src/lib/scoring.js`; layar akhir mengarah ke grup WhatsApp; webhook pendaftaran dan `.env.example` (`4bed4b8`).
- `README.md` awal (`6bc3c17`).
- Apps Script yang diselaraskan dengan aplikasi (payload datar, kolom WhatsApp dan LinkedIn, memakai spreadsheet aktif, variabel `VITE_GAS_URL`) (`5af017c`).
- Grup WhatsApp utama yang wajib diikuti sebelum pasar tim; melamar per grup tim dengan keputusan setujui/tolak oleh owner; layar status, aktivitas, dan linimasa; `src/lib/time.js` (`582836c`).
- Halaman login aiclub.id (dummy) dengan akun demo `DUMMY_USERS`; data wajib dilengkapi sebelum pasar tim; build ke `docs/` untuk GitHub Pages dengan `base "./"`; `.nojekyll` di `public/` dan `docs/` (`1118a99`).
- Wizard tim: pilih gabung atau buat tim secara eksklusif, tutup tim atau keluar tim untuk berpindah, indikator langkah; komponen `Choose` dan `Create` (`a02779b`).
- Halaman detail tim dan grup (`TeamDetail`); aturan satu lamaran aktif per orang; tautan grup WhatsApp tim baru terbuka setelah disetujui (`06eeaca`).
- Alur 3 langkah: daftar di portal kita, daftar tim ke Tencent (`Tencent.jsx`), submit project (`Submit.jsx`) dengan tombol submit terbuka setelah peserta mencentang project selesai; indikator langkah kecil pada langkah 1 (`34931fd`).
- Informasi resmi event: total hadiah USD 3.100, tiga tantangan, tanggal penting, mitra; logo AIClub, SumoPod, Tencent, WorkBuddy, CodeBuddy; poster; favicon dan apple-touch-icon; footer mitra; komponen `EventInfo` dan `Brand` (`f8135ea`).

### Changed

- Penanganan fokus: cincin fokus pada judul tidak lagi muncul saat halaman dimuat (`6bc3c17`).
- Alur dan navigasi mengikuti 3 langkah besar, dengan sub-langkah Data, Skenario, Jalur, Grup utama, Tim, Status; README disesuaikan (`34931fd`).
- Halaman pusat: bagian "6 minggu" diganti batas pendaftaran 1 Nov dan kartu target peserta dihapus (`80b09b3`).
- Data diri: kota dan WhatsApp menjadi wajib dilengkapi sebelum masuk pasar tim (`1118a99`); `README.md` diperbarui di sebagian besar commit fitur.
- Aturan lamaran: dari banyak lamaran menjadi satu lamaran aktif per orang; pindah tim berarti menarik lamaran dahulu (`06eeaca`).
- `.gitignore`: entri `dist` dihapus karena hasil build kini berada di `docs/` dan di-commit (`1118a99`).

### Fixed

- Re-render glitch pada form pendaftaran, diselesaikan lewat pemecahan komponen React (`4bed4b8`).
- Ketidakselarasan payload Apps Script dengan aplikasi (payload datar, WhatsApp/LinkedIn, spreadsheet aktif) (`5af017c`).

### Removed

- Alur pasar tim versi awal pada layar akhir dan `src/lib/webhook.js` (diganti `src/lib/gas.js`) (`5af017c`).
- Apps Script (`apps-script/Code.gs`), `src/lib/gas.js`, `.env.example`, dan `src/components/Final.jsx` (`582836c`).
- Berkas hasil build berhash lama di `docs/assets/`, diganti berkas baru pada setiap build (`a02779b`, `06eeaca`, `34931fd`, `80b09b3`, `f8135ea`).

## Daftar Commit Mentah

Keluaran `git log --format='%h %ad %s' --date=short` pada 2026-10-21 (terbaru di atas):

```
1ea78d5 2026-10-21 Tambah brief.md: rencana integrasi login, session, dan database aiclub.id
f8135ea 2026-10-19 Terapkan info resmi event (hadiah, tantangan, tanggal, mitra), logo AIClub/SumoPod/Tencent/WorkBuddy/CodeBuddy, poster, favicon, footer mitra
80b09b3 2026-10-19 Revisi pusat: ganti 6 minggu dengan batas pendaftaran 1 Nov, hapus kartu target peserta
34931fd 2026-10-19 Alur 3 langkah: daftar di portal kita, daftar tim ke Tencent, submit project; indikator langkah kecil di langkah 1
06eeaca 2026-10-19 Satu lamaran aktif per orang, halaman detail tim & grup, link WhatsApp hanya setelah disetujui
a02779b 2026-10-19 Wizard tim: pilih gabung atau buat (eksklusif), tutup/keluar tim untuk pindah, indikator langkah
1118a99 2026-10-19 Halaman login aiclub.id (dummy), lengkapi data wajib sebelum pasar, build ke docs/ untuk GitHub Pages
582836c 2026-10-19 Hapus Apps Script; gabung grup WA utama wajib sebelum pasar tim; lamar per grup tim dengan approve/reject owner; status, aktivitas, timeline
5af017c 2026-10-19 Samakan Apps Script dengan aplikasi: payload flat, WA/LinkedIn, hapus alur pasar tim, pakai active spreadsheet, env VITE_GAS_URL
6bc3c17 2026-10-19 Tambah README, hilangkan fokus ring judul saat load
4bed4b8 2026-10-19 Pecah form pendaftaran jadi React + Vite, hilangkan re-render glitch, ganti akhir ke grup WhatsApp, tambah webhook
```

Catatan: keluaran `git log` hanya memuat 11 commit. Perubahan `vite.config.js` (perbaikan `emptyOutDir`) dan berkas dokumentasi `docs/*.md` belum ada di riwayat per 2026-10-21.
