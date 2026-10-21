# Product Requirements Document (PRD)

> Status: Draft
> Terakhir diperbarui: 2026-10-21
> Pemilik: Tim AIClub Hackathon

Dokumen ini mendefinisikan masalah, pengguna, fitur, dan metrik produk Portal Pendaftaran AI Agent Hackathon. Konteks proyek ada di [00_PROJECT_CHARTER.md](00_PROJECT_CHARTER.md); alasan bisnis di [02_BRD.md](02_BRD.md); kebutuhan fungsional terperinci di [03_FRD.md](03_FRD.md); rencana integrasi di [../brief.md](../brief.md).

Konvensi status: **Ada (as-built, dummy)** berarti sudah berjalan di kode dengan data dummy di `localStorage`; **Rencana (integrasi aiclub.id)** berarti belum ada dan bergantung pada integrasi.

## 1. Latar belakang

Tencent Cloud Hackathon Indonesia 2026 (kolaborasi Tencent Cloud dan aiclub.id) mengajak peserta membangun AI agent dengan WorkBuddy untuk salah satu dari tiga tantangan. Pendaftaran dibuka 15 Oktober 2026 dan ditutup 1 November 2026, 23.59 WIB. Pendaftaran tim dan pengiriman karya dilakukan di portal Tencent, sedangkan portal ini mengurus bagian sebelum itu: mendata peserta individu, memetakan peran, dan membantu pembentukan tim.

## 2. Pernyataan masalah

| # | Masalah | Dampak |
|---|---|---|
| P-1 | Banyak peserta mendaftar sendiri tanpa tim; tidak ada tempat resmi untuk saling menemukan. | Peserta tidak ikut karena tidak punya tim, atau tim terbentuk tidak seimbang (mis. semua engineer). |
| P-2 | Orang sering salah menebak peran sendiri (teks UI: "yang ngaku CEO ternyata engineer"). | Komposisi tim tidak sesuai kebutuhan agent (domain, data, desain, produk). |
| P-3 | Koordinasi tim dilakukan lewat grup WhatsApp, rawan dibanjiri dan tanpa kontrol. | Link grup tersebar ke pihak yang belum disetujui; owner kewalahan. |
| P-4 | Satu orang dapat melamar atau tergabung di banyak tim sekaligus tanpa aturan. | Slot terkunci oleh orang yang tidak aktif; konflik antar tim. |
| P-5 | Alur pendaftaran melibatkan tiga sistem (portal ini, pendaftaran tim Tencent, submit Tencent) tanpa panduan berurutan. | Peserta lupa mendaftarkan tim atau mengirim karya sebelum batas waktu. |
| P-6 | Peserta berasal dari banyak kota dan latar, termasuk pembaca bahasa Inggris dan Mandarin. | Hambatan bahasa pada formulir dan informasi. |
| P-7 | Portal as-built memakai data dummy dan tidak terhubung ke akun aiclub.id. | Data tidak persisten antarperangkat, aturan bisa dilewati, tidak dapat dipakai sebagai sumber data resmi ([../brief.md](../brief.md) bagian 2). |

## 3. Tujuan produk

1. Peserta individu dapat menyelesaikan pendaftaran dalam satu sesi singkat.
2. Setiap peserta mendapat jalur peran berbasis skenario, dengan hak koreksi.
3. Peserta dapat bergabung ke tim lewat lamaran yang disetujui owner, atau membuka tim sendiri, dengan aturan yang konsisten.
4. Peserta selalu tahu langkah berikutnya sampai menuju portal Tencent dan submit.
5. (Rencana) Semua data dan aturan dijaga di sisi aiclub.id.

Bukan tujuan: mengganti portal Tencent, menilai karya, atau mengelola grup WhatsApp ([00_PROJECT_CHARTER.md](00_PROJECT_CHARTER.md) bagian 4.2).

## 4. Target pengguna

### 4.1 Persona

