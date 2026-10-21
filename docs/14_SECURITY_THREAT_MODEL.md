# Model Ancaman Keamanan (STRIDE)

> Status: Draft
> Terakhir diperbarui: 2026-10-21
> Pemilik: Tim AIClub Hackathon

Dokumen ini memetakan ancaman keamanan dan privasi pada portal pendaftaran AI Agent Hackathon aiclub.id x Tencent Cloud memakai kerangka STRIDE (Spoofing, Tampering, Repudiation, Information disclosure, Denial of service, Elevation of privilege). Analisis dibuat untuk dua kondisi:

1. **Kondisi sekarang**: aplikasi statis React + Vite di GitHub Pages, tanpa backend, seluruh state di `localStorage` peserta.
2. **Kondisi target**: portal di subdomain aiclub.id dengan session aiclub.id dan API BFF di Cloudflare (D1), sebagaimana usulan [../brief.md](../brief.md). Ini rencana; detail final: _TBD_.

Dokumen terkait: [04_TRD.md](04_TRD.md), [12_TEST_STRATEGY.md](12_TEST_STRATEGY.md), [13_GLOSSARY.md](13_GLOSSARY.md), [18_INSTALLATION.md](18_INSTALLATION.md).

## 1. Ringkasan Eksekutif

| Hal | Temuan |
|---|---|
| Kondisi sekarang | Tidak ada data sungguhan yang dilindungi server karena tidak ada server. Login dan semua aturan bisnis hanya efek tampilan dan bisa dilewati dengan DevTools. Risiko utama adalah salah paham (orang mengira ada kontrol), tautan grup WhatsApp yang tertanam di bundel JavaScript, dan data pribadi (nomor WA, kota) yang dimasukkan ke form yang tidak punya dasar penyimpanan yang jelas. |
| Kondisi target | Risiko terbesar: IDOR pada lamaran dan tim, kebocoran `wa_link` tim, CSRF karena cookie lintas subdomain, kebocoran data pribadi (WA, kota) ke peserta lain, brute force/penyalahgunaan tanpa rate limit, dan pelanggaran aturan bisnis lewat pemanggilan API langsung. |
| Prinsip | Klien tidak pernah menjadi sumber kebenaran; semua keputusan akses dan aturan bisnis diputuskan server dan dijaga constraint basis data. |
| Prioritas | Sebelum rilis produksi: kontrol A01 sampai A08 (bagian 8) wajib; data privasi disetujui (pertanyaan terbuka 8.5 di brief). |

## 2. Cakupan dan Asumsi

Dalam cakupan: aplikasi SPA, hasil build di `docs/`, GitHub Pages, rencana BFF dan D1, tautan keluar (grup WhatsApp, `aiclub.id/l/...`, `wa.me`).

Di luar cakupan: keamanan portal Tencent itu sendiri, WhatsApp, infrastruktur internal aiclub.id selain yang dirujuk brief, keamanan perangkat peserta.

Asumsi:

1. Penyerang dapat memakai DevTools, mengubah `localStorage`, memanggil API langsung, dan membaca bundel JavaScript publik.
2. Pengguna sah adalah anggota komunitas dengan akun aiclub.id (target). Saat ini siapa pun dapat masuk dengan email dan sandi bebas.
3. Event berlangsung singkat (pendaftaran sampai 1 Nov 2026, Demo Day 27 Nov 2026), tetapi data pribadi tetap perlu perlindungan setelahnya.
4. Fakta tentang sistem aiclub.id (format session, provider OAuth, akses D1) belum diketahui: _TBD_ ([../brief.md](../brief.md) bagian 8).

## 3. Aset

| ID | Aset | Sensitivitas | Lokasi sekarang | Lokasi target |
|---|---|---|---|---|
| AS-1 | Nomor WhatsApp peserta | Tinggi (data pribadi) | `localStorage` (`hk_state.wa`); dikirim ke WhatsApp lewat tautan `wa.me` saat peserta berbagi | `hackathon_participant` / profil aiclub.id |
| AS-2 | Kota, nama, email, LinkedIn | Sedang sampai tinggi | `localStorage` | Profil aiclub.id (`cityId`) |
| AS-3 | Tautan grup WhatsApp utama (`WA_GROUP_URL`) | Sedang | Tertanam di bundel (`src/data.js`) | Tetap publik atau dikirim setelah syarat terpenuhi: _TBD_ |
| AS-4 | Tautan grup WhatsApp tim (`wa` / `wa_link`) | Tinggi (siapa pun yang tahu dapat masuk grup) | Tertanam di bundel untuk 6 tim contoh; tim buatan peserta di `localStorage` | `hackathon_team.wa_link`, hanya untuk owner dan anggota disetujui |
| AS-5 | Identitas dan session (`memberId`, cookie) | Tinggi | Tidak ada (login dummy) | Cookie session aiclub.id |
| AS-6 | Lamaran, status, keputusan owner | Sedang | `localStorage` | `hackathon_application` |
| AS-7 | Data tim (nama, deskripsi, slot, status) | Rendah sampai sedang | `data.js`, `localStorage` | `hackathon_team` |
| AS-8 | Jawaban skenario dan jalur | Rendah sampai sedang | `localStorage` | `hackathon_participant.jawaban`, `jalur` |
| AS-9 | Integritas aturan bisnis (satu orang satu tim, satu lamaran aktif) | Tinggi (bisnis) | `src/lib/rules.js` (klien) | Server dan constraint D1 |
| AS-10 | Log aktivitas | Rendah | `localStorage` (maks. 60 entri) | `hackathon_activity` |
| AS-11 | Key API pengurus (`/api/v1/agent/*`) | Kritis | Tidak ada di repo | Rahasia di sisi server; tidak boleh ke klien |
| AS-12 | Integritas tautan portal Tencent (`aiclub.id/l/...`) | Sedang | `src/data.js` | Konfigurasi terkontrol |
| AS-13 | Ketersediaan portal selama masa pendaftaran | Sedang | GitHub Pages | Worker + D1 |
| AS-14 | Reputasi penyelenggara (AIClub, Tencent) | Sedang | - | - |
| AS-15 | Kontak anggota tim (WA, email, LinkedIn, GitHub) di ruang tim | Tinggi (data pribadi) | Data contoh (`contoh.id`) di bundel (`ANGGOTA`, `BUILDER`); kontak peserta sendiri di `localStorage` | Hanya dikirim server ke owner dan anggota disetujui di tim yang sama ([../brief.md](../brief.md)) |
| AS-16 | Pesan chat tim | Sedang sampai tinggi (dapat memuat data pribadi) | `localStorage` (`chats`, 200 pesan per tim), hanya perangkat ini | Disimpan dan dikirim server ke anggota tim saja |
| AS-17 | Pengumuman resmi dan hitungan tayangan | Sedang (keaslian informasi panitia) | Konstanta `PENGUMUMAN` dan teks i18n di bundel; `annViewed` di `localStorage` | Dikelola panitia di server; tayangan unik per akun dihitung server |

