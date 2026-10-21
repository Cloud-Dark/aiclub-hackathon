# Strategi Pengujian

> Status: Draft
> Terakhir diperbarui: 2026-10-21
> Pemilik: Tim AIClub Hackathon

Dokumen ini menjelaskan strategi pengujian portal pendaftaran AI Agent Hackathon aiclub.id x Tencent Cloud. Dokumen terkait: [04_TRD.md](04_TRD.md), [17_DEVELOPER_SETUP.md](17_DEVELOPER_SETUP.md), [14_SECURITY_THREAT_MODEL.md](14_SECURITY_THREAT_MODEL.md), [13_GLOSSARY.md](13_GLOSSARY.md), serta [../brief.md](../brief.md) (rencana integrasi dan kriteria selesai).

## 1. Kondisi Saat Ini

| Aspek | Fakta per 2026-10-21 |
|---|---|
| Tes otomatis | **Belum ada.** `package.json` hanya memiliki skrip `dev`, `build`, `preview`; tidak ada runner tes (Vitest, Jest, Playwright) di `devDependencies`. |
| Linter / type check | Tidak ada (`eslint`, `tsc` tidak terpasang). |
| CI | Tidak ditemukan konfigurasi CI di repo (tidak ada `.github/workflows`). _TBD_ apakah ada di luar repo. |
| Backend | Belum ada. Seluruh state berada di `localStorage` (`hk_state`, `hk_lang`). |
| Verifikasi yang dilakukan | Manual melalui `npm run dev` dan `npm run build`. |

Konsekuensi: setiap perubahan aturan bisnis (`src/lib/rules.js`, `src/lib/scoring.js`) saat ini tidak punya jaring pengaman. Dokumen ini mengusulkan strategi bertahap, dari yang termurah (unit) sampai yang bergantung pada integrasi backend (uji API).

## 2. Tujuan dan Prinsip

1. Aturan bisnis yang kelak dijaga server (lihat [../brief.md](../brief.md) bagian 5.3) harus punya tes yang sama di klien dan di server, sehingga perilaku konsisten.
2. Alur 3 langkah (daftar di portal, daftar tim ke Tencent, submit project) harus dilindungi uji end-to-end karena merupakan jalur utama peserta.
3. Piramida uji: banyak unit cepat, sedang uji komponen, sedikit e2e, ditambah uji API setelah backend ada.
4. Data uji deterministik: memakai `DUMMY_USERS`, `TIM`, `BUILDER` di `src/data.js`, bukan data acak.
5. Tidak ada rahasia atau data pribadi sungguhan dalam data uji.

## 3. Piramida Uji yang Diusulkan

| Lapisan | Alat usulan | Sasaran | Fase |
|---|---|---|---|
| Unit | Vitest (selaras dengan Vite) | `src/lib/scoring.js`, `src/lib/rules.js`, `src/lib/time.js`, `src/i18n/index.js` | Segera |
| Komponen | Vitest + React Testing Library + jsdom | Komponen di `src/components/` | Segera / bertahap |
| E2E | Playwright | Alur 3 langkah di browser sungguhan, tiga bahasa, ponsel dan desktop | Setelah unit dan komponen |
| Aksesibilitas | `@axe-core/playwright` + pemeriksaan manual | Seluruh layar | Bersama e2e |
| API / aturan bisnis server | Vitest atau Playwright `request` terhadap Worker/BFF | Endpoint `/api/hackathon/*` | Setelah integrasi (Fase 1 sampai 3 di brief) |
| Manual | Matriks skenario (bagian 9) | Alur peserta dan owner, lintas perangkat | Setiap rilis |

Semua nama paket di atas adalah usulan; belum dipasang. Versi yang dipakai: _TBD_.

## 4. Uji Unit

### 4.1 `src/lib/scoring.js`

Fungsi yang diuji: `total`, `skor`, `urutSkor`, `aktif`, `quizDone`, `waValid`, `identDone`, `reachable`, `subReachable`. Data bobot berasal dari `WEIGHTS` dan urutan jalur dari `URUT` di `src/data.js` (`CEO, CTO, AI, PM, DSG, GRW, DOM, DAT`).

