# Business Requirements Document (BRD)

> Status: Draft
> Terakhir diperbarui: 2026-10-21
> Pemilik: Tim AIClub Hackathon

Dokumen ini menjelaskan kebutuhan bisnis di balik Portal Pendaftaran AI Agent Hackathon: mengapa portal diperlukan, apa nilainya, dampaknya, dan batasan bisnis yang berlaku. Konteks umum ada di [00_PROJECT_CHARTER.md](00_PROJECT_CHARTER.md); kebutuhan produk di [01_PRD.md](01_PRD.md); kebutuhan fungsional di [03_FRD.md](03_FRD.md); rencana integrasi di [../brief.md](../brief.md).

Fakta yang tidak tercantum di kode, `README.md`, atau `brief.md` ditulis `_TBD_` dan tidak diasumsikan.

## 1. Latar belakang bisnis

AIClub.id adalah komunitas AI di Indonesia (memiliki konsep anggota dengan `memberId`, peran pengurus kota dan pusat, event, registrasi, dan tautan pendek `aiclub.id/l/...`; sumber: [../brief.md](../brief.md) bagian 3). Bersama Tencent Cloud Indonesia, aiclub.id menyelenggarakan **Tencent Cloud Hackathon Indonesia 2026**: peserta membangun AI agent dengan WorkBuddy untuk satu dari tiga tantangan (The Workplace Brain, The Office Agent, The Creator Agent). Event gratis, total hadiah USD 2.500, mitra: Tencent Cloud, SumoPod, WorkBuddy, CodeBuddy.

Penyelenggara menetapkan alur tiga langkah: (1) daftar di portal aiclub.id (portal ini), (2) daftarkan tim di portal Tencent, (3) submit project ke Tencent. Portal ini mengisi celah antara minat perorangan dan terbentuknya tim yang siap didaftarkan.

## 2. Kebutuhan bisnis

| ID | Kebutuhan bisnis | Prioritas | Rujukan produk |
|---|---|---|---|
| BR-01 | Penyelenggara perlu mendata peserta individu (nama, kota, WhatsApp, LinkedIn, latar) secara terpusat sebelum batas pendaftaran 1 November 2026. | Tinggi | FR-005 sampai FR-009 |
| BR-02 | Penyelenggara perlu memastikan peserta tergabung ke grup WhatsApp utama sebagai kanal resmi informasi dan pengumuman. | Tinggi | FR-016 sampai FR-019 |
| BR-03 | Penyelenggara perlu membantu peserta tanpa tim menemukan atau membentuk tim yang komposisi perannya seimbang (jalur CEO, CTO, AI, PM, DSG, GRW, DOM, DAT). | Tinggi | FR-010 sampai FR-015, FR-023, FR-024 |
| BR-04 | Pembentukan tim harus tertib: satu orang hanya anggota satu tim atau owner satu tim; satu lamaran aktif per orang. | Tinggi | FR-021, FR-022, FR-026 |
| BR-05 | Akses ke grup WhatsApp tim harus dikendalikan owner (hanya pelamar yang disetujui). | Tinggi | FR-027, FR-030 |
| BR-06 | Peserta harus terarah menyelesaikan langkah 2 (daftar tim Tencent) dan langkah 3 (submit) agar jumlah tim terdaftar dan karya masuk maksimal. | Tinggi | FR-039 sampai FR-044 |
| BR-07 | Pengalaman harus tersedia dalam Indonesia, Inggris, dan Mandarin untuk menjangkau peserta dan mitra. | Sedang | FR-045 sampai FR-048 |
| BR-08 | Data peserta pada akhirnya harus berada di ekosistem aiclub.id (satu identitas `memberId`, tanpa input ulang). | Tinggi | FR-004, FR-009, FR-015, FR-038 |
| BR-09 | Penyelenggara dan pengurus perlu dapat memantau pendaftar dan tim, dengan perlindungan data pribadi. | Sedang | FR-058 |
| BR-10 | Informasi event (hadiah, tanggal, tantangan, mitra) harus konsisten dengan halaman resmi event. | Tinggi | FR-056, FR-057 |
| BR-11 | Portal harus dapat dipublikasikan dengan biaya infrastruktur minimal untuk demo (hosting statis). | Sedang | [04_TRD.md](04_TRD.md) |