## 4. Batas Kepercayaan

### 4.1 Kondisi sekarang

```
[Peserta + browser] --HTTPS--> [GitHub Pages (statis)]
        |  localStorage (hk_state, hk_lang)          <- tidak tepercaya sepenuhnya
        |--> chat.whatsapp.com (grup utama/tim)       <- pihak ketiga
        |--> wa.me (bagikan perkenalan)                <- pihak ketiga, membawa data pribadi
        |--> aiclub.id/l/... (portal Tencent)          <- pihak ketiga
        '--> fonts.googleapis.com / fonts.gstatic.com  <- pihak ketiga (font)
```

| Batas | Penjelasan |
|---|---|
| TB-1 Browser peserta dan hosting statis | Semua kode dan data contoh publik. Tidak ada rahasia yang boleh ada di bundel. |
| TB-2 Peserta dan localStorage | Peserta mengendalikan penuh isi `localStorage`; tidak ada integritas. |
| TB-3 Portal dan pihak ketiga | Tautan keluar dibuka dengan `rel="noopener noreferrer"`. Font dimuat dari Google Fonts (mengirim IP ke Google). |

### 4.2 Kondisi target (rencana)

```
[Browser] --HTTPS, cookie session aiclub.id--> [hackathon.aiclub.id: SPA + BFF Worker]
                                                     |  validasi session, otorisasi, aturan bisnis
                                                     v
                                               [D1 aiclub.id: member + hackathon_*]
[Pengurus] --key pengurus--> [/api/v1/agent/*]  (tidak boleh dipanggil dari klien)
```

| Batas | Penjelasan |
|---|---|
| TB-A Internet ke BFF | Semua masukan tidak tepercaya; wajib validasi, autentikasi, rate limit. |
| TB-B BFF ke D1 | Hanya BFF yang menjalankan kueri; parameter harus terikat (prepared statement). |
| TB-C Subdomain ke domain induk | Cookie `Domain=.aiclub.id` dibagi ke semua subdomain; subdomain lain yang rentan (mis. XSS) dapat memengaruhi session. |
| TB-D Peserta ke peserta | Data satu peserta (WA, kota, lamaran) tidak boleh terlihat peserta lain tanpa hak. |
| TB-E Peserta ke pengurus | Peran pengurus (pusat/kota) dan akses ekspor dipisahkan dari peserta. |

## 5. Alur Data Utama

| Alur | Data | Sekarang | Target |
|---|---|---|---|
| Login | email, sandi | Form dummy, tidak ada verifikasi; sandi tidak dikirim ke mana pun | Login aiclub.id; portal tidak menangani sandi |
| Data diri | nama, kota, WA, email, LinkedIn | `localStorage` | `PATCH /api/hackathon/me` |
| Kuis | jawaban | `localStorage`, skor dihitung di klien | server menghitung ulang skor |
| Berbagi perkenalan | nama, kota, email, latar, WA, LinkedIn, jalur | Tautan `https://wa.me/?text=...` dibuka di tab baru; pengguna menekan kirim sendiri ke grup utama | Sama; tetap inisiatif peserta |
| Melamar/menyetujui | lamaran, keputusan | Diubah di klien | `POST apply`, `POST decide` |
| Tautan grup tim | `wa_link` | Di bundel dan klien | Dikirim server bersyarat |
| Submit ke Tencent | tautan keluar | Tautan statis | Statis; flag `project_ready_at` di server |

## 6. Analisis STRIDE

Skala risiko: T (tinggi), S (sedang), R (rendah); "Kritis" dipakai untuk kebocoran rahasia pengurus. "Sekarang" = state klien tanpa backend; "Target" = session aiclub.id + API.

### 6.1 Spoofing (pemalsuan identitas)