| ID | Kasus | Masukan | Hasil yang diharapkan |
|---|---|---|---|
| U-S01 | `total()` | `CONFIG.quizLen = 6`, `WEIGHTS.length = 6` | `6` |
| U-S02 | `skor([])` | jawaban kosong | objek dengan 8 kunci jalur, semua bernilai `0` |
| U-S03 | Penjumlahan bobot | `jawab = [3]` (soal 1, opsi D) | `CEO` = 3, lainnya 0 |
| U-S04 | Opsi bobot ganda | `jawab = [1]` (soal 1, opsi B: `PM:3, AI:1`) | `PM` = 3, `AI` = 1 |
| U-S05 | Indeks di luar rentang | `jawab = [99]` | Tidak melempar galat; semua skor `0` |
| U-S06 | Jawaban `null`/lompat | `jawab = [null, 0]` | Soal tanpa jawaban diabaikan |
| U-S07 | `urutSkor` mengurut menurun | jawaban yang menghasilkan `CEO` tertinggi | elemen pertama `CEO` |
| U-S08 | Seri skor | skor seri | urutan stabil sesuai `URUT` (sort stabil); dokumentasikan perilaku, jangan bergantung pada mesin JS tertentu |
| U-S09 | `aktif` memakai `override` | `st.override = "DSG"` | `"DSG"` terlepas dari skor |
| U-S10 | `aktif` tanpa `override` | `override = null` | jalur skor tertinggi |
| U-S11 | `quizDone` | 6 jawaban terisi / 5 terisi / ada `null` | `true` / `false` / `false` |
| U-S12 | `waValid` batas bawah | `"08123456"` (8 digit) | `false` |
| U-S13 | `waValid` batas | 9 digit dan 15 digit | `true`; 16 digit `false` |
| U-S14 | `waValid` format | `"+62 812-3456-7890"` | `true` (non-digit dibuang) |
| U-S15 | `waValid` bukan angka | `""`, `"abc"` | `false` |
| U-S16 | `identDone` | nama, kota, WA valid / salah satu kosong / spasi saja | `true` / `false` / `false` |
| U-S17 | `reachable(st, 0)` | state apa pun | `true` |
| U-S18 | `reachable(st, 1|2)` | ident, kuis, `joinedMain` lengkap / salah satu kurang | `true` / `false` |
| U-S19 | `subReachable` | kunci `identitas`, `kuis`, `hasil`, `grup`, `pilih` | sesuai gerbang pada kode: `identitas` selalu `true`; `kuis` perlu ident; `hasil`/`grup` perlu ident + kuis; lainnya perlu juga `joinedMain` |

Catatan: skor resmi kelak dihitung ulang server ([../brief.md](../brief.md) bagian 6). Tes U-S02 sampai U-S11 sebaiknya dijadikan "golden test" yang sama dijalankan ulang terhadap implementasi server (misal sebagai data JSON bersama).

### 4.2 `src/lib/rules.js`

Fungsi: `approvedApp`, `pendingApps`, `activeApp`, `canApply`, `canCreate`. Struktur `st.apps[]` berisi `{ team, status, at }` dengan `status` salah satu `pending | approved | rejected`; `st.myTeam` berisi tim milik owner atau `null`.

| ID | Kasus | State | Hasil yang diharapkan |
|---|---|---|---|
| U-R01 | Tanpa lamaran, tanpa tim | `apps=[]`, `myTeam=null` | `canApply` = `true`; `canCreate` = `true` |
| U-R02 | Satu lamaran `pending` | `apps=[{pending}]` | `activeApp` = lamaran itu; `canApply` = `false`; `canCreate` = `false` |
| U-R03 | Satu lamaran `approved` | `apps=[{approved}]` | `approvedApp` terisi; `canApply` = `false`; `canCreate` = `false` |
| U-R04 | Lamaran `rejected` saja | `apps=[{rejected}]` | `activeApp` = `null`; `canApply` = `true`; `canCreate` = `true` |
| U-R05 | Owner tim | `myTeam={nama:"X"}`, `apps=[]` | `canApply` = `false`; `canCreate` = `false` |
| U-R06 | `pendingApps` menyaring | campuran status | hanya yang `pending` |
| U-R07 | Setelah tarik lamaran | `pending` dihapus dari `apps` | `canApply` kembali `true` |
| U-R08 | Eksklusivitas owner/anggota | `myTeam` terisi dan `apps` berisi `approved` (keadaan terlarang) | dokumentasikan; server wajib menolak keadaan ini |