| Persona | Deskripsi | Kebutuhan utama | Rujukan di kode |
|---|---|---|---|
| Peserta mandiri ("builder") | Individu tanpa tim; latar: kerja di perusahaan teknologi, non-teknologi, mahasiswa/pelajar, freelance/kontraktor, sedang membangun usaha, sedang cari kerja (enam nilai `LATAR`) | Tahu perannya, menemukan tim yang membutuhkan kemampuannya | `Identity.jsx`, `Market.jsx` |
| Owner tim | Peserta yang membuka tim (tidak harus berjalur CEO; `CONFIG.modeDraft = false`) | Menyaring pelamar, mengundang builder, membagikan link grup hanya ke anggota sah | `Create.jsx`, `MyTeam.jsx` |
| Anggota tim | Peserta yang lamarannya disetujui | Masuk grup tim, melihat anggota dan kontak, chat tim, lanjut ke Tencent dan submit | `TeamDetail.jsx`, `Dash.jsx` |
| Pengurus aiclub.id | Pengelola komunitas pusat atau kota | Memantau pendaftar, ekspor data (Rencana, _TBD_) | tidak ada di as-built |

### 4.2 Delapan jalur peran (`URUT`, `src/data.js`)

| Kode | Nama (ID) |
|---|---|
| CEO | CEO / Pemilik ide |
| CTO | CTO / Engineer |
| AI | AI / Agent engineer |
| PM | Product / PM |
| DSG | Designer |
| GRW | Growth / Marketing |
| DOM | Domain expert (ops, risk, finance) |
| DAT | Data analyst |

### 4.3 Konteks penggunaan

Perangkat seluler dan desktop (antarmuka responsif dengan navigasi bawah untuk layar kecil: `BottomNav`); bahasa Indonesia, Inggris, atau Mandarin; sebagian besar peserta datang dari tautan di grup atau halaman event aiclub.id.

## 5. Fitur dan prioritas (MoSCoW)

Kolom FR merujuk ke [03_FRD.md](03_FRD.md).

### 5.1 Must have

| ID | Fitur | FR | Status |
|---|---|---|---|
| F-01 | Halaman awal dengan informasi event (poster, hadiah, tanggal, tantangan) | FR-056 | Ada (as-built, dummy) |
| F-02 | Login (dummy) dan logout | FR-001, FR-002, FR-003 | Ada (as-built, dummy) |
| F-03 | Data diri dengan validasi (kota dan WhatsApp wajib) | FR-005 sampai FR-008 | Ada (as-built, dummy) |
| F-04 | Kuis 6 skenario dan skoring 8 jalur | FR-010, FR-011, FR-013 | Ada (as-built, dummy) |
| F-05 | Hasil jalur utama dan kedua, koreksi jalur | FR-014 | Ada (as-built, dummy) |
| F-06 | Grup WhatsApp utama (wajib sebelum ke tim) | FR-016, FR-018 | Ada (as-built, dummy) |
| F-07 | Pilih jalan: gabung atau buat tim, dengan eksklusivitas | FR-020, FR-021 | Ada (as-built, dummy) |
| F-08 | Pasar tim, detail tim, lamar atau tarik lamaran (satu aktif) | FR-023, FR-025, FR-026 | Ada (as-built, dummy) |
| F-09 | Link grup tim terkunci sampai disetujui | FR-027 | Ada (as-built, dummy) |
| F-10 | Buat tim dan panel owner (pelamar, link grup, tutup tim) | FR-031, FR-032, FR-033, FR-035 | Ada (as-built, dummy) |
| F-11 | Dasbor status peserta | FR-036, FR-037 | Ada (as-built, dummy) |
| F-12 | Langkah Tencent dan Submit (tautan keluar, gerbang centang project selesai) | FR-039 sampai FR-044 | Ada (as-built, dummy) |
| F-13 | Stepper 3 langkah dan sub-langkah, navigasi kembali, pemulihan state | FR-049 sampai FR-055 | Ada (as-built, dummy) |
| F-14 | Tiga bahasa (id, en, zh) | FR-045 sampai FR-048 | Ada (as-built, dummy) |
| F-15 | Login dan session aiclub.id sungguhan | FR-004 | Rencana (integrasi aiclub.id) |
| F-16 | Penyimpanan data di basis data aiclub.id (peserta, tim, lamaran, aktivitas) | FR-009, FR-015, FR-019, FR-022, FR-030, FR-038, FR-041, FR-044 | Rencana (integrasi aiclub.id) |
| F-17 | Penegakan aturan bisnis di server dan constraint DB | FR-022, FR-030 | Rencana (integrasi aiclub.id) |

