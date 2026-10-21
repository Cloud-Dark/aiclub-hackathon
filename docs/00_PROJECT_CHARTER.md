# Project Charter: Portal Pendaftaran AI Agent Hackathon

> Status: Draft
> Terakhir diperbarui: 2026-10-21
> Pemilik: Tim AIClub Hackathon

## 1. Ringkasan

Portal Pendaftaran AI Agent Hackathon adalah aplikasi web statis (React 18 + Vite 5) yang memandu calon peserta Tencent Cloud Hackathon Indonesia 2026 (kolaborasi Tencent Cloud dan aiclub.id) melalui tiga langkah: (1) mendaftar di portal ini, (2) mendaftarkan tim di portal Tencent, (3) mengirim project ke Tencent.

Kondisi saat ini (**as-built**): seluruh data bersifat dummy dan disimpan di `localStorage` peramban masing-masing peserta (kunci `hk_state` dan `hk_lang`). Tidak ada backend, tidak ada login sungguhan, dan tidak ada basis data bersama. Demo publik: <https://cloud-dark.github.io/aiclub-hackathon/>.

Kondisi yang direncanakan (**rencana integrasi**): portal menjadi bagian ekosistem aiclub.id dengan login dan session aiclub.id, serta data tersimpan di basis data aiclub.id. Rencana ini masih berstatus draf diskusi dan bergantung pada jawaban pengelola aiclub.id (lihat [../brief.md](../brief.md) bagian 8).

Dokumen terkait: [01_PRD.md](01_PRD.md), [02_BRD.md](02_BRD.md), [03_FRD.md](03_FRD.md), [04_TRD.md](04_TRD.md), [05_ARCHITECTURE.md](05_ARCHITECTURE.md), [06_IMPLEMENTATION_PLAN.md](06_IMPLEMENTATION_PLAN.md), [08_ROADMAP.md](08_ROADMAP.md), [10_RISK_REGISTER.md](10_RISK_REGISTER.md), [11_DECISIONS.md](11_DECISIONS.md), [13_GLOSSARY.md](13_GLOSSARY.md).

## 2. Visi

Setiap peserta yang berminat pada AI Agent Hackathon dapat mendaftar secara mandiri (tanpa harus membawa tim), mengetahui jalur peran yang paling sesuai, lalu menemukan atau membentuk tim dengan alur yang jelas, adil, dan tidak membingungkan, sampai tim terdaftar dan karya terkirim ke portal Tencent sebelum batas waktu.

## 3. Tujuan

### 3.1 Tujuan produk (berlaku untuk as-built)

| ID | Tujuan | Indikator keberhasilan (terukur dari perilaku aplikasi) |
|---|---|---|
| G-01 | Pendaftaran peserta individu yang singkat | Peserta menyelesaikan data diri dan 6 skenario dalam satu sesi (estimasi teks UI: "4 menit"). |
| G-02 | Pemetaan peran peserta yang bermakna | Setiap peserta mendapat jalur utama dan jalur kedua dari 8 jalur (CEO, CTO, AI, PM, DSG, GRW, DOM, DAT) dan dapat mengoreksinya. |
| G-03 | Pembentukan tim yang tertib | Aturan "satu orang satu tim" dan "satu lamaran aktif" ditegakkan oleh antarmuka. |
| G-04 | Koordinasi lewat WhatsApp | Peserta bergabung ke grup utama (wajib) dan ke grup tim setelah disetujui owner. |
| G-05 | Alur tiga langkah yang tidak memutus | Peserta dapat menuju portal Tencent (daftar tim dan submit) lewat tautan resmi `aiclub.id/l/...`. |
| G-06 | Pengalaman multibahasa | Seluruh antarmuka tersedia dalam Bahasa Indonesia, Inggris, dan Mandarin (Sederhana). |

### 3.2 Tujuan integrasi (rencana, dari [../brief.md](../brief.md))