### 4.3 `src/lib/time.js` dan `src/i18n/index.js`

| ID | Kasus | Hasil yang diharapkan |
|---|---|---|
| U-T01 | `fmtTime(ms, "id")` | string tanggal dan jam format `id-ID`, tidak kosong |
| U-T02 | `fmtTime(ms, "xx")` | jatuh ke `id-ID`, tidak melempar galat |
| U-T03 | `fmtTime(NaN, "id")` | mengembalikan `""` atau string "Invalid Date" yang ditangani; tetapkan perilaku |
| U-I01 | `makeT("en").t("nav.back")` | teks Inggris |
| U-I02 | Kunci hilang di `en`/`zh` | kembali ke teks `id` (fallback `pick(I18N.id, path)`) |
| U-I03 | Interpolasi `{team}` | `t("market.oneAtATime", {team:"REKON"})` memuat `REKON` |
| U-I04 | Variabel tak diberikan | placeholder `{x}` dibiarkan utuh |
| U-I05 | `detectLang` urutan prioritas | `?lang=` > `hk_lang` > `navigator.languages` > `"en"` |
| U-I06 | Paritas kunci | seluruh kunci di `id.js` ada di `en.js` dan `zh.js` (tes struktural yang membandingkan pohon kunci); jumlah baris ketiganya saat ini sama (562) |

### 4.4 Tes Paritas Data

| ID | Kasus |
|---|---|
| U-D01 | Setiap vektor di `WEIGHTS[i]` memiliki jumlah opsi yang sama dengan `questions[i].opsi` di tiga bahasa. |
| U-D02 | Setiap kunci bobot termasuk dalam `URUT`. |
| U-D03 | `TIM[].wa` dan link grup lain lolos `WA_LINK_RE`; `TENCENT_*_URL` berupa URL `https`. |
| U-D04 | `TIM[].butuh` dan `BUILDER[].peran` hanya berisi kode jalur valid. |

## 5. Uji Komponen

Alat usulan: Vitest + React Testing Library (lingkungan `jsdom`). Komponen menerima `t`, `get`, `role`, `st`, `patch`, `actions`, jadi mudah dirender dengan state buatan.

