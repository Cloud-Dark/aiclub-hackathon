# Matriks Keterlacakan Kebutuhan

> Status: Draft
> Terakhir diperbarui: 2026-10-21
> Pemilik: Tim AIClub Hackathon

Dokumen ini menautkan user story ([01_PRD.md](01_PRD.md)), kebutuhan fungsional ([03_FRD.md](03_FRD.md)), dan kebutuhan teknis ([04_TRD.md](04_TRD.md)). Kolom uji merujuk [12_TEST_STRATEGY.md](12_TEST_STRATEGY.md) dan [standards/05_TESTING_STANDARD.md](standards/05_TESTING_STANDARD.md). Status "Ada" berarti sudah berjalan pada prototipe dummy, "Rencana" berarti menunggu integrasi aiclub.id ([../brief.md](../brief.md)).

Pemetaan FR ke TR disusun dari judul dan isi kedua dokumen pada 2026-10-21; perubahan ID di FRD/TRD wajib diikuti pembaruan matriks ini.

## 1. Matriks FR ke US dan TR

| FR | Kebutuhan | User story | TR terkait |
|---|---|---|---|
| FR-001 | Halaman login dummy dengan validasi | US-002 | TR-018 |
| FR-002 | Akun demo satu klik | US-002 | TR-030 |
| FR-003 | Sesi peserta, penanda pengguna, dan logout | _TBD_ | TR-009, TR-011 |
| FR-004 | Login dan session aiclub.id sungguhan | US-002, US-031 | TR-019, TR-020, TR-021, TR-022 |
| FR-005 | Formulir data diri | US-003 | TR-018, TR-050 |
| FR-006 | Validasi data diri | US-004 | TR-018 |
| FR-007 | Prefill dari akun dan penguncian email | US-003 | TR-018 |
| FR-008 | Gerbang kelengkapan data diri | US-004 | TR-012, TR-015 |
| FR-009 | Profil dari aiclub.id dan penulisan balik | US-003, US-031 | TR-026, TR-025 |
| FR-010 | Kuis 6 skenario | US-005 | TR-017 |
| FR-011 | Wajib memilih sebelum lanjut | US-005 | TR-018 |
| FR-012 | Pintasan keyboard di kuis | US-006 | TR-049 |
| FR-013 | Skoring jalur | US-007 | TR-017 |
| FR-014 | Hasil jalur, koreksi, dan jawab ulang | US-007, US-008, US-009 | TR-017, TR-009 |
| FR-015 | Penghitungan ulang jalur resmi di server | US-031 | TR-027 |
| FR-016 | Gabung grup utama dan konfirmasi mandiri | US-010 | TR-033, TR-061 |
| FR-017 | Pesan perkenalan siap kirim | US-011 | TR-033 |
| FR-018 | Gerbang grup utama | US-010 | TR-033, TR-012 |
| FR-019 | Status gabung grup utama di server | _TBD_ | TR-024, TR-025 |
| FR-020 | Layar pilih jalan (gabung atau buat tim) | US-012 | TR-015, TR-016 |
| FR-021 | Aturan eksklusivitas dan jalur pindah di sisi klien | US-013 | TR-015, TR-016 |
| FR-022 | Penegakan aturan eksklusivitas di server | US-013 | TR-024, TR-064 |
| FR-023 | Daftar tim di pasar tim | US-014 | TR-038, TR-063 |
| FR-024 | Penanda kecocokan jalur | US-014 | TR-017 |
| FR-025 | Detail tim | US-015 | TR-063 |
| FR-026 | Lamar, tarik lamaran, dan satu lamaran aktif | US-016 | TR-016, TR-024 |
| FR-027 | Link grup tim terkunci sampai disetujui | US-017, US-034 | TR-063, TR-059 |
| FR-028 | Simulasi keputusan owner (mode demo) | _TBD_ | TR-030, TR-078 |
| FR-029 | Keluar dari tim, tarik semua lamaran | US-018 | TR-016, TR-024 |
| FR-030 | API tim dan lamaran, notifikasi, serta penyembunyian link di server | US-025, US-034 | TR-025, TR-029, TR-063 |
| FR-031 | Form buat tim | US-019 | TR-018, TR-062 |
| FR-032 | Pengelolaan link grup tim oleh owner | US-021 | TR-062, TR-063 |
| FR-033 | Pelamar masuk dan keputusan owner | US-020 | TR-024, TR-064 |
| FR-034 | Undang builder | US-022 | TR-025 |
| FR-035 | Tutup tim | US-023 | TR-024 |
| FR-036 | Dasbor status peserta | US-024 | TR-013, TR-044 |
| FR-037 | Log aktivitas | US-024 | TR-013, TR-028 |
| FR-038 | Penyimpanan tim, pelamar, undangan, dan aktivitas di basis data | US-031 | TR-023, TR-024, TR-076 |
| FR-039 | Tautan ke portal pendaftaran Tencent | US-026 | TR-031, TR-061 |
| FR-040 | Status tim di langkah Tencent | US-026 | TR-031 |
| FR-041 | Pencocokan identitas dengan pendaftar Tencent | _TBD_ | TR-034 |
| FR-042 | Pernyataan project selesai | US-027 | TR-032 |
| FR-043 | Tombol dan tautan submit ke Tencent | US-027 | TR-032, TR-061 |
| FR-044 | Pencatatan flag langkah di server dan gerbang submit | _TBD_ | TR-024, TR-032 |
| FR-045 | Tiga bahasa dengan kunci identik | US-028 | TR-053, TR-058 |
| FR-046 | Pemilihan, deteksi, dan penyimpanan bahasa | _TBD_ | TR-010, TR-054 |
| FR-047 | Fallback kunci dan interpolasi | _TBD_ | TR-055 |
| FR-048 | Metadata dokumen dan pemformatan waktu menurut bahasa | US-028 | TR-056, TR-057 |
| FR-049 | Stepper tiga langkah besar | US-029 | TR-048 |
| FR-050 | Indikator sub-langkah langkah 1 | _TBD_ | TR-048 |
| FR-051 | Navigasi bawah (layar kecil) | _TBD_ | TR-048, TR-051 |
| FR-052 | Tombol Kembali | US-029 | TR-004, TR-046 |
| FR-053 | Persistensi dan pemulihan posisi (as-built) | US-030 | TR-009, TR-012, TR-014 |
| FR-054 | Aksesibilitas navigasi dan umpan balik | US-033 | TR-046, TR-047, TR-051 |
| FR-055 | Aturan perpindahan langkah besar | _TBD_ | TR-015, TR-032, TR-033 |
| FR-056 | Halaman awal dan informasi event | US-001 | TR-045, TR-007 |
| FR-057 | Mitra dan identitas merek | US-001 | TR-007, TR-006 |
| FR-058 | Admin dan ekspor data peserta untuk pengurus | US-032 | TR-068, TR-064 |