| ID | Ancaman | Kondisi | Dampak | Risiko | Mitigasi |
|---|---|---|---|---|---|
| S-1 | Siapa pun masuk sebagai siapa pun: login dummy menerima email apa saja dan sandi apa saja (`Login.jsx`) | Sekarang | Tidak ada data sungguhan terpengaruh, tetapi peserta bisa mengira terverifikasi | R (sekarang), T bila data nyata disimpan | Badge "DUMMY" sudah tampil (`login.badge`). Jangan menyimpan data nyata sampai login sungguhan. |
| S-2 | Pencurian/replay session (cookie dicuri atau token magic link dipakai ulang) | Target | Pengambilalihan akun peserta | T | Cookie `HttpOnly; Secure; SameSite=Lax`; masa berlaku pendek; token sekali pakai bila opsi C; rotasi session saat login; logout menghapus session di sisi server. |
| S-3 | Phishing: halaman tiruan "Masuk dengan aiclub.id" | Target | Kredensial peserta dicuri | S | Domain resmi tunggal (`*.aiclub.id`), tidak ada form kata sandi di portal ini, komunikasikan domain resmi di grup utama. |
| S-4 | Peniruan owner atau tim (tim palsu dengan nama menyesatkan, tautan WA berbahaya) | Keduanya | Peserta masuk grup berbahaya | S | Validasi `WA_LINK_RE`; tautan tampil hanya setelah disetujui; kemampuan pengurus menutup tim; pelaporan. |
| S-5 | Subdomain takeover pada `*.aiclub.id` memanfaatkan cookie bersama | Target | Session dapat dibaca/ditimpa | T | Inventaris DNS, hapus CNAME menggantung, pertimbangkan cookie `__Host-` bila tidak perlu lintas subdomain, atau gunakan opsi OAuth (B). |
| S-6 | Pengaburan identitas Tencent: peserta mengklaim sudah mendaftar tim ke Tencent | Keduanya | Data tak sinkron | R | Tautan `aiclub.id/l/...` tidak memberi data balik; pencocokan `memberId`/email: _TBD_ ([../brief.md](../brief.md) 8.6). |

### 6.2 Tampering (pengubahan data)

| ID | Ancaman | Kondisi | Dampak | Risiko | Mitigasi |
|---|---|---|---|---|---|
| T-1 | Peserta mengubah `localStorage` (`hk_state`) untuk melewati gerbang: `joinedMain`, `projectReady`, status lamaran `approved`, `myTeam`, `override` | Sekarang | Melompati syarat grup utama; "menyetujui" lamarannya sendiri | S (karena dummy) | Dapat diterima untuk demo. Target: semua status dipegang server; `localStorage` hanya preferensi (`lang`, `screen`). |
| T-2 | Melewati aturan bisnis lewat pemanggilan API langsung (satu orang dua tim, dua lamaran aktif, owner melamar) | Target | Data tak konsisten | T | Aturan di server dalam transaksi; `UNIQUE (owner_id)`; indeks unik parsial `one_active_app`; tes A-05 sampai A-10 di [12_TEST_STRATEGY.md](12_TEST_STRATEGY.md). |
| T-3 | Race condition lamaran ganda | Target | Melanggar satu lamaran aktif | T | Constraint DB dan transaksi, bukan hanya pengecekan di aplikasi. |
| T-4 | Peserta memalsukan jalur (kirim `jalur` langsung) | Target | Mengambil slot CEO atau memanipulasi pencocokan | S | Server menghitung ulang skor dari `jawaban`; `jalur_override` dicatat dan diaudit. |
| T-5 | Mass assignment: mengirim field tambahan (`status`, `owner_id`, `member_id`) | Target | Eskalasi atau pemalsuan | T | Allowlist field per endpoint; `member_id` selalu dari session, bukan dari badan permintaan. |
| T-6 | Injeksi (SQL) lewat nama tim, deskripsi, kota | Target | Pembacaan/pengubahan D1 | T | Kueri terparameter, validasi panjang dan tipe. |
| T-7 | XSS tersimpan lewat nama/deskripsi tim atau nama peserta | Target | Pembajakan session, pencurian data | T | React meng-escape secara default; jangan memakai `dangerouslySetInnerHTML`; terapkan CSP; validasi masukan; encode saat ekspor CSV (hindari CSV/formula injection). |
| T-8 | Tautan WA berbahaya (tautan non-WhatsApp, `javascript:`, atau awalan sah diikuti karakter tambahan) | Keduanya | Pengalihan phishing | S | `WA_LINK_RE` di klien dan server (hanya `https://chat.whatsapp.com/...`). Catatan: ekspresi saat ini hanya berjangkar di awal (`^`) tanpa `$`, sehingga teks setelah kode undangan lolos; sebaiknya diberi jangkar akhir di server. Kolom tautan di `Create.jsx` juga boleh kosong. Tautan dibuka dengan `rel="noopener noreferrer"`. |
| T-9 | Perubahan bundel hasil build (supply chain: paket npm, CDN font) | Keduanya | Kode jahat tersuntik | S | Kunci versi lewat `package-lock.json`, tinjau dependensi (`react`, `react-dom`, `vite`, `@vitejs/plugin-react`), audit berkala (`npm audit`), pertimbangkan hosting font sendiri. |
| T-10 | Perubahan tautan portal Tencent di `data.js` oleh pihak tak berwenang | Keduanya | Peserta diarahkan ke situs lain | S | Tinjauan permintaan tarik, proteksi branch `main`, tautan dikelola konfigurasi di server (target). |
| T-11 | Manipulasi hitungan tayangan pengumuman (mengubah `annViewed`, membuka berulang lewat banyak akun atau permintaan langsung) | Keduanya | Angka tayangan tidak mencerminkan jangkauan sebenarnya | R | Sekarang: angka adalah contoh + tayangan lokal, tidak dipakai untuk keputusan. Target: tayangan unik per `memberId` dengan constraint unik di server, rate limit, abaikan permintaan tanpa session. |
| T-12 | Mengakali batas keputusan 24 jam dengan mengubah jam perangkat atau `localStorage` (`at`, `status`, `reason`) | Sekarang | Lamaran tidak kedaluwarsa atau kedaluwarsa lebih cepat di perangkat itu | R (sekarang), S bila tetap di klien saat produksi | Target: kedaluwarsa dihitung dari waktu server dan dijalankan server; endpoint keputusan menolak lamaran yang tidak lagi `pending` (FR-063, FR-064). |