| Komponen | Kasus uji utama |
|---|---|
| `Login.jsx` | Email tidak valid memunculkan `login.errEmail`; sandi kosong memunculkan `login.errPass`; akun demo (`rani@aiclub.id`, dst) memanggil `onLogin` dengan profil dari `DUMMY_USERS`; email tak dikenal menurunkan nama dari bagian lokal email. |
| `Identity.jsx` | Kota dan WA wajib; pesan galat tampil dengan `aria-invalid`; email opsional tapi divalidasi bila diisi; email terkunci bila berasal dari akun. |
| `Quiz.jsx` | Satu jawaban terpilih; tombol lanjut tanpa jawaban menampilkan toast `quiz.pick`; pintasan keyboard A-E dan 1-5 memilih opsi; label tombol berubah di soal terakhir (`quiz.finish`). |
| `Result.jsx` | Jalur utama dan kedua sesuai skor; koreksi jalur menetapkan `override`; "Jawab ulang" mengosongkan jawaban; opsi buka tim terbuka untuk semua jalur selama `CONFIG.modeDraft` bernilai `false` (nilai saat ini); bila `modeDraft` dinyalakan, hanya jalur CEO (`result.openTeamLocked` untuk jalur lain). |
| `Group.jsx` | Tombol konfirmasi tidak aktif sampai tautan grup utama diklik (`clickedMain`); `shareText` menyusun pesan dengan kolom yang terisi saja; URL `wa.me` ter-encode. |
| `Choose.jsx` | Pesan terkunci muncul sesuai `lockedOwner`, `lockedMember`, `lockedPending`; konfirmasi dua klik ("YAKIN? KLIK LAGI") pada tutup/keluar/tarik. |
| `Create.jsx` | Nama wajib, minimal satu slot, tautan harus lolos `WA_LINK_RE`. |
| `Market.jsx` | Tombol lamar, tarik, atau terkunci sesuai `rules.js`; tim yang cocok jalur diberi tanda. |
| `TeamDetail.jsx` | Tautan grup terkunci kecuali status `approved`; langkah "cara masuk" mengikuti status. |
| `Dash.jsx` / `MyTeam.jsx` | Log aktivitas ditampilkan; tombol simulasi owner hanya tampil bila `CONFIG.demoOwner` bernilai `true`; setujui/tolak pelamar memperbarui status. |
| `Tencent.jsx` | Pesan status tim berbeda untuk owner, anggota, pelamar, dan tanpa tim; klik tautan mengisi `tencentClicked`. |
| `Submit.jsx` | Tombol submit terkunci sampai kotak "project selesai" dicentang; klik mengisi `submitClicked`. |
| `Chrome.jsx` / `Widgets.jsx` | Stepper dan indikator kecil menandai langkah terkunci; klik langkah terkunci menampilkan toast `nav.locked` atau `group.gate`. |

Uji state `App.jsx` (`initState`): pemulihan dari `localStorage` mengarahkan ulang layar ke gerbang yang benar (tanpa user ke `intro`; ident belum lengkap ke `identitas`; kuis belum selesai ke `kuis`; belum gabung grup utama ke `grup`; owner tim tidak boleh di `pasar`/`buat`).

## 6. Uji End-to-End (Playwright)

Prasyarat: aplikasi berjalan lewat `npm run dev` (atau `npm run preview` setelah build). Setiap tes memulai dengan `localStorage.clear()` pada origin yang diuji.

| ID | Skenario | Langkah ringkas | Hasil yang diharapkan |
|---|---|---|---|
| E-01 | Alur bahagia peserta anggota | Intro, masuk sebagai `bagas@aiclub.id`, lengkapi kota (sudah ada) dan WA, jawab 6 skenario, lihat hasil, klik grup utama, konfirmasi gabung, pilih "Gabung tim", lamar `REKON`, simulasikan setujui, buka tautan grup tim | Layar `dasbor` menampilkan status `DISETUJUI`; tautan grup tim terbuka di tab baru |
| E-02 | Alur bahagia owner | Masuk, jalur CEO, buat tim (nama, slot, tautan WA valid), setujui pelamar contoh | Pelamar berstatus `DISETUJUI`; log aktivitas bertambah |
| E-03 | Gerbang identitas | Masuk sebagai `rani@aiclub.id` (kota dan WA kosong), coba lanjut | Galat kota dan WA; fokus pindah ke kolom pertama yang salah |
| E-04 | Gerbang grup utama | Selesaikan kuis, coba buka stepper langkah 2 | Toast `group.gate`; layar tidak berubah |
| E-05 | Satu lamaran aktif | Lamar `REKON`, coba lamar `WARUNG TAP` | Toast `market.oneAtATime`; hanya satu lamaran aktif |
| E-06 | Eksklusivitas owner/anggota | Setelah membuat tim, coba melamar tim lain | Toast `market.lockedOwner` |
| E-07 | Pindah pilihan | Tarik lamaran lalu buat tim; atau tutup tim lalu lamar | Berhasil hanya setelah langkah pelepasan |
| E-08 | Langkah 2 Tencent | Buka langkah 2 | Tautan menuju `TENCENT_REGISTER_URL` (`https://aiclub.id/l/O3Sa9yF`), `target=_blank`, `rel=noopener noreferrer` |
| E-09 | Langkah 3 Submit | Buka langkah 3, centang "project selesai" | Tombol submit aktif dan menuju `TENCENT_SUBMIT_URL` (`https://aiclub.id/l/9k54mLk`); sebelum dicentang tidak aktif |
| E-10 | Persistensi | Muat ulang di tengah kuis | Soal dan jawaban dipulihkan dari `hk_state` |
| E-11 | Keluar | Klik keluar, muat ulang | Kembali ke `intro`, state dikosongkan |
| E-12 | Tiga bahasa | Ganti ID/EN/ZH | `document.documentElement.lang` dan judul halaman berubah; tidak ada kunci mentah tampil |
| E-13 | Tautan `?lang=zh` | Buka dengan parameter | Antarmuka Mandarin |
| E-14 | Viewport | Ponsel 375 px dan desktop 1280 px | Tidak ada scroll horizontal; `BottomNav` tampil sesuai desain |
| E-15 | Build statis | Jalankan terhadap `npm run preview` dengan `base "./"` | Aset termuat dari sub-path; tidak ada 404 pada `assets/` dan `brand/` |