| ID | Tujuan | Status |
|---|---|---|
| G-07 | Login dan session memakai akun aiclub.id; tidak ada sistem login terpisah | Rencana |
| G-08 | Semua data (profil, jawaban skenario, tim, lamaran, aktivitas) memakai basis data aiclub.id | Rencana |
| G-09 | Satu identitas (`memberId`) untuk semua sistem, tanpa input ulang data profil | Rencana |
| G-10 | Aturan bisnis ditegakkan di server dan constraint basis data, tidak hanya di klien | Rencana |
| G-11 | Link grup WhatsApp tim hanya dikirim server kepada owner dan pelamar berstatus disetujui | Rencana |
| G-12 | Fase 1 sampai 3 integrasi selesai sebelum pendaftaran ditutup 1 November 2026 | Rencana (risiko tinggi, lihat [10_RISK_REGISTER.md](10_RISK_REGISTER.md)) |

## 4. Ruang lingkup

### 4.1 Dalam lingkup (in scope)

**As-built (sudah ada, dummy):**

1. Halaman awal berisi poster, total hadiah, tanggal penting, dan 3 tantangan (`src/components/Intro.jsx`, `EventInfo.jsx`).
2. Login dummy (email + sandi bebas atau 3 akun demo) (`Login.jsx`, `DUMMY_USERS`).
3. Data diri: nama, kota (wajib), email, WhatsApp (wajib), LinkedIn (opsional), latar (`Identity.jsx`).
4. Kuis 6 skenario, skoring 8 jalur, hasil, koreksi jalur, jawab ulang (`Quiz.jsx`, `Result.jsx`, `lib/scoring.js`).
5. Grup WhatsApp utama (wajib) dan pesan perkenalan siap kirim (`Group.jsx`).
6. Pilih jalan: gabung tim atau buat tim, dengan aturan eksklusivitas (`Choose.jsx`, `lib/rules.js`).
7. Pasar tim, detail tim, lamaran (satu aktif), link grup terkunci sampai disetujui (`Market.jsx`, `TeamDetail.jsx`).
8. Buat tim, dasbor owner (pelamar, undang builder, link grup, tutup tim) (`Create.jsx`, `MyTeam.jsx`).
9. Dasbor status (grup utama, lamaran, aktivitas, timeline, hadiah, tantangan) (`Dash.jsx`).
10. Langkah Tencent dan Submit berupa tautan keluar ke `aiclub.id/l/...` (`Tencent.jsx`, `Submit.jsx`).
11. i18n tiga bahasa, stepper, indikator sub-langkah, navigasi bawah (`src/i18n/*`, `Chrome.jsx`, `Widgets.jsx`).
12. Build statis ke `docs/` untuk GitHub Pages.

**Rencana (integrasi aiclub.id):**

1. Login/OAuth atau cookie session aiclub.id, endpoint `GET/PATCH /api/hackathon/me`, logout.
2. Tabel `hackathon_participant`, `hackathon_team`, `hackathon_application`, `hackathon_invite`, `hackathon_activity` (usulan, lihat [20_DATABASE.md](20_DATABASE.md)).
3. API tim, lamaran, undangan, builder; penegakan aturan bisnis di server.
4. Penghapusan data dummy (`DUMMY_USERS`, `TIM`, `BUILDER`, `SEED_APPLICANTS`, `CONFIG.demoOwner`).
5. Hosting di subdomain aiclub.id (mis. `hackathon.aiclub.id`; nama final _TBD_).
6. Halaman admin atau ekspor CSV untuk pengurus (opsional, fase 5).

### 4.2 Di luar lingkup (out of scope)

| Butir | Keterangan |
|---|---|
| Portal pendaftaran tim dan submit milik Tencent | Tetap di sisi Tencent, diakses lewat tautan `aiclub.id/l/O3Sa9yF` dan `aiclub.id/l/9k54mLk`. Portal ini tidak menerima data balik dari Tencent. |
| Perubahan alur 3 langkah, isi event, atau tampilan | Dinyatakan di luar cakupan integrasi pada [../brief.md](../brief.md) bagian 1. |
| Penilaian juri, penentuan finalis, pengumuman pemenang | Dilakukan penyelenggara di luar portal. |
| Pembuatan dan administrasi grup WhatsApp | Grup dibuat manual oleh pengelola (grup utama) dan owner tim (grup tim); portal hanya menyimpan dan menampilkan tautan. |
| Verifikasi bahwa peserta benar-benar telah masuk grup WhatsApp, mendaftar, atau submit di Tencent | Tidak ada data balik; portal hanya mencatat klik atau centang mandiri. |
| Pengiriman email atau notifikasi push | Tidak ada pada as-built; notifikasi ke owner tercantum sebagai kebutuhan integrasi di brief (bentuk _TBD_). |
| Pembayaran | Event gratis ("gratis" pada teks UI); tidak ada fitur pembayaran. |
| Aplikasi mobile native | Hanya web responsif. |