### 6.3 Repudiation (penyangkalan)

| ID | Ancaman | Kondisi | Dampak | Risiko | Mitigasi |
|---|---|---|---|---|---|
| R-1 | Owner menyangkal telah menolak/menyetujui lamaran; peserta menyangkal pernah melamar | Target | Sengketa keanggotaan tim | S | Catat keputusan di server dengan `decided_at`, pelaku (`memberId`), dan `hackathon_activity`; jangan ubah/hapus entri audit. |
| R-2 | Log aktivitas klien dapat diedit | Sekarang | Riwayat tidak andal | R | Hanya informasi UI; pindah ke log server pada target. |
| R-3 | Persetujuan penggunaan data (WA, kota) tidak terdokumentasi | Target | Masalah kepatuhan privasi | T | Layar persetujuan dengan versi teks dan stempel waktu (pertanyaan 8.5 di brief); simpan catatan persetujuan. |
| R-4 | Aksi pengurus (ekspor, penutupan tim) tak tercatat | Target | Tidak ada akuntabilitas | S | Audit log aksi pengurus. |

### 6.4 Information Disclosure (kebocoran informasi)

| ID | Ancaman | Kondisi | Dampak | Risiko | Mitigasi |
|---|---|---|---|---|---|
| I-1 | **Tautan grup WhatsApp tim bocor.** Tautan `wa` enam tim contoh tertanam di `src/data.js`, sehingga ada di bundel JavaScript publik (`docs/assets/index-*.js`) walau UI baru menampilkannya setelah `approved`. Tim buatan peserta menyimpan tautan di `localStorage`. | Sekarang | Siapa pun yang membaca bundel dapat melewati "link terbuka setelah disetujui" | T (untuk tautan sungguhan), R (untuk placeholder `Dummy...`) | Tautan contoh hanya placeholder; jangan pernah menaruh tautan grup sungguhan di `data.js`. Target: `wa_link` hanya dalam respons API untuk owner dan pelamar `approved`; daftar publik tidak memuatnya; tes A-11/A-12. |
| I-2 | Tautan grup WhatsApp utama (`WA_GROUP_URL`) tertanam di bundel dan README/UI; gerbang "wajib gabung" hanya klik dan konfirmasi sendiri | Keduanya | Tautan menyebar di luar komunitas; grup bisa dimasuki orang tak berhak, spam | S | Terima sebagai tautan semi-publik; atur persetujuan anggota di WhatsApp (admin approval), pantau grup. Mengganti tautan bila disalahgunakan: _TBD_ prosedur. |
| I-3 | Nomor WA, kota, dan email peserta tampil ke peserta lain (daftar builder, detail tim, pelamar) | Target | Pelanggaran privasi, spam, doxxing | T | Daftar publik (`/builders`, `/teams`) tanpa WA/email; WA hanya terlihat oleh pihak yang berhak dan hanya bila perlu; kota ditampilkan umum (kota, bukan alamat); lihat bagian 7. |
| I-4 | Pesan perkenalan `wa.me` memuat nama, kota, email, latar, WA, LinkedIn ke grup utama yang berisi banyak orang | Keduanya | Data pribadi tersebar ke seluruh anggota grup; tidak bisa ditarik | S | Pesan dibuat dan dikirim atas inisiatif peserta; tampilkan pratinjau (sudah ada: `group.previewTitle`); beri peringatan jelas bahwa isi akan terlihat semua anggota; izinkan menghilangkan kolom. |
| I-5 | Data pribadi tersimpan tanpa enkripsi di `localStorage` perangkat bersama | Sekarang | Peserta berikutnya di komputer yang sama melihat data | S | Tombol "Keluar" mengosongkan state (`logout` memakai `fresh()`); sarankan mode privat di perangkat umum. Catatan: `hk_lang` tertinggal. |
| I-6 | Kebocoran lewat pesan galat API, header, atau log (stack trace, ID internal) | Target | Informasi untuk penyerang | S | Galat generik ke klien, detail hanya di log server; tanpa data pribadi di log. |
| I-7 | Enumerasi: tebak ID tim/lamaran/anggota; membedakan "tidak ada" dari "dilarang" | Target | Pemetaan peserta/tim | S | ID acak tak berurutan; respons seragam (`404`) untuk objek yang tak boleh dilihat. |
| I-8 | Font Google dan layanan pihak ketiga menerima IP/metadata peserta | Keduanya | Pelacakan ringan | R | Dokumentasikan; pertimbangkan hosting font sendiri. |
| I-9 | Header `Referer` membocorkan jalur internal ke situs tujuan | Keduanya | Rendah | R | `rel="noopener noreferrer"` sudah dipakai; tambahkan `Referrer-Policy` di server (target). |
| I-10 | Ekspor data pengurus (CSV) bocor atau diakses salah | Target | Kebocoran massal | T | Hanya peran berwenang; unduhan tercatat; masa simpan; enkripsi saat disimpan; tes A-21. |
| I-11 | Key pengurus `/agent/*` bocor ke klien/bundel | Target | Penyalahgunaan akses pengurus | Kritis | Key tidak pernah di bundel; variabel `VITE_*` terlihat publik, jadi jangan dipakai untuk rahasia; gunakan session member atau service binding ([../brief.md](../brief.md) 4 dan 7). |
| I-12 | Cache/CDN menyimpan respons berisi data pribadi | Target | Pengguna lain menerima respons orang lain | S | `Cache-Control: private, no-store` pada endpoint berkredensial; `Vary: Cookie`. |
| I-13 | **Kontak anggota bocor.** Kontak contoh di `ANGGOTA`/`BUILDER` ada di bundel publik walau UI hanya menampilkannya di ruang tim setelah disetujui; pada target, endpoint anggota dapat bocor ke non-anggota bila otorisasi salah | Keduanya | Spam, doxxing, penyalahgunaan nomor WA dan email | T (target), R (sekarang: data contoh `contoh.id`) | Jangan menaruh kontak nyata di repo. Target: kontak hanya untuk owner dan anggota disetujui di tim yang sama, minimisasi kolom, persetujuan peserta sebelum kontak dibagikan ke tim, kontak dicabut saat anggota keluar atau tim ditutup. |
| I-14 | Pesan chat tim berisi data pribadi (nomor, alamat, dokumen) atau terbaca pihak di luar tim | Keduanya | Kebocoran data pribadi antarpeserta | S | Sekarang: pesan hanya di `localStorage` perangkat ini (ikut terhapus saat logout). Target: akses chat hanya untuk anggota tim, imbauan agar tidak membagikan data sensitif, masa simpan dan penghapusan pesan, pesan tidak ditulis ke log server. |

