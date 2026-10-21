# Functional Requirements Document (FRD)

> Status: Draft
> Terakhir diperbarui: 2026-10-21
> Pemilik: Tim AIClub Hackathon

Dokumen ini memuat kebutuhan fungsional Portal Pendaftaran AI Agent Hackathon dengan ID `FR-xxx`, dikelompokkan per modul. Konteks: [00_PROJECT_CHARTER.md](00_PROJECT_CHARTER.md), [01_PRD.md](01_PRD.md), [02_BRD.md](02_BRD.md). Aspek teknis: [04_TRD.md](04_TRD.md), [05_ARCHITECTURE.md](05_ARCHITECTURE.md). Pemetaan ke pengujian dan kebutuhan lain: [19_REQUIREMENTS_TRACEABILITY.md](19_REQUIREMENTS_TRACEABILITY.md). Rencana integrasi: [../brief.md](../brief.md).

## 1. Cara membaca dokumen

### 1.1 Status

| Status | Arti |
|---|---|
| **Ada (as-built, dummy)** | Sudah berjalan di kode saat ini. Data dummy disimpan di `localStorage` peramban (kunci `hk_state`, `hk_lang`); tidak ada backend. |
| **Rencana (integrasi aiclub.id)** | Belum ada. Bergantung pada integrasi login, session, dan basis data aiclub.id ([../brief.md](../brief.md)). Detail bentuk akhir dapat berubah setelah pertanyaan terbuka brief bagian 8 dijawab. |

### 1.2 Format acceptance criteria

Setiap FR memiliki kriteria penerimaan berformat Given/When/Then (G/W/T) atau daftar cek. Semua FR berstatus "Ada" memiliki kriteria yang dapat diverifikasi langsung pada kode atau antarmuka. Kriteria FR berstatus "Rencana" menjadi target uji setelah integrasi.

### 1.3 Singkatan rujukan sumber

Seluruh path relatif terhadap `/home/user/aiclub-hackathon/`. `C:` = `src/components/`, `L:` = `src/lib/`, `I:` = `src/i18n/`.

### 1.4 Penyimpanan state (as-built)

State peserta disimpan di `localStorage` kunci `hk_state` untuk kunci berikut (`PERSIST` di `src/App.jsx`): `user, screen, nama, kota, email, wa, linkedin, github, annViewed, annOpen, prevScreen, chats, latar, idx, jawab, override, clickedMain, joinedMain, mode, viewTeam, tencentClicked, projectReady, submitClicked, tab, apps, undang, myTeam, applicants, log, sharedTeams, invite`. Bahasa disimpan terpisah di kunci `hk_lang`.

### 1.5 Layar dan kode layar (`SCREENS`, `src/data.js`)

`info` (pengumuman), `intro`, `login`, `identitas`, `kuis`, `hasil`, `grup`, `pilih`, `pasar`, `tim` (detail tim), `buat`, `dasbor`, `tencent`, `submit`. Pemetaan layar ke langkah besar (`STEP_OF`): `info`, `intro`, dan `login` = -1; `identitas` sampai `dasbor` = 0 (Daftar); `tencent` = 1; `submit` = 2.

## 2. Indeks kebutuhan

| Modul | Rentang FR | Jumlah |
|---|---|---|
| A. Login | FR-001 sampai FR-004 | 4 |
| B. Data diri | FR-005 sampai FR-009 | 5 |
| C. Skenario/kuis dan jalur | FR-010 sampai FR-015 | 6 |
| D. Grup WhatsApp utama | FR-016 sampai FR-019 | 4 |
| E. Pilih jalan | FR-020 sampai FR-022 | 3 |
| F. Pasar tim dan lamaran | FR-023 sampai FR-030 | 8 |
| G. Buat tim dan dasbor owner (termasuk dasbor status) | FR-031 sampai FR-038 | 8 |
| H. Portal Tencent (daftar tim) | FR-039 sampai FR-041 | 3 |
| I. Submit project | FR-042 sampai FR-044 | 3 |
| J. Internasionalisasi (id/en/zh) | FR-045 sampai FR-048 | 4 |
| K. Navigasi dan stepper | FR-049 sampai FR-055 | 7 |
| L. Informasi event dan administrasi (termasuk link undangan tim) | FR-056 sampai FR-059 | 4 |
| M. Pengumuman, batas keputusan owner, dan ruang tim | FR-060 sampai FR-067 | 8 |

Total: 67 kebutuhan (57 berstatus Ada, 10 berstatus Rencana: FR-004, 009, 015, 019, 022, 030, 038, 041, 044, 058). FR-060 sampai FR-067 berjalan di mode demo; kebutuhan backend-nya dicatat di masing-masing FR dan dirinci di [../brief.md](../brief.md).

---

## 3. Modul A: Login

### FR-001 Halaman login dummy dengan validasi

| Atribut | Nilai |
|---|---|
| Status | Ada (as-built, dummy) |
| Prioritas | Must |
| Sumber | `C:Login.jsx`, `I:id.js` (`login.*`), `App.jsx` (`login`, `next`) |
| Terkait | US-002; BR-08 |

Deskripsi: layar `login` menampilkan form email dan kata sandi berlabel "DUMMY - BELUM TERSAMBUNG KE AICLUB.ID SUNGGUHAN". Email apa pun yang valid dengan sandi tidak kosong diterima.

Acceptance criteria:
- G: peserta berada di layar login; W: mengirim form dengan email tidak berformat `x@y.z`; T: pesan galat "Format email belum benar" tampil dan login tidak diproses.
- G: email valid; W: kata sandi kosong; T: pesan "Isi kata sandi dulu" tampil dan login tidak diproses.
- G: email valid dan sandi apa pun tidak kosong; W: submit; T: `user = {email, nama}` tersimpan dan layar berpindah ke `identitas`.
- G: email tidak ada di `DUMMY_USERS`; W: login; T: nama ditebak dari bagian sebelum `@` (pemisah `.`, `_`, `-` diganti spasi, huruf awal kapital), kota, WhatsApp, dan LinkedIn dikosongkan. Email dinormalkan huruf kecil dan dipotong spasi.
- G: layar login; W: tombol Kembali ditekan; T: kembali ke `intro`.

### FR-002 Akun demo satu klik

| Atribut | Nilai |
|---|---|
| Status | Ada (as-built, dummy) |
| Prioritas | Should |
| Sumber | `C:Login.jsx`, `src/data.js` (`DUMMY_USERS`) |
| Terkait | US-002 |

Deskripsi: tiga akun demo dengan kelengkapan profil berbeda agar semua cabang validasi dapat diuji: `rani@aiclub.id` (kota dan WhatsApp kosong), `bagas@aiclub.id` (kota Malang, WhatsApp kosong), `salsa@aiclub.id` (kota Bandung, LinkedIn terisi, WhatsApp kosong).

Acceptance criteria:
- G: layar login; W: peserta mengklik salah satu akun demo; T: login langsung berhasil tanpa mengisi form dan layar `identitas` tampil.
- G: login dengan Rani; W: layar data diri terbuka; T: nama "Rani Putri" dan email `rani@aiclub.id` terisi, kota dan WhatsApp kosong.
- G: login dengan Salsa; W: layar data diri terbuka; T: kota "Bandung" dan LinkedIn `https://linkedin.com/in/salsa-nadira` terisi, WhatsApp kosong.
- Daftar akun demo dan petunjuk "Profil tiap akun berbeda" tampil di bawah form.

### FR-003 Sesi peserta, penanda pengguna, dan logout

| Atribut | Nilai |
|---|---|
| Status | Ada (as-built, dummy) |
| Prioritas | Must |
| Sumber | `C:Chrome.jsx` (`Header`), `App.jsx` (`login`, `logout`, `initState`) |
| Terkait | US-002, US-030 |

Acceptance criteria:
- G: peserta sudah login; W: header dirender; T: chip "Masuk sebagai {nama}" dengan tombol KELUAR tampil, dan `title` chip berisi email.
- G: peserta menekan KELUAR; W: aksi diproses; T: seluruh state peserta direset ke kondisi awal (`fresh()`: `user` null, data diri, jawaban, tim, lamaran, log dikosongkan) dan layar `intro` tampil. Pilihan bahasa tetap.
- G: halaman dimuat ulang di layar selain `intro` dan `login`; W: `user` tidak ada di state tersimpan; T: layar diarahkan ke `intro`.
- G: login pertama kali; W: akun membawa data profil; T: data yang sudah diketik peserta tidak ditimpa (`s.nama || u.nama`, dan seterusnya untuk kota, WhatsApp, LinkedIn).
- Pada as-built, sesi hanya berlaku di peramban yang sama; tidak ada kedaluwarsa sesi.

### FR-004 Login dan session aiclub.id sungguhan

| Atribut | Nilai |
|---|---|
| Status | Rencana (integrasi aiclub.id) |
| Prioritas | Must (integrasi) |
| Sumber | [../brief.md](../brief.md) bagian 4 dan 7 (`Login.jsx`, `src/lib/api.js` baru, `App.jsx`) |
| Terkait | US-002, US-031; BR-08 |

Deskripsi: mengganti form dummy dengan tombol "Masuk dengan aiclub.id". Opsi A (cookie session bersama di `*.aiclub.id`, disarankan), B (OAuth/OIDC), atau C (magic link) dipilih berdasarkan jawaban pertanyaan 8.1 sampai 8.3 brief (keputusan: _TBD_).

Acceptance criteria:
- G: pengguna belum login; W: membuka portal atau memanggil API; T: respons 401 dan klien mengarahkan ke login aiclub.id (`VITE_LOGIN_URL`).
- G: pengguna login lewat aiclub.id; W: portal dimuat; T: `GET /api/hackathon/me` mengembalikan profil dan status; `DUMMY_USERS` tidak ada lagi di bundel.
- G: pengguna menekan keluar; W: `POST /api/auth/logout` dipanggil; T: session di aiclub.id berakhir (berlaku di kedua sisi).
- G: halaman dimuat ulang atau dibuka di perangkat lain; W: session masih valid; T: pengguna tetap masuk.
- Cookie `HttpOnly`, `Secure`, `SameSite=Lax`, `Domain=.aiclub.id` (bila opsi A); tidak ada rahasia di bundel klien.

---

## 4. Modul B: Data diri

### FR-005 Formulir data diri

| Atribut | Nilai |
|---|---|
| Status | Ada (as-built, dummy) |
| Prioritas | Must |
| Sumber | `C:Identity.jsx`, `C:Combo.jsx`, `src/data.js` (`LATAR`), `I:id.js` (`identity.*`) |
| Terkait | US-003; BR-01 |

Deskripsi: formulir berisi nama (wajib), kota (wajib), email (terkunci bila login; opsional diformat), WhatsApp (wajib), LinkedIn (opsional), dan latar (`kerja-tech`, `kerja-nontech`, `mahasiswa`, `freelance`, `founder`, `cari-kerja`; bawaan `kerja-tech`) lewat kotak pilihan yang dapat dicari.

Acceptance criteria:
- G: layar `identitas`; W: dirender; T: tampil bidang NAMA, KOTA, EMAIL, WHATSAPP, LINKEDIN (opsional), SEKARANG KAMU, dan catatan bahwa data tidak menentukan peran.
- G: peserta mengetik pada bidang; W: nilai berubah; T: state diperbarui dan galat bidang itu dihapus.
- G: peserta membuka kotak pilihan latar; W: memilih salah satu dari 6 opsi; T: nilai `latar` tersimpan; pilihan dapat dicari dengan teks.
- G: peserta menekan Enter di formulir atau tombol LANJUT KE SKENARIO; W: validasi lolos; T: layar berpindah ke `kuis`.
- Teks bantuan: "Terhubung dengan akun aiclub.id. Lengkapi data yang masih kosong; kota dan WhatsApp wajib." tampil bila `user` ada.

### FR-006 Validasi data diri

| Atribut | Nilai |
|---|---|
| Status | Ada (as-built, dummy) |
| Prioritas | Must |
| Sumber | `App.jsx` (`next`, kasus `identitas`), `L:scoring.js` (`waValid`) |
| Terkait | US-004; BRL-01 |

Acceptance criteria:
- G: nama kosong atau hanya spasi; W: LANJUT; T: galat "Isi nama dulu ya" pada nama dan perpindahan layar dibatalkan.
- G: kota kosong; W: LANJUT; T: galat "Isi kota dulu ya".
- G: nomor WhatsApp berisi kurang dari 9 atau lebih dari 15 digit (karakter non-digit diabaikan); W: LANJUT; T: galat "Nomor WhatsApp belum benar (9-15 angka)". Contoh lolos: `08123456789`, `+62 812-3456-789`.
- G: email terisi tetapi tidak cocok pola `^[^\s@]+@[^\s@]+\.[^\s@]+$`; W: LANJUT; T: galat "Format email belum benar". Email kosong tidak dianggap galat.
- G: ada satu atau lebih galat; W: LANJUT; T: semua galat tampil bersamaan dan fokus pindah ke bidang bergalat pertama.
- G: semua bidang wajib valid; W: LANJUT; T: berpindah ke `kuis`; bila `idx` >= jumlah skenario maka `idx` direset ke 0.