### 5.2 Should have

| ID | Fitur | FR | Status |
|---|---|---|---|
| F-18 | Pesan perkenalan siap kirim ke grup utama (tautan `wa.me`) | FR-017 | Ada (as-built, dummy) |
| F-19 | Undang builder dari daftar (sisi owner) | FR-034 | Ada (as-built, dummy) |
| F-20 | Log aktivitas peserta (maksimum 60 entri terakhir) | FR-037 | Ada (as-built, dummy) |
| F-21 | Pintasan keyboard di kuis (A sampai E atau 1 sampai 5) | FR-012 | Ada (as-built, dummy) |
| F-22 | Keluar tim dan tutup tim dengan konfirmasi dua klik | FR-029, FR-035 | Ada (as-built, dummy) |
| F-23 | Notifikasi ke owner saat ada lamaran baru | FR-030 | Rencana (integrasi aiclub.id), bentuk _TBD_ |
| F-24 | Layar persetujuan penggunaan data (WhatsApp, kota) | _TBD_ (brief 8.5) | Rencana, belum ada FR |
| F-28 | Pengumuman panitia: daftar, detail, tayangan, penanda baca, badge belum dibaca, kartu di dasbor; dapat dibaca tanpa login | FR-060, FR-061, FR-062 | Ada (as-built, dummy); backend: Rencana |
| F-29 | Batas keputusan owner 24 jam dengan penolakan otomatis dan tampilan sisa waktu | FR-063, FR-064 | Ada (as-built, dummy); penegakan server: Rencana |
| F-30 | Ruang tim: anggota dan kontak (WA, email, LinkedIn, GitHub) setelah disetujui | FR-065, FR-067 | Ada (as-built, dummy; data contoh); backend: Rencana |
| F-31 | Chat tim di dalam aplikasi | FR-066 | Ada (as-built, dummy; hanya di perangkat ini); backend: Rencana |

### 5.3 Could have

| ID | Fitur | FR | Status |
|---|---|---|---|
| F-25 | Halaman admin atau ekspor CSV peserta dan tim untuk pengurus | FR-058 | Rencana (integrasi aiclub.id) |
| F-26 | Pencocokan identitas peserta dengan pendaftar di portal Tencent (email atau `memberId`) | FR-041 | Rencana, _TBD_ (brief 8.6) |
| F-27 | Tab "Builder yang cari tim" di pasar tim (dua arah) | _TBD_ | Teks i18n `market.tabBuilders`/`titleTwoWay` ada, belum dipakai di UI |

### 5.4 Won't have (periode ini)

| Butir | Alasan |
|---|---|
| Penilaian juri atau skor karya di portal | Di luar lingkup; dilakukan penyelenggara |
| Pembuatan grup WhatsApp otomatis | Dibuat manual; portal hanya menyimpan link |
| Chat antarpeserta di luar tim (pesan pribadi atau forum umum) | Koordinasi umum lewat grup WhatsApp; chat dalam aplikasi hanya untuk anggota satu tim (F-31) |
| Pembayaran atau tiket | Event gratis |
| Aplikasi native | Web responsif sudah memadai |
| Mengubah alur 3 langkah | Dinyatakan di luar cakupan ([../brief.md](../brief.md) bagian 1) |

## 6. User story

Format: Sebagai [peran], saya ingin [kemampuan], agar [manfaat]. Kolom FR merujuk ke [03_FRD.md](03_FRD.md); prioritas memakai MoSCoW (M/S/C).