### 6.5 Denial of Service

| ID | Ancaman | Kondisi | Dampak | Risiko | Mitigasi |
|---|---|---|---|---|---|
| D-1 | Banjir permintaan ke endpoint tulis (apply, buat tim, undang) | Target | Kuota Worker/D1 habis, layanan lambat | S | Rate limit per session/IP (nilai: _TBD_); batas ukuran badan permintaan; respons `429`. |
| D-2 | Spam pembuatan tim atau lamaran untuk menutupi pasar tim | Target | Daftar tim penuh sampah | S | Satu owner satu tim (constraint), satu lamaran aktif per orang, batas jumlah tindakan per jam, moderasi pengurus. |
| D-3 | Brute force/credential stuffing pada login | Target | Pengambilalihan akun | T | Ditangani sistem login aiclub.id; dorong rate limit, penguncian progresif, deteksi anomali di sana; portal tidak mengimplementasikan login sendiri. Sekarang: tidak relevan (tidak ada otentikasi nyata). |
| D-4 | Brute force/enumerasi ID tim atau lamaran untuk mencari tautan atau data | Target | Pemetaan data | S | ID acak (UUID/ULID), otorisasi per objek, rate limit, respons seragam. |
| D-5 | Lonjakan trafik menjelang batas 1 Nov | Keduanya | Portal lambat | S | Aset statis di CDN; kuota Worker/D1 dipantau; uji beban ringan. GitHub Pages memiliki batas lalu lintas dari pihak GitHub: _TBD_. |
| D-6 | `localStorage` rusak atau penuh membuat aplikasi tidak dapat dimuat | Sekarang | Peserta terkunci | R | Pembacaan dibungkus `try/catch` dan validasi `SCREENS`; petunjuk reset di [17_DEVELOPER_SETUP.md](17_DEVELOPER_SETUP.md). |
| D-7 | Ketergantungan pada pihak ketiga (GitHub Pages, Google Fonts, `wa.me`, portal Tencent) tidak tersedia | Keduanya | Alur terhenti sebagian | R | Font memiliki fallback; tidak ada mitigasi atas portal Tencent selain komunikasi. |
| D-8 | Spam atau penyalahgunaan chat tim (banjir pesan, pelecehan, tautan berbahaya) | Keduanya | Anggota terganggu, kuota server habis | S | Sekarang: validasi kosong, maks 1000 karakter, simpan 200 pesan terakhir, hanya lokal. Target: rate limit per `memberId`, batas panjang di server, pesan dirender sebagai teks (tanpa HTML), pelaporan dan moderasi pengurus (_TBD_), anggota yang keluar kehilangan akses. |

### 6.6 Elevation of Privilege (peningkatan hak)