### FR-007 Prefill dari akun dan penguncian email

| Atribut | Nilai |
|---|---|
| Status | Ada (as-built, dummy) |
| Prioritas | Must |
| Sumber | `App.jsx` (`login`), `C:Identity.jsx` |
| Terkait | US-003 |

Acceptance criteria:
- G: peserta login dengan akun yang memiliki data; W: layar data diri dibuka; T: nama, kota, email, dan LinkedIn akun terisi otomatis.
- G: peserta sudah login; W: layar data diri; T: bidang email berstatus read-only dengan label "(dari akun aiclub.id)".
- G: peserta mengubah kota atau WhatsApp; W: melanjutkan; T: nilai baru dipakai di seluruh aplikasi (pesan perkenalan, kota tim yang dibuat), tetapi tidak ditulis balik ke profil aiclub.id (belum ada profil sungguhan).

### FR-008 Gerbang kelengkapan data diri

| Atribut | Nilai |
|---|---|
| Status | Ada (as-built, dummy) |
| Prioritas | Must |
| Sumber | `L:scoring.js` (`identDone`, `reachable`, `subReachable`), `App.jsx` (`initState`) |
| Terkait | US-004 |

Acceptance criteria:
- G: `identDone` salah (nama, kota, atau WhatsApp belum valid); W: peserta membuka ulang halaman di layar selain `intro`, `login`, `identitas`; T: diarahkan ke `identitas`.
- G: data diri belum lengkap; W: peserta mengklik langkah besar 2 atau 3 di stepper; T: langkah terkunci (tombol nonaktif) dan toast "Selesaikan langkah sebelumnya dulu" bila dipicu dari navigasi bawah.
- G: data diri belum lengkap; W: indikator sub-langkah "Skenario" dan seterusnya; T: tidak dapat diklik.

### FR-009 Profil dari aiclub.id dan penulisan balik

| Atribut | Nilai |
|---|---|
| Status | Rencana (integrasi aiclub.id) |
| Prioritas | Must (integrasi) |
| Sumber | [../brief.md](../brief.md) bagian 5.1 |
| Terkait | US-003, US-031; BR-01, BR-08 |

Acceptance criteria:
- G: peserta masuk; W: layar data diri dibuka; T: `memberId`, nama, email, kota (`cityId`), WhatsApp, dan LinkedIn dibaca dari profil aiclub.id, bukan disimpan ulang.
- G: peserta mengubah kota, WhatsApp, atau LinkedIn; W: menyimpan; T: perubahan ditulis balik ke profil aiclub.id; bila penulisan balik tidak diizinkan, disimpan di `hackathon_participant` dan ditandai override (keputusan: _TBD_, pertanyaan 8.4).
- Kota dipilih berdasarkan `cityId` dari `/agent/regions`, bukan teks bebas.
- Layar persetujuan penggunaan data (WhatsApp, kota) ditampilkan sebelum nomor tampil ke pengelola atau owner (pertanyaan 8.5; FR terpisah _TBD_).

---

## 5. Modul C: Skenario/kuis dan jalur

### FR-010 Kuis 6 skenario

| Atribut | Nilai |
|---|---|
| Status | Ada (as-built, dummy) |
| Prioritas | Must |
| Sumber | `C:Quiz.jsx`, `L:scoring.js` (`total`), `src/data.js` (`CONFIG.quizLen = 6`, `WEIGHTS`), `I:id.js` (`questions`) |
| Terkait | US-005 |

Deskripsi: enam skenario, masing-masing satu layar: Hari Pertama (5 opsi), Prototipenya Jalan Tapi Jelek (4), Agent-mu Ngarang (4), Satu Orang Hilang (4), Lima Menit di Depan Juri (4), Setelah Hackathon (5). Tidak ada jawaban benar.

Acceptance criteria:
- G: layar `kuis`; W: dirender; T: tampil judul, teks, opsi berlabel A sampai E sesuai jumlah opsi, indikator "skenario {a} dari 6", bilah progres, dan tulisan "tidak ada jawaban benar".
- G: peserta memilih opsi; W: klik; T: opsi bertanda `aria-checked=true` dan jawaban tersimpan pada indeks skenario itu.
- G: peserta sudah menjawab skenario 1; W: kembali dari skenario 2; T: jawaban skenario 1 masih terpilih.
- G: skenario terakhir (6) dijawab; W: tombol LIHAT HASIL; T: layar `hasil`.
- Jumlah skenario = `min(CONFIG.quizLen, WEIGHTS.length)` = 6.

### FR-011 Wajib memilih sebelum lanjut

| Atribut | Nilai |
|---|---|
| Status | Ada (as-built, dummy) |
| Prioritas | Must |
| Sumber | `App.jsx` (`next`, kasus `kuis`), `L:scoring.js` (`quizDone`) |
| Terkait | US-005; BRL-02 |

Acceptance criteria:
- G: skenario belum dijawab; W: LANJUT; T: toast "Pilih satu jawaban dulu" tampil (hilang sekitar 2,2 detik) dan layar tidak berpindah.
- G: ada skenario yang belum dijawab; W: peserta membuka langkah di luar kuis lewat indikator atau stepper; T: layar hasil, grup, dan seterusnya tidak dapat dicapai (`quizDone` salah); saat dimuat ulang dialihkan ke `kuis`.
- G: peserta mengklik indikator "Skenario" setelah sebagian terjawab; W: diklik; T: membuka skenario pertama yang belum dijawab.

### FR-012 Pintasan keyboard di kuis

| Atribut | Nilai |
|---|---|
| Status | Ada (as-built, dummy) |
| Prioritas | Should |
| Sumber | `App.jsx` (efek `onKey`) |
| Terkait | US-006 |

Acceptance criteria:
- G: layar `kuis` dan fokus tidak di input, select, atau textarea; W: menekan A sampai E atau 1 sampai 5; T: opsi dengan indeks sesuai terpilih bila indeks < jumlah opsi skenario itu (mis. E diabaikan di skenario 4 opsi).
- G: layar `kuis`; W: Enter ditekan saat fokus bukan di tombol; T: sama dengan LANJUT (termasuk toast bila belum menjawab).
- G: tombol Ctrl, Meta, atau Alt ikut ditekan; T: pintasan tidak aktif.
- Pintasan tidak aktif di layar selain `kuis`.

### FR-013 Skoring jalur

| Atribut | Nilai |
|---|---|
| Status | Ada (as-built, dummy) |
| Prioritas | Must |
| Sumber | `L:scoring.js` (`skor`, `urutSkor`, `aktif`), `src/data.js` (`URUT`, `WEIGHTS`) |
| Terkait | US-007; BR-03 |

Deskripsi: tiap opsi jawaban menambah bobot ke satu atau lebih dari 8 jalur (`CEO, CTO, AI, PM, DSG, GRW, DOM, DAT`). Skor jalur = jumlah bobot semua jawaban. Urutan jalur menurun menurut skor; skor sama mengikuti urutan `URUT`. Jalur aktif = `override` bila ada, jika tidak jalur teratas.

Acceptance criteria:
- G: skenario 1 dijawab opsi A (`{DOM:3, PM:1}`); W: skor dihitung; T: DOM = 3, PM = 1, jalur lain 0.
- G: jawaban yang indeksnya tidak punya bobot; T: diabaikan tanpa galat.
- G: dua jalur dengan skor sama tertinggi; W: urutan ditentukan; T: jalur yang lebih awal di `URUT` menjadi utama.
- G: `override` terisi; W: jalur aktif dibaca; T: `override` dipakai (bukan jalur skor tertinggi).
- Hasil skoring deterministik untuk jawaban yang sama.

### FR-014 Hasil jalur, koreksi, dan jawab ulang

| Atribut | Nilai |
|---|---|
| Status | Ada (as-built, dummy) |
| Prioritas | Must |
| Sumber | `C:Result.jsx`, `C:Combo.jsx`, `App.jsx` (`redo`), `I:id.js` (`result.*`, `roles.*`) |
| Terkait | US-007, US-008, US-009 |

Acceptance criteria:
- G: kuis selesai; W: layar `hasil`; T: tampil JALUR UTAMA (nama ringkas dan deskripsi), JALUR KEDUA (jalur teratas berikutnya yang bukan jalur utama), dan SKOR PER JALUR (bilah relatif terhadap skor tertinggi; jalur aktif berwarna kuning).
- G: peserta memilih peran lain di "SISTEM BISA SALAH - KOREKSI DI SINI"; W: memilih; T: `override` tersimpan dan seluruh tampilan hasil serta pasar tim memakai peran itu.
- G: hasil dirender; W: bagian "YANG TERBUKA UNTUKMU"; T: memuat empat butir: buka tim sendiri (bila `CONFIG.modeDraft` salah atau jalur CEO), melamar ke tim yang butuh jalur aktif, diundang tim lain, pelatihan dengan WorkBuddy (pilih 1 dari 3 tantangan).
- G: peserta menekan "Jawab ulang"; W: diproses; T: `jawab` dikosongkan, `idx` = 0, `override` = null, dan layar `kuis` tampil.
- G: peserta menekan GABUNG GRUP WHATSAPP; T: layar `grup`.

### FR-015 Penghitungan ulang jalur resmi di server

| Atribut | Nilai |
|---|---|
| Status | Rencana (integrasi aiclub.id) |
| Prioritas | Should (integrasi) |
| Sumber | [../brief.md](../brief.md) bagian 5.2 dan 6 |
| Terkait | US-031; BRL-11 |

Acceptance criteria:
- G: peserta menyimpan jawaban lewat `PATCH /api/hackathon/me`; W: server menerima; T: kolom `jawaban` (array indeks) disimpan dan `jalur` dihitung ulang server memakai bobot yang sama; nilai dari klien tidak dipercaya.
- G: peserta mengoreksi jalur; W: disimpan; T: `jalur_override` tersimpan terpisah dari `jalur`.
- G: pengguna berpindah perangkat; W: login; T: jawaban dan jalur yang sama tampil.

---

## 6. Modul D: Grup WhatsApp utama

### FR-016 Gabung grup utama dan konfirmasi mandiri

| Atribut | Nilai |
|---|---|
| Status | Ada (as-built, dummy) |
| Prioritas | Must |
| Sumber | `C:Group.jsx`, `App.jsx` (`confirmMain`), `src/data.js` (`WA_GROUP_URL`), `I:id.js` (`group.*`) |
| Terkait | US-010; BR-02, BRL-03 |

Acceptance criteria:
- G: layar `grup`; W: dirender; T: tombol "KLIK DISINI UNTUK GABUNG WHATSAPP" membuka `https://chat.whatsapp.com/GNcd3TL3bZ71LoxlL8RzH9` di tab baru (`target=_blank`, `rel="noopener noreferrer"`).
- G: peserta belum mengklik tautan gabung; W: menekan SAYA SUDAH GABUNG; T: toast "Klik tombol gabung di atas dulu, baru bisa lanjut." dan `joinedMain` tetap salah.
- G: peserta sudah mengklik tautan (`clickedMain` benar); W: menekan SAYA SUDAH GABUNG; T: `joinedMain` benar, entri log "joinMain" ditambahkan, dan layar berpindah ke `pilih`.
- G: `joinedMain` benar; W: layar `grup` dibuka kembali; T: tampil "Sudah gabung grup utama".
- Konfirmasi bersifat pernyataan mandiri; portal tidak dapat memverifikasi keanggotaan sebenarnya di WhatsApp.

### FR-017 Pesan perkenalan siap kirim

| Atribut | Nilai |
|---|---|
| Status | Ada (as-built, dummy) |
| Prioritas | Should |
| Sumber | `C:Group.jsx` (`shareText`), `I:id.js` (`group.msg.*`) |
| Terkait | US-011 |

Acceptance criteria:
- G: layar `grup`; W: pratinjau pesan dirender; T: pesan berurutan: kalimat pembuka ("Halo, saya peserta AI Agent Hackathon"), baris Nama, Kota, Email, Latar, WhatsApp, LinkedIn, Jalur, Jalur kedua. Baris Kota, Email, WhatsApp, dan LinkedIn hanya muncul bila terisi.
- G: peserta mengoreksi jalur; W: pratinjau dirender ulang; T: baris Jalur memakai jalur aktif dan Jalur kedua jalur teratas lainnya.
- G: peserta menekan "KLIK DISINI UNTUK KIRIM INFORMASI KAMU KE WHATSAPP"; T: membuka `https://wa.me/?text=<pesan ter-encode>` di tab baru.
- Pesan mengikuti bahasa antarmuka aktif.