| ID | User story | Prioritas | FR | Status |
|---|---|---|---|---|
| US-001 | Sebagai calon peserta, saya ingin melihat informasi event (hadiah, tanggal, tantangan) sebelum mendaftar, agar tahu apakah layak ikut. | M | FR-056, FR-057 | Ada (as-built, dummy) |
| US-002 | Sebagai calon peserta, saya ingin masuk dengan akun aiclub.id, agar datanya terhubung tanpa membuat akun baru. | M | FR-001, FR-002, FR-004 | Ada (dummy); sungguhan: Rencana |
| US-003 | Sebagai peserta, saya ingin data diri saya terisi dari profil dan hanya melengkapi yang kosong, agar tidak mengetik ulang. | M | FR-005, FR-007, FR-009, FR-067 | Ada (prefill dari akun dummy); profil sungguhan: Rencana |
| US-004 | Sebagai peserta, saya ingin diberi tahu bila kota atau nomor WhatsApp belum benar, agar bisa diperbaiki sebelum lanjut. | M | FR-006, FR-008 | Ada (as-built, dummy) |
| US-005 | Sebagai peserta, saya ingin menjawab skenario singkat satu per satu, agar sistem memahami cara kerja saya. | M | FR-010, FR-011 | Ada (as-built, dummy) |
| US-006 | Sebagai peserta, saya ingin memakai keyboard untuk memilih jawaban, agar lebih cepat. | S | FR-012 | Ada (as-built, dummy) |
| US-007 | Sebagai peserta, saya ingin melihat jalur utama dan kedua beserta skornya, agar paham alasan hasilnya. | M | FR-013, FR-014 | Ada (as-built, dummy) |
| US-008 | Sebagai peserta, saya ingin mengoreksi jalur bila sistem keliru, agar pencarian tim memakai peran yang saya yakini. | M | FR-014 | Ada (as-built, dummy) |
| US-009 | Sebagai peserta, saya ingin menjawab ulang skenario, agar bisa memperbaiki hasil. | S | FR-014 | Ada (as-built, dummy) |
| US-010 | Sebagai peserta, saya ingin bergabung ke grup WhatsApp utama, agar menerima info resmi dan pengumuman. | M | FR-016, FR-018 | Ada (as-built, dummy) |
| US-011 | Sebagai peserta, saya ingin pesan perkenalan tersusun otomatis dari data saya, agar mudah memperkenalkan diri di grup. | S | FR-017, FR-067 | Ada (as-built, dummy) |
| US-012 | Sebagai peserta, saya ingin memilih antara gabung tim atau buat tim, agar sesuai dengan kondisi saya. | M | FR-020 | Ada (as-built, dummy) |
| US-013 | Sebagai peserta, saya ingin dicegah menjadi anggota satu tim sekaligus owner tim lain, agar tidak terjadi konflik. | M | FR-021, FR-022 | Ada (klien); server: Rencana |
| US-014 | Sebagai peserta, saya ingin melihat daftar tim, slot yang dicari, dan kecocokan dengan jalur saya, agar memilih tim yang tepat. | M | FR-023, FR-024 | Ada (as-built, dummy) |
| US-015 | Sebagai peserta, saya ingin melihat detail tim sebelum melamar, agar yakin dengan pilihan saya. | M | FR-025 | Ada (as-built, dummy) |
| US-016 | Sebagai peserta, saya ingin melamar ke satu tim dan menarik lamaran bila ingin pindah, agar tidak menahan slot tim lain. | M | FR-026 | Ada (as-built, dummy) |
| US-017 | Sebagai peserta, saya ingin link grup tim terbuka setelah owner menyetujui, agar bisa bergabung ke grup yang tepat. | M | FR-027 | Ada (as-built, dummy) |
| US-018 | Sebagai peserta yang sudah di tim, saya ingin dapat keluar dari tim, agar bisa pindah atau membuat tim sendiri. | S | FR-029 | Ada (as-built, dummy) |
| US-019 | Sebagai owner, saya ingin membuat tim dengan nama, deskripsi, slot yang dicari, dan link grup WhatsApp, agar peserta lain dapat melamar. | M | FR-031 | Ada (as-built, dummy) |
| US-020 | Sebagai owner, saya ingin menyetujui atau menolak pelamar, agar komposisi tim sesuai. | M | FR-033 | Ada (as-built, dummy; pelamar contoh) |
| US-021 | Sebagai owner, saya ingin mengubah link grup tim kapan saja, agar tetap valid. | M | FR-032 | Ada (as-built, dummy) |
| US-022 | Sebagai owner, saya ingin mengundang builder yang belum bertim, agar slot terisi lebih cepat. | S | FR-034 | Ada (as-built, dummy; builder contoh) |
| US-023 | Sebagai owner, saya ingin menutup tim, agar bisa bergabung ke tim lain bila rencana berubah. | S | FR-035 | Ada (as-built, dummy) |
| US-024 | Sebagai peserta, saya ingin dasbor status berisi lamaran, grup utama, aktivitas, timeline, hadiah, dan tantangan, agar tahu posisi saya. | M | FR-036, FR-037 | Ada (as-built, dummy) |
| US-025 | Sebagai owner, saya ingin diberi tahu saat ada pelamar baru, agar tidak melewatkannya. | S | FR-030 | Rencana (integrasi aiclub.id) |
| US-026 | Sebagai peserta, saya ingin diarahkan ke portal Tencent untuk mendaftarkan tim, dan tahu status tim saya di halaman itu. | M | FR-039, FR-040 | Ada (as-built, dummy) |
| US-027 | Sebagai peserta, saya ingin tombol submit baru terbuka setelah saya menyatakan project selesai, agar tidak submit terlalu dini. | M | FR-042, FR-043 | Ada (as-built, dummy) |
| US-028 | Sebagai peserta, saya ingin memakai portal dalam Bahasa Indonesia, Inggris, atau Mandarin, agar nyaman membaca. | M | FR-045 sampai FR-048 | Ada (as-built, dummy) |
| US-029 | Sebagai peserta, saya ingin melihat langkah saya (3 langkah besar dan 6 sub-langkah) dan dapat kembali ke langkah sebelumnya, agar tidak tersesat. | M | FR-049 sampai FR-052 | Ada (as-built, dummy) |
| US-030 | Sebagai peserta, saya ingin kembali ke posisi terakhir saat membuka ulang halaman, agar tidak mengulang dari awal. | M | FR-053 | Ada (di peramban yang sama); lintas perangkat: Rencana |
| US-031 | Sebagai peserta, saya ingin progres dan tim saya tetap ada di perangkat lain, agar tidak bergantung pada satu peramban. | M | FR-004, FR-009, FR-015, FR-038 | Rencana (integrasi aiclub.id) |
| US-032 | Sebagai pengurus aiclub.id, saya ingin memantau pendaftar dan tim serta mengekspor datanya, agar bisa menindaklanjuti. | C | FR-058 | Rencana (integrasi aiclub.id) |
| US-033 | Sebagai pengguna pembaca layar atau keyboard, saya ingin fokus berpindah ke judul layar dan perubahan status diumumkan, agar dapat memakai portal. | S | FR-054 | Ada (as-built, dummy) |
| US-034 | Sebagai peserta, saya ingin hanya orang yang berhak melihat link grup tim saya, agar grup tidak dibanjiri pihak luar. | M | FR-027, FR-030 | Ada (penyembunyian di UI); penegakan server: Rencana |
| US-035 | Sebagai peserta atau calon peserta, saya ingin membaca pengumuman resmi panitia di portal, termasuk sebelum login, agar tidak tertinggal informasi jadwal dan aturan. | S | FR-060, FR-062 | Ada (as-built, dummy); pengelolaan pengumuman di server: Rencana |
| US-036 | Sebagai peserta, saya ingin tahu pengumuman mana yang belum saya baca dan berapa kali sebuah pengumuman dilihat, agar fokus ke info yang baru. | S | FR-061, FR-062 | Ada (as-built, dummy; tayangan contoh); penghitungan di server: Rencana |
| US-037 | Sebagai pelamar, saya ingin lamaran yang tidak diputuskan owner dalam 24 jam ditolak otomatis dan sisa waktunya terlihat, agar saya tidak menunggu tanpa kepastian dan bisa mencari tim lain. | M | FR-063, FR-064 | Ada (as-built, dummy); penegakan server: Rencana |
| US-038 | Sebagai anggota atau owner tim, saya ingin melihat anggota tim beserta kontaknya (WA, email, LinkedIn, GitHub) setelah lamaran disetujui, agar dapat langsung berkoordinasi. | S | FR-065, FR-067 | Ada (as-built, dummy; kontak contoh); pembatasan akses di server: Rencana |
| US-039 | Sebagai anggota atau owner tim, saya ingin mengobrol dengan tim di dalam portal, agar koordinasi awal tidak harus menunggu grup WhatsApp tim. | S | FR-066 | Ada (as-built, dummy; hanya di perangkat ini); sinkronisasi antaranggota: Rencana |