## 7. Uji API dan Aturan Bisnis Server (Setelah Integrasi)

Berlaku setelah BFF/Worker tersedia ([../brief.md](../brief.md) bagian 4 dan 6). Semua detail kontrak final: _TBD_ (menunggu jawaban pertanyaan terbuka di brief bagian 8). Tes ditulis terhadap lingkungan staging dengan basis data D1 terpisah dan akun uji, bukan produksi.

| ID | Aturan / endpoint | Kasus | Hasil yang diharapkan |
|---|---|---|---|
| A-01 | Autentikasi | Semua `/api/hackathon/*` tanpa session | `401` |
| A-02 | Otorisasi owner | Owner tim B memanggil `POST /applications/:id/decide` untuk lamaran tim A | `403` |
| A-03 | IDOR lamaran | Peserta X menarik (`DELETE /applications/:id`) lamaran milik Y | `403` atau `404` |
| A-04 | IDOR tim | Pengguna bukan owner memanggil `PATCH /teams/:id` | `403` |
| A-05 | Satu lamaran aktif | Dua `POST /teams/:id/apply` berbeda oleh orang yang sama | Yang kedua ditolak (`409`); indeks unik `one_active_app` terjaga |
| A-06 | Race condition | Dua permintaan apply paralel (`Promise.all`) | Tepat satu berhasil |
| A-07 | Owner tidak boleh melamar | Owner memanggil apply | Ditolak |
| A-08 | Pelamar tidak boleh membuat tim | Orang dengan lamaran `pending/approved` memanggil `POST /teams` | Ditolak |
| A-09 | Satu owner satu tim | Owner membuat tim kedua | Ditolak (batasan `UNIQUE owner_id`) |
| A-10 | Auto-withdraw | Satu lamaran disetujui | Lamaran `pending` lain milik orang itu menjadi `withdrawn` dalam satu transaksi |
| A-11 | Kunci `wa_link` | `GET /teams` dan `GET /teams/:id` oleh peserta belum disetujui | Respons tidak memuat `wa_link` |
| A-12 | `wa_link` untuk berhak | Owner dan pelamar `approved` | `wa_link` ada |
| A-13 | Validasi `wa_link` | Nilai selain `https://chat.whatsapp.com/...` | Ditolak `400` |
| A-14 | Pindah pilihan | Anggota keluar, owner menutup tim, pelamar menarik | Tiap transisi sah hanya sesuai urutan |
| A-15 | Gerbang submit | Tandai submit tanpa `project_ready_at` | Ditolak |
| A-16 | Skor resmi | Kirim `jawaban` valid | Server menghitung ulang `jalur`; nilai `jalur` dari klien diabaikan |
| A-17 | Validasi masukan | Payload berlebih, tipe salah, string sangat panjang | `400`, tanpa galat 500 |
| A-18 | Pembatasan laju | Lonjakan permintaan dari satu session/IP | `429` setelah ambang (nilai: _TBD_) |
| A-19 | CSRF | Permintaan mutasi lintas situs tanpa token/Origin valid | Ditolak |
| A-20 | Privasi daftar | `GET /builders` | Tidak memuat nomor WA atau email |
| A-21 | Ekspor admin | Peserta biasa mengakses ekspor | `403` |
| A-22 | Logout | `POST /api/auth/logout` | Session tidak berlaku lagi di kedua sisi |