## 3. Justifikasi bisnis

### 3.1 Masalah yang diselesaikan

1. Banyak peserta tidak memiliki tim; tanpa mekanisme pertemuan, potensi peserta hilang.
2. Komposisi tim yang tidak seimbang menurunkan kualitas karya (agent yang dibuat hanya oleh engineer tanpa pemahaman domain atau data).
3. Koordinasi manual lewat grup WhatsApp tidak dapat melacak siapa melamar ke mana, dan tidak menegakkan aturan satu orang satu tim.
4. Tiga sistem (portal ini, pendaftaran Tencent, submit Tencent) tanpa panduan berurutan menimbulkan risiko peserta tidak menyelesaikan seluruh langkah.

### 3.2 Opsi yang dipertimbangkan

| Opsi | Deskripsi | Penilaian |
|---|---|---|
| A. Tidak ada portal (formulir biasa + grup WhatsApp) | Peserta daftar lewat formulir dan mencari tim sendiri di grup | Murah, tetapi tidak ada pemetaan peran, tidak ada kontrol lamaran, data tersebar. |
| B. Portal statis dummy (as-built) | SPA React dengan `localStorage` | Cepat dan murah untuk demo alur dan validasi UX; tidak dapat dipakai sebagai sumber data resmi. **Kondisi sekarang.** |
| C. Portal terintegrasi aiclub.id (rencana) | Login dan data di aiclub.id, backend (Cloudflare Worker + D1 menurut brief) | Memenuhi kebutuhan data resmi dan penegakan aturan; bergantung pada penyediaan akses dari aiclub.id dan waktu pengerjaan sebelum 1 November 2026. **Target.** |

Keputusan rinci dicatat di [11_DECISIONS.md](11_DECISIONS.md). Analisis biaya dan manfaat bernilai rupiah: _TBD_ (tidak ada data anggaran di repo).

### 3.3 Manfaat yang diharapkan

| Manfaat | Pihak | Indikator (target _TBD_) |
|---|---|---|
| Lebih banyak peserta individu terserap menjadi tim | Penyelenggara, peserta | Persentase peserta bertim (M-05, [01_PRD.md](01_PRD.md)) |
| Komposisi tim lebih beragam | Penyelenggara, juri | Sebaran jalur per tim (dapat dihitung setelah integrasi) |
| Data peserta terpusat dan konsisten dengan profil | aiclub.id | Tidak ada input ulang; satu `memberId` |
| Pengurangan beban moderasi manual grup | Pengurus | Pelanggaran aturan lewat API = 0 (M-10) |
| Peserta menyelesaikan langkah Tencent dan submit | Tencent, penyelenggara | M-08, M-09 |

## 4. Dampak

### 4.1 Dampak bagi peserta

1. Satu tempat untuk mendaftar, mengetahui peran, dan mencari tim.
2. Peserta wajib memberikan nomor WhatsApp dan kota; nomor dapat tampil dalam pesan perkenalan yang dibagikan peserta sendiri ke grup utama (FR-017). Dampak privasi harus dikelola ([14_SECURITY_THREAT_MODEL.md](14_SECURITY_THREAT_MODEL.md)).
3. Pada as-built, data hanya di peramban sendiri; ganti perangkat berarti memulai ulang.

### 4.2 Dampak bagi penyelenggara dan pengurus

1. Kebutuhan penyediaan akses (login, session, basis data) dari sisi aiclub.id; perlu keputusan dan sumber daya engineering.
2. Perlu kebijakan peran akses data: siapa yang boleh melihat seluruh peserta dan tim (pusat saja atau pengurus kota) ([../brief.md](../brief.md) 8.7).
3. Perubahan data event (tanggal, hadiah) dilakukan lewat pembaruan kode (`src/i18n/*.js`) dan build ulang, bukan lewat panel admin.

### 4.3 Dampak bagi mitra