## 5. Pemangku kepentingan

| Pemangku kepentingan | Peran | Kepentingan |
|---|---|---|
| aiclub.id (komunitas) | Penyelenggara bersama, pemilik ekosistem tempat portal akan terintegrasi | Pendaftaran tertib, data peserta terpusat, pengalaman satu identitas |
| Tencent Cloud Indonesia | Penyelenggara bersama, pemilik portal pendaftaran tim dan submit | Jumlah tim terdaftar dan karya masuk |
| SumoPod, WorkBuddy, CodeBuddy | Mitra event (tampil di footer) | Eksposur mitra, penggunaan WorkBuddy oleh peserta |
| Peserta (individu) | Pengguna utama | Daftar cepat, tahu peran, menemukan tim |
| Owner tim (peserta yang membuka tim) | Pengguna dengan hak mengelola tim | Merekrut anggota yang sesuai, mengelola pelamar |
| Pengurus aiclub.id (pusat dan kota) | Pengelola dan pengawas data peserta | Pemantauan pendaftar; kebutuhan ekspor/admin (_TBD_, brief 8.7) |
| Tim pengembang portal | Membangun dan memelihara | Kejelasan kebutuhan dan batasan integrasi |
| Juri hackathon | Menilai karya di luar portal | _TBD_ (tidak ada interaksi dengan portal) |
| Pemilik produk / sponsor internal | Menyetujui dokumen dan anggaran | _TBD_ (nama tidak tercantum di repo) |

Matriks RACI rinci: _TBD_.

## 6. Ringkasan event (sumber: `src/i18n/id.js`, `README.md`)

| Butir | Nilai |
|---|---|
| Nama event | Tencent Cloud Hackathon Indonesia 2026 |
| Tagline | "Bangun AI agent yang beneran bantu kerja, bukan cuma bisa ngobrol, pakai WorkBuddy." |
| Total hadiah | USD 3.100 (Juara 1 USD 1.800; Juara 2 USD 800; Juara 3 USD 500) |
| Tantangan (pilih 1 dari 3) | The Workplace Brain (Learn Anywhere); The Office Agent (Automate Better); The Creator Agent (Create Bolder) |
| Pendaftaran dibuka | 15 Oktober 2026 |
| Batas pendaftaran dan pengumpulan karya | 1 November 2026, 23.59 WIB |
| Pengumuman finalis | 14 November 2026 |
| Demo Day dan Awarding | 27 November 2026, 13.00 sampai 16.00 WIB, Jakarta (lokasi detail menyusul) |
| Sumber data resmi | <https://aiclub.id/event/tencent-cloud-hackathon-2026> |

Catatan: tahun pada tanggal diturunkan dari nama event ("2026"); teks UI hanya menampilkan tanggal dan bulan.

## 7. Asumsi dan batasan

1. Portal as-built hanya demo: tidak boleh dipakai sebagai sumber data resmi peserta.
2. Sampai integrasi selesai, data tiap peserta hanya ada di peramban masing-masing; ganti peramban atau perangkat berarti data hilang.
3. Integrasi tidak dapat diselesaikan dari sisi repo ini saja; memerlukan penyediaan login, akses basis data, dan tabel hackathon oleh pengelola aiclub.id ([../brief.md](../brief.md) bagian 3 dan 8).
4. GitHub Pages (`cloud-dark.github.io`) tidak dapat berbagi cookie dengan `aiclub.id`, sehingga tidak cocok untuk versi produksi.
5. Batas waktu keras: pendaftaran ditutup 1 November 2026, 23.59 WIB.

## 8. Kriteria sukses

### 8.1 Untuk as-built (demo)