### FR-018 Gerbang grup utama

| Atribut | Nilai |
|---|---|
| Status | Ada (as-built, dummy) |
| Prioritas | Must |
| Sumber | `App.jsx` (`toChoose`, `initState`), `L:scoring.js` (`reachable`, `subReachable`) |
| Terkait | US-010; BRL-03 |

Acceptance criteria:
- G: `joinedMain` salah; W: menekan LANJUT PILIH JALAN; T: toast "Gabung grup utama dulu sebelum masuk pasar tim" dan tidak berpindah.
- G: `joinedMain` salah; W: halaman dimuat ulang di layar `pilih`, `pasar`, `tim`, `buat`, `dasbor`, `tencent`, atau `submit`; T: dialihkan ke `grup`.
- G: `joinedMain` salah; W: mengklik langkah besar 2 atau 3; T: langkah terkunci; toast "Gabung grup utama dulu sebelum masuk pasar tim" bila identitas dan kuis sudah selesai, selain itu "Selesaikan langkah sebelumnya dulu".

### FR-019 Status gabung grup utama di server

| Atribut | Nilai |
|---|---|
| Status | Rencana (integrasi aiclub.id) |
| Prioritas | Should (integrasi) |
| Sumber | [../brief.md](../brief.md) bagian 5.2 (`joined_main_at`) |
| Terkait | US-031 |

Acceptance criteria:
- G: peserta mengonfirmasi bergabung; W: `PATCH /api/hackathon/me`; T: `joined_main_at` terisi dan menjadi dasar gerbang di server.
- G: `joined_main_at` kosong; W: peserta memanggil API pembuatan tim atau lamaran; T: ditolak server (kode galat: _TBD_).
- Verifikasi keanggotaan WhatsApp sungguhan: _TBD_ (tidak ada sumber data di brief).

---

## 7. Modul E: Pilih jalan

### FR-020 Layar pilih jalan (gabung atau buat tim)

| Atribut | Nilai |
|---|---|
| Status | Ada (as-built, dummy) |
| Prioritas | Must |
| Sumber | `C:Choose.jsx`, `App.jsx` (`chooseJoin`, `chooseCreate`, `goDash`), `I:id.js` (`choose.*`) |
| Terkait | US-012; BR-03 |

Acceptance criteria:
- G: peserta belum memiliki tim atau lamaran; W: layar `pilih`; T: dua kartu: A "GABUNG TIM" (tombol CARI TIM) dan B "BUAT TIM" (tombol BUAT TIM SENDIRI).
- G: peserta memiliki lamaran (tanpa tim sendiri); W: layar `pilih`; T: kartu A berlabel "PILIHANMU SEKARANG" dengan tombol LANJUT KE LAMARANKU.
- G: peserta adalah owner; W: layar `pilih`; T: kartu B berlabel "PILIHANMU SEKARANG" dengan tombol LANJUT KE TIMKU yang membuka `dasbor`.
- G: peserta menekan CARI TIM; T: layar `pasar` dengan `mode = join`. G: menekan BUAT TIM SENDIRI; T: layar `buat` dengan `mode = create`.
- Teks eksplisit: "Satu orang hanya bisa tergabung di satu tim, atau membuka satu tim. Tidak bisa dua-duanya sekaligus."

### FR-021 Aturan eksklusivitas dan jalur pindah di sisi klien

| Atribut | Nilai |
|---|---|
| Status | Ada (as-built, dummy) |
| Prioritas | Must |
| Sumber | `L:rules.js` (`approvedApp`, `pendingApps`, `activeApp`, `canApply`, `canCreate`), `C:Choose.jsx`, `C:Widgets.jsx` (`ConfirmButton`), `App.jsx` |
| Terkait | US-013; BR-04, BRL-04, BRL-10 |

Acceptance criteria:
- G: peserta owner tim; W: layar `pilih`; T: kartu A menampilkan "Kamu sedang jadi owner tim {tim}. Tutup tim dulu kalau mau gabung ke tim lain." dan tombol TUTUP TIM.
- G: peserta anggota (lamaran disetujui); W: layar `pilih`; T: kartu B menampilkan "Kamu sudah tergabung di tim {tim}. Keluar dulu kalau mau membuat tim sendiri." dan tombol KELUAR DARI TIM.
- G: peserta memiliki lamaran menunggu; W: layar `pilih`; T: kartu B menampilkan "Kamu masih punya {n} lamaran yang menunggu..." dan tombol TARIK SEMUA LAMARAN.
- G: `canCreate` salah (owner atau memiliki lamaran menunggu/disetujui); W: `createTeam` dipanggil; T: ditolak dengan toast; pada layar `buat` yang dimuat ulang dialihkan ke `pilih`.
- G: tombol berkonfirmasi; W: klik pertama; T: label berubah "YAKIN? KLIK LAGI" selama 4 detik; klik kedua dalam rentang itu menjalankan aksi; jika waktu habis, tombol kembali normal.

### FR-022 Penegakan aturan eksklusivitas di server

| Atribut | Nilai |
|---|---|
| Status | Rencana (integrasi aiclub.id) |
| Prioritas | Must (integrasi) |
| Sumber | [../brief.md](../brief.md) bagian 5.3 |
| Terkait | US-013, US-031; BR-04, BRL-04 |

Acceptance criteria:
- G: peserta memiliki lamaran `pending` atau `approved`; W: `POST /api/hackathon/teams`; T: ditolak server.
- G: peserta sudah owner; W: `POST /api/hackathon/teams/:id/apply`; T: ditolak server.
- G: `owner_id` UNIQUE pada `hackathon_team`; W: owner mencoba membuat tim kedua; T: ditolak oleh constraint basis data.
- G: dua permintaan melamar bersamaan oleh peserta yang sama; W: keduanya diproses; T: hanya satu berhasil (unique index parsial `one_active_app` pada `status IN ('pending','approved')`).
- Aturan ini teruji dengan memanggil API langsung, bukan hanya lewat UI (kriteria selesai brief bagian 10).

---

## 8. Modul F: Pasar tim dan lamaran

### FR-023 Daftar tim di pasar tim

| Atribut | Nilai |
|---|---|
| Status | Ada (as-built, dummy) |
| Prioritas | Must |
| Sumber | `C:Market.jsx`, `src/data.js` (`TIM`), `I:id.js` (`teams`, `market.*`) |
| Terkait | US-014 |

Deskripsi: enam tim contoh: REKON (Jakarta), WARUNG TAP (Bandung), SIAP RISIKO (Surabaya), TANYA OPS (Yogyakarta), ANTRE HABIS (Makassar), BACA KONTRAK (Medan), masing-masing dengan deskripsi satu kalimat, jumlah anggota, nama CEO, dan slot yang dicari.

Acceptance criteria:
- G: layar `pasar`; W: dirender; T: tiap kartu tim menampilkan nama, status, deskripsi, kota, "{n} anggota", "CEO {nama}", dan tag slot yang dicari.
- G: peserta melihat kartu; W: ringkasan di bawah; T: teks "{a} lamaran aktif" menghitung lamaran selain berstatus ditolak.
- G: peserta menekan LIHAT STATUSKU; T: layar `dasbor`.
- Catatan: tab "Builder yang cari tim" (`market.tabBuilders`) memiliki teks i18n tetapi belum dirender; tim buatan peserta tidak muncul di pasar (daftar bersumber dari `TIM` tetap).

### FR-024 Penanda kecocokan jalur

| Atribut | Nilai |
|---|---|
| Status | Ada (as-built, dummy) |
| Prioritas | Should |
| Sumber | `C:Market.jsx`, `C:TeamDetail.jsx`, `L:scoring.js` (`aktif`) |
| Terkait | US-014; BR-03 |

Acceptance criteria:
- G: jalur aktif peserta termasuk dalam `butuh` tim; W: kartu dirender; T: status "COCOK JALURMU" (cyan), kartu bertanda khusus, dan tag jalur itu disorot.
- G: tidak cocok; T: status "BUKA" dan tag tidak disorot.
- G: lamaran sudah ada; T: status mengikuti lamaran (LAMARAN TERKIRIM, DISETUJUI, DITOLAK), bukan kecocokan.
- G: detail tim; T: tampil "Cocok dengan jalurmu" atau "Bukan persis jalurmu, tapi tetap boleh melamar".
- Peserta tetap boleh melamar ke tim yang tidak cocok.

### FR-025 Detail tim

| Atribut | Nilai |
|---|---|
| Status | Ada (as-built, dummy) |
| Prioritas | Must |
| Sumber | `C:TeamDetail.jsx`, `App.jsx` (`openDetail`, `initState`) |
| Terkait | US-015 |

Acceptance criteria:
- G: peserta menekan LIHAT DETAIL; W: `openDetail(nama)`; T: layar `tim` menampilkan nama, deskripsi, kota, jumlah anggota, owner, "dibuka {n} hari lalu", slot yang dicari, dan kartu grup WhatsApp tim (nama grup, "{n} orang di grup").
- G: layar detail; W: bagian "CARA MASUK"; T: tiga langkah (Lamar tim ini, Owner menyetujui, Gabung grup WhatsApp) dengan langkah aktif atau selesai sesuai status lamaran.
- G: `viewTeam` tidak cocok dengan tim mana pun saat dimuat ulang; T: dialihkan ke `pasar`.
- G: tombol "KEMBALI KE DAFTAR TIM" atau Kembali; T: layar `pasar`.

### FR-026 Lamar, tarik lamaran, dan satu lamaran aktif

| Atribut | Nilai |
|---|---|
| Status | Ada (as-built, dummy) |
| Prioritas | Must |
| Sumber | `App.jsx` (`toggleApply`), `C:Market.jsx`, `C:TeamDetail.jsx`, `L:rules.js` |
| Terkait | US-016; BR-04, BRL-05 |

Acceptance criteria:
- G: tidak ada lamaran aktif dan peserta bukan owner; W: menekan LAMAR SLOT INI; T: lamaran `{team, status: pending, at}` ditambahkan, `mode = join`, log "apply" tercatat, tombol berubah TARIK LAMARAN.
- G: lamaran berstatus pending ke tim X; W: menekan TARIK LAMARAN; T: lamaran dihapus dan log "withdraw" tercatat.
- G: lamaran pending ke tim X; W: melamar ke tim Y; T: toast "Kamu masih melamar ke X. Tarik lamaran itu dulu kalau mau melamar ke tim lain." dan tidak ada lamaran baru; tombol Y berlabel SUDAH MELAMAR.
- G: lamaran disetujui di tim X; W: melamar ke tim Y; T: toast "Kamu sudah tergabung di satu tim." dan tombol berlabel SUDAH DI TIM.
- G: peserta adalah owner; W: melamar; T: toast "Kamu owner tim. Tutup tim dulu untuk melamar ke tim lain."
- G: lamaran ke tim berstatus rejected; W: menekan tombol; T: tidak ada perubahan (tombol LAMARAN DITOLAK nonaktif; tidak dapat melamar ulang).
- G: pada layar detail dan pasar; T: perilaku identik karena memakai `toggleApply` yang sama.

### FR-027 Link grup tim terkunci sampai disetujui

| Atribut | Nilai |
|---|---|
| Status | Ada (as-built, dummy; penyembunyian hanya di UI) |
| Prioritas | Must |
| Sumber | `C:TeamDetail.jsx`, `C:Market.jsx` (`openTeamGroup`), `C:Dash.jsx`, `src/data.js` (`TIM[].wa`) |
| Terkait | US-017, US-034; BR-05, BRL-07 |

Acceptance criteria:
- G: lamaran belum disetujui (tidak ada, pending, atau rejected); W: detail tim; T: tampil "LINK GRUP TERKUNCI - MENUNGGU PERSETUJUAN" dan tidak ada tautan ke grup tim.
- G: lamaran disetujui; W: detail tim; T: muncul tombol "GABUNG GRUP WHATSAPP TIM" menuju `wa` tim di tab baru (`noopener noreferrer`).
- G: lamaran disetujui dan tim tidak punya link (`wa` kosong); W: pasar atau dasbor; T: tampil "LINK GRUP MENYUSUL" atau "owner belum menambahkan link grup".
- Batasan as-built: link grup dummy (`https://chat.whatsapp.com/Dummy...`) tetap berada dalam bundel klien dan dapat dibaca lewat sumber halaman; karena itu perlindungan sebenarnya hanya tercapai pada integrasi (FR-030).