Kasus A-02, A-05, A-11 dan A-20 langsung sepadan dengan butir "Kriteria selesai" di [../brief.md](../brief.md) bagian 10 dan wajib lulus sebelum rilis produksi. Kerangka ancaman yang melatarinya ada di [14_SECURITY_THREAT_MODEL.md](14_SECURITY_THREAT_MODEL.md).

## 8. Uji Aksesibilitas

Dasar yang sudah ada di kode: fokus dipindah ke judul saat berganti layar, `aria-live="polite"` pada `<main id="app">`, toast dengan `role="status"`, `aria-invalid` pada kolom galat, `prefers-reduced-motion` dihormati saat scroll.

| ID | Pemeriksaan | Cara |
|---|---|---|
| X-01 | Pemindaian otomatis tanpa pelanggaran berat pada tiap layar (`intro`, `login`, `identitas`, `kuis`, `hasil`, `grup`, `pilih`, `pasar`, `tim`, `buat`, `dasbor`, `tencent`, `submit`) | `@axe-core/playwright` |
| X-02 | Seluruh alur dapat diselesaikan hanya dengan keyboard (Tab, Shift+Tab, Enter, Spasi, A-E / 1-5 di kuis) | Manual + Playwright |
| X-03 | Urutan fokus logis; fokus terlihat; tidak ada jebakan fokus | Manual |
| X-04 | Fokus berpindah ke judul setiap pindah layar atau soal | Playwright (`document.activeElement`) |
| X-05 | Pesan galat terbaca pembaca layar dan terhubung ke kolomnya | NVDA/VoiceOver |
| X-06 | Kontras teks dan komponen memenuhi WCAG 2.1 AA, termasuk tema gelap (`theme-color #05070E`) dan font piksel (Press Start 2P, VT323) | Alat kontras + manual |
| X-07 | Tombol `aria-disabled` tetap terbaca dan memberi alasan (mis. `group.confirmHint`) | Manual |
| X-08 | Ukuran target sentuh memadai di ponsel; zoom 200% tanpa kehilangan konten | Manual |
| X-09 | Animasi mengikuti `prefers-reduced-motion` | Emulasi media di Playwright |
| X-10 | Atribut `lang` dokumen mengikuti bahasa terpilih (nilai dari `meta.lang` pada `id.js`, `en.js`, `zh.js`: `id`, `en`, `zh`) | Playwright |
| X-11 | Teks alternatif gambar logo mitra dan poster (`event.posterAlt`) | Manual |

Standar target: WCAG 2.1 AA (usulan; keputusan akhir: _TBD_).

## 9. Matriks Skenario Manual

Data uji dari `DUMMY_USERS` di `src/data.js`:

| Akun | Email | Nama | Kota | WA | LinkedIn | Tujuan |
|---|---|---|---|---|---|---|
| Rani | `rani@aiclub.id` | Rani Putri | kosong | kosong | kosong | Menguji gerbang kota dan WA wajib |
| Bagas | `bagas@aiclub.id` | Bagas Pratama | Malang | kosong | kosong | Menguji gerbang WA saja |
| Salsa | `salsa@aiclub.id` | Salsa Nadira | Bandung | kosong | `https://linkedin.com/in/salsa-nadira` | Menguji pra-isi LinkedIn dan gerbang WA |
| Bebas | email apa saja + sandi bebas | diturunkan dari email | kosong | kosong | kosong | Menguji pembuatan profil dari email tak dikenal |