## 7. Alur pengguna ringkas

```
Awal -> Login -> Data diri -> Skenario (6) -> Hasil jalur -> Grup utama (wajib)
     -> Pilih jalan --+-> Gabung: Pasar tim -> Detail tim -> Lamar -> (owner setuju) -> Status
                      +-> Buat: Form tim -> Panel owner (pelamar, undang, link grup) -> Status
     -> Langkah 2: Daftar tim di portal Tencent (tautan keluar)
     -> Langkah 3: Submit project di portal Tencent (tautan keluar, setelah centang "project selesai")
```

Indikator kecil pada langkah 1: Data, Skenario, Jalur, Grup utama, Tim, Status. Aturan perpindahan: owner menutup tim dulu, anggota keluar dari tim dulu, atau pelamar menarik lamaran yang menunggu.

## 8. Metrik keberhasilan

Portal as-built tidak memiliki analitik, sehingga seluruh metrik di bawah **belum dapat diukur** sampai ada backend atau instrumentasi. Target numerik _TBD_ kecuali dinyatakan lain. Sumber data pengukuran adalah tabel `hackathon_*` ([20_DATABASE.md](20_DATABASE.md)).

| ID | Metrik | Definisi | Target | Sumber |
|---|---|---|---|---|
| M-01 | Tingkat penyelesaian data diri | Peserta login yang lolos data diri / peserta login | _TBD_ | `hackathon_participant` |
| M-02 | Tingkat penyelesaian kuis | Peserta yang menyelesaikan 6 skenario / peserta lolos data diri | _TBD_ | `jawaban` terisi |
| M-03 | Tingkat koreksi jalur | Peserta yang memakai `override` / peserta berhasil | _TBD_ (indikator akurasi skoring) | `jalur_override` |
| M-04 | Gabung grup utama | Peserta dengan `joined_main_at` / peserta selesai kuis | _TBD_ | `joined_main_at` |
| M-05 | Peserta bertim | Peserta yang menjadi owner atau anggota disetujui / peserta aktif | _TBD_ | tim dan lamaran |
| M-06 | Waktu rata-rata sampai disetujui | Selisih `created_at` dan `decided_at` lamaran | _TBD_ | `hackathon_application` |
| M-07 | Rasio lamaran disetujui | Disetujui / (disetujui + ditolak) | _TBD_ | `hackathon_application` |
| M-08 | Klik portal Tencent | Peserta dengan `tencent_clicked_at` / peserta bertim | _TBD_ | `tencent_clicked_at` |
| M-09 | Kesiapan submit | Peserta dengan `project_ready_at` dan `submit_clicked_at` / peserta bertim | _TBD_ | kolom terkait |
| M-10 | Pelanggaran aturan bisnis lewat API | Jumlah keberhasilan melanggar aturan 5.3 brief | 0 (kriteria brief bagian 10) | uji dan log server |
| M-11 | Kebocoran link grup tim | Respons API berisi `wa_link` untuk pengguna yang tidak berhak | 0 (kriteria brief bagian 10) | uji dan log server |
| M-12 | Kinerja halaman | Waktu muat dan interaktif di jaringan seluler | _TBD_ | [04_TRD.md](04_TRD.md) |
| M-13 | Pendaftar total dan tim terbentuk | Jumlah pendaftar dan tim sebelum 2026-11-01 | _TBD_ (tidak ada target di kode atau brief; kunci i18n `dash.formed` memuat angka "120+ pendaftar, target 30 tim" tetapi tidak ditampilkan dan statusnya tidak terverifikasi) | basis data |