### FR-028 Simulasi keputusan owner (mode demo)

| Atribut | Nilai |
|---|---|
| Status | Ada (as-built, dummy) |
| Prioritas | Must (demo); dihapus pada integrasi |
| Sumber | `App.jsx` (`decideApp`), `C:Dash.jsx`, `src/data.js` (`CONFIG.demoOwner = true`) |
| Terkait | US-016, US-017; BRL-06 |

Acceptance criteria:
- G: `CONFIG.demoOwner` benar dan lamaran berstatus pending; W: dasbor dibuka; T: tombol SETUJUI dan TOLAK tampil dengan catatan "MODE DEMO - keputusan owner disimulasikan di perangkat ini".
- G: peserta menekan SETUJUI; T: status lamaran menjadi approved dan log "approved" tercatat; lamaran pending lain (bila ada) dihapus dengan log "autoWithdraw".
- G: peserta menekan TOLAK; T: status rejected dan log "rejected" tercatat.
- G: `CONFIG.demoOwner` salah; T: tombol simulasi dan catatan demo tidak tampil.
- G: lamaran sudah diputuskan atau ditolak otomatis; T: keputusan tidak dapat diulang (FR-064); lamaran pending yang lewat 24 jam ditolak otomatis (FR-063).
- Seluruh logika ini dihapus pada integrasi (brief bagian 7, butir 5).

### FR-029 Keluar dari tim, tarik semua lamaran

| Atribut | Nilai |
|---|---|
| Status | Ada (as-built, dummy) |
| Prioritas | Should |
| Sumber | `App.jsx` (`leaveTeam`, `withdrawAll`), `C:Choose.jsx`, `C:Dash.jsx` |
| Terkait | US-018; BRL-05 |

Acceptance criteria:
- G: anggota di tim X; W: menekan KELUAR DARI TIM (dua klik); T: lamaran X dihapus, `mode = null`, log "leave" tercatat, layar `pilih`.
- G: peserta memiliki lamaran pending; W: TARIK SEMUA LAMARAN (dua klik); T: semua lamaran berstatus pending dihapus, `mode = null`, log "withdrawAll".
- G: peserta telah keluar atau menarik; W: layar `pilih`; T: tombol BUAT TIM SENDIRI dan CARI TIM aktif kembali.

### FR-030 API tim dan lamaran, notifikasi, serta penyembunyian link di server

| Atribut | Nilai |
|---|---|
| Status | Rencana (integrasi aiclub.id) |
| Prioritas | Must (integrasi) |
| Sumber | [../brief.md](../brief.md) bagian 5.3, 6, 7 |
| Terkait | US-016, US-017, US-025, US-031, US-034; BR-04, BR-05, BRL-06, BRL-07 |

Acceptance criteria:
- G: sesi valid; W: `GET /api/hackathon/teams`; T: daftar tim terbuka tanpa `wa_link`.
- G: peserta belum disetujui; W: `GET /api/hackathon/teams/:id`; T: respons tanpa `wa_link`. G: owner atau pelamar `approved`; T: respons memuat `wa_link`.
- G: `POST /api/hackathon/teams/:id/apply`; T: membuat `hackathon_application` berstatus `pending`; pelanggaran aturan 5.3 ditolak.
- G: owner `POST /api/hackathon/applications/:id/decide` dengan `{status}`; T: status berubah; bila `approved`, seluruh lamaran `pending` lain milik orang itu menjadi `withdrawn` dalam satu transaksi.
- G: pengguna selain owner tim; W: memanggil decide; T: 403.
- G: tanpa sesi; T: 401 pada semua endpoint.
- G: `DELETE /api/hackathon/applications/:id`; T: tarik lamaran atau keluar tim.
- G: ada lamaran baru; T: owner menerima notifikasi (saluran: _TBD_).
- `wa_link` divalidasi server dengan pola `WA_LINK_RE`.

---

## 9. Modul G: Buat tim dan dasbor owner

### FR-031 Form buat tim

| Atribut | Nilai |
|---|---|
| Status | Ada (as-built, dummy) |
| Prioritas | Must |
| Sumber | `C:Create.jsx`, `App.jsx` (`createTeam`), `src/data.js` (`URUT`, `WA_LINK_RE`), `I:id.js` (`create.*`, `dash.myTeam.*`) |
| Terkait | US-019 |

Acceptance criteria:
- G: layar `buat`; W: dirender; T: tiga bagian: "1 TIMMU" (nama wajib, deskripsi opsional), "2 SIAPA YANG KAMU CARI" (tag 8 jalur, pilih minimal satu), "3 GRUP WHATSAPP TIM" (link opsional).
- G: nama kosong; W: BUKA TIM; T: galat "Isi nama tim dulu".
- G: tidak ada slot dipilih; W: BUKA TIM; T: galat "Pilih minimal satu slot".
- G: link WhatsApp terisi tetapi tidak berawalan `https://chat.whatsapp.com/`; W: BUKA TIM; T: galat "Link harus berawalan https://chat.whatsapp.com/". Link kosong diperbolehkan.
- G: semua valid; W: BUKA TIM; T: `myTeam = {nama (huruf kapital), desc, kota (dari data diri), butuh, wa}`, `mode = create`, `undang` kosong, pelamar contoh diisi, log "openTeam", dan layar `dasbor` tampil.
- Tidak ada validasi keunikan nama tim (belum ada penyimpanan bersama).

### FR-032 Pengelolaan link grup tim oleh owner

| Atribut | Nilai |
|---|---|
| Status | Ada (as-built, dummy) |
| Prioritas | Must |
| Sumber | `C:MyTeam.jsx`, `App.jsx` (`saveTeamLink`) |
| Terkait | US-021; BRL-08 |

Acceptance criteria:
- G: owner di dasbor; W: mengubah bidang link dan menekan SIMPAN LINK dengan nilai valid; T: `myTeam.wa` diperbarui dan "Link grup tersimpan" tampil.
- G: nilai tidak diawali `https://chat.whatsapp.com/`; W: SIMPAN LINK; T: galat tampil dan link tidak berubah.
- G: nilai dikosongkan; W: SIMPAN LINK; T: diterima (link dihapus).
- G: ada pelamar disetujui tetapi `wa` kosong; T: catatan "Belum ada link grup - tambahkan di atas" tampil.

### FR-033 Pelamar masuk dan keputusan owner

| Atribut | Nilai |
|---|---|
| Status | Ada (as-built, dummy; pelamar contoh) |
| Prioritas | Must |
| Sumber | `C:MyTeam.jsx`, `App.jsx` (`decideApplicant`), `src/data.js` (`SEED_APPLICANTS = [0, 4]`, `BUILDER`) |
| Terkait | US-020 |

Acceptance criteria:
- G: tim baru dibuat; W: panel "PELAMAR MASUK"; T: dua pelamar contoh berstatus MENUNGGU: Dimas (AI, Semarang) dan Arif (CTO, Pontianak), lengkap dengan peran dan deskripsi.
- G: owner menekan SETUJUI; T: status pelamar menjadi DISETUJUI dan log "approveWho" mencatat nama.
- G: owner menekan TOLAK; T: status DITOLAK dan log "rejectWho".
- G: pelamar sudah diputuskan; T: tombol diganti label status; tidak dapat diubah lagi.
- G: tidak ada pelamar; T: "Belum ada pelamar."
- Pelamar adalah data contoh tetap, bukan peserta nyata.

### FR-034 Undang builder

| Atribut | Nilai |
|---|---|
| Status | Ada (as-built, dummy; builder contoh) |
| Prioritas | Should |
| Sumber | `C:MyTeam.jsx`, `App.jsx` (`toggleInvite`), `src/data.js` (`BUILDER`) |
| Terkait | US-022 |

Acceptance criteria:
- G: owner di dasbor; W: bagian "UNDANG BUILDER"; T: enam builder contoh (Dimas, Lala, Hendra, Vina, Arif, Tari) dengan kota, tag peran, dan deskripsi.
- G: owner menekan UNDANG; T: `undang` memuat nama, tombol menjadi TERKIRIM, log "invite".
- G: owner menekan TERKIRIM; T: undangan dibatalkan, log "uninvite".
- Undangan tidak dikirim ke siapa pun (tidak ada backend); hanya mengubah state lokal.
- Rencana: `POST /api/hackathon/teams/:id/invites` dan `GET /api/hackathon/builders` (lihat FR-038).

### FR-035 Tutup tim

| Atribut | Nilai |
|---|---|
| Status | Ada (as-built, dummy) |
| Prioritas | Should |
| Sumber | `C:MyTeam.jsx`, `C:Choose.jsx`, `App.jsx` (`closeTeam`) |
| Terkait | US-023 |

Acceptance criteria:
- G: owner menekan TUTUP TIM (dua klik, dari dasbor atau layar `pilih`); T: `myTeam`, `applicants`, `undang`, dan `mode` dikosongkan, log "closeTeam" tercatat, layar `pilih`.
- G: owner baru satu klik; W: 4 detik berlalu; T: tombol kembali ke label semula tanpa menutup tim.
- G: tim ditutup; W: layar `pilih`; T: peserta dapat memilih gabung atau buat tim kembali.

### FR-036 Dasbor status peserta

| Atribut | Nilai |
|---|---|
| Status | Ada (as-built, dummy) |
| Prioritas | Must |
| Sumber | `C:Dash.jsx`, `C:EventInfo.jsx`, `I:id.js` (`dash.*`, `schedule`) |
| Terkait | US-024 |

Acceptance criteria:
- G: layar `dasbor`; W: dirender; T: judul sapaan memakai nama peserta (huruf kapital) atau "PESERTA" bila kosong.
- G: dasbor; T: kartu GRUP UTAMA HACKATHON menampilkan "sudah gabung" dan tombol BUKA GRUP ke `WA_GROUP_URL`.
- G: peserta bukan owner; T: kartu "LAMARAN & UNDANGAN" mencantumkan tiap lamaran (tim, keterangan status, tombol LIHAT DETAIL, tombol GABUNG GRUP TIM bila disetujui dan `wa` tersedia, KELUAR DARI TIM bila disetujui). Bila kosong: "Belum ada lamaran. Balik ke pasar tim dan lamar tim yang cocok denganmu."
- G: peserta owner; T: kartu "LAMARAN & UNDANGAN" digantikan panel TIM SAYA (FR-032 sampai FR-035).
- G: dasbor; T: kolom kanan memuat total hadiah (USD 3.100), JALURMU (nama ringkas dan deskripsi), dan tiga tantangan (ringkas).
- G: dasbor; T: bagian "JALAN SAMPAI DEMO DAY" memuat empat tonggak: 15 OKT; 1 NOV 23.59 WIB; 14 NOV; 27 NOV 13.00-16.00 WIB.
- G: tombol aksi bawah; T: LANJUT KE LANGKAH 2 (ke `tencent`), KEMBALI KE PASAR TIM (hanya non-owner), GANTI PILIHAN (ke `pilih`), "Mulai dari awal".
- Keterbatasan as-built: sapaan tetap "BELUM PUNYA TIM" bagi semua peserta, termasuk owner atau anggota (teks `dash.greeting`).

### FR-037 Log aktivitas

| Atribut | Nilai |
|---|---|
| Status | Ada (as-built, dummy) |
| Prioritas | Should |
| Sumber | `App.jsx` (`withLog`), `C:Dash.jsx`, `L:time.js` (`fmtTime`), `I:id.js` (`dash.log.*`) |
| Terkait | US-024 |

Acceptance criteria:
- G: peserta melakukan aksi bertanda log (joinMain, apply, withdraw, approved, rejected, invite, uninvite, openTeam, approveWho, rejectWho, closeTeam, leave, autoWithdraw, withdrawAll, autoReject, autoRejectWho, chat); T: entri `{k, at, ...}` ditambahkan.
- G: lebih dari 60 entri; T: hanya 60 terakhir disimpan.
- G: dasbor; T: entri tampil dari terbaru ke terlama dengan waktu terformat sesuai bahasa (hari, bulan singkat, jam, menit) dan kalimat dari kunci i18n.
- G: tidak ada aktivitas; T: "Belum ada aktivitas."
- Catatan: kunci `dash.log` memuat teks "approved"/"rejected" untuk tim; pada as-built keputusan hanya dihasilkan lewat simulasi.

### FR-038 Penyimpanan tim, pelamar, undangan, dan aktivitas di basis data