Mitra tampil di footer dan header (logo Tencent, SumoPod, WorkBuddy, CodeBuddy) dengan tautan ke situs masing-masing. Tencent tidak menerima data balik dari portal ini kecuali integrasi identitas disepakati (brief 8.6).

### 4.4 Dampak teknis dan operasional

| Area | As-built | Setelah integrasi |
|---|---|---|
| Hosting | GitHub Pages dari `docs/` | Subdomain aiclub.id (mis. `hackathon.aiclub.id`, nama final _TBD_) |
| Data | `localStorage` per peramban | Basis data aiclub.id (Cloudflare D1 menurut brief) |
| Login | Dummy | Akun aiclub.id |
| Operasional | Tidak ada | Pemantauan, migrasi tabel, penanganan insiden ([17_DEVELOPER_SETUP.md](17_DEVELOPER_SETUP.md), [18_INSTALLATION.md](18_INSTALLATION.md)) |

## 5. Constraint bisnis

| ID | Constraint | Sumber |
|---|---|---|
| C-01 | Pendaftaran dibuka 15 Oktober 2026 dan ditutup 1 November 2026, 23.59 WIB; fase integrasi 1 sampai 3 harus selesai sebelum itu. | `src/i18n/id.js`, [../brief.md](../brief.md) bagian 11 |
| C-02 | Pengumuman finalis 14 November 2026; Demo Day dan Awarding 27 November 2026, 13.00 sampai 16.00 WIB, Jakarta. | `src/i18n/id.js` |
| C-03 | Alur tiga langkah dan isi event tidak diubah oleh pekerjaan integrasi. | [../brief.md](../brief.md) bagian 1 |
| C-04 | Portal Tencent tetap di sisi Tencent dan diakses lewat tautan `aiclub.id/l/O3Sa9yF` dan `aiclub.id/l/9k54mLk`; tidak ada pertukaran data. | `README.md`, `src/data.js` |
| C-05 | Satu orang hanya boleh menjadi anggota satu tim atau owner satu tim, tidak keduanya; satu lamaran aktif per orang. | `README.md`, `src/lib/rules.js` |
| C-06 | Link grup WhatsApp tim hanya boleh dikirim server kepada owner dan pelamar berstatus disetujui (pada integrasi). | [../brief.md](../brief.md) bagian 5.3 |
| C-07 | Data pribadi (WhatsApp, kota) memerlukan dasar persetujuan dan tidak boleh tampil di daftar publik. | [../brief.md](../brief.md) bagian 8.5 dan 11 |
| C-08 | Tidak ada kunci API pengurus atau rahasia di bundel klien; API `/agent/*` aiclub.id memakai kunci pengurus dan tidak boleh dipanggil dari peramban. | [../brief.md](../brief.md) bagian 4 |
| C-09 | Portal produksi harus berada di domain induk aiclub.id agar cookie session dapat dipakai; GitHub Pages tidak memenuhi syarat ini. | [../brief.md](../brief.md) bagian 4 |
| C-10 | Infrastruktur aiclub.id memakai Cloudflare (D1, R2); pilihan arsitektur backend mengikutinya. | [../brief.md](../brief.md) bagian 3 |
| C-11 | Event gratis; tidak ada pemrosesan pembayaran. | `src/i18n/id.js` ("gratis") |
| C-12 | Anggaran, jumlah tim pengembang, dan jadwal kerja rinci: _TBD_. | tidak ditemukan di repo |

## 6. Aturan bisnis