Catatan: untuk as-built, indikator yang dapat dicek hanya bersifat fungsional (lihat kriteria sukses S-01 sampai S-06 di [00_PROJECT_CHARTER.md](00_PROJECT_CHARTER.md)).

## 9. Persyaratan non-fungsional ringkas

Detail teknis di [04_TRD.md](04_TRD.md); keamanan di [14_SECURITY_THREAT_MODEL.md](14_SECURITY_THREAT_MODEL.md); pengujian di [12_TEST_STRATEGY.md](12_TEST_STRATEGY.md).

| Aspek | Kebutuhan | Kondisi as-built |
|---|---|---|
| Aksesibilitas | Fokus ke judul pada perpindahan layar, `aria-live`, `aria-current`, `role=radio`, pengurangan gerak (`prefers-reduced-motion`) | Ada |
| Responsif | Layar kecil didukung dengan navigasi bawah | Ada |
| Privasi | WhatsApp dan kota tidak tampil di daftar publik; kontak anggota hanya untuk owner dan anggota yang disetujui di tim yang sama; persetujuan penggunaan data | Kontak hanya ditampilkan di UI ruang tim (data contoh); penegakan server dan persetujuan data: Rencana |
| Keamanan | Tidak ada rahasia di bundel klien; aturan di server | Tidak ada rahasia karena tidak ada backend; aturan hanya di klien |
| Hosting | Statis (GitHub Pages) untuk demo; subdomain aiclub.id untuk produksi | Demo saja |
| Lokalisasi | id, en, zh dengan fallback ke id | Ada |