| Atribut | Nilai |
|---|---|
| Status | Rencana (integrasi aiclub.id) |
| Prioritas | Must (integrasi) |
| Sumber | [../brief.md](../brief.md) bagian 5.2, 6, 7; [20_DATABASE.md](20_DATABASE.md) |
| Terkait | US-019 sampai US-025, US-031; BR-08 |

Acceptance criteria:
- G: owner membuat tim; W: `POST /api/hackathon/teams`; T: baris `hackathon_team` dengan `owner_id` unik, `status = open`.
- G: owner mengubah link atau deskripsi; W: `PATCH /api/hackathon/teams/:id`; T: disimpan; non-owner mendapat 403.
- G: owner menutup tim; W: `POST /api/hackathon/teams/:id/close`; T: `status = closed`.
- G: owner mengundang builder; W: `POST /api/hackathon/teams/:id/invites`; T: baris `hackathon_invite` dibuat dan builder dapat melihatnya.
- G: aksi bermakna; T: baris `hackathon_activity` menggantikan `log` lokal.
- G: data dummy `TIM`, `BUILDER`, `SEED_APPLICANTS`, dan `CONFIG.demoOwner` dihapus dari bundel produksi.
- Pembaruan optimistis hanya bila ada rollback; layar memuat, kosong, dan gagal tersedia untuk `Market`, `TeamDetail`, `Choose`, `MyTeam`.

---

## 10. Modul H: Portal Tencent (daftar tim)

### FR-039 Tautan ke portal pendaftaran Tencent

| Atribut | Nilai |
|---|---|
| Status | Ada (as-built, dummy; tautan keluar nyata) |
| Prioritas | Must |
| Sumber | `C:Tencent.jsx`, `src/data.js` (`TENCENT_REGISTER_URL`), `I:id.js` (`tencent.*`) |
| Terkait | US-026; BR-06, C-04 |

Acceptance criteria:
- G: layar `tencent`; W: dirender; T: judul "DAFTARKAN TIM KE TENCENT" dan tombol "KLIK DISINI UNTUK DAFTAR TIM KE TENCENT" menuju `https://aiclub.id/l/O3Sa9yF` di tab baru (`noopener noreferrer`).
- G: peserta mengklik tombol; T: `tencentClicked` benar dan muncul "Portal Tencent sudah dibuka".
- G: layar; T: catatan "Link terbuka di tab baru. Selesai mendaftar, kembali ke sini." dan "Langkah 3 dikerjakan nanti, setelah project selesai dibuat."
- G: peserta menekan LANJUT KE SUBMIT PROJECT; T: layar `submit`. Tombol tidak mensyaratkan klik tautan.
- Portal tidak mengetahui apakah pendaftaran di Tencent benar-benar selesai.

### FR-040 Status tim di langkah Tencent

| Atribut | Nilai |
|---|---|
| Status | Ada (as-built, dummy) |
| Prioritas | Should |
| Sumber | `C:Tencent.jsx`, `L:rules.js` (`activeApp`) |
| Terkait | US-026 |

Acceptance criteria:
- G: peserta owner; T: "Kamu owner tim {tim}. Daftarkan timmu sekarang." (hijau kebiruan).
- G: lamaran disetujui; T: "Kamu anggota tim {tim}. Pastikan owner timmu sudah mendaftarkan tim ke Tencent."
- G: lamaran pending; T: "Lamaranmu ke {tim} masih menunggu persetujuan owner." (kuning).
- G: tidak ada tim maupun lamaran; T: "Kamu belum punya tim. Kembali ke langkah 1 untuk melamar atau membuat tim." (magenta) dan tombol KEMBALI KE LANGKAH 1 (ke `pilih` atau `dasbor` menurut keadaan).
- Tombol KEMBALI KE LANGKAH 1 tidak tampil bila peserta sudah punya tim.

### FR-041 Pencocokan identitas dengan pendaftar Tencent

| Atribut | Nilai |
|---|---|
| Status | Rencana (integrasi aiclub.id) |
| Prioritas | Could |
| Sumber | [../brief.md](../brief.md) bagian 5.2 (`tencent_clicked_at`) dan 8.6 |
| Terkait | BR-06 |

Acceptance criteria:
- G: peserta mengklik portal Tencent; W: disimpan; T: `tencent_clicked_at` tercatat di server.
- G: keputusan pencocokan (email atau `memberId`) disetujui; T: mekanisme pencocokan ditentukan (_TBD_, bergantung Tencent). Tautan `aiclub.id/l/...` hanya short link dan belum mengembalikan data.

---

## 11. Modul I: Submit project

### FR-042 Pernyataan project selesai

| Atribut | Nilai |
|---|---|
| Status | Ada (as-built, dummy) |
| Prioritas | Must |
| Sumber | `C:Submit.jsx`, `I:id.js` (`submit.*`) |
| Terkait | US-027; BRL-09 |

Acceptance criteria:
- G: layar `submit`; W: dirender; T: kotak centang "Project saya sudah selesai dan siap dikirim" tidak tercentang dan catatan "Centang dulu supaya tombol submit terbuka." tampil.
- G: peserta mencentang; T: `projectReady` benar dan catatan hilang. G: peserta menghapus centang; T: `projectReady` salah dan tombol submit kembali nonaktif.
- Nilai tersimpan di `localStorage` sehingga bertahan setelah muat ulang di peramban yang sama.

### FR-043 Tombol dan tautan submit ke Tencent

| Atribut | Nilai |
|---|---|
| Status | Ada (as-built, dummy; tautan keluar nyata) |
| Prioritas | Must |
| Sumber | `C:Submit.jsx`, `src/data.js` (`TENCENT_SUBMIT_URL`) |
| Terkait | US-027; BR-06, BRL-09 |

Acceptance criteria:
- G: `projectReady` salah; T: tombol "KLIK DISINI UNTUK SUBMIT PROJECT KE TENCENT" nonaktif (`aria-disabled`) dan bukan tautan.
- G: `projectReady` benar; T: tombol menjadi tautan ke `https://aiclub.id/l/9k54mLk` di tab baru (`noopener noreferrer`).
- G: peserta mengklik tautan; T: `submitClicked` benar dan "Portal submit sudah dibuka. Semoga sukses di Demo Day!" tampil.
- G: tautan "Mulai dari awal"; T: seluruh state direset dan layar `intro`.
- Portal tidak mengetahui apakah karya benar-benar terkirim di Tencent.

### FR-044 Pencatatan flag langkah di server dan gerbang submit

| Atribut | Nilai |
|---|---|
| Status | Rencana (integrasi aiclub.id) |
| Prioritas | Should (integrasi) |
| Sumber | [../brief.md](../brief.md) bagian 5.2 (`project_ready_at`, `submit_clicked_at`) dan 5.3 butir 7 |
| Terkait | US-031; BRL-09 |

Acceptance criteria:
- G: peserta mencentang project selesai; W: `PATCH /api/hackathon/me`; T: `project_ready_at` terisi.
- G: `project_ready_at` kosong; W: server diminta mencatat klik submit; T: ditolak.
- G: peserta mengklik submit; T: `submit_clicked_at` terisi.

---

## 12. Modul J: Internasionalisasi (id/en/zh)

### FR-045 Tiga bahasa dengan kunci identik

| Atribut | Nilai |
|---|---|
| Status | Ada (as-built, dummy) |
| Prioritas | Must |
| Sumber | `I:id.js`, `I:en.js`, `I:zh.js`, `I:index.js` (`I18N`, `LANGS`) |
| Terkait | US-028; BR-07 |

Acceptance criteria:
- G: kamus id, en, zh; W: kunci dibandingkan; T: ketiganya memiliki 428 kunci daun yang identik (diverifikasi pada 2026-10-21).
- G: seluruh layar dan teks event (hadiah, tanggal, tantangan, deskripsi tim contoh, builder contoh, pertanyaan skenario, nama jalur); T: tersedia dalam tiga bahasa.
- Label bahasa pada header: ID, EN, 中文 (nama: Bahasa Indonesia, English, 简体中文).
- Mata uang hadiah tampil "USD 3.100" (id) dan "USD 3,100" (en, zh); nominal juara: 1.800, 800, 500 (format ribuan menyesuaikan).

### FR-046 Pemilihan, deteksi, dan penyimpanan bahasa

| Atribut | Nilai |
|---|---|
| Status | Ada (as-built, dummy) |
| Prioritas | Must |
| Sumber | `I:index.js` (`detectLang`), `App.jsx` (`setLang`), `C:Chrome.jsx` |
| Terkait | US-028 |

Acceptance criteria:
- G: kunjungan pertama; W: `detectLang` dievaluasi; T: urutan prioritas: parameter URL `?lang=` (id/en/zh), nilai `hk_lang` di `localStorage`, lalu bahasa peramban (awalan id, ms, jv, su = id; zh = zh; en = en), bawaan akhir `en`.
- G: peserta menekan tombol bahasa; W: klik; T: seluruh antarmuka berganti seketika, `hk_lang` tersimpan, tombol aktif `aria-pressed=true`.
- G: bahasa diganti di tengah alur; T: state peserta (jawaban, tim, lamaran) tidak berubah.
- G: `localStorage` tidak tersedia; T: ganti bahasa tetap bekerja pada sesi berjalan tanpa galat.

### FR-047 Fallback kunci dan interpolasi

| Atribut | Nilai |
|---|---|
| Status | Ada (as-built, dummy) |
| Prioritas | Should |
| Sumber | `I:index.js` (`makeT`, `pick`) |
| Terkait | US-028 |

Acceptance criteria:
- G: kunci tidak ada pada bahasa aktif; W: `t(kunci)` dipanggil; T: nilai bahasa Indonesia dipakai sebagai cadangan.
- G: teks berisi `{var}`; W: `t(kunci, {var: nilai})`; T: placeholder diganti; placeholder tanpa nilai dibiarkan apa adanya.
- G: nilai bukan string (mis. kunci menunjuk objek); W: `t` dipanggil; T: mengembalikan string kosong.
- `get(path)` dipakai untuk nilai non-string (array pertanyaan, jadwal, tantangan, nama jalur).

### FR-048 Metadata dokumen dan pemformatan waktu menurut bahasa

| Atribut | Nilai |
|---|---|
| Status | Ada (as-built, dummy) |
| Prioritas | Should |
| Sumber | `App.jsx` (efek `meta.lang`, `meta.title`), `L:time.js` (`fmtTime`), `I:*.js` (`meta.*`) |
| Terkait | US-028 |

Acceptance criteria:
- G: bahasa berganti; T: atribut `lang` pada `<html>` menjadi `id`, `en`, atau `zh` dan `document.title` menjadi "Pendaftaran AI Agent Hackathon", "AI Agent Hackathon Registration", atau "AI Agent 黑客松报名".
- G: log aktivitas; T: waktu diformat `Intl.DateTimeFormat` dengan locale `id-ID`, `en-US`, atau `zh-CN` (hari, bulan singkat, jam, menit); bila gagal, string kosong.

---

## 13. Modul K: Navigasi dan stepper

### FR-049 Stepper tiga langkah besar

| Atribut | Nilai |
|---|---|
| Status | Ada (as-built, dummy) |
| Prioritas | Must |
| Sumber | `C:Chrome.jsx` (`Stepper`), `src/data.js` (`STEP_OF`), `L:scoring.js` (`reachable`), `I:id.js` (`steps`) |
| Terkait | US-029 |

Acceptance criteria:
- G: layar mana pun; W: stepper dirender; T: tiga langkah: DAFTAR (data, kuis & tim), TENCENT (daftar tim), SUBMIT (kirim project).
- G: layar sedang berada di langkah k; T: langkah itu bertanda `cur` dan `aria-current=step`; langkah sebelumnya bertanda `done`.
- G: syarat belum terpenuhi (data diri, kuis, dan grup utama); T: langkah 2 dan 3 `disabled`. Langkah 1 selalu dapat dicapai.
- G: layar `intro` atau `login`; T: tidak ada langkah aktif (nilai -1).

### FR-050 Indikator sub-langkah langkah 1

| Atribut | Nilai |
|---|---|
| Status | Ada (as-built, dummy) |
| Prioritas | Must |
| Sumber | `C:Widgets.jsx` (`SubSteps`), `L:scoring.js` (`subReachable`), `App.jsx` (`goSub`) |
| Terkait | US-029 |

Acceptance criteria:
- G: layar `identitas`, `kuis`, `hasil`, `grup`, `pilih`, `pasar`, `tim`, `buat`, atau `dasbor`; T: enam indikator tampil: Data, Skenario, Jalur, Grup utama, Tim (atau "Buat tim" bila `mode = create`), Status.
- G: layar `pilih`, `pasar`, `tim`, dan `buat`; T: posisi aktif ke-5 (Tim); `dasbor` ke-6 (Status).
- G: indikator sebelum posisi aktif dan `subReachable` benar; W: diklik; T: berpindah ke layar itu (Skenario membuka skenario pertama yang belum dijawab).
- G: indikator pada atau setelah posisi aktif; T: tidak dapat diklik. Indikator selesai bertanda centang.
- G: layar `tencent`, `submit`, `intro`, `login`; T: sub-langkah tidak ditampilkan.