| ID | Aturan | Status penegakan |
|---|---|---|
| BRL-01 | Kota dan nomor WhatsApp (9 sampai 15 digit) wajib sebelum peserta dapat melanjutkan ke skenario. | Ada di klien (FR-006, FR-008) |
| BRL-02 | Semua enam skenario wajib dijawab sebelum hasil dan langkah berikutnya terbuka. | Ada di klien (FR-011, FR-055) |
| BRL-03 | Peserta wajib bergabung ke grup utama WhatsApp (konfirmasi mandiri) sebelum memilih jalan atau membuka langkah 2 dan 3. | Ada di klien (FR-016, FR-018) |
| BRL-04 | Anggota satu tim atau owner satu tim, tidak keduanya. | Klien; server: Rencana (FR-021, FR-022) |
| BRL-05 | Satu lamaran aktif (menunggu atau disetujui) per orang; pindah berarti menarik lamaran dulu. | Klien; server: Rencana (FR-026) |
| BRL-06 | Saat satu lamaran disetujui, lamaran menunggu lain milik orang itu dibatalkan otomatis. | Klien (demo); server transaksi: Rencana (FR-028, FR-030) |
| BRL-07 | Link grup tim terbuka hanya setelah lamaran disetujui owner. | UI; server: Rencana (FR-027) |
| BRL-08 | Link grup WhatsApp yang diisi harus berawalan `https://chat.whatsapp.com/`. | Ada di klien; server: Rencana (FR-031, FR-032) |
| BRL-09 | Tombol submit Tencent hanya aktif setelah peserta mencentang project selesai. | Ada di klien; server: Rencana (FR-043) |
| BRL-10 | Pembuatan tim ditolak bila peserta memiliki lamaran menunggu atau disetujui; melamar ditolak bila peserta sudah menjadi owner. | Ada di klien (FR-021) |
| BRL-11 | Jalur hasil resmi dihitung ulang server dari jawaban. | Rencana (FR-015) |

## 7. Pemangku kepentingan bisnis dan tanggung jawab

| Pihak | Tanggung jawab bisnis |
|---|---|
| aiclub.id | Menyediakan login, session, basis data, dan keputusan kebijakan data; mengelola grup utama; pemilik data peserta |
| Tencent Cloud | Mengelola portal pendaftaran tim dan submit; menyediakan konten event dan tantangan |
| Mitra (SumoPod, WorkBuddy, CodeBuddy) | Dukungan platform dan alat untuk peserta |
| Tim pengembang portal | Membangun, memelihara, dan mendokumentasikan portal |
| Pemilik produk | Menyetujui dokumen dan memutuskan opsi integrasi; nama _TBD_ |

## 8. Risiko bisnis

Rujukan lengkap: [10_RISK_REGISTER.md](10_RISK_REGISTER.md).

| Risiko | Dampak | Mitigasi (rencana) |
|---|---|---|
| Integrasi tertahan karena akses dari aiclub.id belum tersedia | Portal tetap dummy sampai batas pendaftaran; data tidak resmi | Dorong jawaban pertanyaan brief bagian 8; siapkan jalur cadangan (mis. ekspor manual) _TBD_ |
| Waktu pengerjaan tidak cukup sebelum 2026-11-01 | Fitur tim dan lamaran tidak terintegrasi | Prioritaskan fase 1 sampai 3; fase 5 opsional |
| Kebocoran data pribadi (WhatsApp, link grup) | Reputasi dan kepatuhan | Aturan 5.3 brief di server, layar persetujuan, uji kebocoran |
| Peserta tidak menyelesaikan langkah Tencent | Tim terdaftar lebih sedikit | Pengingat jelas di UI dan grup utama; metrik M-08, M-09 |
| Data event usang di portal | Informasi keliru ke peserta | Sinkronisasi dengan halaman resmi; satu sumber di `src/i18n/*.js` |

## 9. Kriteria penerimaan bisnis

1. Seluruh alur peserta (login sampai submit) dapat dijalankan dan aturan bisnis BRL-01 sampai BRL-10 terpenuhi pada as-built (uji di [12_TEST_STRATEGY.md](12_TEST_STRATEGY.md)).
2. Pada integrasi: kriteria S-07 sampai S-12 di [00_PROJECT_CHARTER.md](00_PROJECT_CHARTER.md) terpenuhi.
3. Keterlacakan dari BR-xx ke FR-xxx terdokumentasi di [19_REQUIREMENTS_TRACEABILITY.md](19_REQUIREMENTS_TRACEABILITY.md).

## 10. Glosarium singkat

Lihat [13_GLOSSARY.md](13_GLOSSARY.md). Istilah kunci: owner (pembuat tim), builder (peserta yang belum bertim), jalur (peran hasil skoring), grup utama (grup WhatsApp hackathon), `memberId` (identitas anggota aiclub.id).