| ID | Ancaman | Kondisi | Dampak | Risiko | Mitigasi |
|---|---|---|---|---|---|
| E-1 | **IDOR lamaran:** peserta X menyetujui, menolak, atau menarik lamaran milik orang lain dengan mengganti `applications/:id` | Target | Mengambil alih keputusan keanggotaan | T | Otorisasi per objek: `decide` hanya oleh owner tim yang lamarannya masuk (`403`); `DELETE` hanya oleh pemilik lamaran atau owner tim; ID tak berurutan; tes A-02/A-03. |
| E-2 | **IDOR tim:** peserta mengubah (`PATCH`), menutup, atau mengundang atas nama tim lain, atau membaca `wa_link` tim lain dengan `GET /teams/:id` | Target | Pembajakan tim, kebocoran tautan | T | Periksa `team.owner_id == session.memberId`; `wa_link` hanya untuk owner dan anggota `approved`; tes A-04/A-11. |
| E-3 | Peserta biasa memanggil fungsi pengurus (ekspor, daftar semua peserta) | Target | Kebocoran massal | T | Peran dipisah di server; akses ekspor hanya pengurus berwenang (pertanyaan 8.7 di brief). |
| E-4 | Melewati `demoOwner`: tombol simulasi setujui/tolak tim contoh | Sekarang | Hanya mempengaruhi demo | R | Matikan `CONFIG.demoOwner` dan hapus data contoh sebelum produksi ([../brief.md](../brief.md) 7). |
| E-5 | Menambahkan diri sebagai owner dan anggota sekaligus (melanggar eksklusivitas) | Target | Menguasai dua posisi | S | Validasi di server dalam satu transaksi, tes A-07/A-08. |
| E-6 | Eskalasi lewat parameter (`role`, `isAdmin`) di badan permintaan atau klaim token | Target | Hak pengurus | T | Peran selalu dibaca dari session/DB, bukan dari masukan klien. |
| E-7 | Menyalahgunakan CSRF agar korban yang login melakukan aksi (lihat bagian 7.3) | Target | Aksi atas nama korban | T | Lihat mitigasi CSRF. |
| E-8 | Non-anggota membaca anggota, kontak, atau chat tim lain dengan mengganti ID tim pada endpoint ruang tim | Target | Kebocoran kontak dan isi chat | T | Periksa keanggotaan (owner atau lamaran `approved`) pada setiap permintaan; respons `404` seragam; tes otorisasi dua akun. |
| E-9 | Peserta selain panitia menerbitkan atau mengubah pengumuman | Target | Informasi palsu atas nama panitia | S | Penulisan pengumuman hanya untuk peran panitia di server; audit log penerbitan. |

## 7. Topik Khusus

### 7.1 Kebocoran Tautan Grup WhatsApp

Fakta kode saat ini:

1. `TIM[].wa` (enam tautan placeholder `https://chat.whatsapp.com/Dummy...`) dan `WA_GROUP_URL` ada di `src/data.js` sehingga masuk ke `docs/assets/index-*.js`. Siapa pun dapat membaca bundel.
2. Penyembunyian tautan tim adalah efek tampilan: `TeamDetail.jsx` menampilkan tombol hanya bila status `approved`, namun data tetap tersedia di JavaScript.
3. Tautan grup yang dibuat owner disimpan di `localStorage` perangkat owner (`myTeam.wa`).

Risiko dan kontrol:

| Kontrol | Sekarang | Target |
|---|---|---|
| Tautan tim hanya diketahui yang berhak | Tidak terjamin (di bundel). Aman hanya karena placeholder. | `wa_link` dikirim server bersyarat (owner dan `approved`); tidak ada di daftar publik (`GET /teams`) |
| Validasi format | `WA_LINK_RE` di `Create.jsx` | `WA_LINK_RE` juga di server |
| Pencabutan tautan bocor | Tidak ada | Owner dapat mengganti tautan (`PATCH /teams/:id`); WhatsApp memungkinkan reset tautan undangan oleh admin grup |
| Penerima membagikan ulang tautan | Tidak terkendali | Gunakan persetujuan anggota (admin approval) di WhatsApp; imbau owner |
| Larangan data nyata di `data.js` | Aturan proses | Hapus `TIM`, `BUILDER`, `SEED_APPLICANTS` saat integrasi |

### 7.2 IDOR pada Lamaran dan Tim

Matriks otorisasi target (ringkasan):

| Endpoint (usulan di brief) | Pelaku sah | Pemeriksaan wajib |
|---|---|---|
| `GET /api/hackathon/me` | Pemilik session | `memberId` dari session; tidak menerima `memberId` dari klien |
| `GET /teams/:id` | Peserta login | `wa_link` hanya bila owner atau pelamar `approved` pada tim itu |
| `PATCH /teams/:id` | Owner tim | `owner_id == session.memberId` |
| `POST /teams/:id/close` | Owner tim | idem |
| `POST /teams/:id/apply` | Peserta tanpa tim dan tanpa lamaran aktif, bukan owner | aturan 5.3 di brief |
| `DELETE /applications/:id` | Pemilik lamaran (menarik/keluar) atau owner tim (mengeluarkan) | pemilik lamaran atau owner tim terkait |
| `POST /applications/:id/decide` | Owner tim yang menerima lamaran | `team.owner_id == session.memberId`, status `pending` |
| `POST /teams/:id/invites` | Owner tim | idem; builder belum bertim |
| `GET /builders` | Peserta login | Tanpa WA/email |

Praktik tambahan: ID acak (UUID/ULID), respons `404` seragam untuk objek yang tidak boleh diketahui, uji otomatis kasus "owner tim lain" dan "peserta lain" (A-02, A-03, A-04).