### FR-051 Navigasi bawah (layar kecil)

| Atribut | Nilai |
|---|---|
| Status | Ada (as-built, dummy) |
| Prioritas | Should |
| Sumber | `C:Chrome.jsx` (`BottomNav`), `App.jsx` (`gotoStep`) |
| Terkait | US-029 |

Acceptance criteria:
- G: layar kecil; T: bilah bawah dengan empat tombol: Awal, DAFTAR, TENCENT, SUBMIT dengan ikon piksel.
- G: tombol Awal; W: diklik; T: layar `intro`.
- G: langkah terkunci; W: diklik; T: `aria-disabled=true` dan toast penjelasan (lihat FR-055).

### FR-052 Tombol Kembali

| Atribut | Nilai |
|---|---|
| Status | Ada (as-built, dummy) |
| Prioritas | Must |
| Sumber | `App.jsx` (`back`), `C:Common.jsx` (`Head`, `Actions`) |
| Terkait | US-029 |

Acceptance criteria (peta Kembali):
- `login` dan `identitas` ke `intro`; `kuis` ke skenario sebelumnya atau ke `identitas` bila di skenario 1; `hasil` ke skenario 6; `grup` ke `hasil`; `pilih` ke `grup`; `pasar` dan `buat` ke `pilih`; `tim` ke `pasar`; `dasbor` ke `pilih` bila owner atau ke `pasar` bila bukan; `tencent` ke `dasbor`; `submit` ke `tencent`.
- Tombol Kembali tersedia di kepala layar dan di bilah aksi bawah tiap layar (kecuali `intro`).
- Perpindahan layar menggulir ke atas (animasi halus kecuali `prefers-reduced-motion`) dan menghapus galat formulir.

### FR-053 Persistensi dan pemulihan posisi (as-built)

| Atribut | Nilai |
|---|---|
| Status | Ada (as-built, dummy) |
| Prioritas | Must |
| Sumber | `App.jsx` (`PERSIST`, `initState`, efek penyimpanan) |
| Terkait | US-030 |

Acceptance criteria:
- G: peserta memuat ulang halaman; W: `initState` membaca `hk_state`; T: seluruh kunci `PERSIST` yang ada dipulihkan.
- G: `screen` tersimpan tidak dikenal; T: `intro`.
- G: `screen` bukan `intro` tetapi `user` kosong; T: `intro`.
- G: data diri belum lengkap; T: layar selain `intro`, `login`, `identitas` dialihkan ke `identitas`.
- G: kuis belum lengkap; T: layar `hasil`, `grup`, `pilih`, `pasar`, `tim`, `buat`, `dasbor`, `tencent`, `submit` dialihkan ke `kuis`.
- G: `joinedMain` salah; T: layar `pilih`, `pasar`, `tim`, `buat`, `dasbor`, `tencent`, `submit` dialihkan ke `grup`.
- G: owner membuka `pasar`, `buat`, atau `tim`; T: dialihkan ke `dasbor`. G: `tim` dengan `viewTeam` tidak valid; T: `pasar`. G: `buat` dengan `canCreate` salah; T: `pilih`.
- G: `localStorage` gagal (mode privat); T: aplikasi tetap berjalan tanpa persistensi.
- Data tidak tersinkron antarperangkat dan hilang bila data peramban dibersihkan.

### FR-054 Aksesibilitas navigasi dan umpan balik

| Atribut | Nilai |
|---|---|
| Status | Ada (as-built, dummy) |
| Prioritas | Should |
| Sumber | `App.jsx` (efek fokus, `toast`), `C:Quiz.jsx`, `C:Chrome.jsx`, `C:Widgets.jsx` |
| Terkait | US-033 |

Acceptance criteria:
- G: peserta berpindah layar atau skenario; T: fokus berpindah ke judul pertama (`h1` atau `h2`) tanpa menggulir; tidak terjadi saat render pertama.
- G: area `main` berubah; T: `aria-live=polite` mengumumkan perubahan; toast memakai `role=status`.
- G: opsi skenario; T: `role=radiogroup` dan `role=radio` dengan `aria-checked`.
- G: bidang formulir bergalat; T: `aria-invalid` benar dan pesan galat berdekatan dengan bidang.
- G: pengguna mengaktifkan pengurangan gerak; T: pengguliran tidak beranimasi.
- Toast hilang sendiri sekitar 2,2 detik.

### FR-055 Aturan perpindahan langkah besar

| Atribut | Nilai |
|---|---|
| Status | Ada (as-built, dummy) |
| Prioritas | Must |
| Sumber | `App.jsx` (`gotoStep`, `goSub`, `next`), `L:scoring.js` (`reachable`) |
| Terkait | US-029; BRL-02, BRL-03 |

Acceptance criteria:
- G: peserta menekan DAFTAR dari langkah 2 atau 3; T: menuju layar langkah 1 yang relevan: `identitas` bila data belum lengkap, skenario pertama yang belum dijawab bila kuis belum selesai, `grup` bila belum gabung, selain itu `dasbor` bila punya tim atau lamaran, atau `pilih` bila tidak.
- G: sudah berada di langkah 1; W: menekan DAFTAR; T: tidak ada perpindahan.
- G: peserta menekan TENCENT atau SUBMIT dan syarat terpenuhi; T: menuju `tencent` atau `submit`.
- G: peserta menekan Awal; T: `intro`.
- G: langkah terkunci; T: toast "Gabung grup utama dulu sebelum masuk pasar tim" bila data dan kuis selesai, selain itu "Selesaikan langkah sebelumnya dulu".
- G: tombol LANJUT pada `intro`; T: `identitas` bila sudah login, `login` jika belum. G: LANJUT pada `hasil` ke `grup`; `pasar` ke `dasbor`; `tencent` ke `submit`.

---

## 14. Modul L: Informasi event dan administrasi

### FR-056 Halaman awal dan informasi event

| Atribut | Nilai |
|---|---|
| Status | Ada (as-built, dummy; konten statis) |
| Prioritas | Must |
| Sumber | `C:Intro.jsx`, `C:EventInfo.jsx` (`Poster`, `Prize`, `Dates`, `Challenges`), `I:id.js` (`intro.*`, `event.*`), `public/brand/poster.jpg` |
| Terkait | US-001; BR-10 |

Acceptance criteria:
- G: layar `intro`; W: dirender; T: judul "AI AGENT HACKATHON", subjudul "Tencent Cloud Indonesia - pendaftaran sampai 1 Nov", penjelasan alur, tombol "MULAI PENDAFTARAN", petunjuk "gratis - 4 menit - nggak perlu jago dulu", poster, dan kartu "KENAPA PAKAI KUIS".
- G: informasi event; T: total hadiah USD 3.100 (Juara 1 USD 1.800; Juara 2 USD 800; Juara 3 USD 500); tanggal penting: 15 OKT pendaftaran dibuka; 1 NOV batas pendaftaran dan pengumpulan karya 23.59 WIB; 14 NOV pengumuman finalis; 27 NOV Demo Day dan Awarding, Jakarta, 13.00-16.00 WIB.
- G: tantangan; T: tiga kartu: The Workplace Brain (LEARN ANYWHERE), The Office Agent (AUTOMATE BETTER), The Creator Agent (CREATE BOLDER) dengan deskripsi.
- G: tombol MULAI PENDAFTARAN; T: `login` bila belum masuk, atau `identitas` bila sudah.
- Teks header: "pendaftaran 15 Okt - 1 Nov" dan "demo day akhir Nov - Jakarta". Teks ini tampil di header pada lebar layar 1400 px ke atas dan di bawah header pada layar yang lebih sempit (FR-062). Data dari <https://aiclub.id/event/tencent-cloud-hackathon-2026>; lokasi detail Demo Day: "menyusul" (_TBD_).

### FR-057 Mitra dan identitas merek

| Atribut | Nilai |
|---|---|
| Status | Ada (as-built, dummy; konten statis) |
| Prioritas | Should |
| Sumber | `C:Brand.jsx` (`PARTNERS`, `Partners`, `Footer`), `C:Chrome.jsx` (`Header`), `public/brand/*` |
| Terkait | US-001; BR-10 |

Acceptance criteria:
- G: halaman mana pun; T: header memuat logo AIClub.id dengan "x SumoPod x TENCENT CLOUD" dan footer memuat teks "Kolaborasi Tencent Cloud & AICLUB.ID - gratis" serta strip "DIDUKUNG OLEH".
- G: footer; T: empat mitra tampil dengan tautan eksternal di tab baru (`noopener noreferrer`): Tencent Cloud (`https://www.tencentcloud.com/`), SumoPod (`https://sumopod.com/`), WorkBuddy (`https://www.workbuddy.ai/`), CodeBuddy (`https://www.codebuddy.ai/`).
- Aset dimuat relatif terhadap `BASE_URL` agar jalan di sub-path GitHub Pages.

### FR-058 Admin dan ekspor data peserta untuk pengurus

| Atribut | Nilai |
|---|---|
| Status | Rencana (integrasi aiclub.id) |
| Prioritas | Could (opsional, fase 5) |
| Sumber | [../brief.md](../brief.md) bagian 8.7, 9 (fase 5), 10 |
| Terkait | US-032; BR-09 |

Acceptance criteria:
- G: pengurus berwenang (cakupan pusat atau kota: _TBD_); W: membuka halaman admin atau meminta ekspor; T: daftar peserta dan tim dapat dilihat atau diekspor CSV.
- G: pengguna tanpa kewenangan; T: 403.
- G: ekspor atau daftar admin; T: nomor WhatsApp tidak bocor ke peserta lain dan hanya tampil kepada pihak yang berwenang.
- Bentuk (halaman admin atau ekspor CSV): _TBD_.

---

### FR-059 Link undangan tim (bagikan dan gabung lewat link)

| Atribut | Nilai |
|---|---|
| Status | Ada (as-built, dummy) |
| Prioritas | Should |
| Sumber | `src/lib/share.js`, `src/components/MyTeam.jsx` (`ShareTeam`), `src/App.jsx` (`URL_INVITE`, `initState`, `confirmMain`), `src/components/Market.jsx`, `src/components/TeamDetail.jsx` |
| Terkait | US-019, US-014, US-015, US-016; FR-023, FR-025, FR-026, FR-031 |

Owner tim mendapat link `?tim=<kode>` di dasbor. Kode berisi id tim, nama, deskripsi, kota, slot yang dicari, nama owner, dan waktu dibuat dalam JSON base64url. Link grup WhatsApp tim **tidak** dimasukkan ke kode agar tetap terkunci sampai lamaran disetujui (FR-027).

Acceptance criteria:
- G: owner sudah membuat tim; W: membuka dasbor; T: kartu "Bagikan link tim" menampilkan link, tombol Salin link, Bagikan ke WhatsApp (`wa.me` berisi pesan dan link), dan Bagikan (Web Share API, hanya bila peramban mendukung).
- G: pengunjung membuka link valid; W: halaman dimuat; T: tim disimpan ke `sharedTeams`, parameter `tim` dihapus dari URL, dan banner undangan tampil selama syarat pendaftaran belum terpenuhi.
- G: pengunjung menyelesaikan login, data diri, skenario, dan grup utama; W: menekan "Saya sudah gabung"; T: diarahkan langsung ke detail tim tersebut, bukan ke layar pilih jalan.
- G: pengunjung sudah memenuhi semua syarat saat membuka link; T: langsung membuka detail tim.
- G: tim dari link; T: tampil di pasar tim dengan penanda "LEWAT LINK" dan dapat dilamar dengan aturan yang sama (satu lamaran aktif, FR-026).
- G: kode rusak atau tidak lolos validasi (id, panjang teks, slot di luar `URUT`); T: toast "Link tim tidak valid atau rusak", tidak ada tim ditambahkan.
- G: owner membuka link timnya sendiri; T: toast "Ini link timmu sendiri", tim tidak ditambahkan ke `sharedTeams`.
- G: nama tim dari link sama dengan tim lain; T: nama diberi akhiran ` · <4 karakter id>`.
- Batasan mode demo: lamaran lewat link tidak masuk ke kotak pelamar owner dan link grup tim tidak terkirim sampai backend tersedia (FR-030). Keterangan ini ditampilkan di kartu bagikan.

---