## 10. Dependensi dan asumsi

1. Jawaban atas pertanyaan terbuka pengelola aiclub.id (login, session, akses DB, profil, persetujuan data, identitas Tencent, peran, hosting) ([../brief.md](../brief.md) bagian 8).
2. Tautan Tencent (`https://aiclub.id/l/O3Sa9yF`, `https://aiclub.id/l/9k54mLk`) dan grup utama WhatsApp (`https://chat.whatsapp.com/GNcd3TL3bZ71LoxlL8RzH9`) tetap valid.
3. Data event mengikuti halaman resmi <https://aiclub.id/event/tencent-cloud-hackathon-2026>; perubahan jadwal harus diperbarui manual di `src/i18n/*.js`.

## 11. Pertanyaan terbuka

| # | Pertanyaan | Pemilik |
|---|---|---|
| Q-1 | Apakah aiclub.id menyediakan OAuth/OIDC atau hanya cookie session? | Pengelola aiclub.id |
| Q-2 | Siapa yang boleh melihat seluruh peserta dan tim (pusat atau kota)? Perlu halaman admin atau cukup ekspor CSV? | Pengelola aiclub.id |
| Q-3 | Apakah peserta perlu dicocokkan dengan pendaftar di portal Tencent? | Tencent dan aiclub.id |
| Q-4 | Bagaimana bentuk notifikasi ke owner (email, WhatsApp, in-app)? | _TBD_ |
| Q-5 | Target jumlah peserta dan tim | _TBD_ |
| Q-6 | Apakah mode "hanya CEO yang membuka tim" (`CONFIG.modeDraft`) akan diaktifkan? | Pemilik produk |