### 7.3 CSRF dan Cookie

Cookie bersama `Domain=.aiclub.id` membuat browser mengirimnya ke semua subdomain, sehingga permintaan mutasi dari situs lain dapat membawa cookie bila tidak dibatasi.

| Kontrol | Penjelasan |
|---|---|
| `SameSite=Lax` (minimal) atau `Strict` | Cookie tidak ikut pada permintaan lintas situs berbasis POST. Catatan: subdomain sesama `aiclub.id` dianggap *same-site*, jadi `SameSite` saja tidak melindungi dari subdomain lain. |
| Metode aman | `GET` tidak boleh mengubah data. Semua mutasi memakai `POST/PATCH/DELETE`. |
| Pemeriksaan `Origin`/`Referer` | BFF menolak mutasi bila `Origin` bukan `https://hackathon.aiclub.id` (nilai final: _TBD_). |
| Token CSRF atau header kustom | Mutasi mensyaratkan header kustom (mis. `X-Requested-With`) atau token anti-CSRF; permintaan lintas asal memicu preflight CORS yang ditolak. |
| `Content-Type: application/json` ketat | Tolak `text/plain` dan form-encoded pada endpoint JSON. |
| CORS | Tanpa `Access-Control-Allow-Origin: *` pada endpoint berkredensial; allowlist asal tunggal. |
| `HttpOnly`, `Secure` | Skrip tidak bisa membaca cookie; hanya lewat HTTPS. |
| Higiene subdomain | Semua subdomain di bawah `.aiclub.id` setara tepercaya; audit XSS dan takeover (S-5). |
| `fetch` dengan `credentials: "include"` | Sesuai rencana `src/lib/api.js`; pastikan hanya ke `VITE_API_BASE` yang ditetapkan. |
| Logout | Menghapus session di server (`POST /api/auth/logout`) dan di kedua sisi. |

Opsi login B (OAuth/OIDC) dan C (magic link) membawa risikonya sendiri: validasi `state` dan PKCE, `redirect_uri` ketat, token sekali pakai dengan masa berlaku pendek (replay).

### 7.4 Privasi WhatsApp dan Kota

| Data | Status | Kebijakan usulan |
|---|---|---|
| Nomor WA | Wajib diisi (9 sampai 15 digit) | Dikumpulkan hanya untuk koordinasi hackathon; tidak tampil di daftar publik dan tidak ke peserta lain, kecuali peserta sendiri membagikannya (pesan perkenalan) atau ada dasar persetujuan; visibilitas ke owner/pengurus: _TBD_ (pertanyaan 8.5 brief). |
| Kota | Wajib | Level kota saja (bukan alamat). Boleh tampil pada kartu tim/builder; target memakai `cityId`. |
| Email | Opsional (dari akun) | Tidak ditampilkan ke peserta lain; dipakai untuk undangan. |
| LinkedIn | Opsional | Hanya bila dibagikan sendiri. |
| GitHub | Opsional | Hanya bila dibagikan sendiri; ikut pesan perkenalan dan kontak ruang tim. |
| Kontak di ruang tim (WA, email, LinkedIn, GitHub) | Tampil ke owner dan anggota disetujui (mode demo: data contoh) | Hanya untuk anggota tim yang sama; perlu dasar persetujuan sebelum dibagikan ke tim (pertanyaan 8.5 brief); lihat I-13. |
| Masa simpan | Belum ditetapkan | _TBD_ (usulan: hapus atau anonimkan setelah event berakhir). |
| Hak subjek data (akses, koreksi, hapus) | Belum ada | _TBD_; perlu jalur permintaan melalui pengurus. |
| Dasar hukum dan kebijakan privasi | Belum ada di portal | _TBD_; perlu layar persetujuan sebelum nomor WA tampil ke pengurus atau owner. |

Data pribadi tidak boleh muncul di URL, log akses, atau alat analitik. Saat ini tidak ada analitik di kode.

### 7.5 Brute Force dan Rate Limiting

| Permukaan | Ancaman | Kontrol (target) |
|---|---|---|
| Login aiclub.id | Tebak sandi, credential stuffing | Tanggung jawab sistem login aiclub.id: batas percobaan, penundaan progresif, notifikasi. Portal tidak menerima sandi. |
| Endpoint tulis hackathon | Spam, otomatisasi | Rate limit per `memberId` dan per IP; batas wajar (nilai: _TBD_) misalnya per menit untuk apply, buat tim, undang. |
| Endpoint baca (`/teams`, `/teams/:id`, `/builders`) | Scraping, enumerasi | Rate limit; paginasi; ID acak; tanpa data pribadi. |
| Tautan undangan/token | Tebak token | Token panjang dan acak, masa berlaku pendek, sekali pakai. |
| Respons | Pembedaan keberadaan akun/objek | Pesan galat seragam. |
| Cloudflare | Perlindungan tepi | WAF/bot management/Rules rate limiting tersedia di Cloudflare; konfigurasi: _TBD_. |

Sekarang: tidak ada endpoint, jadi brute force tidak relevan; satu-satunya "gerbang" (login dummy) memang tidak memverifikasi apa pun.

## 8. Daftar Mitigasi dan Prioritas