Data tim dari `TIM` (REKON, WARUNG TAP, SIAP RISIKO, TANYA OPS, ANTRE HABIS, BACA KONTRAK) dan `BUILDER` (Dimas, Lala, Hendra, Vina, Arif, Tari). Pelamar contoh pada tim buatan peserta: `SEED_APPLICANTS = [0, 4]` (Dimas dan Arif).

### 9.1 Alur Peserta (anggota)

| ID | Prasyarat | Langkah | Hasil yang diharapkan | Lulus? |
|---|---|---|---|---|
| M-P01 | Browser bersih | Buka beranda, klik mulai | Menuju login | _TBD_ |
| M-P02 | M-P01 | Login `rani@aiclub.id` sandi `x` | Layar data diri; email terkunci | _TBD_ |
| M-P03 | M-P02 | Kosongkan kota dan WA, klik lanjut | Galat `errCity` dan `errWa` | _TBD_ |
| M-P04 | M-P02 | Isi WA `0812345678` (10 digit), kota `Kupang` | Lanjut ke skenario | _TBD_ |
| M-P05 | M-P04 | Jawab semua soal dengan opsi A | Hasil tampil dengan jalur utama dan kedua | _TBD_ |
| M-P06 | M-P05 | Koreksi jalur ke `DSG` | Jalur aktif menjadi DESIGNER | _TBD_ |
| M-P07 | M-P05 | Di grup utama, klik konfirmasi sebelum klik tautan | Toast petunjuk; tidak lanjut | _TBD_ |
| M-P08 | M-P05 | Klik tautan grup utama lalu konfirmasi | Lanjut ke "pilih jalan" | _TBD_ |
| M-P09 | M-P08 | Pilih gabung, buka detail `REKON` | Tautan grup terkunci | _TBD_ |
| M-P10 | M-P09 | Lamar `REKON`, lalu coba lamar tim lain | Ditolak dengan pesan satu lamaran | _TBD_ |
| M-P11 | M-P10 | Tarik lamaran, lamar `WARUNG TAP` | Berhasil | _TBD_ |
| M-P12 | M-P11 | Setujui lewat tombol demo | Status `DISETUJUI`; tautan grup tim aktif; lamaran pending lain batal otomatis (jika ada) | _TBD_ |
| M-P13 | M-P12 | Keluar dari tim | Kembali ke "pilih jalan"; bisa membuat tim | _TBD_ |
| M-P14 | M-P08 | Pilih buat tim | Lihat M-O01 | _TBD_ |
| M-P15 | Selesai langkah 1 | Buka langkah 2 | Tautan Tencent daftar tim terbuka di tab baru | _TBD_ |
| M-P16 | M-P15 | Buka langkah 3, centang "project selesai" | Tombol submit aktif | _TBD_ |
| M-P17 | Tengah alur | Muat ulang halaman | Posisi dan data terjaga | _TBD_ |
| M-P18 | Tengah alur | Ganti bahasa ke EN dan ZH | Semua teks berganti | _TBD_ |
| M-P19 | Login Salsa | Periksa kolom data diri | Kota `Bandung` dan LinkedIn terisi | _TBD_ |
| M-P20 | Login Bagas | Periksa kolom data diri | Kota `Malang` terisi; WA kosong dan wajib | _TBD_ |

### 9.2 Alur Owner