## 2. Matriks US ke FR

| US | FR |
|---|---|
| US-001 | FR-056, FR-057 |
| US-002 | FR-001, FR-002, FR-004 |
| US-003 | FR-005, FR-007, FR-009 |
| US-004 | FR-006, FR-008 |
| US-005 | FR-010, FR-011 |
| US-006 | FR-012 |
| US-007 | FR-013, FR-014 |
| US-008 | FR-014 |
| US-009 | FR-014 |
| US-010 | FR-016, FR-018 |
| US-011 | FR-017 |
| US-012 | FR-020 |
| US-013 | FR-021, FR-022 |
| US-014 | FR-023, FR-024 |
| US-015 | FR-025 |
| US-016 | FR-026 |
| US-017 | FR-027 |
| US-018 | FR-029 |
| US-019 | FR-031 |
| US-020 | FR-033 |
| US-021 | FR-032 |
| US-022 | FR-034 |
| US-023 | FR-035 |
| US-024 | FR-036, FR-037 |
| US-025 | FR-030 |
| US-026 | FR-039, FR-040 |
| US-027 | FR-042, FR-043 |
| US-028 | FR-045, FR-048 |
| US-029 | FR-049, FR-052 |
| US-030 | FR-053 |
| US-031 | FR-004, FR-009, FR-015, FR-038 |
| US-032 | FR-058 |
| US-033 | FR-054 |
| US-034 | FR-027, FR-030 |