## 15. Modul M: Pengumuman, batas keputusan owner, dan ruang tim

Modul ini mencakup pengumuman resmi panitia, batas waktu keputusan owner atas lamaran, ruang tim (anggota, kontak, dan chat), serta kolom GitHub di data diri. Seluruh FR di modul ini berjalan di mode demo; kebutuhan backend-nya (tabel, endpoint, dan aturan server) dirinci di [../brief.md](../brief.md) (bagian 5.2, 5.3, dan 6.3 sampai 6.5). Dokumen ini tidak menyalin detail tersebut.

### FR-060 Layar pengumuman: daftar dan detail

| Atribut | Nilai |
|---|---|
| Status | Ada (as-built, dummy) |
| Prioritas | Should |
| Sumber | `C:Announcements.jsx` (`Announcements`), `App.jsx` (`toAnnouncements`, `openAnn`, `back`, `initState`), `src/data.js` (`PENGUMUMAN`, `SCREENS`, `STEP_OF.info = -1`), `I:id.js` (`ann.*`, `announcements`) |
| Terkait | US-035; FR-052, FR-053, FR-061, FR-062 |

Layar `info` memuat daftar pengumuman panitia. Metadata (id, waktu terbit, sematan, tayangan contoh) ada di `PENGUMUMAN`; teks judul, ringkasan, dan isi per bahasa ada di kunci i18n `announcements` dengan urutan yang sama.

Acceptance criteria:
- G: peserta membuka layar `info`; W: dirender; T: judul "PENGUMUMAN", kalimat pengantar, dan daftar pengumuman berisi judul, ringkasan, waktu terbit, jumlah tayangan, serta penanda baca (FR-061).
- G: daftar pengumuman; T: pengumuman yang disematkan (`pin: true`, berlabel "DISEMATKAN") tampil paling atas, sisanya diurutkan dari waktu terbit terbaru.
- G: peserta mengklik satu pengumuman; W: `openAnn(id)`; T: layar detail menampilkan judul, metadata, dan seluruh paragraf isi; halaman digulir ke atas.
- G: layar detail; W: menekan "KEMBALI KE DAFTAR" atau Kembali; T: kembali ke daftar pengumuman (`annOpen = null`).
- G: layar daftar; W: menekan Kembali; T: kembali ke layar asal (`prevScreen`), atau `intro` bila tidak ada layar asal.
- G: pengunjung belum login; W: membuka layar `info` (termasuk saat memuat ulang halaman); T: pengumuman tetap dapat dibaca tanpa dialihkan ke `intro` atau `login`.
- G: layar `info`; T: `STEP_OF` bernilai -1 sehingga tidak ada langkah besar yang aktif di stepper.
- G: bahasa diganti; T: teks pengumuman mengikuti bahasa aktif (id/en/zh).
- Kebutuhan backend: pengumuman dikelola panitia dan diambil dari server, bukan dari konstanta di bundel klien ([../brief.md](../brief.md)).

### FR-061 Tayangan dan status baca pengumuman

| Atribut | Nilai |
|---|---|
| Status | Ada (as-built, dummy) |
| Prioritas | Should |
| Sumber | `C:Announcements.jsx` (`annViews`, `unreadCount`, `Meta`), `App.jsx` (`openAnn`, `openAnnFrom`), state `annViewed` |
| Terkait | US-036; FR-060, FR-062 |

Acceptance criteria:
- G: peserta membuka detail pengumuman yang belum pernah dibuka; T: id pengumuman ditambahkan ke `annViewed` satu kali.
- G: peserta membuka pengumuman yang sama lagi; T: `annViewed` tidak berubah (tayangan dihitung sekali per akun).
- G: daftar atau detail; T: jumlah tayangan = `views` contoh di `PENGUMUMAN` ditambah 1 bila id ada di `annViewed`, dengan teks "{n}x dilihat".
- G: pengumuman belum dibuka; T: penanda "BARU". G: sudah dibuka; T: penanda "SUDAH DIBACA".
- G: layar daftar dan detail; T: catatan mode demo tampil: jumlah tayangan adalah angka contoh ditambah tayangan di perangkat ini.
- Batasan mode demo: `annViewed` tersimpan di `localStorage` perangkat ini, sehingga "sekali per akun" belum berlaku lintas perangkat dan angka tayangan bukan data nyata.
- Kebutuhan backend: pencatatan tayangan unik per akun dan penghitungan total di server ([../brief.md](../brief.md)).

### FR-062 Akses pengumuman dari header, navigasi bawah, dan dasbor

| Atribut | Nilai |
|---|---|
| Status | Ada (as-built, dummy) |
| Prioritas | Should |
| Sumber | `C:Chrome.jsx` (`Header`, `BottomNav`), `C:Dash.jsx`, `C:Announcements.jsx` (`AnnTeaser`, `unreadCount`), `src/styles.css` (`.ann-btn`, `.dot-n`, `.meta`, `.sub-meta`), `src/data.js` (`ICONS.bell`) |
| Terkait | US-035, US-036; FR-051, FR-056, FR-060, FR-061 |

Acceptance criteria:
- G: lebar layar 768 px ke atas; T: header memuat tombol "PENGUMUMAN" berikon lonceng; tombol berstatus aktif saat berada di layar `info`.
- G: layar kecil; T: navigasi bawah memuat tombol "PENGUMUMAN" di ujung kanan dengan `aria-current="page"` saat berada di layar `info`; tombol Awal tidak ikut aktif di layar `info`.
- G: ada pengumuman yang belum dibuka; T: badge angka jumlah belum dibaca tampil pada tombol header dan navigasi bawah; label aksesibel tombol memuat "{n} belum dibaca". G: semua sudah dibuka; T: badge tidak tampil.
- G: tombol pengumuman ditekan dari layar mana pun; W: `toAnnouncements`; T: layar `info` (daftar) terbuka dan layar asal disimpan di `prevScreen`.
- G: layar `dasbor`; T: kolom kanan memuat kartu "PENGUMUMAN TERBARU" berisi tiga pengumuman teratas (urutan FR-060), jumlah belum dibaca, dan tombol "LIHAT SEMUA PENGUMUMAN".
- G: peserta mengklik pengumuman di kartu dasbor; W: `openAnnFrom(id)`; T: detail pengumuman terbuka, tayangan tercatat (FR-061), dan Kembali dari daftar kembali ke `dasbor`.
- G: lebar layar di bawah 1400 px; T: teks jadwal header ("pendaftaran 15 Okt - 1 Nov", "demo day akhir Nov - Jakarta") disembunyikan dari header dan ditampilkan di bawah header (`.sub-meta`); pada 1400 px ke atas teks jadwal tampil di header. Sebelumnya ambang ini 1000 px; dinaikkan agar tidak bertabrakan dengan tombol pengumuman.

### FR-063 Batas keputusan owner 24 jam dan penolakan otomatis

| Atribut | Nilai |
|---|---|
| Status | Ada (as-built, dummy) |
| Prioritas | Must |
| Sumber | `L:rules.js` (`DEADLINE_MS`, `deadlineOf`, `expirePending`), `App.jsx` (`initState`, efek interval 30 detik), `src/data.js` (`CONFIG.approveHours = 24`), `I:id.js` (`deadline.*`, `dash.log.autoReject`, `dash.log.autoRejectWho`) |
| Terkait | US-037; FR-026, FR-028, FR-033, FR-037 |

Owner memiliki waktu `CONFIG.approveHours` (24) jam sejak lamaran masuk (`at`) untuk memutuskan. Aturan berlaku untuk lamaran milik peserta (`apps`) dan pelamar di tim milik owner (`applicants`).

Acceptance criteria:
- G: lamaran berstatus `pending` dengan `at + 24 jam <= sekarang`; W: aplikasi dibuka (`initState`); T: lamaran menjadi `{status: "rejected", reason: "expired", decidedAt: at + 24 jam}`.
- G: aplikasi sedang terbuka; W: pengecekan berkala tiap 30 detik menemukan lamaran yang lewat batas; T: status diubah seperti di atas dan log "autoReject" (lamaran peserta, "Lamaran ke {team} ditolak otomatis (lewat 24 jam)") atau "autoRejectWho" (pelamar di tim owner) tercatat.
- G: tidak ada lamaran yang lewat batas; T: state tidak diubah (tidak memicu render ulang).
- G: lamaran ditolak otomatis; T: label status "DITOLAK OTOMATIS" tampil di dasbor, pasar tim, dan panel pelamar owner; keterangan di dasbor dan detail tim: "Ditolak otomatis: owner tidak memutuskan dalam 24 jam".
- G: lamaran peserta ditolak otomatis; T: peserta tidak lagi memiliki lamaran aktif dan dapat melamar ke tim lain (FR-026).
- G: data lama berisi pelamar tanpa `at`; W: aplikasi dibuka; T: `at` diisi waktu saat itu sehingga batas dihitung mulai dari pemuatan tersebut.
- G: lamaran kedaluwarsa ketika aplikasi sedang tertutup; W: aplikasi dibuka; T: status diubah dan log "autoReject"/"autoRejectWho" tetap tercatat dengan waktu batasnya (`expireAll` di `App.jsx`, dipakai `initState` dan pengecekan berkala).
- Kebutuhan backend: penolakan otomatis dijalankan di server (terjadwal atau saat dibaca), tidak bergantung pada aplikasi peserta yang terbuka ([../brief.md](../brief.md)).

### FR-064 Sisa waktu keputusan dan keputusan sekali

| Atribut | Nilai |
|---|---|
| Status | Ada (as-built, dummy) |
| Prioritas | Must |
| Sumber | `L:rules.js` (`msLeft`, `leftHM`), `App.jsx` (`decideApp`, `decideApplicant`, `toggleApply`), `C:Dash.jsx`, `C:TeamDetail.jsx`, `C:MyTeam.jsx`, `C:Market.jsx` |
| Terkait | US-037; FR-026, FR-028, FR-033, FR-063 |

Acceptance criteria:
- G: lamaran peserta berstatus `pending`; W: dasbor atau detail tim dibuka; T: tampil "Owner punya {h} jam {m} menit lagi untuk memutuskan" (menit dibulatkan ke atas).
- G: owner melihat pelamar berstatus `pending`; T: panel pelamar menampilkan "sisa {h}j {m}m" di samping tombol SETUJUI dan TOLAK.
- G: lamaran peserta berstatus `pending`; W: menekan TARIK LAMARAN; T: lamaran dihapus dan log "withdraw" tercatat (FR-026).
- G: lamaran sudah berstatus `approved` atau `rejected` (termasuk ditolak otomatis); W: keputusan dipanggil lagi (`decideApp` atau `decideApplicant`), misalnya dari tab lain atau klik terlambat; T: tidak ada perubahan state.
- G: lamaran diputuskan owner atau simulasi; T: `decidedAt` diisi waktu keputusan.
- Kebutuhan backend: sisa waktu dihitung dari waktu server, dan endpoint keputusan menolak lamaran yang tidak lagi `pending` ([../brief.md](../brief.md)).

### FR-065 Ruang tim: anggota dan kontak

| Atribut | Nilai |
|---|---|
| Status | Ada (as-built, dummy; anggota dan kontak contoh) |
| Prioritas | Should |
| Sumber | `C:TeamRoom.jsx` (`TeamRoom`, `Contacts`), `L:team.js` (`teamMembers`, `isOwnTeam`), `C:TeamDetail.jsx`, `C:MyTeam.jsx`, `src/data.js` (`ANGGOTA`, `BUILDER` dengan kontak), `I:id.js` (`room.*`) |
| Terkait | US-038; FR-025, FR-027, FR-033, FR-059 |

Acceptance criteria:
- G: lamaran peserta ke tim X disetujui; W: detail tim X dibuka; T: kartu "ANGGOTA & KONTAK" menampilkan jumlah dan daftar anggota (dari `ANGGOTA`) ditambah peserta sendiri berlabel "KAMU"; owner berlabel "OWNER".
- G: peserta adalah owner; W: dasbor (panel TIM SAYA); T: kartu yang sama menampilkan owner (peserta sendiri) dan pelamar yang sudah disetujui beserta kontaknya (dari `BUILDER`).
- G: anggota memiliki kontak; T: tampil tautan WA (`wa.me`, nomor `08...` diubah menjadi `628...`), email (`mailto:`), LinkedIn, dan GitHub; seluruh tautan dibuka di tab baru (`noopener noreferrer`).
- G: nilai LinkedIn atau GitHub tidak diawali `https://`; T: tautan tersebut tidak ditampilkan.
- G: lamaran belum ada, masih `pending`, atau ditolak; W: detail tim; T: anggota, kontak, dan chat tidak dirender; tampil pesan terkunci "Anggota, kontak, dan chat tim terbuka setelah lamaranmu disetujui."
- G: tim berasal dari link undangan (`?tim=`, FR-059) dan lamaran disetujui (simulasi); T: owner tampil tanpa kontak dengan catatan "Kontak owner tampil setelah backend tersambung."
- Batasan mode demo: kontak anggota adalah data contoh (domain `contoh.id`) di bundel klien; penyembunyian hanya di UI.
- Kebutuhan backend: kontak anggota hanya dikirim server kepada owner dan anggota yang disetujui di tim yang sama ([../brief.md](../brief.md)).