| ID | Mitigasi | Menutup | Kondisi | Prioritas | Status |
|---|---|---|---|---|---|
| A01 | Otorisasi per objek (owner tim, pemilik lamaran) di semua endpoint | E-1, E-2, T-5 | Target | Wajib sebelum produksi | Belum |
| A02 | Aturan bisnis di server dan constraint D1 (`UNIQUE owner_id`, `one_active_app`), transaksi | T-2, T-3, E-5 | Target | Wajib | Belum |
| A03 | `wa_link` bersyarat dan tidak ada di daftar publik | I-1, I-3 | Target | Wajib | Belum |
| A04 | Perlindungan CSRF (Origin, header kustom, SameSite, CORS ketat) | E-7 | Target | Wajib | Belum |
| A05 | Cookie `HttpOnly; Secure; SameSite`, rotasi dan logout dua sisi | S-2 | Target | Wajib | Belum |
| A06 | Validasi masukan, kueri terparameter, allowlist field, `WA_LINK_RE` server | T-5, T-6, T-8 | Target | Wajib | Belum |
| A07 | Privasi: persetujuan, minimisasi, daftar tanpa WA/email | I-3, R-3 | Target | Wajib | Belum |
| A08 | Tidak ada key pengurus atau rahasia di bundel; `VITE_*` publik | I-11 | Target | Wajib | Terpenuhi untuk repo saat ini (tidak ada `.env` di repo; `.env` dan `.env.local` ada di `.gitignore`) |
| A09 | Rate limit dan batas ukuran badan | D-1 sampai D-4 | Target | Tinggi | Belum |
| A10 | CSP dan header keamanan (`Referrer-Policy`, `X-Content-Type-Options`, `frame-ancestors`) | T-7, I-9 | Target | Tinggi | Belum; GitHub Pages tidak mengizinkan header kustom |
| A11 | Audit log keputusan dan aksi pengurus | R-1, R-4 | Target | Sedang | Belum |
| A12 | Server menghitung ulang skor jalur | T-4 | Target | Sedang | Belum |
| A13 | Hapus `TIM`, `BUILDER`, `SEED_APPLICANTS`, `demoOwner` dari produksi | E-4, I-1 | Target | Wajib | Belum |
| A14 | Tidak menaruh tautan grup sungguhan atau data pribadi sungguhan di repo | I-1, I-2 | Sekarang | Wajib | Aturan proses |
| A15 | Tautan keluar `rel="noopener noreferrer"` | I-9 | Sekarang | Sedang | Terpenuhi (semua tautan eksternal di komponen) |
| A16 | Peringatan privasi pada pesan perkenalan `wa.me` | I-4 | Sekarang | Sedang | Sebagian: ada pratinjau pesan |
| A17 | Audit dependensi dan kunci versi | T-9 | Keduanya | Sedang | `package-lock.json` ada; audit berkala belum |
| A18 | Inventaris subdomain `*.aiclub.id` dan peninjauan XSS | S-5 | Target | Tinggi | Belum |
| A19 | Kebijakan retensi dan hak subjek data | Bagian 7.4 | Target | Tinggi | _TBD_ |
| A20 | Kontak dan chat tim hanya untuk anggota tim (owner dan `approved`), dengan rate limit dan batas panjang pesan | I-13, I-14, D-8, E-8 | Target | Wajib sebelum produksi fitur ruang tim | Belum ([../brief.md](../brief.md)) |
| A21 | Kedaluwarsa lamaran dan tayangan pengumuman dihitung server; penerbitan pengumuman hanya peran panitia | T-11, T-12, E-9 | Target | Tinggi | Belum ([../brief.md](../brief.md)) |
| A22 | Tidak menaruh kontak nyata di `ANGGOTA`/`BUILDER`; hapus data contoh saat integrasi | I-13 | Sekarang | Wajib | Aturan proses; data contoh memakai domain `contoh.id` |

## 9. Risiko Residual dan Keputusan Terbuka

1. Opsi login (A cookie bersama, B OAuth, C magic link) menentukan permukaan CSRF dan session; keputusan: _TBD_ ([../brief.md](../brief.md) 8.1 dan 8.2).
2. Siapa yang boleh melihat data peserta (pengurus pusat atau kota) dan format ekspor: _TBD_ (8.7).
3. Dasar persetujuan data WA dan kota: _TBD_ (8.5).
4. Apakah GitHub Pages dipertahankan sebagai demo dummy setelah produksi: _TBD_. Bila dipertahankan, bundelnya tidak boleh memuat data nyata.
5. Ambang rate limit, masa simpan data, prosedur insiden (kebocoran tautan atau data): _TBD_.
6. Tinjauan keamanan ini harus diulang setelah arsitektur final dan sebelum rilis produksi.

## 10. Referensi

- [../brief.md](../brief.md): arsitektur target, aturan bisnis 5.3, kontrak API, kriteria selesai, risiko.
- [12_TEST_STRATEGY.md](12_TEST_STRATEGY.md): tes A-01 sampai A-22 yang memverifikasi mitigasi di dokumen ini.
- Kode: `src/lib/rules.js` (termasuk `expirePending`), `src/lib/team.js`, `src/components/TeamRoom.jsx`, `src/components/Announcements.jsx`, `src/data.js` (`WA_LINK_RE`, `TIM`, `DUMMY_USERS`, `ANGGOTA`, `PENGUMUMAN`), `src/App.jsx` (`PERSIST`, `hk_state`), `src/components/Login.jsx`, `Group.jsx`, `TeamDetail.jsx`, `Create.jsx`.
