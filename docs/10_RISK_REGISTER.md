# Register Risiko

> Status: Draft
> Terakhir diperbarui: 2026-10-21
> Pemilik: Tim AIClub Hackathon

Dokumen ini mencatat risiko proyek integrasi portal dengan aiclub.id. Sumber: [../brief.md](../brief.md) bagian 11 dan tinjauan kode (`src/App.jsx`, `src/data.js`, `src/lib/rules.js`, `src/lib/team.js`, `src/components/TeamRoom.jsx`, `src/components/Announcements.jsx`, `vite.config.js`). Rencana kerja: [06_IMPLEMENTATION_PLAN.md](06_IMPLEMENTATION_PLAN.md). Keputusan terkait: [11_DECISIONS.md](11_DECISIONS.md).

Skala: Likelihood dan Impact bernilai Rendah, Sedang, atau Tinggi. Nilai adalah penilaian awal per 2026-10-21 dan perlu ditinjau ulang setelah Fase 0. Nama pemilik perorangan: _TBD_; kolom Owner memuat peran.

## 1. Tabel Risiko

| ID | Risiko | Sumber | Likelihood | Impact | Mitigasi | Owner | Status |
|---|---|---|---|---|---|---|---|
| R1 | Tanpa provider login atau akses DB dari aiclub.id, integrasi tertahan (pertanyaan brief 8.1 sampai 8.3). Risiko terbesar. | brief 11 | Sedang | Tinggi | Selesaikan Fase 0 lebih dulu; ajukan daftar pertanyaan bagian 8 ke pengelola aiclub.id; siapkan opsi A, B, C agar keputusan cepat; pertahankan prototipe dummy sebagai cadangan | Pengelola aiclub.id + Tim AIClub Hackathon | Terbuka |
| R2 | Cookie session lintas domain gagal bila portal tetap di `github.io` (`cloud-dark.github.io`) karena tidak bisa berbagi cookie dengan aiclub.id | brief 4 dan 11 | Tinggi (bila tetap di Pages) | Tinggi | Pindahkan portal ke subdomain `*.aiclub.id` (`Domain=.aiclub.id`, `HttpOnly`, `Secure`, `SameSite=Lax`); atau pakai OAuth (opsi B); Pages hanya untuk demo dummy | Tim AIClub Hackathon | Terbuka |
| R3 | Race condition lamaran ganda bila aturan hanya dicek di klien (`activeApp`/`canApply` di `src/lib/rules.js`) | brief 11 | Sedang | Tinggi | Indeks unik parsial `one_active_app`, transaksi saat persetujuan, uji lamaran bersamaan, respons terstruktur saat constraint dilanggar | Tim AIClub Hackathon | Terbuka |
| R4 | Data pribadi (WhatsApp, kota) tanpa dasar persetujuan, atau tampil di daftar publik | brief 8.5 dan 11 | Sedang | Tinggi | Konfirmasi dasar persetujuan dengan pengelola; layar persetujuan bila perlu; `GET /teams` tanpa data pribadi; ekspor hanya untuk peran berwenang | Pengelola aiclub.id + Tim AIClub Hackathon | Terbuka |
| R5 | Batas waktu: pendaftaran ditutup 1 Nov 2026 (23.59 WIB, `src/i18n/id.js`), Fase 1 sampai 3 mungkin belum selesai | brief 11 | Tinggi | Sedang | Prioritaskan Fase 1 sampai 3; potong lingkup (Fase 5 opsional); bila terlambat, periode berjalan tetap di prototipe dummy dan integrasi untuk tahap berikutnya (keputusan: _TBD_) | Tim AIClub Hackathon | Terbuka |
| R6 | State klien bisa dimanipulasi: seluruh status (`apps`, `myTeam`, `joinedMain`, `projectReady`) ada di `localStorage` `hk_state` dan bisa diubah lewat DevTools | Kode `App.jsx` (`PERSIST`) | Tinggi (saat ini) | Sedang (prototipe) hingga Tinggi (produksi) | Pindahkan kebenaran ke server (Fase 2 dan 3); `localStorage` hanya preferensi; validasi semua input di server | Tim AIClub Hackathon | Terbuka |
| R7 | Link grup WhatsApp tim bocor: `TIM[].wa` ikut di bundel JS statis sehingga siapa pun bisa membacanya tanpa persetujuan owner; pada versi produksi, `wa_link` bisa bocor lewat respons daftar bila salah dirancang | `src/data.js`, brief 5.3 butir 4 | Tinggi (dummy) / Sedang (produksi) | Sedang | Kirim `wa_link` hanya untuk owner dan pelamar `approved`; daftar publik tanpa `wa_link`; tes respons API; hapus `TIM` dari bundel (Fase 4) | Tim AIClub Hackathon | Terbuka |
| R8 | Aturan satu orang satu tim dan satu lamaran aktif bisa dilanggar dengan memanggil API langsung | brief 5.3 | Tinggi (tanpa constraint) | Tinggi | `owner_id UNIQUE`, indeks `one_active_app`, pemeriksaan server, tes API tanpa UI | Tim AIClub Hackathon | Terbuka |
| R9 | Owner lain memutuskan lamaran tim orang lain (otorisasi tidak memadai) | brief 10 | Sedang | Tinggi | Periksa kepemilikan tim pada `decide`, kembalikan `403`, uji otorisasi | Tim AIClub Hackathon | Terbuka |
| R10 | Kunci pengurus `/agent/*` terpapar di bundel klien | brief 4 butir 3 | Rendah | Tinggi | Jangan pernah memakai key pengurus di klien; tidak ada rahasia di variabel `VITE_*`; tinjau bundel sebelum rilis | Tim AIClub Hackathon | Terbuka |
| R11 | `emptyOutDir` bawaan Vite menghapus seluruh `docs/` (termasuk dokumentasi `.md`) setiap `npm run build` karena `outDir` = `docs` | `vite.config.js` | Tinggi (sebelum perbaikan) | Sedang | Diperbaiki 2026-10-21 (Alya): `emptyOutDir: false` dan plugin `clean-docs-assets` yang hanya menghapus `docs/assets`. Pantau: file lama di `docs/` selain `assets` tidak ikut dibersihkan; bila `docs/` dipakai bersama hasil build dan dokumen, hindari berkas `.md` dengan nama bentrok. Tinjau ulang saat build produksi dipindah | Tim AIClub Hackathon | Tertangani (2026-10-21) |
| R12 | Hasil build `docs/` harus di-commit manual; lupa menjalankan `npm run build` membuat Pages tertinggal dari kode | README.md | Sedang | Rendah | Tambahkan langkah build ke checklist rilis; pertimbangkan CI (_TBD_) | Tim AIClub Hackathon | Terbuka |
| R13 | Skor jalur resmi hanya dihitung di klien (`scoring.js`) sehingga dapat dimanipulasi | brief 6 | Sedang | Rendah | Hitung ulang jalur di server dari `jawaban` (Fase 2) | Tim AIClub Hackathon | Terbuka |
| R14 | Identitas peserta aiclub.id tidak dapat dicocokkan dengan pendaftar portal Tencent (link `aiclub.id/l/...` hanya short link tanpa data balik) | brief 8.6 | Sedang | Sedang | Putuskan di Fase 0 apakah pencocokan lewat email atau `memberId` diperlukan; bila ya, minta mekanisme dari Tencent/pengelola | Pengelola aiclub.id + Tim AIClub Hackathon | Terbuka |
| R15 | Lokasi dan detail Demo Day belum final (`event.venue`: "lokasi detail menyusul") sehingga teks portal bisa usang | `src/i18n/id.js` | Sedang | Rendah | Perbarui i18n id/en/zh saat info tersedia | Tim AIClub Hackathon | Terbuka |
| R16 | Peran admin tidak ditentukan sehingga data peserta (termasuk WA) dapat dilihat pihak yang tidak berwenang | brief 8.7 | Sedang | Tinggi | Tetapkan peran di Fase 0; otorisasi endpoint admin; ekspor hanya peran berwenang | Pengelola aiclub.id | Terbuka |
| R17 | Kontak anggota (WA, email, LinkedIn, GitHub) di ruang tim bocor ke non-anggota, atau dibagikan tanpa persetujuan peserta | Kode `TeamRoom.jsx`, `src/lib/team.js`, `ANGGOTA`; [../brief.md](../brief.md) | Sedang | Tinggi | Mode demo hanya memakai kontak contoh (`contoh.id`); target: kontak dikirim server hanya ke owner dan anggota disetujui, dasar persetujuan dipastikan (brief 8.5), kontak dicabut saat keluar atau tim ditutup | Tim AIClub Hackathon | Terbuka |
| R18 | Spam atau penyalahgunaan chat tim, termasuk pesan berisi data pribadi | Kode `TeamRoom.jsx` (FR-066) | Sedang | Sedang | Sekarang: chat hanya lokal, maks 1000 karakter, 200 pesan per tim. Target: rate limit, akses hanya anggota, moderasi dan pelaporan (_TBD_), masa simpan pesan, imbauan tidak membagikan data sensitif | Tim AIClub Hackathon | Terbuka |
| R19 | Hitungan tayangan pengumuman dapat dimanipulasi atau menyesatkan (mode demo memakai angka contoh) | Kode `Announcements.jsx` (`annViews`) | Tinggi (dummy) / Rendah (produksi) | Rendah | Catatan mode demo tampil di layar; target: tayangan unik per akun dihitung server | Tim AIClub Hackathon | Terbuka |
| R20 | Penolakan otomatis 24 jam hanya berjalan di klien (jam perangkat, aplikasi harus terbuka) sehingga tidak konsisten antarperangkat dan dapat diakali; tanpa server, owner nyata tidak menerima lamaran sehingga lamaran tetap kedaluwarsa | Kode `rules.js` (`expirePending`), `App.jsx` | Tinggi (dummy) | Sedang | Jalankan kedaluwarsa di server dengan waktu server; notifikasi owner (FR-030) agar keputusan tidak terlewat; endpoint keputusan menolak lamaran yang tidak `pending` | Tim AIClub Hackathon | Terbuka |

## 2. Peta Singkat

| Impact \ Likelihood | Rendah | Sedang | Tinggi |
|---|---|---|---|
| Tinggi | R10 | R1, R3, R4, R9, R16, R17 | R2, R8 |
| Sedang | - | R7, R14, R18, R11 (setelah perbaikan: rendah) | R5, R6, R20 |
| Rendah | - | R12, R13, R15 | R19 |

Pemetaan menggunakan nilai pada tabel; perbedaan kecil (mis. R6 dan R7 yang bergantung konteks dummy atau produksi) dijelaskan di kolom Likelihood.

## 3. Proses Tinjauan

1. Tinjau register setelah Fase 0 selesai dan setiap akhir fase.
2. Risiko yang tertangani diberi tanggal dan tautan ke perubahan atau keputusan di [11_DECISIONS.md](11_DECISIONS.md).
3. Risiko baru ditambahkan dengan ID berurutan.