### FR-066 Chat tim di dalam aplikasi

| Atribut | Nilai |
|---|---|
| Status | Ada (as-built, dummy; hanya di perangkat ini) |
| Prioritas | Should |
| Sumber | `C:TeamRoom.jsx`, `L:team.js` (`teamMessages`), `App.jsx` (`sendChat`), state `chats`, `I:id.js` (`room.*`, `dash.log.chat`) |
| Terkait | US-039; FR-037, FR-065 |

Acceptance criteria:
- G: peserta berada di ruang tim (owner atau anggota disetujui); T: kartu "CHAT TIM - {nama tim}" menampilkan riwayat pesan, kolom isian, dan tombol KIRIM.
- G: peserta adalah anggota (bukan owner); T: pesan pertama adalah sapaan contoh dari owner: "Halo, selamat datang di tim {team}! Kenalan dulu yuk di sini."
- G: kolom kosong atau hanya spasi; W: KIRIM; T: pesan galat "Tulis pesan dulu" dan tidak ada pesan dikirim.
- G: teks valid; W: KIRIM atau Enter; T: pesan `{me: true, who, text, at}` ditambahkan ke `chats[nama tim]`, kolom dikosongkan, log "chat" tercatat, dan daftar pesan digulir ke bawah.
- G: teks lebih dari 1000 karakter; T: kolom membatasi masukan (`maxLength = 1000`) dan pesan dipotong menjadi 1000 karakter.
- G: lebih dari 200 pesan dalam satu tim; T: hanya 200 pesan terakhir disimpan.
- G: daftar pesan; T: setiap pesan menampilkan pengirim ("KAMU" untuk pesan sendiri) dan waktu sesuai bahasa; isi ditampilkan sebagai teks biasa (tidak dirender sebagai HTML); daftar memakai `role="log"` dan `aria-live="polite"`.
- G: belum ada pesan; T: "Belum ada pesan. Sapa timmu duluan."
- Batasan mode demo: pesan hanya tersimpan di `localStorage` perangkat ini dan tidak terkirim ke anggota lain; keterangan ini tampil di bawah kartu chat.
- Kebutuhan backend: penyimpanan pesan, pengiriman ke semua anggota, pembatasan laju, dan pemeriksaan keanggotaan di server ([../brief.md](../brief.md)).

### FR-067 Kolom GitHub di data diri

| Atribut | Nilai |
|---|---|
| Status | Ada (as-built, dummy) |
| Prioritas | Could |
| Sumber | `C:Identity.jsx`, `C:Group.jsx` (`shareText`), `App.jsx` (`login`, `fresh`, `PERSIST`), `I:id.js` (`identity.github`, `identity.githubPh`, `group.msg.github`) |
| Terkait | US-003, US-011, US-038; FR-005, FR-017, FR-065 |

Acceptance criteria:
- G: layar `identitas`; T: kolom "GITHUB (opsional)" tampil dengan placeholder `https://github.com/username`.
- G: kolom dikosongkan; W: LANJUT; T: tidak ada galat (kolom opsional).
- G: kolom terisi; W: pesan perkenalan grup utama disusun (FR-017); T: baris "GitHub: {nilai}" ikut dalam pesan. G: kosong; T: baris tidak disertakan.
- G: akun login memiliki GitHub; W: login; T: kolom terisi bila sebelumnya kosong.
- G: peserta menjadi anggota atau owner; T: GitHub peserta tampil sebagai kontak di ruang tim bila diawali `https://` (FR-065).
- Kebutuhan backend: kolom GitHub disimpan bersama data peserta ([../brief.md](../brief.md)).

---

## 16. Matriks ringkas: FR terhadap status, sumber, dan user story

| FR | Modul | Status | Sumber utama | US |
|---|---|---|---|---|
| FR-001 | Login | Ada | `Login.jsx` | US-002 |
| FR-002 | Login | Ada | `Login.jsx`, `data.js` | US-002 |
| FR-003 | Login | Ada | `Chrome.jsx`, `App.jsx` | US-002, US-030 |
| FR-004 | Login | Rencana | brief 4, 7 | US-002, US-031 |
| FR-005 | Data diri | Ada | `Identity.jsx` | US-003 |
| FR-006 | Data diri | Ada | `App.jsx`, `scoring.js` | US-004 |
| FR-007 | Data diri | Ada | `App.jsx`, `Identity.jsx` | US-003 |
| FR-008 | Data diri | Ada | `scoring.js`, `App.jsx` | US-004 |
| FR-009 | Data diri | Rencana | brief 5.1 | US-003, US-031 |
| FR-010 | Kuis dan jalur | Ada | `Quiz.jsx`, `data.js` | US-005 |
| FR-011 | Kuis dan jalur | Ada | `App.jsx`, `scoring.js` | US-005 |
| FR-012 | Kuis dan jalur | Ada | `App.jsx` | US-006 |
| FR-013 | Kuis dan jalur | Ada | `scoring.js`, `data.js` | US-007 |
| FR-014 | Kuis dan jalur | Ada | `Result.jsx` | US-007, US-008, US-009 |
| FR-015 | Kuis dan jalur | Rencana | brief 5.2, 6 | US-031 |
| FR-016 | Grup utama | Ada | `Group.jsx`, `App.jsx` | US-010 |
| FR-017 | Grup utama | Ada | `Group.jsx` | US-011 |
| FR-018 | Grup utama | Ada | `App.jsx`, `scoring.js` | US-010 |
| FR-019 | Grup utama | Rencana | brief 5.2 | US-031 |
| FR-020 | Pilih jalan | Ada | `Choose.jsx` | US-012 |
| FR-021 | Pilih jalan | Ada | `rules.js`, `Choose.jsx` | US-013 |
| FR-022 | Pilih jalan | Rencana | brief 5.3 | US-013, US-031 |
| FR-023 | Pasar dan lamaran | Ada | `Market.jsx`, `data.js` | US-014 |
| FR-024 | Pasar dan lamaran | Ada | `Market.jsx`, `TeamDetail.jsx` | US-014 |
| FR-025 | Pasar dan lamaran | Ada | `TeamDetail.jsx` | US-015 |
| FR-026 | Pasar dan lamaran | Ada | `App.jsx`, `rules.js` | US-016 |
| FR-027 | Pasar dan lamaran | Ada (UI saja) | `TeamDetail.jsx`, `Market.jsx` | US-017, US-034 |
| FR-028 | Pasar dan lamaran | Ada (demo) | `App.jsx`, `Dash.jsx` | US-016, US-017 |
| FR-029 | Pasar dan lamaran | Ada | `App.jsx`, `Choose.jsx` | US-018 |
| FR-030 | Pasar dan lamaran | Rencana | brief 5.3, 6, 7 | US-016, US-017, US-025, US-031, US-034 |
| FR-031 | Buat tim dan dasbor | Ada | `Create.jsx` | US-019 |
| FR-032 | Buat tim dan dasbor | Ada | `MyTeam.jsx` | US-021 |
| FR-033 | Buat tim dan dasbor | Ada (contoh) | `MyTeam.jsx`, `data.js` | US-020 |
| FR-034 | Buat tim dan dasbor | Ada (contoh) | `MyTeam.jsx` | US-022 |
| FR-035 | Buat tim dan dasbor | Ada | `MyTeam.jsx`, `App.jsx` | US-023 |
| FR-036 | Buat tim dan dasbor | Ada | `Dash.jsx` | US-024 |
| FR-037 | Buat tim dan dasbor | Ada | `App.jsx`, `Dash.jsx`, `time.js` | US-024 |
| FR-038 | Buat tim dan dasbor | Rencana | brief 5.2, 6, 7 | US-019 sampai US-025, US-031 |
| FR-039 | Tencent | Ada | `Tencent.jsx`, `data.js` | US-026 |
| FR-040 | Tencent | Ada | `Tencent.jsx` | US-026 |
| FR-041 | Tencent | Rencana | brief 5.2, 8.6 | (tanpa US khusus; BR-06) |
| FR-042 | Submit | Ada | `Submit.jsx` | US-027 |
| FR-043 | Submit | Ada | `Submit.jsx`, `data.js` | US-027 |
| FR-044 | Submit | Rencana | brief 5.2, 5.3 | US-031 |
| FR-045 | i18n | Ada | `i18n/*.js` | US-028 |
| FR-046 | i18n | Ada | `i18n/index.js`, `App.jsx` | US-028 |
| FR-047 | i18n | Ada | `i18n/index.js` | US-028 |
| FR-048 | i18n | Ada | `App.jsx`, `time.js` | US-028 |
| FR-049 | Navigasi | Ada | `Chrome.jsx` | US-029 |
| FR-050 | Navigasi | Ada | `Widgets.jsx` | US-029 |
| FR-051 | Navigasi | Ada | `Chrome.jsx` | US-029 |
| FR-052 | Navigasi | Ada | `App.jsx`, `Common.jsx` | US-029 |
| FR-053 | Navigasi | Ada | `App.jsx` | US-030 |
| FR-054 | Navigasi | Ada | `App.jsx`, `Quiz.jsx` | US-033 |
| FR-055 | Navigasi | Ada | `App.jsx`, `scoring.js` | US-029 |
| FR-056 | Info event | Ada | `Intro.jsx`, `EventInfo.jsx` | US-001 |
| FR-057 | Info event | Ada | `Brand.jsx`, `Chrome.jsx` | US-001 |
| FR-058 | Admin | Rencana | brief 8.7, 9 | US-032 |
| FR-059 | Info event (link tim) | Ada | `share.js`, `MyTeam.jsx`, `App.jsx` | US-014, US-015, US-016, US-019 |
| FR-060 | Pengumuman | Ada | `Announcements.jsx`, `App.jsx`, `data.js` | US-035 |
| FR-061 | Pengumuman | Ada (demo) | `Announcements.jsx`, `App.jsx` | US-036 |
| FR-062 | Pengumuman | Ada | `Chrome.jsx`, `Dash.jsx`, `Announcements.jsx` | US-035, US-036 |
| FR-063 | Batas keputusan | Ada (demo) | `rules.js`, `App.jsx`, `data.js` | US-037 |
| FR-064 | Batas keputusan | Ada (demo) | `rules.js`, `App.jsx`, `Dash.jsx`, `MyTeam.jsx`, `TeamDetail.jsx` | US-037 |
| FR-065 | Ruang tim | Ada (contoh) | `TeamRoom.jsx`, `team.js`, `data.js` | US-038 |
| FR-066 | Ruang tim | Ada (demo) | `TeamRoom.jsx`, `team.js`, `App.jsx` | US-039 |
| FR-067 | Data diri | Ada | `Identity.jsx`, `Group.jsx` | US-003, US-011, US-038 |

## 17. Hal yang belum didefinisikan (_TBD_)

| Butir | Catatan |
|---|---|
| Opsi login final (A, B, atau C) | Menunggu jawaban pengelola aiclub.id (brief 8.1 sampai 8.3) |
| Bentuk notifikasi ke owner | Tidak ada di as-built maupun brief |
| Pengelolaan pengumuman oleh panitia (siapa yang menulis, menyematkan, dan menghapus) | Pengumuman as-built berupa konstanta `PENGUMUMAN` dan teks i18n; kebutuhan backend di [../brief.md](../brief.md) |
| Moderasi chat tim (laporan, hapus pesan, retensi) | Chat as-built hanya lokal (FR-066); kebijakan moderasi belum ditetapkan |
| Layar persetujuan penggunaan data | Disebut di brief 8.5; belum ada FR rinci |
| Mekanisme pencocokan identitas dengan Tencent | Brief 8.6 |
| Cakupan akses admin (pusat atau kota) dan format ekspor | Brief 8.7 |
| Lokasi detail Demo Day | Teks UI: "lokasi detail menyusul" |
| Kebijakan retensi dan penghapusan data peserta | Tidak ditemukan di repo; lihat [14_SECURITY_THREAT_MODEL.md](14_SECURITY_THREAT_MODEL.md) |
| Aktivasi mode "hanya CEO membuka tim" (`CONFIG.modeDraft`) | Saat ini nonaktif |