| ID | Prasyarat | Langkah | Hasil yang diharapkan | Lulus? |
|---|---|---|---|---|
| M-O01 | Gerbang grup utama lolos | Pilih buat tim, isi nama, pilih slot, tautan WA valid | Tim terbuka; dasbor menampilkan "TIM SAYA" | _TBD_ |
| M-O02 | M-O01 | Kosongkan nama / tanpa slot / tautan `http://...` | Galat `errName`, `errSlot`, `errWa` | _TBD_ |
| M-O03 | M-O01 | Periksa pelamar masuk | Dimas dan Arif berstatus menunggu | _TBD_ |
| M-O04 | M-O03 | Setujui Dimas, tolak Arif | Status berubah; log mencatat | _TBD_ |
| M-O05 | M-O01 | Undang builder dari daftar, batalkan undangan | Status `TERKIRIM` lalu kembali | _TBD_ |
| M-O06 | M-O01 | Ubah dan simpan tautan grup tim | Toast `saved` | _TBD_ |
| M-O07 | M-O01 | Coba melamar ke tim lain | Ditolak (`lockedOwner`) | _TBD_ |
| M-O08 | M-O01 | Tutup tim (dua klik konfirmasi) | Kembali ke "pilih jalan"; tim dan pelamar dibersihkan | _TBD_ |
| M-O09 | Mengikuti M-O08 | Lamar ke tim lain | Berhasil | _TBD_ |
| M-O10 | Jalur bukan CEO, `modeDraft = false` | Lihat hasil dan buat tim | Opsi buka tim tampil terbuka dan tim dapat dibuat (perilaku saat ini). Dengan `modeDraft = true`, teks terkunci (`openTeamLocked`); _TBD_ apakah tombol buat tim ikut diblok |

### 9.3 Lintas Perangkat

Peramban yang diuji: _TBD_ (usulan: dua versi terakhir Chrome, Safari iOS, Firefox, Edge). Pengujian mode privat/penyimpanan diblokir: aplikasi harus tetap berjalan karena akses `localStorage` dibungkus `try/catch`.

## 10. Data Uji dan Pengelolaan Lingkungan

| Kebutuhan | Pendekatan |
|---|---|
| Akun | `DUMMY_USERS` untuk klien. Setelah integrasi: akun uji khusus di staging, tidak memakai data anggota nyata. |
| Reset state | Hapus `hk_state` dan `hk_lang` (lihat [17_DEVELOPER_SETUP.md](17_DEVELOPER_SETUP.md)); di Playwright gunakan `storageState` bersih atau konteks baru. |
| Waktu | Aktivitas memakai `Date.now()`; gunakan jam palsu (`vi.useFakeTimers`, `page.clock`) agar deterministik. |
| Tautan eksternal | Jangan menembus ke `chat.whatsapp.com` atau `aiclub.id/l/...`; cukup periksa atribut `href`, `target`, `rel`, atau hadang permintaan. |
| Tautan WA uji | Gunakan nilai placeholder seperti pada `TIM` (mis. `https://chat.whatsapp.com/DummyRekon01`), jangan tautan grup sungguhan. |

## 11. Kriteria Lulus per Rilis

1. Seluruh tes unit hijau; cakupan `src/lib/*` mendekati penuh (target angka: _TBD_).
2. E-01 sampai E-15 hijau pada Chromium; subset (E-01, E-05, E-09) pada WebKit dan Firefox.
3. Tanpa pelanggaran axe tingkat serius/kritis.
4. Matriks manual 9.1 dan 9.2 dijalankan penuh untuk rilis besar, dan subset untuk rilis kecil.
5. Setelah integrasi: seluruh A-01 sampai A-22 hijau di staging sebelum produksi.
6. `npm run build` sukses dan `docs/` tidak kehilangan file `.md` (lihat [18_INSTALLATION.md](18_INSTALLATION.md) mengenai perbaikan `emptyOutDir` 2026-10-21).

## 12. Rencana Penerapan Bertahap

| Tahap | Pekerjaan | Keluaran |
|---|---|---|
| 1 | Pasang Vitest; tulis U-S, U-R, U-T, U-I, U-D | Skrip `npm test` (nama usulan) |
| 2 | Tambah React Testing Library; uji komponen paling berisiko (`Identity`, `Group`, `Choose`, `Market`, `TeamDetail`) | Cakupan komponen inti |
| 3 | Pasang Playwright; E-01 sampai E-15; axe | Skrip `npm run e2e` (usulan) |
| 4 | CI untuk menjalankan tahap 1 sampai 3 pada setiap permintaan tarik | Konfigurasi CI: _TBD_ |
| 5 | Uji API setelah backend (A-01 sampai A-22), berbagi golden test skor | Rangkaian uji staging |

Perubahan pada `package.json` untuk tahap di atas belum dilakukan dan berada di luar cakupan dokumen ini.