## 3. Matriks TR ke FR

TR tanpa FR adalah kebutuhan non-fungsional (platform, performa, keamanan, operasi).

| TR | Kebutuhan teknis | FR terkait |
|---|---|---|
| TR-001 | SPA React 18 + Vite 5 (As-built) | Non-fungsional |
| TR-002 | Dependensi runtime minimal (As-built) | Non-fungsional |
| TR-003 | Konfigurasi build untuk sub-path (As-built) | Non-fungsional |
| TR-004 | Tanpa router; navigasi lewat state layar (As-built) | FR-052 |
| TR-005 | CSS tunggal tanpa framework (As-built) | Non-fungsional |
| TR-006 | Font eksternal Google Fonts (As-built) | FR-057 |
| TR-007 | Aset brand statis (As-built) | FR-056, FR-057 |
| TR-008 | State aplikasi tunggal di komponen App (As-built) | Non-fungsional |
| TR-009 | Persistensi `hk_state` lewat daftar `PERSIST` (As-built) | FR-003, FR-014, FR-053 |
| TR-010 | Preferensi bahasa `hk_lang` (As-built) | FR-046 |
| TR-011 | Akses `localStorage` aman gagal (As-built) | FR-003 |
| TR-012 | Pemulihan layar saat rehidrasi (As-built) | FR-008, FR-018, FR-053 |
| TR-013 | Log aktivitas lokal berbatas (As-built) | FR-036, FR-037 |
| TR-014 | Ganti persistensi klien menjadi hanya preferensi (Rencana) | FR-053 |
| TR-015 | Aturan satu orang satu tim (As-built, sisi klien) | FR-008, FR-020, FR-021, FR-055 |
| TR-016 | Satu lamaran aktif per orang (As-built, sisi klien) | FR-020, FR-021, FR-026, FR-029 |
| TR-017 | Perhitungan jalur peran deterministik (As-built) | FR-010, FR-013, FR-014, FR-024 |
| TR-018 | Validasi input di klien (As-built) | FR-001, FR-005, FR-006, FR-007, FR-011, FR-031 |
| TR-019 | Login memakai session aiclub.id (Rencana) | FR-004 |
| TR-020 | Atribut cookie session (Rencana) | FR-004 |
| TR-021 | Klien API `src/lib/api.js` (Rencana) | FR-004 |
| TR-022 | BFF Cloudflare (Rencana) | FR-004 |
| TR-023 | Akses database D1 (Rencana) | FR-038 |
| TR-024 | Aturan bisnis ditegakkan server dan constraint DB (Rencana) | FR-019, FR-022, FR-026, FR-029, FR-033, FR-035, FR-038, FR-044 |
| TR-025 | Kontrak endpoint (Rencana) | FR-009, FR-019, FR-030, FR-034 |
| TR-026 | Pembacaan profil dari aiclub.id (Rencana) | FR-009 |
| TR-027 | Skor jalur resmi dihitung ulang server (Rencana) | FR-015 |
| TR-028 | Pengganti `log` dengan `hackathon_activity` (Rencana) | FR-037 |
| TR-029 | Notifikasi ke owner (Rencana) | FR-030 |
| TR-030 | Pembersihan data dummy (Rencana) | FR-002, FR-028 |
| TR-031 | Tautan portal Tencent lewat short link aiclub.id (As-built) | FR-039, FR-040 |
| TR-032 | Gerbang tombol submit (As-built, sisi klien) | FR-042, FR-043, FR-044, FR-055 |
| TR-033 | Grup WhatsApp utama wajib (As-built, sisi klien) | FR-016, FR-017, FR-018, FR-055 |
| TR-034 | Pencocokan identitas Tencent (Rencana, `_TBD_`) | FR-041 |
| TR-035 | Tidak ada backend pada versi sekarang (As-built) | Non-fungsional |
| TR-036 | GitHub Pages tidak cocok untuk produksi terintegrasi (Rencana) | Non-fungsional |
| TR-037 | Batas waktu proyek (As-built sebagai fakta jadwal) | Non-fungsional |
| TR-038 | Pembatasan skala data klien (As-built) | FR-023 |
| TR-039 | Peramban yang didukung (Rencana, `_TBD_`) | Non-fungsional |
| TR-040 | Ukuran bundel (As-built, pengukuran 2026-10-21) | Non-fungsional |
| TR-041 | Tanpa pemecahan kode dan pemuatan malas (As-built) | Non-fungsional |
| TR-042 | Render dan interaksi (As-built) | Non-fungsional |
| TR-043 | Anggaran latensi API (Rencana, usulan) | Non-fungsional |
| TR-044 | Keadaan memuat, kosong, dan gagal (Rencana) | FR-036 |
| TR-045 | Bahasa dokumen dan judul (As-built) | FR-056 |
| TR-046 | Manajemen fokus saat pindah layar (As-built) | FR-052, FR-054 |
| TR-047 | Wilayah live dan toast (As-built) | FR-054 |
| TR-048 | Navigasi langkah (As-built) | FR-049, FR-050, FR-051 |
| TR-049 | Pintasan keyboard kuis (As-built) | FR-012 |
| TR-050 | Formulir yang dapat diakses (As-built) | FR-005 |
| TR-051 | Gerak berkurang dan ikon dekoratif (As-built) | FR-051, FR-054 |
| TR-052 | Audit aksesibilitas formal (Rencana, `_TBD_`) | Non-fungsional |
| TR-053 | Tiga bahasa (As-built) | FR-045 |
| TR-054 | Deteksi bahasa (As-built) | FR-046 |
| TR-055 | Fallback kunci dan interpolasi (As-built) | FR-047 |
| TR-056 | Format waktu per lokal (As-built) | FR-048 |
| TR-057 | Font untuk aksara Mandarin (As-built) | FR-048 |
| TR-058 | Paritas kamus otomatis (Rencana) | FR-045 |
| TR-059 | Tidak ada rahasia di bundel klien (As-built, wajib dipertahankan) | FR-027 |
| TR-060 | Pencegahan XSS (As-built) | Non-fungsional |
| TR-061 | Tautan keluar aman (As-built) | FR-016, FR-039, FR-043 |
| TR-062 | Validasi skema tautan WhatsApp (As-built klien, Rencana server) | FR-031, FR-032 |
| TR-063 | Kontrol akses `wa_link` (Rencana) | FR-023, FR-025, FR-027, FR-030, FR-032 |
| TR-064 | Otorisasi dan kode status (Rencana) | FR-022, FR-033, FR-058 |
| TR-065 | Perlindungan CSRF dan CORS (Rencana) | Non-fungsional |
| TR-066 | Pembatasan laju dan pencegahan penyalahgunaan (Rencana, `_TBD_`) | Non-fungsional |
| TR-067 | Header keamanan (Rencana) | Non-fungsional |
| TR-068 | Privasi data pribadi (Rencana) | FR-058 |
| TR-069 | Penanganan galat tanpa kebocoran (Rencana) | Non-fungsional |
| TR-070 | Log dan retensi (Rencana, `_TBD_`) | Non-fungsional |
| TR-071 | Deploy GitHub Pages dari `docs/` (As-built) | Non-fungsional |
| TR-072 | Prosedur rilis manual (As-built) | Non-fungsional |
| TR-073 | Pemisahan dokumentasi dan hasil build (As-built) | Non-fungsional |
| TR-074 | Lingkungan dan variabel konfigurasi (Rencana) | Non-fungsional |
| TR-075 | Pipeline CI/CD (Rencana, `_TBD_`) | Non-fungsional |
| TR-076 | Migrasi basis data (Rencana) | FR-038 |
| TR-077 | Pemantauan dan rollback (Rencana, `_TBD_`) | Non-fungsional |
| TR-078 | Penghentian versi dummy (Rencana) | FR-028 |

## 4. Ringkasan

- FR: 58; US: 34; TR: 78.
- FR tanpa US: FR-003, FR-019, FR-028, FR-041, FR-044, FR-046, FR-047, FR-050, FR-051, FR-055.
- TR tanpa FR (non-fungsional): 26.
- Cara memelihara: tambah baris saat FR/TR baru terbit; jangan menomori ulang ID yang sudah ada.