| ID | Kriteria | Cara verifikasi |
|---|---|---|
| S-01 | Peserta dapat menyelesaikan alur Login, Data diri, 6 skenario, Hasil, Grup utama, Pilih jalan, Pasar/Buat tim, Status, Tencent, Submit tanpa galat | Uji manual alur lengkap ([12_TEST_STRATEGY.md](12_TEST_STRATEGY.md)) |
| S-02 | Aturan eksklusivitas (anggota atau owner, satu lamaran aktif) tidak dapat dilanggar lewat antarmuka | Uji skenario di [03_FRD.md](03_FRD.md) FR-021, FR-026 |
| S-03 | Link grup WhatsApp tim tidak tampil sebelum lamaran disetujui | FR-027 |
| S-04 | Tombol submit Tencent tidak aktif sebelum peserta mencentang bahwa project selesai | FR-043 |
| S-05 | Tiga bahasa menampilkan seluruh teks tanpa kunci hilang (428 kunci identik pada id, en, zh) | FR-045 |
| S-06 | `npm run build` menghasilkan keluaran statis di `docs/` yang berjalan di sub-path GitHub Pages | [18_INSTALLATION.md](18_INSTALLATION.md) |

### 8.2 Untuk integrasi (dari brief bagian 10)

| ID | Kriteria |
|---|---|
| S-07 | Tidak ada sistem login terpisah; session sama dengan aiclub.id; logout berlaku di kedua sisi |
| S-08 | Tidak ada data dummy di bundel produksi; `localStorage` hanya berisi preferensi (bahasa, layar terakhir) |
| S-09 | Aturan satu orang satu tim dan satu lamaran aktif tidak dapat dilanggar dengan memanggil API langsung (teruji) |
| S-10 | Link grup WhatsApp tim tidak muncul di respons API untuk pengguna yang belum disetujui |
| S-11 | Endpoint tanpa session mengembalikan 401; owner lain tidak dapat memutuskan lamaran tim orang lain (403) |
| S-12 | Data peserta hanya dapat diekspor pengurus berwenang; nomor WhatsApp tidak bocor ke peserta lain |

Target kuantitatif (jumlah pendaftar, jumlah tim terbentuk, persentase penyelesaian): _TBD_. Lihat metrik di [01_PRD.md](01_PRD.md) bagian 8.

## 9. Tonggak (milestone)

| Tonggak | Tanggal | Status |
|---|---|---|
| Portal as-built (dummy) dipublikasikan di GitHub Pages | sebelum 2026-10-21 | Selesai (menurut `README.md`) |
| Brief integrasi aiclub.id (draf) | sebelum 2026-10-21 | Selesai (draf, [../brief.md](../brief.md)) |
| Fase 0: keputusan opsi login dan akses DB | _TBD_ | Menunggu pengelola aiclub.id |
| Fase 1 sampai 3: auth, data peserta, tim dan lamaran | paling lambat 2026-11-01 | Rencana |
| Fase 4: pembersihan dan domain produksi | _TBD_ | Rencana |
| Fase 5: admin/ekspor (opsional) | _TBD_ | Rencana |

Detail jadwal: [06_IMPLEMENTATION_PLAN.md](06_IMPLEMENTATION_PLAN.md) dan [08_ROADMAP.md](08_ROADMAP.md).

## 10. Risiko utama

Daftar lengkap ada di [10_RISK_REGISTER.md](10_RISK_REGISTER.md). Ringkasan dari [../brief.md](../brief.md) bagian 11:

1. Tanpa provider login atau akses basis data dari aiclub.id, integrasi tertahan (risiko terbesar).
2. Cookie lintas domain gagal bila portal tetap di `github.io`.
3. Race condition lamaran ganda bila hanya dicek di klien.
4. Data pribadi (WhatsApp, kota) memerlukan dasar persetujuan dan tidak boleh tampil di daftar publik ([14_SECURITY_THREAT_MODEL.md](14_SECURITY_THREAT_MODEL.md)).
5. Batas waktu 1 November 2026 yang ketat.

## 11. Tata kelola dokumen

Keputusan arsitektur dan produk dicatat di [11_DECISIONS.md](11_DECISIONS.md); perubahan versi di [31_CHANGELOG.md](31_CHANGELOG.md); istilah di [13_GLOSSARY.md](13_GLOSSARY.md); keterlacakan kebutuhan di [19_REQUIREMENTS_TRACEABILITY.md](19_REQUIREMENTS_TRACEABILITY.md).
